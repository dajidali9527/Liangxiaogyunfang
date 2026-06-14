import { api, setToken } from './client';
import { Enrollment } from '../data/mock';
import { AuthUser } from './auth.api';
export interface EnrollResult {
  enrollment: Enrollment;
  user: AuthUser;
  token: string;
  autoCreated: boolean;
  password?: string;
}
export async function enrollApi(data: {
  activityId: string;
  contactPhone: string;
  contactName?: string;
  adults?: number;
  children?: number;
  note?: string;
  participants?: any[];
}) {
  const res = await api.post<EnrollResult>('/enrollments', data);
  if (res.success && res.data?.token) {
    setToken(res.data.token);
  }
  return res;
}
export async function getMyEnrollmentsApi() {
  return api.get<Enrollment[]>('/enrollments/my');
}
export async function getEnrollmentApi(id: string) {
  return api.get<Enrollment>(`/enrollments/${id}`);
}
export async function updateEnrollmentApi(id: string, data: Partial<Enrollment>) {
  return api.put<Enrollment>(`/enrollments/${id}`, data);
}
