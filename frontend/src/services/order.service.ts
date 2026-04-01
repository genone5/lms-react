import apiClient from './apiClient';
import type { TestOrder, PaginationParams } from '../types';

export const getOrders = async (params?: PaginationParams & { status?: string; patientId?: number }) => {
  const res = await apiClient.get('/orders', { params });
  return res.data;
};

export const getOrderById = async (id: number) => {
  const res = await apiClient.get(`/orders/${id}`);
  return res.data.data;
};

export const createOrder = async (data: { patientId: number; doctorName: string; branchId: number; testIds: number[] }) => {
  const res = await apiClient.post('/orders', data);
  return res.data.data as TestOrder;
};

export const updateOrderStatus = async (id: number, status: string) => {
  const res = await apiClient.put(`/orders/${id}/status`, { status });
  return res.data.data as TestOrder;
};

export const cancelOrder = async (id: number) => {
  const res = await apiClient.put(`/orders/${id}/cancel`);
  return res.data;
};

export const getOrderItems = async (orderId: number) => {
  const res = await apiClient.get(`/orders/${orderId}/items`);
  return res.data.data;
};
