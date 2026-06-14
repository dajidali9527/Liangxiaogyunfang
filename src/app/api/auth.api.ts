import { api, setToken, removeToken } from './client';
export interface AuthUser {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  registeredAt: string;
  lastLoginAt: string;
  username?: string;
}
export interface LoginResult {
  user: AuthUser;
  token: string;
}
export interface RegisterResult {
  user: AuthUser;
  token: string;
}
export async function loginApi(account: string, password: string) {
  const res = await api.post<LoginResult>('/auth/login', { account, password });
  if (res.success && res.data?.token) {
    setToken(res.data.token);
  }
  return res;
}
export async function registerApi(data: { phone: string; password: string; nickname?: string; email?: string }) {
  const res = await api.post<RegisterResult>('/auth/register', data);
  if (res.success && res.data?.token) {
    setToken(res.data.token);
  }
  return res;
}
export async function getMeApi() {
  return api.get<AuthUser>('/auth/me');
}
export async function changePasswordApi(oldPassword: string, newPassword: string) {
  return api.put('/auth/password', { oldPassword, newPassword });
}
export async function logoutApi() {
  removeToken();
}
