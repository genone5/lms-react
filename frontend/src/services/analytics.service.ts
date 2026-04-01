import apiClient from './apiClient';

export const getRevenueReport = async () => {
  const res = await apiClient.get('/analytics/revenue');
  return res.data.data;
};

export const getTestVolume = async () => {
  const res = await apiClient.get('/analytics/test-volume');
  return res.data.data;
};

export const getPatientStats = async () => {
  const res = await apiClient.get('/analytics/patients');
  return res.data.data;
};

export const getDailyActivity = async () => {
  const res = await apiClient.get('/analytics/daily');
  return res.data.data;
};
