import apiClient from './apiClient';

export const getLabInfo = async () => {
  const res = await apiClient.get('/settings/lab');
  return res.data.data;
};

export const updateLabInfo = async (data: Record<string, string>) => {
  const res = await apiClient.put('/settings/lab', data);
  return res.data.data;
};

export const getEmailSettings = async () => {
  const res = await apiClient.get('/settings/email');
  return res.data.data;
};

export const updateEmailSettings = async (data: Record<string, unknown>) => {
  const res = await apiClient.put('/settings/email', data);
  return res.data.data;
};
