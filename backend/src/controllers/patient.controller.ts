import { Response } from 'express';
import { patients, testOrders, orderItems, tests, results, invoices } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { Patient } from '../types/index.js';

let nextId = patients.length + 1;

export const getAll = (req: AuthRequest, res: Response): void => {
  const { search, gender, page = '1', limit = '10' } = req.query as Record<string, string>;
  let data = [...patients];

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(p =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.email?.toLowerCase().includes(q) ?? false)
    );
  }
  if (gender) data = data.filter(p => p.gender === gender);

  const total = data.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paged = data.slice(start, start + parseInt(limit));

  res.json({ success: true, data: paged, total, page: parseInt(page), limit: parseInt(limit) });
};

export const getById = (req: AuthRequest, res: Response): void => {
  const patient = patients.find(p => p.id === parseInt(req.params.id));
  if (!patient) {
    res.status(404).json({ success: false, message: 'Patient not found' });
    return;
  }
  res.json({ success: true, data: patient });
};

export const create = (req: AuthRequest, res: Response): void => {
  const { firstName, lastName, gender, dateOfBirth, phone, email, address, bloodGroup, emergencyContact } = req.body;

  if (!firstName || !lastName || !phone) {
    res.status(400).json({ success: false, message: 'First name, last name and phone are required' });
    return;
  }

  const newPatient: Patient = {
    id: nextId++,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone,
    email,
    address,
    bloodGroup,
    emergencyContact,
    createdAt: new Date().toISOString(),
  };

  patients.push(newPatient);
  res.status(201).json({ success: true, data: newPatient, message: 'Patient created successfully' });
};

export const update = (req: AuthRequest, res: Response): void => {
  const idx = patients.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Patient not found' });
    return;
  }

  patients[idx] = { ...patients[idx], ...req.body };
  res.json({ success: true, data: patients[idx], message: 'Patient updated successfully' });
};

export const remove = (req: AuthRequest, res: Response): void => {
  const idx = patients.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Patient not found' });
    return;
  }

  patients.splice(idx, 1);
  res.json({ success: true, message: 'Patient deleted successfully' });
};

export const getTestHistory = (req: AuthRequest, res: Response): void => {
  const patientId = parseInt(req.params.id);
  const patient = patients.find(p => p.id === patientId);
  if (!patient) {
    res.status(404).json({ success: false, message: 'Patient not found' });
    return;
  }

  const orders = testOrders
    .filter(o => o.patientId === patientId)
    .map(order => ({
      ...order,
      items: orderItems
        .filter(oi => oi.orderId === order.id)
        .map(oi => ({
          ...oi,
          testName: tests.find(t => t.id === oi.testId)?.name,
          result: results.find(r => r.orderItemId === oi.id),
        })),
      invoice: invoices.find(inv => inv.orderId === order.id),
    }));

  res.json({ success: true, data: { patient, orders } });
};
