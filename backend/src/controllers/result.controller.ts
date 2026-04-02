import { Response } from 'express';
import { Op } from 'sequelize';
import { Result } from '../models/Result.js';
import { OrderItem } from '../models/OrderItem.js';
import { TestOrder } from '../models/TestOrder.js';
import { Patient } from '../models/Patient.js';
import { Test } from '../models/Test.js';
import { User } from '../models/User.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId, status } = req.query as Record<string, string>;

  let itemIds: number[] | undefined;
  if (orderId) {
    const items = await OrderItem.findAll({ where: { orderId: parseInt(orderId) }, attributes: ['id'] });
    itemIds = items.map(i => i.id);
  }

  const where: Record<string, unknown> = {};
  if (itemIds) where.orderItemId = { [Op.in]: itemIds };
  if (status) where.resultStatus = status;

  const results = await Result.findAll({ where });
  const allItemIds = results.map(r => r.orderItemId);
  const items = await OrderItem.findAll({ where: { id: { [Op.in]: allItemIds } } });
  const orderIds = [...new Set(items.map(i => i.orderId))];
  const testIds = [...new Set(items.map(i => i.testId))];
  const userIds = [...new Set([
    ...results.map(r => r.enteredBy),
    ...results.filter(r => r.verifiedBy).map(r => r.verifiedBy),
  ])];

  const [orders, tests, users] = await Promise.all([
    TestOrder.findAll({ where: { id: { [Op.in]: orderIds } } }),
    Test.findAll({ where: { id: { [Op.in]: testIds } } }),
    User.findAll({ where: { id: { [Op.in]: userIds } } }),
  ]);
  const patientIds = [...new Set(orders.map(o => o.patientId))];
  const patients = await Patient.findAll({ where: { id: { [Op.in]: patientIds } } });

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

  const existing = await Result.findOne({ where: { orderItemId: parseInt(orderItemId) } });
  if (existing) { res.status(400).json({ success: false, message: 'Result already entered for this order item' }); return; }

  const newResult = await Result.create({
    orderItemId: parseInt(orderItemId),
    resultValue, unit, normalRange, resultStatus,
    enteredBy: req.user!.userId,
    createdAt: new Date(),
  });

  await OrderItem.update({ status: 'completed' }, { where: { id: parseInt(orderItemId) } });

  res.status(201).json({ success: true, data: newResult, message: 'Result entered successfully' });
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await Result.findOne({ where: { id: parseInt(req.params.id) } });
  if (!result) { res.status(404).json({ success: false, message: 'Result not found' }); return; }
  await result.update(req.body);
  res.json({ success: true, data: result, message: 'Result updated successfully' });
};

export const verify = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await Result.findOne({ where: { id: parseInt(req.params.id) } });
  if (!result) { res.status(404).json({ success: false, message: 'Result not found' }); return; }
  await result.update({ verifiedBy: req.user!.userId });
  res.json({ success: true, data: result, message: 'Result verified' });
};
