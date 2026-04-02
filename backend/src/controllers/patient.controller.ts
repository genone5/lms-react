import { Response } from 'express';
import { Patient } from '../models/Patient.js';
import { TestOrder } from '../models/TestOrder.js';
import { OrderItem } from '../models/OrderItem.js';
import { Test } from '../models/Test.js';
import { Result } from '../models/Result.js';
import { Invoice } from '../models/Invoice.js';
import { getNextId } from '../db/counter.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, gender, page = '1', limit = '10' } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (gender) filter.gender = gender;
  if (search) {
    const q = search.replace(/-/g, '');
    filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { idCardNumber: new RegExp(q.replace(/(\d{5})(\d{7})(\d)/, '$1-$2-$3'), 'i') },
    ];
  }

  const total = await Patient.countDocuments(filter);
  const data = await Patient.find(filter)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  res.json({ success: true, data, total, page: parseInt(page), limit: parseInt(limit) });
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const patient = await Patient.findOne({ id: parseInt(req.params.id) });
  if (!patient) {
    res.status(404).json({ success: false, message: 'Patient not found' });
    return;
  }
  res.json({ success: true, data: patient });
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const { firstName, lastName, gender, dateOfBirth, age, idCardNumber, phone, email, address, bloodGroup, emergencyContact } = req.body;

  if (!firstName || !lastName || !phone) {
    res.status(400).json({ success: false, message: 'First name, last name and phone are required' });
    return;
  }

  const newPatient = new Patient({
    id: await getNextId('patient'),
    firstName, lastName, gender, dateOfBirth,
    age: age ? parseInt(age) : undefined,
    idCardNumber,
    phone, email, address, bloodGroup, emergencyContact,
    createdAt: new Date().toISOString(),
  });

  await newPatient.save();
  res.status(201).json({ success: true, data: newPatient, message: 'Patient created successfully' });
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const patient = await Patient.findOne({ id: parseInt(req.params.id) });
  if (!patient) {
    res.status(404).json({ success: false, message: 'Patient not found' });
    return;
  }
  Object.assign(patient, req.body);
  await patient.save();
  res.json({ success: true, data: patient, message: 'Patient updated successfully' });
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  const patient = await Patient.findOneAndDelete({ id: parseInt(req.params.id) });
  if (!patient) {
    res.status(404).json({ success: false, message: 'Patient not found' });
    return;
  }
  res.json({ success: true, message: 'Patient deleted successfully' });
};

export const getTestHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const patientId = parseInt(req.params.id);
  const patient = await Patient.findOne({ id: patientId });
  if (!patient) {
    res.status(404).json({ success: false, message: 'Patient not found' });
    return;
  }

  const orders = await TestOrder.find({ patientId });
  const [allItems, allTests, allResults, allInvoices] = await Promise.all([
    OrderItem.find({ orderId: { $in: orders.map(o => o.id) } }),
    Test.find({}),
    Result.find({}),
    Invoice.find({ orderId: { $in: orders.map(o => o.id) } }),
  ]);

  const enrichedOrders = orders.map((order: (typeof orders)[number]) => ({
    ...order.toJSON(),
    items: allItems
      .filter((oi: (typeof allItems)[number]) => oi.orderId === order.id)
      .map((oi: (typeof allItems)[number]) => ({
        ...oi.toJSON(),
        testName: allTests.find((t: (typeof allTests)[number]) => t.id === oi.testId)?.name,
        result: allResults.find((r: (typeof allResults)[number]) => r.orderItemId === oi.id),
      })),
    invoice: allInvoices.find((inv: (typeof allInvoices)[number]) => inv.orderId === order.id),
  }));

  res.json({ success: true, data: { patient, orders: enrichedOrders } });
};
