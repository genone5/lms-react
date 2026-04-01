import { Response } from 'express';
import { testOrders, orderItems, patients, tests } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { TestOrder, OrderItem } from '../types/index.js';

let nextOrderId = testOrders.length + 1;
let nextItemId = orderItems.length + 1;

export const getAll = (req: AuthRequest, res: Response): void => {
  const { status, patientId, page = '1', limit = '10' } = req.query as Record<string, string>;
  let data = testOrders.map(o => ({
    ...o,
    patientName: patients.find(p => p.id === o.patientId)
      ? `${patients.find(p => p.id === o.patientId)!.firstName} ${patients.find(p => p.id === o.patientId)!.lastName}`
      : 'Unknown',
    items: orderItems.filter(i => i.orderId === o.id).map(i => ({
      ...i,
      testName: tests.find(t => t.id === i.testId)?.name,
    })),
  }));

  if (status) data = data.filter(o => o.status === status);
  if (patientId) data = data.filter(o => o.patientId === parseInt(patientId));

  const total = data.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paged = data.slice(start, start + parseInt(limit));

  res.json({ success: true, data: paged, total });
};

export const getById = (req: AuthRequest, res: Response): void => {
  const order = testOrders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  const patient = patients.find(p => p.id === order.patientId);
  const items = orderItems.filter(i => i.orderId === order.id).map(i => ({
    ...i,
    testName: tests.find(t => t.id === i.testId)?.name,
    testPrice: tests.find(t => t.id === i.testId)?.price,
  }));

  res.json({
    success: true,
    data: {
      ...order,
      patient,
      items,
    },
  });
};

export const create = (req: AuthRequest, res: Response): void => {
  const { patientId, doctorName, branchId, testIds } = req.body;

  if (!patientId || !doctorName || !branchId || !testIds?.length) {
    res.status(400).json({ success: false, message: 'patientId, doctorName, branchId and testIds are required' });
    return;
  }

  const patient = patients.find(p => p.id === parseInt(patientId));
  if (!patient) {
    res.status(404).json({ success: false, message: 'Patient not found' });
    return;
  }

  const newOrder: TestOrder = {
    id: nextOrderId++,
    patientId: parseInt(patientId),
    doctorName,
    branchId: parseInt(branchId),
    status: 'pending',
    orderDate: new Date().toISOString(),
    createdBy: req.user!.userId,
  };

  testOrders.push(newOrder);

  const newItems: OrderItem[] = (testIds as number[]).map(testId => {
    const test = tests.find(t => t.id === testId);
    const item: OrderItem = {
      id: nextItemId++,
      orderId: newOrder.id,
      testId,
      price: test?.price || 0,
      status: 'pending',
    };
    orderItems.push(item);
    return item;
  });

  res.status(201).json({
    success: true,
    data: { ...newOrder, items: newItems },
    message: 'Order created successfully',
  });
};

export const updateStatus = (req: AuthRequest, res: Response): void => {
  const idx = testOrders.findIndex(o => o.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }
  testOrders[idx].status = req.body.status;
  res.json({ success: true, data: testOrders[idx], message: 'Order status updated' });
};

export const cancel = (req: AuthRequest, res: Response): void => {
  const idx = testOrders.findIndex(o => o.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }
  testOrders[idx].status = 'cancelled';
  res.json({ success: true, message: 'Order cancelled' });
};

export const getItems = (req: AuthRequest, res: Response): void => {
  const orderId = parseInt(req.params.id);
  const items = orderItems.filter(i => i.orderId === orderId).map(i => ({
    ...i,
    testName: tests.find(t => t.id === i.testId)?.name,
  }));
  res.json({ success: true, data: items });
};
