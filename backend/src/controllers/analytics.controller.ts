import { Response } from 'express';
import { payments, invoices, testOrders, patients, tests, orderItems } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getRevenue = (_req: AuthRequest, res: Response): void => {
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + i.netAmount, 0);

  const byMethod = payments.reduce((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  const daily: Record<string, number> = {};
  payments.forEach(p => {
    const date = p.paymentDate.split('T')[0];
    daily[date] = (daily[date] || 0) + p.amount;
  });

  res.json({
    success: true,
    data: {
      totalRevenue,
      pendingRevenue,
      byMethod,
      daily: Object.entries(daily).map(([date, amount]) => ({ date, amount })),
    },
  });
};

export const getTestVolume = (_req: AuthRequest, res: Response): void => {
  const testCounts = orderItems.reduce((acc, oi) => {
    const test = tests.find(t => t.id === oi.testId);
    if (test) acc[test.name] = (acc[test.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byCategory = tests.reduce((acc, t) => {
    const count = orderItems.filter(oi => oi.testId === t.id).length;
    acc[t.category] = (acc[t.category] || 0) + count;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    success: true,
    data: {
      topTests: Object.entries(testCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
      totalOrders: testOrders.length,
    },
  });
};

export const getPatientStats = (_req: AuthRequest, res: Response): void => {
  const byGender = patients.reduce((acc, p) => {
    acc[p.gender] = (acc[p.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthly: Record<string, number> = {};
  patients.forEach(p => {
    const month = p.createdAt.slice(0, 7);
    monthly[month] = (monthly[month] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      total: patients.length,
      byGender: Object.entries(byGender).map(([gender, count]) => ({ gender, count })),
      monthly: Object.entries(monthly).map(([month, count]) => ({ month, count })),
    },
  });
};

export const getDailyActivity = (_req: AuthRequest, res: Response): void => {
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = testOrders.filter(o => o.orderDate.startsWith(today));
  const todayRevenue = payments
    .filter(p => p.paymentDate.startsWith(today))
    .reduce((sum, p) => sum + p.amount, 0);

  res.json({
    success: true,
    data: {
      date: today,
      newPatients: patients.filter(p => p.createdAt.startsWith(today)).length,
      totalOrders: todayOrders.length,
      pendingTests: orderItems.filter(oi => oi.status === 'pending').length,
      todayRevenue,
      completedTests: orderItems.filter(oi => oi.status === 'completed').length,
    },
  });
};
