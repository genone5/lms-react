import { Response } from 'express';
import { samples, orderItems, testOrders, patients, tests } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { Sample } from '../types/index.js';

let nextId = samples.length + 1;

export const getPending = (_req: AuthRequest, res: Response): void => {
  const pendingItems = orderItems.filter(oi =>
    oi.status === 'pending' && !samples.find(s => s.orderItemId === oi.id)
  ).map(oi => {
    const order = testOrders.find(o => o.id === oi.orderId);
    const patient = patients.find(p => p.id === order?.patientId);
    const test = tests.find(t => t.id === oi.testId);
    return {
      ...oi,
      testName: test?.name,
      sampleType: test?.sampleType,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      doctorName: order?.doctorName,
      orderDate: order?.orderDate,
    };
  });

  res.json({ success: true, data: pendingItems });
};

export const collect = (req: AuthRequest, res: Response): void => {
  const { orderItemId, sampleType } = req.body;
  if (!orderItemId || !sampleType) {
    res.status(400).json({ success: false, message: 'orderItemId and sampleType are required' });
    return;
  }

  const existingSample = samples.find(s => s.orderItemId === parseInt(orderItemId));
  if (existingSample) {
    res.status(400).json({ success: false, message: 'Sample already collected for this order item' });
    return;
  }

  const newSample: Sample = {
    id: nextId++,
    orderItemId: parseInt(orderItemId),
    sampleType,
    collectedBy: req.user!.userId,
    collectionTime: new Date().toISOString(),
    status: 'collected',
  };

  samples.push(newSample);

  const itemIdx = orderItems.findIndex(oi => oi.id === parseInt(orderItemId));
  if (itemIdx !== -1) orderItems[itemIdx].status = 'collected';

  res.status(201).json({ success: true, data: newSample, message: 'Sample collected successfully' });
};

export const updateStatus = (req: AuthRequest, res: Response): void => {
  const idx = samples.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Sample not found' });
    return;
  }
  samples[idx].status = req.body.status;
  res.json({ success: true, data: samples[idx], message: 'Sample status updated' });
};

export const getHistory = (_req: AuthRequest, res: Response): void => {
  const data = samples.map(s => {
    const item = orderItems.find(oi => oi.id === s.orderItemId);
    const order = testOrders.find(o => o.id === item?.orderId);
    const patient = patients.find(p => p.id === order?.patientId);
    const test = tests.find(t => t.id === item?.testId);
    return {
      ...s,
      testName: test?.name,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
    };
  });
  res.json({ success: true, data });
};
