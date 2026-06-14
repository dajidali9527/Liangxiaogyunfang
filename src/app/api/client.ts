const TOKEN_KEY = 'yunfang_token';
const BASE_URL = '/api';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
interface ApiResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
async function request<T = any>(method: HttpMethod, path: string, body?: any): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const options: RequestInit = {
    method,
    headers,
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  try {
    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json();
    if (res.status === 401) {
      removeToken();
    }
    return data;
  } catch (err) {
    console.error('[API Error]', err);
    return { success: false, message: '网络错误，请检查网络连接' };
  }
}
export const api = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body: any) => request<T>('POST', path, body),
  put: <T = any>(path: string, body: any) => request<T>('PUT', path, body),
  del: <T = any>(path: string) => request<T>('DELETE', path),
};
