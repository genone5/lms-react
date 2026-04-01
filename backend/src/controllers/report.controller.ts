import { Response } from 'express';
import { reports, testOrders, patients, orderItems, tests, results } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { Report } from '../types/index.js';

let nextId = reports.length + 1;

export const getAll = (_req: AuthRequest, res: Response): void => {
  const data = reports.map(r => {
    const order = testOrders.find(o => o.id === r.orderId);
    const patient = patients.find(p => p.id === order?.patientId);
    return {
      ...r,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      doctorName: order?.doctorName,
    };
  });
  res.json({ success: true, data });
};

export const getById = (req: AuthRequest, res: Response): void => {
  const report = reports.find(r => r.id === parseInt(req.params.id));
  if (!report) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }

  const order = testOrders.find(o => o.id === report.orderId);
  const patient = patients.find(p => p.id === order?.patientId);
  const items = orderItems.filter(oi => oi.orderId === report.orderId).map(oi => ({
    ...oi,
    testName: tests.find(t => t.id === oi.testId)?.name,
    result: results.find(r => r.orderItemId === oi.id),
  }));

  res.json({ success: true, data: { ...report, order, patient, items } });
};

export const generate = (req: AuthRequest, res: Response): void => {
  const { orderId } = req.body;
  if (!orderId) {
    res.status(400).json({ success: false, message: 'orderId is required' });
    return;
  }

  const existing = reports.find(r => r.orderId === parseInt(orderId));
  if (existing) {
    res.json({ success: true, data: existing, message: 'Report already exists' });
    return;
  }

  const newReport: Report = {
    id: nextId++,
    orderId: parseInt(orderId),
    reportUrl: `/reports/report_order_${orderId}.pdf`,
    generatedBy: req.user!.userId,
    generatedAt: new Date().toISOString(),
    status: 'final',
  };

  reports.push(newReport);
  res.status(201).json({ success: true, data: newReport, message: 'Report generated successfully' });
};

export const download = (req: AuthRequest, res: Response): void => {
  const report = reports.find(r => r.id === parseInt(req.params.id));
  if (!report) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }
  res.json({ success: true, data: { url: report.reportUrl }, message: 'Download link ready' });
};
