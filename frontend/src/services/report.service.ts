import apiClient from './apiClient';
import type { Report } from '../types';

export const getReports = async () => {
  const res = await apiClient.get('/reports');
  return res.data.data as Report[];
};

export const getReportById = async (id: number) => {
  const res = await apiClient.get(`/reports/${id}`);
  return res.data.data;
};

export const generateReport = async (orderId: number) => {
  const res = await apiClient.post('/reports/generate', { orderId });
  return res.data.data as Report;
};

export const downloadReport = async (id: number) => {
  const res = await apiClient.get(`/reports/${id}/download`);
  return res.data.data;
};
