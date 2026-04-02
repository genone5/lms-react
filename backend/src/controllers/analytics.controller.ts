import { Response } from 'express';
import { Op } from 'sequelize';
import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';
import { TestOrder } from '../models/TestOrder.js';
import { Patient } from '../models/Patient.js';
import { OrderItem } from '../models/OrderItem.js';
import { Test } from '../models/Test.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getRevenue = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [payments, unpaidInvoices] = await Promise.all([
    Payment.findAll(),
    Invoice.findAll({ where: { status: 'unpaid' } }),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = unpaidInvoices.reduce((sum, i) => sum + i.netAmount, 0);

  const byMethod = payments.reduce((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  const daily: Record<string, number> = {};
  payments.forEach(p => {
    const date = new Date(p.paymentDate).toISOString().split('T')[0];
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

export const getTestVolume = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [orderItems, tests, totalOrders] = await Promise.all([
    OrderItem.findAll(),
    Test.findAll(),
    TestOrder.count(),
  ]);

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
      totalOrders,
    },
  });
};

export const getPatientStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const patients = await Patient.findAll();

  const byGender = patients.reduce((acc, p) => {
    acc[p.gender] = (acc[p.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthly: Record<string, number> = {};
  patients.forEach(p => {
    const month = new Date(p.createdAt).toISOString().slice(0, 7);
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

export const getDailyActivity = async (_req: AuthRequest, res: Response): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [newPatients, todayOrders, pendingTests, completedTests, payments] = await Promise.all([
    Patient.count({ where: { createdAt: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
    TestOrder.count({ where: { orderDate: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
    OrderItem.count({ where: { status: 'pending' } }),
    OrderItem.count({ where: { status: 'completed' } }),
    Payment.findAll({ where: { paymentDate: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
  ]);

  const todayRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  res.json({
    success: true,
    data: {
      date: today.toISOString().split('T')[0],
      newPatients,
      totalOrders: todayOrders,
      pendingTests,
      todayRevenue,
      completedTests,
    },
  });
};
