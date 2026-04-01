import apiClient from './apiClient';

export const getPendingSamples = async () => {
  const res = await apiClient.get('/samples/pending');
  return res.data.data;
};

export const collectSample = async (data: { orderItemId: number; sampleType: string }) => {
  const res = await apiClient.post('/samples', data);
  return res.data.data;
};

export const updateSampleStatus = async (id: number, status: string) => {
  const res = await apiClient.put(`/samples/${id}/status`, { status });
  return res.data.data;
};

export const getSampleHistory = async () => {
  const res = await apiClient.get('/samples');
  return res.data.data;
};
