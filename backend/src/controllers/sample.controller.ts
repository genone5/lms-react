import { Response } from 'express';
import { Op } from 'sequelize';
import { Sample } from '../models/Sample.js';
import { OrderItem } from '../models/OrderItem.js';
import { TestOrder } from '../models/TestOrder.js';
import { Patient } from '../models/Patient.js';
import { Test } from '../models/Test.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getPending = async (_req: AuthRequest, res: Response): Promise<void> => {
  const collectedSamples = await Sample.findAll({ attributes: ['orderItemId'] });
  const collectedItemIds = collectedSamples.map(s => s.orderItemId);

  const where: Record<string, unknown> = { status: 'pending' };
  if (collectedItemIds.length) where.id = { [Op.notIn]: collectedItemIds };

  const pendingItems = await OrderItem.findAll({ where });
  const orderIds = [...new Set(pendingItems.map(oi => oi.orderId))];
  const testIds = [...new Set(pendingItems.map(oi => oi.testId))];
  const [orders, tests] = await Promise.all([
    TestOrder.findAll({ where: { id: { [Op.in]: orderIds } } }),
    Test.findAll({ where: { id: { [Op.in]: testIds } } }),
  ]);
  const patientIds = [...new Set(orders.map(o => o.patientId))];
  const patients = await Patient.findAll({ where: { id: { [Op.in]: patientIds } } });

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

  const existing = await Sample.findOne({ where: { orderItemId: parseInt(orderItemId) } });
  if (existing) { res.status(400).json({ success: false, message: 'Sample already collected for this order item' }); return; }

  const newSample = await Sample.create({
    orderItemId: parseInt(orderItemId),
    sampleType,
    collectedBy: req.user!.userId,
    collectionTime: new Date(),
    status: 'collected',
  });

  await OrderItem.update({ status: 'collected' }, { where: { id: parseInt(orderItemId) } });

  res.status(201).json({ success: true, data: newSample, message: 'Sample collected successfully' });
};

export const updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const sample = await Sample.findOne({ where: { id: parseInt(req.params.id) } });
  if (!sample) { res.status(404).json({ success: false, message: 'Sample not found' }); return; }
  await sample.update({ status: req.body.status });
  res.json({ success: true, data: sample, message: 'Sample status updated' });
};

export const getHistory = async (_req: AuthRequest, res: Response): Promise<void> => {
  const samples = await Sample.findAll();
  const itemIds = samples.map(s => s.orderItemId);
  const items = await OrderItem.findAll({ where: { id: { [Op.in]: itemIds } } });
  const orderIds = [...new Set(items.map(i => i.orderId))];
  const testIds = [...new Set(items.map(i => i.testId))];
  const [orders, tests] = await Promise.all([
    TestOrder.findAll({ where: { id: { [Op.in]: orderIds } } }),
    Test.findAll({ where: { id: { [Op.in]: testIds } } }),
  ]);
  const patientIds = [...new Set(orders.map(o => o.patientId))];
  const patients = await Patient.findAll({ where: { id: { [Op.in]: patientIds } } });

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
