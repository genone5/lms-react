import apiClient from './apiClient';
import type { User, PaginationParams } from '../types';

export const getUsers = async (params?: PaginationParams & { roleId?: number; status?: string }) => {
  const res = await apiClient.get('/users', { params });
  return res.data;
};

export const getUserById = async (id: number) => {
  const res = await apiClient.get(`/users/${id}`);
  return res.data.data as User;
};

export const createUser = async (data: Partial<User> & { password: string }) => {
  const res = await apiClient.post('/users', data);
  return res.data.data as User;
};

export const updateUser = async (id: number, data: Partial<User> & { password?: string }) => {
  const res = await apiClient.put(`/users/${id}`, data);
  return res.data.data as User;
};

export const toggleUserStatus = async (id: number) => {
  const res = await apiClient.put(`/users/${id}/toggle-status`);
  return res.data;
};

export const getUserActivityLogs = async (id: number) => {
  const res = await apiClient.get(`/users/${id}/activity`);
  return res.data.data;
};
