import { Response } from 'express';
import { results, orderItems, testOrders, patients, tests, users } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { Result } from '../types/index.js';

let nextId = results.length + 1;

export const getAll = (req: AuthRequest, res: Response): void => {
  const { orderId, status } = req.query as Record<string, string>;
  let data = results.map(r => {
    const item = orderItems.find(oi => oi.id === r.orderItemId);
    const order = testOrders.find(o => o.id === item?.orderId);
    const patient = patients.find(p => p.id === order?.patientId);
    const test = tests.find(t => t.id === item?.testId);
    const enteredByUser = users.find(u => u.id === r.enteredBy);
    const verifiedByUser = r.verifiedBy ? users.find(u => u.id === r.verifiedBy) : null;
    return {
      ...r,
      testName: test?.name,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      orderId: order?.id,
      enteredByName: enteredByUser?.name,
      verifiedByName: verifiedByUser?.name,
    };
  });

  if (orderId) {
    const orderItemIds = orderItems.filter(oi => oi.orderId === parseInt(orderId)).map(oi => oi.id);
    data = data.filter(r => orderItemIds.includes(r.orderItemId));
  }
  if (status) data = data.filter(r => r.resultStatus === status);

  res.json({ success: true, data });
};

export const enter = (req: AuthRequest, res: Response): void => {
  const { orderItemId, resultValue, unit, normalRange, resultStatus } = req.body;
  if (!orderItemId || !resultValue || !unit || !normalRange || !resultStatus) {
    res.status(400).json({ success: false, message: 'All fields are required' });
    return;
  }

  const existing = results.find(r => r.orderItemId === parseInt(orderItemId));
  if (existing) {
    res.status(400).json({ success: false, message: 'Result already entered for this order item' });
    return;
  }

  const newResult: Result = {
    id: nextId++,
    orderItemId: parseInt(orderItemId),
    resultValue,
    unit,
    normalRange,
    resultStatus,
    enteredBy: req.user!.userId,
    createdAt: new Date().toISOString(),
  };

  results.push(newResult);

  const itemIdx = orderItems.findIndex(oi => oi.id === parseInt(orderItemId));
  if (itemIdx !== -1) orderItems[itemIdx].status = 'completed';

  res.status(201).json({ success: true, data: newResult, message: 'Result entered successfully' });
};

export const update = (req: AuthRequest, res: Response): void => {
  const idx = results.findIndex(r => r.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Result not found' });
    return;
  }
  results[idx] = { ...results[idx], ...req.body };
  res.json({ success: true, data: results[idx], message: 'Result updated successfully' });
};

export const verify = (req: AuthRequest, res: Response): void => {
  const idx = results.findIndex(r => r.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Result not found' });
    return;
  }
  results[idx].verifiedBy = req.user!.userId;
  res.json({ success: true, data: results[idx], message: 'Result verified' });
};
