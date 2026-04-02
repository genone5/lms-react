import { Response } from 'express';
import { Op } from 'sequelize';
import { Patient } from '../models/Patient.js';
import { TestOrder } from '../models/TestOrder.js';
import { OrderItem } from '../models/OrderItem.js';
import { Test } from '../models/Test.js';
import { Result } from '../models/Result.js';
import { Invoice } from '../models/Invoice.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, gender, page = '1', limit = '10' } = req.query as Record<string, string>;

  const where: Record<string, unknown> = {};
  if (gender) where.gender = gender;
  if (search) {
    where[Op.or as symbol] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { phone: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { idCardNumber: { [Op.iLike]: `%${search.replace(/-/g, '')}%` } },
    ];
  }

  const { rows: data, count: total } = await Patient.findAndCountAll({
    where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['createdAt', 'DESC']],
  });

  res.json({ success: true, data, total, page: parseInt(page), limit: parseInt(limit) });
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const patient = await Patient.findOne({ where: { id: parseInt(req.params.id) } });
  if (!patient) { res.status(404).json({ success: false, message: 'Patient not found' }); return; }
  res.json({ success: true, data: patient });
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  const { firstName, lastName, gender, dateOfBirth, age, idCardNumber, phone, email, address, bloodGroup, emergencyContact } = req.body;
  if (!firstName || !lastName || !phone) {
    res.status(400).json({ success: false, message: 'First name, last name and phone are required' });
    return;
  }

  const newPatient = await Patient.create({
    firstName, lastName, gender,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    age: age ? parseInt(age) : undefined,
    idCardNumber, phone, email, address, bloodGroup, emergencyContact,
    createdAt: new Date(),
  });

  res.status(201).json({ success: true, data: newPatient, message: 'Patient created successfully' });
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  const patient = await Patient.findOne({ where: { id: parseInt(req.params.id) } });
  if (!patient) { res.status(404).json({ success: false, message: 'Patient not found' }); return; }

  await patient.update(req.body);
  res.json({ success: true, data: patient, message: 'Patient updated successfully' });
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  const patient = await Patient.findOne({ where: { id: parseInt(req.params.id) } });
  if (!patient) { res.status(404).json({ success: false, message: 'Patient not found' }); return; }

  await patient.destroy();
  res.json({ success: true, message: 'Patient deleted successfully' });
};

export const getTestHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const patientId = parseInt(req.params.id);
  const patient = await Patient.findOne({ where: { id: patientId } });
  if (!patient) { res.status(404).json({ success: false, message: 'Patient not found' }); return; }

  const orders = await TestOrder.findAll({ where: { patientId } });
  const orderIds = orders.map(o => o.id);
  const [allItems, allTests, allResults, allInvoices] = await Promise.all([
    OrderItem.findAll({ where: { orderId: { [Op.in]: orderIds } } }),
    Test.findAll(),
    Result.findAll(),
    Invoice.findAll({ where: { orderId: { [Op.in]: orderIds } } }),
  ]);

  const enrichedOrders = orders.map(order => ({
    ...order.toJSON(),
    items: allItems.filter(oi => oi.orderId === order.id).map(oi => ({
      ...oi.toJSON(),
      testName: allTests.find(t => t.id === oi.testId)?.name,
      result: allResults.find(r => r.orderItemId === oi.id),
    })),
    invoice: allInvoices.find(inv => inv.orderId === order.id),
  }));

  res.json({ success: true, data: { patient, orders: enrichedOrders } });
};
