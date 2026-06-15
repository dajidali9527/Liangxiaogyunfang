import { api } from './client';
import { Activity } from '../data/mock';
export async function getActivitiesApi() {
  const res = await api.get<Activity[]>('/activities');
  return res;
}
export async function getActivityApi(id: string) {
  const res = await api.get<Activity>(`/activities/${id}`);
  return res;
}
export async function createActivityApi(data: Partial<Activity>) {
  return api.post<Activity>('/activities', data);
}
export async function updateActivityApi(id: string, data: Partial<Activity>) {
  return api.put<Activity>(`/activities/${id}`, data);
}
export async function deleteActivityApi(id: string) {
  return api.del(`/activities/${id}`);
}
export async function uploadFilesApi(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  const res = await api.upload<string[]>('/upload', formData);
  if (res.success && res.data) return res.data;
  throw new Error(res.message || '上传失败');
}
