import apiClient from './apiClient';
import type { AuthUser } from '../types';

export const login = async (email: string, password: string): Promise<AuthUser> => {
  const res = await apiClient.post('/auth/login', { email, password });
  const { token, user } = res.data.data;
  const authUser: AuthUser = { ...user, token };
  localStorage.setItem('lms_token', token);
  localStorage.setItem('lms_user', JSON.stringify(authUser));
  return authUser;
};

export const logout = (): void => {
  localStorage.removeItem('lms_token');
  localStorage.removeItem('lms_user');
};

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem('lms_user');
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
};

export const getProfile = async () => {
  const res = await apiClient.get('/auth/profile');
  return res.data.data;
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  const res = await apiClient.put('/auth/change-password', { oldPassword, newPassword });
  return res.data;
};
