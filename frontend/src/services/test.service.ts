import apiClient from './apiClient';
import type { Test, PaginationParams } from '../types';

export const getTests = async (params?: PaginationParams & { category?: string }) => {
  const res = await apiClient.get('/tests', { params });
  return res.data;
};

export const getTestById = async (id: number) => {
  const res = await apiClient.get(`/tests/${id}`);
  return res.data.data as Test;
};

export const getTestCategories = async (): Promise<string[]> => {
  const res = await apiClient.get('/tests/categories');
  return res.data.data;
};

export const createTest = async (data: Partial<Test>) => {
  const res = await apiClient.post('/tests', data);
  return res.data.data as Test;
};

export const updateTest = async (id: number, data: Partial<Test>) => {
  const res = await apiClient.put(`/tests/${id}`, data);
  return res.data.data as Test;
};

export const deleteTest = async (id: number) => {
  const res = await apiClient.delete(`/tests/${id}`);
  return res.data;
};
