import apiClient from './apiClient';
import type { Invoice, Payment, PaginationParams } from '../types';

export const getInvoices = async (params?: PaginationParams & { status?: string }) => {
  const res = await apiClient.get('/billing/invoices', { params });
  return res.data;
};

export const getInvoiceById = async (id: number) => {
  const res = await apiClient.get(`/billing/invoices/${id}`);
  return res.data.data;
};

export const createInvoice = async (data: { orderId: number; discount?: number; tax?: number }) => {
  const res = await apiClient.post('/billing/invoices', data);
  return res.data.data as Invoice;
};

export const updateInvoice = async (id: number, data: Partial<Invoice>) => {
  const res = await apiClient.put(`/billing/invoices/${id}`, data);
  return res.data.data as Invoice;
};

export const applyDiscount = async (id: number, discount: number) => {
  const res = await apiClient.put(`/billing/invoices/${id}/discount`, { discount });
  return res.data.data as Invoice;
};

export const collectPayment = async (data: { invoiceId: number; amount: number; paymentMethod: string }) => {
  const res = await apiClient.post('/billing/payments', data);
  return res.data.data as Payment;
};

export const getPayments = async (params?: PaginationParams) => {
  const res = await apiClient.get('/billing/payments', { params });
  return res.data;
};

export const getReceipt = async (paymentId: number) => {
  const res = await apiClient.get(`/billing/payments/${paymentId}/receipt`);
  return res.data.data;
};
