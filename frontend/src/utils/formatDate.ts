import dayjs from 'dayjs';

export const formatDate = (date?: string | null): string => {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY');
};

export const formatDateTime = (date?: string | null): string => {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY, HH:mm');
};

export const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString()}`;
};
