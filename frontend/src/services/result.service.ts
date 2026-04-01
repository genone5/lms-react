import apiClient from './apiClient';
import type { Result } from '../types';

export const getResults = async (params?: { orderId?: number; status?: string }) => {
  const res = await apiClient.get('/results', { params });
  return res.data.data as Result[];
};

export const enterResult = async (data: { orderItemId: number; resultValue: string; unit: string; normalRange: string; resultStatus: string }) => {
  const res = await apiClient.post('/results', data);
  return res.data.data as Result;
};

export const updateResult = async (id: number, data: Partial<Result>) => {
  const res = await apiClient.put(`/results/${id}`, data);
  return res.data.data as Result;
};

export const verifyResult = async (id: number) => {
  const res = await apiClient.put(`/results/${id}/verify`);
  return res.data.data as Result;
};
