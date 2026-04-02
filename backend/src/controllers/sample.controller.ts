import { Response } from 'express';
import { Sample } from '../models/Sample.js';
import { OrderItem } from '../models/OrderItem.js';
import { TestOrder } from '../models/TestOrder.js';
import { Patient } from '../models/Patient.js';
import { Test } from '../models/Test.js';
import { getNextId } from '../db/counter.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getPending = async (_req: AuthRequest, res: Response): Promise<void> => {
  const collectedItemIds = (await Sample.find({}, 'orderItemId')).map(s => s.orderItemId);
  const pendingItems = await OrderItem.find({ status: 'pending', id: { $nin: collectedItemIds } });

  const orderIds = [...new Set(pendingItems.map(oi => oi.orderId))];
  const testIds = [...new Set(pendingItems.map(oi => oi.testId))];
  const [orders, tests] = await Promise.all([
    TestOrder.find({ id: { $in: orderIds } }),
    Test.find({ id: { $in: testIds } }),
  ]);
  const patientIds = [...new Set(orders.map(o => o.patientId))];
  const patients = await Patient.find({ id: { $in: patientIds } });

  const data = pendingItems.map(oi => {
    const order = orders.find(o => o.id === oi.orderId);
    const patient = patients.find(p => p.id === order?.patientId);
    const test = tests.find(t => t.id === oi.testId);
    return {
      ...oi.toJSON(),
      testName: test?.name,
      sampleType: test?.sampleType,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      doctorName: order?.doctorName,
      orderDate: order?.orderDate,
    };
  });

  res.json({ success: true, data });
};

export const collect = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderItemId, sampleType } = req.body;
  if (!orderItemId || !sampleType) {
    res.status(400).json({ success: false, message: 'orderItemId and sampleType are required' });
    return;
  }

  const existing = await Sample.findOne({ orderItemId: parseInt(orderItemId) });
  if (existing) {
    res.status(400).json({ success: false, message: 'Sample already collected for this order item' });
    return;
  }

  const newSample = new Sample({
    id: await getNextId('sample'),
    orderItemId: parseInt(orderItemId),
    sampleType,
    collectedBy: req.user!.userId,
    collectionTime: new Date().toISOString(),
    status: 'collected',
  });
  await newSample.save();

  await OrderItem.findOneAndUpdate({ id: parseInt(orderItemId) }, { status: 'collected' });

  res.status(201).json({ success: true, data: newSample, message: 'Sample collected successfully' });
};

export const updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const sample = await Sample.findOne({ id: parseInt(req.params.id) });
  if (!sample) {
    res.status(404).json({ success: false, message: 'Sample not found' });
    return;
  }
  sample.status = req.body.status;
  await sample.save();
  res.json({ success: true, data: sample, message: 'Sample status updated' });
};

export const getHistory = async (_req: AuthRequest, res: Response): Promise<void> => {
  const samples = await Sample.find({});
  const itemIds = samples.map(s => s.orderItemId);
  const items = await OrderItem.find({ id: { $in: itemIds } });
  const orderIds = [...new Set(items.map(i => i.orderId))];
  const testIds = [...new Set(items.map(i => i.testId))];
  const [orders, tests] = await Promise.all([
    TestOrder.find({ id: { $in: orderIds } }),
    Test.find({ id: { $in: testIds } }),
  ]);
  const patientIds = [...new Set(orders.map(o => o.patientId))];
  const patients = await Patient.find({ id: { $in: patientIds } });

  const data = samples.map(s => {
    const item = items.find(i => i.id === s.orderItemId);
    const order = orders.find(o => o.id === item?.orderId);
    const patient = patients.find(p => p.id === order?.patientId);
    const test = tests.find(t => t.id === item?.testId);
    return {
      ...s.toJSON(),
      testName: test?.name,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
    };
  });

  res.json({ success: true, data });
};
