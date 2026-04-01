import apiClient from './apiClient';
import type { Branch } from '../types';

export const getBranches = async () => {
  const res = await apiClient.get('/branches');
  return res.data.data as Branch[];
};

export const getBranchById = async (id: number) => {
  const res = await apiClient.get(`/branches/${id}`);
  return res.data.data as Branch;
};

export const createBranch = async (data: Partial<Branch>) => {
  const res = await apiClient.post('/branches', data);
  return res.data.data as Branch;
};

export const updateBranch = async (id: number, data: Partial<Branch>) => {
  const res = await apiClient.put(`/branches/${id}`, data);
  return res.data.data as Branch;
};

export const deleteBranch = async (id: number) => {
  const res = await apiClient.delete(`/branches/${id}`);
  return res.data;
};

export const getBranchStaff = async (id: number) => {
  const res = await apiClient.get(`/branches/${id}/staff`);
  return res.data.data;
};
