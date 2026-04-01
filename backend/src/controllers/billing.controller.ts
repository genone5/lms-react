import { Response } from 'express';
import { invoices, payments, testOrders, patients, orderItems, tests } from '../data/mockData.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { Invoice, Payment } from '../types/index.js';

let nextInvoiceId = invoices.length + 1;
let nextPaymentId = payments.length + 1;

export const getInvoices = (req: AuthRequest, res: Response): void => {
  const { status, page = '1', limit = '10' } = req.query as Record<string, string>;
  let data = invoices.map(inv => {
    const order = testOrders.find(o => o.id === inv.orderId);
    const patient = patients.find(p => p.id === order?.patientId);
    return {
      ...inv,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      doctorName: order?.doctorName,
    };
  });

  if (status) data = data.filter(inv => inv.status === status);

  const total = data.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  res.json({ success: true, data: data.slice(start, start + parseInt(limit)), total });
};

export const getInvoiceById = (req: AuthRequest, res: Response): void => {
  const invoice = invoices.find(inv => inv.id === parseInt(req.params.id));
  if (!invoice) {
    res.status(404).json({ success: false, message: 'Invoice not found' });
    return;
  }

  const order = testOrders.find(o => o.id === invoice.orderId);
  const patient = patients.find(p => p.id === order?.patientId);
  const items = orderItems.filter(oi => oi.orderId === invoice.orderId).map(oi => ({
    ...oi,
    testName: tests.find(t => t.id === oi.testId)?.name,
  }));
  const invoicePayments = payments.filter(p => p.invoiceId === invoice.id);

  res.json({
    success: true,
    data: { ...invoice, patient, order, items, payments: invoicePayments },
  });
};

export const createInvoice = (req: AuthRequest, res: Response): void => {
  const { orderId, discount = 0, tax = 0 } = req.body;
  if (!orderId) {
    res.status(400).json({ success: false, message: 'orderId is required' });
    return;
  }

  const existing = invoices.find(inv => inv.orderId === parseInt(orderId));
  if (existing) {
    res.status(400).json({ success: false, message: 'Invoice already exists for this order' });
    return;
  }

  const items = orderItems.filter(oi => oi.orderId === parseInt(orderId));
  const totalAmount = items.reduce((sum, oi) => sum + oi.price, 0);
  const netAmount = totalAmount - parseFloat(discount) + parseFloat(tax);

  const newInvoice: Invoice = {
    id: nextInvoiceId++,
    orderId: parseInt(orderId),
    totalAmount,
    discount: parseFloat(discount),
    tax: parseFloat(tax),
    netAmount,
    status: 'unpaid',
    createdAt: new Date().toISOString(),
  };

  invoices.push(newInvoice);
  res.status(201).json({ success: true, data: newInvoice, message: 'Invoice created successfully' });
};

export const updateInvoice = (req: AuthRequest, res: Response): void => {
  const idx = invoices.findIndex(inv => inv.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Invoice not found' });
    return;
  }
  invoices[idx] = { ...invoices[idx], ...req.body };
  res.json({ success: true, data: invoices[idx], message: 'Invoice updated' });
};

export const applyDiscount = (req: AuthRequest, res: Response): void => {
  const idx = invoices.findIndex(inv => inv.id === parseInt(req.params.id));
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Invoice not found' });
    return;
  }
  const { discount } = req.body;
  invoices[idx].discount = parseFloat(discount);
  invoices[idx].netAmount = invoices[idx].totalAmount - parseFloat(discount) + invoices[idx].tax;
  res.json({ success: true, data: invoices[idx], message: 'Discount applied' });
};

export const collectPayment = (req: AuthRequest, res: Response): void => {
  const { invoiceId, amount, paymentMethod } = req.body;
  if (!invoiceId || !amount || !paymentMethod) {
    res.status(400).json({ success: false, message: 'invoiceId, amount and paymentMethod are required' });
    return;
  }

  const invIdx = invoices.findIndex(inv => inv.id === parseInt(invoiceId));
  if (invIdx === -1) {
    res.status(404).json({ success: false, message: 'Invoice not found' });
    return;
  }

  const newPayment: Payment = {
    id: nextPaymentId++,
    invoiceId: parseInt(invoiceId),
    amount: parseFloat(amount),
    paymentMethod,
    paymentDate: new Date().toISOString(),
    receivedBy: req.user!.userId,
  };

  payments.push(newPayment);
  invoices[invIdx].status = 'paid';

  res.status(201).json({ success: true, data: newPayment, message: 'Payment recorded successfully' });
};

export const getPayments = (_req: AuthRequest, res: Response): void => {
  const data = payments.map(p => {
    const invoice = invoices.find(inv => inv.id === p.invoiceId);
    const order = testOrders.find(o => o.id === invoice?.orderId);
    const patient = patients.find(pt => pt.id === order?.patientId);
    return {
      ...p,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      invoiceNetAmount: invoice?.netAmount,
    };
  });
  res.json({ success: true, data });
};

export const getReceipt = (req: AuthRequest, res: Response): void => {
  const payment = payments.find(p => p.id === parseInt(req.params.id));
  if (!payment) {
    res.status(404).json({ success: false, message: 'Payment not found' });
    return;
  }
  const invoice = invoices.find(inv => inv.id === payment.invoiceId);
  const order = testOrders.find(o => o.id === invoice?.orderId);
  const patient = patients.find(p => p.id === order?.patientId);
  const items = orderItems.filter(oi => oi.orderId === order?.id).map(oi => ({
    ...oi,
    testName: tests.find(t => t.id === oi.testId)?.name,
  }));

  res.json({ success: true, data: { payment, invoice, patient, items } });
};
