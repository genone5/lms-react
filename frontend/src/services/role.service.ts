import apiClient from './apiClient';
import type { Role } from '../types';

export const getRoles = async () => {
  const res = await apiClient.get('/roles');
  return res.data.data as Role[];
};

export const getRoleById = async (id: number) => {
  const res = await apiClient.get(`/roles/${id}`);
  return res.data.data as Role;
};

export const createRole = async (data: Partial<Role>) => {
  const res = await apiClient.post('/roles', data);
  return res.data.data as Role;
};

export const updateRole = async (id: number, data: Partial<Role>) => {
  const res = await apiClient.put(`/roles/${id}`, data);
  return res.data.data as Role;
};

export const deleteRole = async (id: number) => {
  const res = await apiClient.delete(`/roles/${id}`);
  return res.data;
};

export const getPermissionMatrix = async () => {
  const res = await apiClient.get('/roles/permissions');
  return res.data.data;
};
