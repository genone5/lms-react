import PDFDocument from 'pdfkit';
import type { Response } from 'express';
import type { Patient, TestOrder, OrderItem, Test, Result, User } from '../types/index.js';

const labSettings = {
  name: 'ClearPath Diagnostics',
  address: '123 Main Street, Karachi',
  phone: '021-1234567',
  email: 'info@clearpathlab.com',
  reportFooter: 'Results are valid for 30 days from date of collection.',
};

interface ReportData {
  patient: Patient;
  order: TestOrder;
  items: (OrderItem & { test?: Test; result?: Result })[];
  enteredByUser?: User;
  verifiedByUser?: User;
}

const PRIMARY = '#1677ff';
const DARK    = '#1a1a2e';
const GRAY    = '#6b7280';
const LIGHT   = '#f3f4f6';
const RED     = '#f5222d';
const ORANGE  = '#fa8c16';
const GREEN   = '#52c41a';

function statusColor(status?: string): string {
  if (status === 'abnormal') return ORANGE;
  if (status === 'critical')  return RED;
  return GREEN;
}

export function generateLabReportPDF(res: Response, data: ReportData): void {
  const { patient, order, items } = data;

  const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 50, right: 50 } });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition',
    `attachment; filename="report_order_${order.id}_${patient.firstName}_${patient.lastName}.pdf"`);

  doc.pipe(res);

  const W = doc.page.width - 100; // usable width

  // ── HEADER BAR ──────────────────────────────────────────────────
  doc.rect(50, 40, W, 70).fill(PRIMARY);

  doc.fill('#ffffff')
     .fontSize(20).font('Helvetica-Bold')
     .text('🔬  ' + labSettings.name, 60, 52, { width: W - 120 });

  doc.fontSize(9).font('Helvetica')
     .text(labSettings.address, 60, 76)
     .text(`${labSettings.phone}  •  ${labSettings.email}`, 60, 88);

  doc.fill('#ffffff').fontSize(11).font('Helvetica-Bold')
     .text('LAB REPORT', W - 40, 60, { align: 'right', width: 100 });

  doc.moveDown(0.5);

  // ── REPORT META ─────────────────────────────────────────────────
  const metaTop = 125;
  doc.rect(50, metaTop, W, 24).fill(LIGHT);
  doc.fill(DARK).fontSize(9).font('Helvetica-Bold')
     .text(`Report #: RPT-${order.id.toString().padStart(5, '0')}`, 60, metaTop + 7)
     .text(`Order Date: ${new Date(order.orderDate).toLocaleDateString('en-PK', { day:'2-digit', month:'short', year:'numeric' })}`, 220, metaTop + 7)
     .text(`Print Date: ${new Date().toLocaleDateString('en-PK', { day:'2-digit', month:'short', year:'numeric' })}`, 390, metaTop + 7);

  // ── PATIENT INFO ────────────────────────────────────────────────
  const piTop = metaTop + 34;
  doc.rect(50, piTop, W, 14).fill(PRIMARY);
  doc.fill('#fff').fontSize(9).font('Helvetica-Bold').text('PATIENT INFORMATION', 60, piTop + 3);

  const piData: [string, string][] = [
    ['Patient Name', `${patient.firstName} ${patient.lastName}`],
    ['Date of Birth', patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '-'],
    ['Gender', patient.gender?.toUpperCase() || '-'],
    ['Blood Group', patient.bloodGroup || '-'],
    ['Phone', patient.phone],
    ['Referring Doctor', order.doctorName],
  ];

  let y = piTop + 20;
  piData.forEach(([label, value], i) => {
    const col = i % 2 === 0 ? 60 : 310;
    if (i % 2 === 0 && i > 0) y += 16;
    doc.fill(GRAY).fontSize(8).font('Helvetica').text(label + ':', col, y);
    doc.fill(DARK).fontSize(9).font('Helvetica-Bold').text(value, col + 90, y);
  });

  y += 24;

  // ── RESULTS TABLE ───────────────────────────────────────────────
  doc.rect(50, y, W, 14).fill(PRIMARY);
  doc.fill('#fff').fontSize(9).font('Helvetica-Bold').text('TEST RESULTS', 60, y + 3);
  y += 18;

  // Table header
  const cols = { test: 60, value: 230, unit: 310, range: 370, status: 460 };
  doc.rect(50, y, W, 16).fill('#e8f0fe');
  doc.fill(DARK).fontSize(8).font('Helvetica-Bold')
     .text('Test Name',     cols.test,   y + 4)
     .text('Result',        cols.value,  y + 4)
     .text('Unit',          cols.unit,   y + 4)
     .text('Normal Range',  cols.range,  y + 4)
     .text('Status',        cols.status, y + 4);
  y += 18;

  items.forEach((item, idx) => {
    const rowH = 18;
    if (idx % 2 === 0) doc.rect(50, y, W, rowH).fill('#fafafa');

    const result = item.result;
    const testName = item.test?.name || `Test #${item.testId}`;

    doc.fill(DARK).fontSize(8).font('Helvetica').text(testName, cols.test, y + 5, { width: 160 });

    if (result) {
      doc.fill(DARK).text(result.resultValue,  cols.value,  y + 5, { width: 70 });
      doc.fill(GRAY).text(result.unit,         cols.unit,   y + 5, { width: 55 });
      doc.fill(GRAY).text(result.normalRange,  cols.range,  y + 5, { width: 85 });
      doc.fill(statusColor(result.resultStatus))
         .font('Helvetica-Bold')
         .text(result.resultStatus?.toUpperCase() || '-', cols.status, y + 5, { width: 70 });
    } else {
      doc.fill(ORANGE).text('Pending', cols.value, y + 5);
    }

    // thin row border
    doc.moveTo(50, y + rowH).lineTo(50 + W, y + rowH).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    y += rowH;
  });

  y += 16;

  // ── SIGNATURE SECTION ───────────────────────────────────────────
  doc.moveTo(50, y).lineTo(50 + W, y).strokeColor('#d1d5db').lineWidth(1).stroke();
  y += 14;

  doc.fill(GRAY).fontSize(8).font('Helvetica')
     .text('Lab Technician', 60, y)
     .text('Verified By', 260, y)
     .text('Authorised Signatory', 440, y);

  y += 30;
  doc.moveTo(60,  y).lineTo(180, y).strokeColor(DARK).lineWidth(0.5).stroke();
  doc.moveTo(260, y).lineTo(380, y).strokeColor(DARK).lineWidth(0.5).stroke();
  doc.moveTo(440, y).lineTo(540, y).strokeColor(DARK).lineWidth(0.5).stroke();

  // ── FOOTER ──────────────────────────────────────────────────────
  const footerY = doc.page.height - 55;
  doc.rect(50, footerY, W, 1).fill('#d1d5db');
  doc.fill(GRAY).fontSize(7.5).font('Helvetica')
     .text(labSettings.reportFooter, 50, footerY + 6, { width: W, align: 'center' });
  doc.text(`${labSettings.name}  •  ${labSettings.address}  •  ${labSettings.phone}`, 50, footerY + 18, { width: W, align: 'center' });

  doc.end();
}
