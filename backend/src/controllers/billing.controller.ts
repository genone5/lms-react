import { Response } from 'express';
import { Op } from 'sequelize';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { TestOrder } from '../models/TestOrder.js';
import { Patient } from '../models/Patient.js';
import { OrderItem } from '../models/OrderItem.js';
import { Test } from '../models/Test.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, page = '1', limit = '10' } = req.query as Record<string, string>;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const { rows: invoices, count: total } = await Invoice.findAndCountAll({
    where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['createdAt', 'DESC']],
  });

  const orderIds = invoices.map(inv => inv.orderId);
  const orders = await TestOrder.findAll({ where: { id: { [Op.in]: orderIds } } });
  const patientIds = [...new Set(orders.map(o => o.patientId))];
  const patients = await Patient.findAll({ where: { id: { [Op.in]: patientIds } } });

  const data = invoices.map(inv => {
    const order = orders.find(o => o.id === inv.orderId);
    const patient = patients.find(p => p.id === order?.patientId);
    return {
      ...inv.toJSON(),
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      doctorName: order?.doctorName,
    };
  });

  res.json({ success: true, data, total });
};

export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  const invoice = await Invoice.findOne({ where: { id: parseInt(req.params.id) } });
  if (!invoice) { res.status(404).json({ success: false, message: 'Invoice not found' }); return; }

  const order = await TestOrder.findOne({ where: { id: invoice.orderId } });
  const [patient, items, tests, invoicePayments] = await Promise.all([
    Patient.findOne({ where: { id: order?.patientId } }),
    OrderItem.findAll({ where: { orderId: invoice.orderId } }),
    Test.findAll(),
    Payment.findAll({ where: { invoiceId: invoice.id } }),
  ]);

  const enrichedItems = items.map(oi => ({ ...oi.toJSON(), testName: tests.find(t => t.id === oi.testId)?.name }));
  res.json({ success: true, data: { ...invoice.toJSON(), patient, order, items: enrichedItems, payments: invoicePayments } });
};

export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId, discount = 0, tax = 0 } = req.body;
  if (!orderId) { res.status(400).json({ success: false, message: 'orderId is required' }); return; }

  const existing = await Invoice.findOne({ where: { orderId: parseInt(orderId) } });
  if (existing) { res.status(400).json({ success: false, message: 'Invoice already exists for this order' }); return; }

  const items = await OrderItem.findAll({ where: { orderId: parseInt(orderId) } });
  const totalAmount = items.reduce((sum, oi) => sum + oi.price, 0);
  const netAmount = totalAmount - parseFloat(discount) + parseFloat(tax);

  const newInvoice = await Invoice.create({
    orderId: parseInt(orderId),
    totalAmount,
    discount: parseFloat(discount),
    tax: parseFloat(tax),
    netAmount,
    status: 'unpaid',
    createdAt: new Date(),
  });
  res.status(201).json({ success: true, data: newInvoice, message: 'Invoice created successfully' });
};

export const updateInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  const invoice = await Invoice.findOne({ where: { id: parseInt(req.params.id) } });
  if (!invoice) { res.status(404).json({ success: false, message: 'Invoice not found' }); return; }
  await invoice.update(req.body);
  res.json({ success: true, data: invoice, message: 'Invoice updated' });
};

export const applyDiscount = async (req: AuthRequest, res: Response): Promise<void> => {
  const invoice = await Invoice.findOne({ where: { id: parseInt(req.params.id) } });
  if (!invoice) { res.status(404).json({ success: false, message: 'Invoice not found' }); return; }
  const discount = parseFloat(req.body.discount);
  await invoice.update({ discount, netAmount: invoice.totalAmount - discount + invoice.tax });
  res.json({ success: true, data: invoice, message: 'Discount applied' });
};

export const collectPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { invoiceId, amount, paymentMethod } = req.body;
  if (!invoiceId || !amount || !paymentMethod) {
    res.status(400).json({ success: false, message: 'invoiceId, amount and paymentMethod are required' });
    return;
  }

  const invoice = await Invoice.findOne({ where: { id: parseInt(invoiceId) } });
  if (!invoice) { res.status(404).json({ success: false, message: 'Invoice not found' }); return; }

  const newPayment = await Payment.create({
    invoiceId: parseInt(invoiceId),
    amount: parseFloat(amount),
    paymentMethod,
    paymentDate: new Date(),
    receivedBy: req.user!.userId,
  });

  await invoice.update({ status: 'paid' });

  res.status(201).json({ success: true, data: newPayment, message: 'Payment recorded successfully' });
};

export const getPayments = async (_req: AuthRequest, res: Response): Promise<void> => {
  const payments = await Payment.findAll();
  const invoiceIds = payments.map(p => p.invoiceId);
  const invoices = await Invoice.findAll({ where: { id: { [Op.in]: invoiceIds } } });
  const orderIds = invoices.map(inv => inv.orderId);
  const orders = await TestOrder.findAll({ where: { id: { [Op.in]: orderIds } } });
  const patientIds = [...new Set(orders.map(o => o.patientId))];
  const patients = await Patient.findAll({ where: { id: { [Op.in]: patientIds } } });

  const data = payments.map(p => {
    const invoice = invoices.find(inv => inv.id === p.invoiceId);
    const order = orders.find(o => o.id === invoice?.orderId);
    const patient = patients.find(pt => pt.id === order?.patientId);
    return {
      ...p.toJSON(),
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      invoiceNetAmount: invoice?.netAmount,
    };
  });

  res.json({ success: true, data });
};

export const getReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  const payment = await Payment.findOne({ where: { id: parseInt(req.params.id) } });
  if (!payment) { res.status(404).json({ success: false, message: 'Payment not found' }); return; }

  const invoice = await Invoice.findOne({ where: { id: payment.invoiceId } });
  const order = await TestOrder.findOne({ where: { id: invoice?.orderId } });
  const [patient, items, tests] = await Promise.all([
    Patient.findOne({ where: { id: order?.patientId } }),
    OrderItem.findAll({ where: { orderId: order?.id } }),
    Test.findAll(),
  ]);

  const enrichedItems = items.map(oi => ({ ...oi.toJSON(), testName: tests.find(t => t.id === oi.testId)?.name }));
  res.json({ success: true, data: { payment, invoice, patient, items: enrichedItems } });
};
