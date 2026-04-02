import { Response } from 'express';
import { Result } from '../models/Result.js';
import { OrderItem } from '../models/OrderItem.js';
import { TestOrder } from '../models/TestOrder.js';
import { Patient } from '../models/Patient.js';
import { Test } from '../models/Test.js';
import { User } from '../models/User.js';
import { getNextId } from '../db/counter.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId, status } = req.query as Record<string, string>;

  let itemIds: number[] | undefined;
  if (orderId) {
    const items = await OrderItem.find({ orderId: parseInt(orderId) }, 'id');
    itemIds = items.map(i => i.id);
  }

  const filter: Record<string, unknown> = {};
  if (itemIds) filter.orderItemId = { $in: itemIds };
  if (status) filter.resultStatus = status;

  const results = await Result.find(filter);
  const allItemIds = results.map(r => r.orderItemId);
  const items = await OrderItem.find({ id: { $in: allItemIds } });
  const orderIds = [...new Set(items.map(i => i.orderId))];
  const testIds = [...new Set(items.map(i => i.testId))];
  const userIds = [...new Set([...results.map(r => r.enteredBy), ...results.filter(r => r.verifiedBy).map(r => r.verifiedBy as number)])];

  const [orders, tests, users] = await Promise.all([
    TestOrder.find({ id: { $in: orderIds } }),
    Test.find({ id: { $in: testIds } }),
    User.find({ id: { $in: userIds } }),
  ]);
  const patientIds = [...new Set(orders.map(o => o.patientId))];
  const patients = await Patient.find({ id: { $in: patientIds } });

  const data = results.map(r => {
    const item = items.find(i => i.id === r.orderItemId);
    const order = orders.find(o => o.id === item?.orderId);
    const patient = patients.find(p => p.id === order?.patientId);
    const test = tests.find(t => t.id === item?.testId);
    return {
      ...r.toJSON(),
      testName: test?.name,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      orderId: order?.id,
      enteredByName: users.find(u => u.id === r.enteredBy)?.name,
      verifiedByName: r.verifiedBy ? users.find(u => u.id === r.verifiedBy)?.name : undefined,
    };
  });

  res.json({ success: true, data });
};

export const enter = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderItemId, resultValue, unit, normalRange, resultStatus } = req.body;
  if (!orderItemId || !resultValue || !unit || !normalRange || !resultStatus) {
    res.status(400).json({ success: false, message: 'All fields are required' });
    return;
  }

  const existing = await Result.findOne({ orderItemId: parseInt(orderItemId) });
  if (existing) {
    res.status(400).json({ success: false, message: 'Result already entered for this order item' });
    return;
  }

  const newResult = new Result({
    id: await getNextId('result'),
    orderItemId: parseInt(orderItemId),
    resultValue, unit, normalRange, resultStatus,
    enteredBy: req.user!.userId,
    createdAt: new Date().toISOString(),
  });
  await newResult.save();

  await OrderItem.findOneAndUpdate({ id: parseInt(orderItemId) }, { status: 'completed' });

  res.status(201).json({ success: true, data: newResult, message: 'Result entered successfully' });
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await Result.findOne({ id: parseInt(req.params.id) });
  if (!result) {
    res.status(404).json({ success: false, message: 'Result not found' });
    return;
  }
  Object.assign(result, req.body);
  await result.save();
  res.json({ success: true, data: result, message: 'Result updated successfully' });
};

export const verify = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await Result.findOne({ id: parseInt(req.params.id) });
  if (!result) {
    res.status(404).json({ success: false, message: 'Result not found' });
    return;
  }
  result.verifiedBy = req.user!.userId;
  await result.save();
  res.json({ success: true, data: result, message: 'Result verified' });
};
