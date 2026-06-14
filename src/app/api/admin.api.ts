import { api } from './client';
import { Activity, Enrollment, AppUser } from '../data/mock';
export interface DashboardData {
  stats: {
    activeActivities: number;
    totalEnrollments: number;
    checkedIn: number;
    paidConfirmed: number;
    pendingPayment: number;
    totalUsers: number;
  };
  recentActivities: Activity[];
  pendingItems: (Enrollment & { activity: Activity; user: AppUser })[];
}
export interface StatsData {
  kpi: {
    totalEnrollments: number;
    checkInRate: string;
    paymentRate: string;
    confirmedAmount: number;
  };
  activities: Activity[];
  checkInDist: { checkInStatus: string; _count: number }[];
  paymentDist: { paymentStatus: string; _count: number }[];
  topUsers: any[];
}
export async function getDashboardApi() {
  return api.get<DashboardData>('/admin/dashboard');
}
export async function getUsersApi(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return api.get<AppUser[]>(`/admin/users${query}`);
}
export async function updateUserApi(id: string, data: Partial<AppUser>) {
  return api.put<AppUser>(`/admin/users/${id}`, data);
}
export async function resetPasswordApi(id: string) {
  return api.post(`/admin/users/${id}/reset-password`, {});
}
export async function getAdminEnrollmentsApi(activityId: string) {
  return api.get<Enrollment[]>(`/admin/enrollments?activityId=${activityId}`);
}
export async function manualEnrollApi(data: {
  activityId: string;
  contactPhone: string;
  contactName?: string;
  adults?: number;
  children?: number;
  amount?: number;
  note?: string;
}) {
  return api.post<Enrollment>('/admin/enrollments/manual', data);
}
export async function checkInApi(id: string, checkInStatus: string, checkInTime?: string, checkOutTime?: string) {
  return api.put<Enrollment>(`/admin/enrollments/${id}/checkin`, { checkInStatus, checkInTime, checkOutTime });
}
export async function paymentApi(id: string, paymentStatus: string, adminNote?: string) {
  return api.put<Enrollment>(`/admin/enrollments/${id}/payment`, { paymentStatus, adminNote });
}
export async function removeEnrollmentApi(id: string) {
  return api.put<Enrollment>(`/admin/enrollments/${id}/remove`, {});
}
export async function getStatsApi() {
  return api.get<StatsData>('/admin/stats');
}
