import { createContext, useContext, useState, ReactNode } from 'react';
import { AppUser, Enrollment, Activity, ACTIVITIES, USERS, ENROLLMENTS } from '../data/mock';

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
  navigate: (r: Route) => void;
  login: (phone: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  register: (data: RegisterData) => { success: boolean; message: string };
  enroll: (activityId: string, data: EnrollData) => { success: boolean; message: string; autoCreated?: boolean; password?: string };
  updateCheckIn: (enrollmentId: string, status: Enrollment['checkInStatus'], time?: string) => void;
  updatePayment: (enrollmentId: string, status: Enrollment['paymentStatus'], note?: string) => void;
  updateEnrollment: (enrollmentId: string, updates: Partial<Enrollment>) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  updateUser: (userId: string, updates: Partial<AppUser>) => void;
  addActivity: (activity: Activity) => void;
  manualEnroll: (activityId: string, data: ManualEnrollData) => { success: boolean; message: string };
  removeEnrollment: (enrollmentId: string) => void;
  findOrCreateUserByPhone: (phone: string, name: string) => AppUser;
}

export interface RegisterData {
  name: string;
  phone: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface EnrollData {
  adults: number;
  children: number;
  contactName: string;
  contactPhone: string;
  note: string;
}

export interface ManualEnrollData {
  contactName: string;
  contactPhone: string;
  adults: number;
  children: number;
  amount: number;
  note?: string;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [route, setRoute] = useState<Route>({ page: 'home' });
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES);
  const [users, setUsers] = useState<AppUser[]>(USERS);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(ENROLLMENTS);

  const navigate = (r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = (phone: string, password: string) => {
    const user = users.find(u => u.phone === phone && u.password === password);
    if (!user) return { success: false, message: '手机号或密码错误' };
    if (user.status === 'disabled') return { success: false, message: '账号已被禁用，请联系管理员' };
    setCurrentUser(user);
    return { success: true, message: '登录成功' };
  };

  const logout = () => {
    setCurrentUser(null);
    navigate({ page: 'home' });
  };

  const register = (data: RegisterData) => {
    const exists = users.find(u => u.phone === data.phone || (data.email && u.email === data.email));
    if (exists) return { success: false, message: '该手机号或邮箱已注册' };
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      nickname: data.nickname || data.name,
      phone: data.phone,
      email: data.email,
      role: 'user',
      status: 'active',
      registeredAt: new Date().toISOString().split('T')[0],
      lastLoginAt: new Date().toISOString().split('T')[0],
      password: data.password,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, message: '注册成功' };
  };

  const findOrCreateUserByPhone = (phone: string, name: string) => {
    const existing = users.find(u => u.phone === phone);
    if (existing) return existing;
    const defaultPassword = phone.slice(-6);
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name: name || phone,
      nickname: name || phone,
      phone,
      email: '',
      role: 'user',
      status: 'active',
      registeredAt: new Date().toISOString().split('T')[0],
      lastLoginAt: new Date().toISOString().split('T')[0],
      password: defaultPassword,
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const enroll = (activityId: string, data: EnrollData) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return { success: false, message: '活动不存在' };
    if (activity.status === '已关闭' || activity.status === '已结束') {
      return { success: false, message: '活动已关闭，无法报名' };
    }
    if (activity.enrolled >= activity.capacity) {
      return { success: false, message: '活动名额已满' };
    }
    // 自动创建账号：根据手机号查找或创建用户
    let user = currentUser;
    let autoCreated = false;
    let autoPassword = '';
    if (!user) {
      user = findOrCreateUserByPhone(data.contactPhone, data.contactName);
      autoCreated = true;
      autoPassword = data.contactPhone.slice(-6);
      setCurrentUser(user);
    }
    const existing = enrollments.find(
      e => e.activityId === activityId && e.userId === user!.id && e.status !== '已取消' && e.status !== '已移除'
    );
    if (existing) return { success: false, message: '您已报名此活动' };

    const amount = activity.price * (data.adults + data.children * 0.5);
    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      activityId,
      userId: user.id,
      enrolledAt: new Date().toLocaleString('zh-CN'),
      status: '已报名',
      checkInStatus: '未签到',
      paymentStatus: '未确认',
      amount,
      adults: data.adults,
      children: data.children,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      note: data.note,
      adminNote: '',
    };
    setEnrollments(prev => [...prev, newEnrollment]);
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, enrolled: a.enrolled + 1 } : a));
    return { success: true, message: '报名成功！', autoCreated, password: autoCreated ? autoPassword : undefined };
  };

  const manualEnroll = (activityId: string, data: ManualEnrollData) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return { success: false, message: '活动不存在' };
    const user = findOrCreateUserByPhone(data.contactPhone, data.contactName);
    const existing = enrollments.find(
      e => e.activityId === activityId && e.userId === user.id && e.status !== '已取消' && e.status !== '已移除'
    );
    if (existing) return { success: false, message: '该用户已报名此活动' };
    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      activityId,
      userId: user.id,
      enrolledAt: new Date().toLocaleString('zh-CN'),
      status: '已报名',
      checkInStatus: '未签到',
      paymentStatus: '未确认',
      amount: data.amount,
      adults: data.adults,
      children: data.children,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      note: data.note || '',
      adminNote: '管理员后台报名',
    };
    setEnrollments(prev => [...prev, newEnrollment]);
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, enrolled: a.enrolled + 1 } : a));
    return { success: true, message: '添加成功' };
  };

  const removeEnrollment = (enrollmentId: string) => {
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status: '已移除' as const } : e));
  };

  const updateCheckIn = (enrollmentId: string, status: Enrollment['checkInStatus'], time?: string) => {
    setEnrollments(prev => prev.map(e =>
      e.id === enrollmentId
        ? {
            ...e,
            checkInStatus: status,
            checkInTime: status === '已签到' ? (time || new Date().toLocaleString('zh-CN')) : e.checkInTime,
            checkOutTime: status === '已离场' ? (time || new Date().toLocaleString('zh-CN')) : e.checkOutTime,
          }
        : e
    ));
  };

  const updatePayment = (enrollmentId: string, status: Enrollment['paymentStatus'], note?: string) => {
    setEnrollments(prev => prev.map(e =>
      e.id === enrollmentId
        ? {
            ...e,
            paymentStatus: status,
            adminNote: note !== undefined ? note : e.adminNote,
            confirmedBy: currentUser?.name,
            confirmedAt: new Date().toLocaleString('zh-CN'),
          }
        : e
    ));
  };

  const updateEnrollment = (enrollmentId: string, updates: Partial<Enrollment>) => {
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, ...updates } : e));
  };

  const updateActivity = (activityId: string, updates: Partial<Activity>) => {
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, ...updates } : a));
  };

  const updateUser = (userId: string, updates: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const addActivity = (activity: Activity) => {
    setActivities(prev => [activity, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      currentUser, route, activities, users, enrollments,
      navigate, login, logout, register, enroll,
      updateCheckIn, updatePayment, updateEnrollment,
      updateActivity, updateUser, addActivity,
      manualEnroll, removeEnrollment, findOrCreateUserByPhone,
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
