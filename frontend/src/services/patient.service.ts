import apiClient from './apiClient';
import type { Patient, PaginationParams } from '../types';

export const getPatients = async (params?: PaginationParams & { gender?: string }) => {
  const res = await apiClient.get('/patients', { params });
  return res.data;
};

export const getPatientById = async (id: number) => {
  const res = await apiClient.get(`/patients/${id}`);
  return res.data.data as Patient;
};

export const createPatient = async (data: Partial<Patient>) => {
  const res = await apiClient.post('/patients', data);
  return res.data.data as Patient;
};

export const updatePatient = async (id: number, data: Partial<Patient>) => {
  const res = await apiClient.put(`/patients/${id}`, data);
  return res.data.data as Patient;
};

export const deletePatient = async (id: number) => {
  const res = await apiClient.delete(`/patients/${id}`);
  return res.data;
};

export const getPatientHistory = async (id: number) => {
  const res = await apiClient.get(`/patients/${id}/history`);
  return res.data.data;
};
