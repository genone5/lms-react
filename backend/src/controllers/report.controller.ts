import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { Report } from '../models/Report.js';
import { TestOrder } from '../models/TestOrder.js';
import { Patient } from '../models/Patient.js';
import { OrderItem } from '../models/OrderItem.js';
import { Test } from '../models/Test.js';
import { Result } from '../models/Result.js';
import { getNextId } from '../db/counter.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getAll = async (_req: AuthRequest, res: Response): Promise<void> => {
  const reports = await Report.find({});
  const orderIds = reports.map(r => r.orderId);
  const orders = await TestOrder.find({ id: { $in: orderIds } });
  const patientIds = [...new Set(orders.map(o => o.patientId))];
  const patients = await Patient.find({ id: { $in: patientIds } });

  const data = reports.map((r: typeof reports[number]) => {
    const order = orders.find((o: typeof orders[number]) => o.id === r.orderId);
    const patient = patients.find((p: typeof patients[number]) => p.id === order?.patientId);
    return {
      ...r.toJSON(),
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      doctorName: order?.doctorName,
    };
  });

  res.json({ success: true, data });
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  const report = await Report.findOne({ id: parseInt(req.params.id) });
  if (!report) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }

  const order = await TestOrder.findOne({ id: report.orderId });
  const [patient, items, tests, results] = await Promise.all([
    Patient.findOne({ id: order?.patientId }),
    OrderItem.find({ orderId: report.orderId }),
    Test.find({}),
    Result.find({}),
  ]);

  const enrichedItems = items.map((oi: typeof items[number]) => ({
    ...oi.toJSON(),
    testName: tests.find((t: typeof tests[number]) => t.id === oi.testId)?.name,
    result: results.find((r: typeof results[number]) => r.orderItemId === oi.id),
  }));

  res.json({ success: true, data: { ...report.toJSON(), order, patient, items: enrichedItems } });
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId } = req.body;
  if (!orderId) {
    res.status(400).json({ success: false, message: 'orderId is required' });
    return;
  }

  const existing = await Report.findOne({ orderId: parseInt(orderId) });
  if (existing) {
    res.json({ success: true, data: existing, message: 'Report already exists' });
    return;
  }

  const newReport = new Report({
    id: await getNextId('report'),
    orderId: parseInt(orderId),
    reportUrl: `/reports/report_order_${orderId}.pdf`,
    generatedBy: req.user!.userId,
    generatedAt: new Date().toISOString(),
    status: 'final',
  });
  await newReport.save();
  res.status(201).json({ success: true, data: newReport, message: 'Report generated successfully' });
};

export const download = async (req: AuthRequest, res: Response): Promise<void> => {
  const report = await Report.findOne({ id: parseInt(req.params.id) });
  if (!report) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }

  const order = await TestOrder.findOne({ id: report.orderId });
  const [patient, items, tests, results] = await Promise.all([
    Patient.findOne({ id: order?.patientId }),
    OrderItem.find({ orderId: report.orderId }),
    Test.find({}),
    Result.find({}),
  ]);

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  const filename = `report_${report.id}_order_${report.orderId}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).font('Helvetica-Bold').text('Lab Management System', { align: 'center' });
  doc.fontSize(14).font('Helvetica').text('Laboratory Report', { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  doc.fontSize(11).font('Helvetica-Bold').text('Report Information');
  doc.font('Helvetica').fontSize(10);
  doc.text(`Report ID: ${report.id}`);
  doc.text(`Order ID: ${report.orderId}`);
  doc.text(`Generated At: ${new Date(report.generatedAt).toLocaleString()}`);
  doc.text(`Status: ${report.status.toUpperCase()}`);
  doc.moveDown();

  doc.fontSize(11).font('Helvetica-Bold').text('Patient Information');
  doc.font('Helvetica').fontSize(10);
  doc.text(`Name: ${patientName}`);
  if (patient) {
    doc.text(`Date of Birth: ${patient.dateOfBirth || '-'}`);
    doc.text(`Gender: ${patient.gender}`);
    doc.text(`Phone: ${patient.phone}`);
  }
  doc.moveDown();

  if (order) {
    doc.fontSize(11).font('Helvetica-Bold').text('Order Information');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Doctor: ${order.doctorName}`);
    doc.text(`Order Date: ${new Date(order.orderDate).toLocaleString()}`);
    doc.moveDown();
  }

  doc.fontSize(11).font('Helvetica-Bold').text('Test Results');
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const col = { test: 50, value: 220, unit: 340, range: 420 };

  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Test Name', col.test, tableTop);
  doc.text('Value', col.value, tableTop);
  doc.text('Unit', col.unit, tableTop);
  doc.text('Ref Range', col.range, tableTop);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);

  doc.font('Helvetica').fontSize(10);
  items.forEach((item: typeof items[number]) => {
    const y = doc.y;
    const testName = tests.find((t: typeof tests[number]) => t.id === item.testId)?.name ?? 'Unknown Test';
    const result = results.find((r: typeof results[number]) => r.orderItemId === item.id);
    doc.text(testName, col.test, y, { width: 160 });
    doc.text(result?.resultValue ?? 'Pending', col.value, y);
    doc.text(result?.unit ?? '-', col.unit, y);
    doc.text(result?.normalRange ?? '-', col.range, y, { width: 120 });
    doc.moveDown(0.5);
  });

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();
  doc.fontSize(9).font('Helvetica-Oblique').text('This report is generated by the Lab Management System.', { align: 'center' });

  doc.end();
};
