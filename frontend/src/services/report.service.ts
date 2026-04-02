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

export const downloadReport = async (id: number): Promise<void> => {
  const res = await apiClient.get(`/reports/${id}/download`, { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `report_${id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
