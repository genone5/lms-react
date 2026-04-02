import { Response } from 'express';
import { Op } from 'sequelize';
import { TestOrder } from '../models/TestOrder.js';
import { OrderItem } from '../models/OrderItem.js';
import { Patient } from '../models/Patient.js';
import { Test } from '../models/Test.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, patientId, page = '1', limit = '10' } = req.query as Record<string, string>;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (patientId) where.patientId = parseInt(patientId);

  const { rows: orders, count: total } = await TestOrder.findAndCountAll({
    where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['orderDate', 'DESC']],
  });

  const patientIds = [...new Set(orders.map(o => o.patientId))];
  const orderIds = orders.map(o => o.id);
  const [patients, allItems, allTests] = await Promise.all([
    Patient.findAll({ where: { id: { [Op.in]: patientIds } } }),
    OrderItem.findAll({ where: { orderId: { [Op.in]: orderIds } } }),
    Test.findAll(),
  ]);

  const data = orders.map(o => ({
    ...o.toJSON(),
    patientName: (() => {
      const p = patients.find(pt => pt.id === o.patientId);
      return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
    })(),
    items: allItems
      .filter(i => i.orderId === o.id)
      .map(i => ({ ...i.toJSON(), testName: allTests.find(t => t.id === i.testId)?.name })),
  }));

  res.json({ success: true, data, total });
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await TestOrder.findOne({ where: { id: parseInt(req.params.id) } });
  if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }

  const [patient, items, tests] = await Promise.all([
    Patient.findOne({ where: { id: order.patientId } }),
    OrderItem.findAll({ where: { orderId: order.id } }),
    Test.findAll(),
  ]);

  const enrichedItems = items.map(i => ({
    ...i.toJSON(),
    testName: tests.find(t => t.id === i.testId)?.name,
    testPrice: tests.find(t => t.id === i.testId)?.price,
  }));

  res.json({ success: true, data: { ...order.toJSON(), patient, items: enrichedItems } });
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const { patientId, doctorName, branchId, testIds } = req.body;
  if (!patientId || !doctorName || !branchId || !testIds?.length) {
    res.status(400).json({ success: false, message: 'patientId, doctorName, branchId and testIds are required' });
    return;
  }

  const patient = await Patient.findOne({ where: { id: parseInt(patientId) } });
  if (!patient) { res.status(404).json({ success: false, message: 'Patient not found' }); return; }

  const newOrder = await TestOrder.create({
    patientId: parseInt(patientId),
    doctorName,
    branchId: parseInt(branchId),
    status: 'pending',
    orderDate: new Date(),
    createdBy: req.user!.userId,
  });

  const tests = await Test.findAll({ where: { id: { [Op.in]: testIds } } });
  const items = await Promise.all(
    (testIds as number[]).map(async (testId: number) => {
      const test = tests.find(t => t.id === testId);
      return OrderItem.create({ orderId: newOrder.id, testId, price: test?.price || 0, status: 'pending' });
    })
  );

  res.status(201).json({ success: true, data: { ...newOrder.toJSON(), items }, message: 'Order created successfully' });
};

export const updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await TestOrder.findOne({ where: { id: parseInt(req.params.id) } });
  if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
  await order.update({ status: req.body.status });
  res.json({ success: true, data: order, message: 'Order status updated' });
};

export const cancel = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await TestOrder.findOne({ where: { id: parseInt(req.params.id) } });
  if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
  await order.update({ status: 'cancelled' });
  res.json({ success: true, message: 'Order cancelled' });
};

export const getItems = async (req: AuthRequest, res: Response): Promise<void> => {
  const items = await OrderItem.findAll({ where: { orderId: parseInt(req.params.id) } });
  const testIds = items.map(i => i.testId);
  const tests = await Test.findAll({ where: { id: { [Op.in]: testIds } } });
  const data = items.map(i => ({ ...i.toJSON(), testName: tests.find(t => t.id === i.testId)?.name }));
  res.json({ success: true, data });
};
