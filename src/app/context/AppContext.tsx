import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { AppUser, Enrollment, Activity } from '../data/mock';
import { getToken, setToken, removeToken } from '../api/client';
import { loginApi, registerApi, getMeApi, logoutApi, changePasswordApi, changeNicknameApi, AuthUser } from '../api/auth.api';
import { getActivitiesApi, getActivityApi, createActivityApi, updateActivityApi, deleteActivityApi } from '../api/activity.api';
import { enrollApi, getMyEnrollmentsApi, getEnrollmentApi, updateEnrollmentApi } from '../api/enrollment.api';
import {
  getDashboardApi, getUsersApi, updateUserApi, resetPasswordApi, deleteUserApi,
  getAdminEnrollmentsApi, manualEnrollApi, checkInApi, paymentApi,
  removeEnrollmentApi, getStatsApi,
} from '../api/admin.api';
export type Route =
  | { page: 'home' }
  | { page: 'activity-detail'; id: string }
  | { page: 'login'; redirect?: Route }
  | { page: 'register' }
  | { page: 'my-history' }
  | { page: 'my-activity-detail'; enrollmentId: string }
  | { page: 'register-confirm'; activityId: string; enrollData: EnrollData }
  | { page: 'admin-dashboard' }
  | { page: 'admin-activities' }
  | { page: 'admin-activity-detail'; activityId: string }
  | { page: 'admin-users' }
  | { page: 'admin-stats' };
interface AppState {
  currentUser: AppUser | null;
  route: Route;
  activities: Activity[];
  users: AppUser[];
  enrollments: Enrollment[];
  loading: boolean;
  navigate: (r: Route) => void;
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  enroll: (activityId: string, data: EnrollData) => Promise<{ success: boolean; message: string; autoCreated?: boolean; password?: string }>;
  updateCheckIn: (enrollmentId: string, status: Enrollment['checkInStatus'], time?: string) => Promise<void>;
  updatePayment: (enrollmentId: string, status: Enrollment['paymentStatus'], note?: string) => Promise<void>;
  updateEnrollment: (enrollmentId: string, updates: Partial<Enrollment>) => Promise<void>;
  updateActivity: (activityId: string, updates: Partial<Activity>) => Promise<void>;
  updateUser: (userId: string, updates: Partial<AppUser>) => Promise<void>;
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  addActivity: (activity: Activity) => Promise<{ success: boolean; message: string }>;
  deleteActivity: (activityId: string) => Promise<{ success: boolean; message: string }>;
  manualEnroll: (activityId: string, data: ManualEnrollData) => Promise<{ success: boolean; message: string }>;
  removeEnrollment: (enrollmentId: string) => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchMyEnrollments: () => Promise<void>;
  fetchAdminEnrollments: (activityId: string) => Promise<void>;
  fetchUsers: (search?: string) => Promise<void>;
  fetchDashboard: () => Promise<any>;
  fetchStats: () => Promise<any>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  changeNickname: (nickname: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (userId: string) => Promise<{ success: boolean; message: string }>;
}
export interface RegisterData {
  name: string;
  phone: string;
  email: string;
  password: string;
  nickname?: string;
}
export interface Participant {
  name: string;
  gender: string;
  age: string;
  note: string;
}
export interface EnrollData {
  adults: number;
  children: number;
  contactName: string;
  contactPhone: string;
  note: string;
  participants: Participant[];
}
export interface ManualEnrollData {
  contactName: string;
  contactPhone: string;
  adults: number;
  children: number;
  amount: number;
  note?: string;
  participants?: Participant[];
}
function mapAuthUserToAppUser(u: AuthUser): AppUser {
  return {
    id: u.id,
    name: u.name || '',
    nickname: u.nickname || '',
    phone: u.phone || '',
    email: u.email || '',
    role: (u.role as any) || 'user',
    status: (u.status as any) || 'active',
    registeredAt: u.registeredAt || '',
    lastLoginAt: u.lastLoginAt || '',
    password: '',
    username: u.username,
  };
}
const AppContext = createContext<AppState | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [route, setRoute] = useState<Route>({ page: 'home' });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { document.body.style.cursor = busy ? 'wait' : ''; }, [busy]);
  const navigate = (r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const mapActivity = (d: any): Activity => ({
    id: d.id,
    name: d.name || '',
    status: d.status || '草稿',
    startDate: d.startDate || '',
    endDate: d.endDate || '',
    location: d.location || '',
    price: d.price || 0,
    capacity: d.capacity || 0,
    enrolled: d.enrolled || 0,
    enrollDeadline: d.enrollDeadline || '',
    enrollStartDate: d.enrollStartDate || '',
    description: d.description || [],
    imageUrl: d.imageUrl || '',
    payee: d.payee || '',
    tags: d.tags || [],
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '',
    isFeatured: d.isFeatured || false,
    featuredPosters: d.featuredPosters || [],
    featuredDescription: d.featuredDescription || '',
    images: d.images || [],
    videoUrl: d.videoUrl || '',
  });
  // 初始化：恢复登录态 + 加载活动列表
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (token) {
        const res = await getMeApi();
        if (res.success && res.data) {
          setCurrentUser(mapAuthUserToAppUser(res.data));
        } else {
          removeToken();
        }
      }
      const actRes = await getActivitiesApi();
      if (actRes.success && actRes.data) {
        setActivities((actRes.data as any[]).map(mapActivity));
      }
      setLoading(false);
    })();
  }, []);
  const fetchActivities = useCallback(async () => {
    const res = await getActivitiesApi();
    if (res.success && res.data) {
      setActivities((res.data as any[]).map(mapActivity));
    }
  }, []);
  const fetchMyEnrollments = useCallback(async () => {
    const res = await getMyEnrollmentsApi();
    if (res.success && res.data) {
      setEnrollments(res.data as Enrollment[]);
    }
  }, []);
  const fetchAdminEnrollments = useCallback(async (activityId: string) => {
    setBusy(true);
    const res = await getAdminEnrollmentsApi(activityId);
    if (res.success && res.data) {
      setEnrollments(res.data as Enrollment[]);
    }
    setBusy(false);
  }, []);
  const fetchUsers = useCallback(async (search?: string) => {
    const res = await getUsersApi(search);
    if (res.success && res.data) {
      setUsers(res.data as AppUser[]);
    }
  }, []);
  const fetchDashboard = useCallback(async () => {
    const res = await getDashboardApi();
    return res.data;
  }, []);
  const fetchStats = useCallback(async () => {
    setBusy(true);
    const res = await getStatsApi();
    setBusy(false);
    return res.data;
  }, []);
  const login = async (phoneOrUsername: string, password: string) => {
    const res = await loginApi(phoneOrUsername, password);
    if (res.success && res.data) {
      setCurrentUser(mapAuthUserToAppUser(res.data.user));
      return { success: true, message: '登录成功' };
    }
    return { success: false, message: res.message || '登录失败' };
  };
  const logout = () => {
    logoutApi();
    setCurrentUser(null);
    setEnrollments([]);
    navigate({ page: 'home' });
  };
  const register = async (data: RegisterData) => {
    const res = await registerApi({
      phone: data.phone,
      password: data.password,
      nickname: data.nickname,
      email: data.email || undefined,
    });
    if (res.success && res.data) {
      setCurrentUser(mapAuthUserToAppUser(res.data.user));
      return { success: true, message: '注册成功' };
    }
    return { success: false, message: res.message || '注册失败' };
  };
  const enroll = async (activityId: string, data: EnrollData) => {
    setBusy(true);
    const res = await enrollApi({
      activityId,
      contactPhone: data.contactPhone,
      contactName: data.contactName || undefined,
      adults: data.adults,
      children: data.children,
      note: data.note || undefined,
      participants: data.participants,
    });
    if (res.success && res.data) {
      setCurrentUser(mapAuthUserToAppUser(res.data.user));
      await fetchActivities();
      setBusy(false);
      return {
        success: true,
        message: '报名成功！',
        autoCreated: res.data.autoCreated,
        password: res.data.password,
      };
    }
    setBusy(false);
    return { success: false, message: res.message || '报名失败' };
  };
  const manualEnroll = async (activityId: string, data: ManualEnrollData) => {
    const res = await manualEnrollApi({
      activityId,
      contactPhone: data.contactPhone,
      contactName: data.contactName || undefined,
      adults: data.adults,
      children: data.children,
      amount: data.amount,
      note: data.note || undefined,
      participants: data.participants,
    });
    if (res.success) {
      await fetchActivities();
      return { success: true, message: '添加成功' };
    }
    return { success: false, message: res.message || '添加失败' };
  };
  const removeEnrollmentFn = async (enrollmentId: string) => {
    await removeEnrollmentApi(enrollmentId);
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status: '已移除' as const } : e));
  };
  const updateCheckIn = async (enrollmentId: string, status: Enrollment['checkInStatus'], time?: string) => {
    const res = await checkInApi(enrollmentId, status, time);
    if (res.success && res.data) {
      setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, ...res.data } : e));
    }
  };
  const updatePayment = async (enrollmentId: string, status: Enrollment['paymentStatus'], note?: string) => {
    const res = await paymentApi(enrollmentId, status, note);
    if (res.success && res.data) {
      setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, ...res.data } : e));
    }
  };
  const updateEnrollment = async (enrollmentId: string, updates: Partial<Enrollment>) => {
    const res = await updateEnrollmentApi(enrollmentId, updates);
    if (res.success && res.data) {
      setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, ...res.data } : e));
    }
  };
  const updateActivity = async (activityId: string, updates: Partial<Activity>) => {
    setBusy(true);
    const res = await updateActivityApi(activityId, updates);
    if (res.success && res.data) {
      setActivities(prev => prev.map(a => a.id === activityId ? mapActivity(res.data!) : a));
    }
    setBusy(false);
  };
  const updateUser = async (userId: string, updates: Partial<AppUser>) => {
    const res = await updateUserApi(userId, updates);
    if (res.success && res.data) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...res.data } : u));
    }
  };
  const deleteUserFn = async (userId: string) => {
    const res = await deleteUserApi(userId);
    if (res.success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      return { success: true, message: '删除成功' };
    }
    return { success: false, message: res.message || '删除失败' };
  };
  const addActivity = async (activity: Activity) => {
    setBusy(true);
    const res = await createActivityApi(activity);
    if (res.success && res.data) {
      setActivities(prev => [mapActivity(res.data!), ...prev]);
      setBusy(false);
      return { success: true, message: '创建成功' };
    }
    setBusy(false);
    return { success: false, message: res.message || '创建失败' };
  };
  const deleteActivity = async (activityId: string) => {
    const res = await deleteActivityApi(activityId);
    if (res.success) {
      setActivities(prev => prev.filter(a => a.id !== activityId));
      return { success: true, message: '删除成功' };
    }
    return { success: false, message: res.message || '删除失败' };
  };
  const changePassword = async (oldPassword: string, newPassword: string) => {
    const res = await changePasswordApi(oldPassword, newPassword);
    return { success: res.success, message: res.message || '密码修改成功' };
  };
  const changeNickname = async (nickname: string) => {
    const res = await changeNicknameApi(nickname);
    if (res.success && res.data) {
      setCurrentUser(mapAuthUserToAppUser(res.data));
      return { success: true, message: '昵称修改成功' };
    }
    return { success: false, message: res.message || '修改失败' };
  };
  const resetPassword = async (userId: string) => {
    const res = await resetPasswordApi(userId);
    return { success: res.success, message: res.message || '重置成功' };
  };
  return (
    <AppContext.Provider value={{
      currentUser, route, activities, users, enrollments, loading,
      navigate, login, logout, register, enroll,
      updateCheckIn, updatePayment, updateEnrollment,
      updateActivity, updateUser, deleteUser: deleteUserFn, addActivity, deleteActivity,
      manualEnroll, removeEnrollment: removeEnrollmentFn,
      fetchActivities, fetchMyEnrollments, fetchAdminEnrollments,
      fetchUsers, fetchDashboard, fetchStats,
      changePassword, changeNickname, resetPassword,
    }}>
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
