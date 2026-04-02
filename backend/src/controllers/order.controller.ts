import { Response } from 'express';
import { TestOrder } from '../models/TestOrder.js';
import { OrderItem } from '../models/OrderItem.js';
import { Patient } from '../models/Patient.js';
import { Test } from '../models/Test.js';
import { getNextId } from '../db/counter.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, patientId, page = '1', limit = '10' } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (patientId) filter.patientId = parseInt(patientId);

  const total = await TestOrder.countDocuments(filter);
  const orders = await TestOrder.find(filter)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .sort({ orderDate: -1 });

  const patientIds = [...new Set(orders.map(o => o.patientId))];
  const orderIds = orders.map(o => o.id);
  const [patients, allItems, allTests] = await Promise.all([
    Patient.find({ id: { $in: patientIds } }),
    OrderItem.find({ orderId: { $in: orderIds } }),
    Test.find({}),
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
  const order = await TestOrder.findOne({ id: parseInt(req.params.id) });
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  const [patient, items, tests] = await Promise.all([
    Patient.findOne({ id: order.patientId }),
    OrderItem.find({ orderId: order.id }),
    Test.find({}),
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

  const patient = await Patient.findOne({ id: parseInt(patientId) });
  if (!patient) {
    res.status(404).json({ success: false, message: 'Patient not found' });
    return;
  }

  const newOrder = new TestOrder({
    id: await getNextId('testorder'),
    patientId: parseInt(patientId),
    doctorName,
    branchId: parseInt(branchId),
    status: 'pending',
    orderDate: new Date().toISOString(),
    createdBy: req.user!.userId,
  });
  await newOrder.save();

  const tests = await Test.find({ id: { $in: testIds } });
  const itemDocs = await Promise.all(
    (testIds as number[]).map(async (testId: number) => {
      const test = tests.find(t => t.id === testId);
      const item = new OrderItem({
        id: await getNextId('orderitem'),
        orderId: newOrder.id,
        testId,
        price: test?.price || 0,
        status: 'pending',
      });
      await item.save();
      return item;
    })
  );

  res.status(201).json({
    success: true,
    data: { ...newOrder.toJSON(), items: itemDocs },
    message: 'Order created successfully',
  });
};

export const updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await TestOrder.findOne({ id: parseInt(req.params.id) });
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }
  order.status = req.body.status;
  await order.save();
  res.json({ success: true, data: order, message: 'Order status updated' });
};

export const cancel = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await TestOrder.findOne({ id: parseInt(req.params.id) });
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }
  order.status = 'cancelled';
  await order.save();
  res.json({ success: true, message: 'Order cancelled' });
};

export const getItems = async (req: AuthRequest, res: Response): Promise<void> => {
  const items = await OrderItem.find({ orderId: parseInt(req.params.id) });
  const tests = await Test.find({ id: { $in: items.map(i => i.testId) } });
  const data = items.map(i => ({ ...i.toJSON(), testName: tests.find(t => t.id === i.testId)?.name }));
  res.json({ success: true, data });
};
