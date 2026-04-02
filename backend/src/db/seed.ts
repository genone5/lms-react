import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from './connection.js';
import { Role } from '../models/Role.js';
import { Branch } from '../models/Branch.js';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Test } from '../models/Test.js';
import { TestOrder } from '../models/TestOrder.js';
import { OrderItem } from '../models/OrderItem.js';
import { Sample } from '../models/Sample.js';
import { Result } from '../models/Result.js';
import { Report } from '../models/Report.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import { Settings } from '../models/Settings.js';

const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('Connected to PostgreSQL lms database');

  // Truncate in reverse dependency order to avoid FK constraint errors
  await sequelize.query('TRUNCATE TABLE "AuditLog","Notification","Payment","Report","Result","Sample","Invoice","OrderItem","TestOrder","Test","Patient","User","Branch","Role","Settings" RESTART IDENTITY CASCADE');
  console.log('Cleared all tables');

  // ── Roles ─────────────────────────────────────────────────────────
  await Role.bulkCreate([
    { id: 1, name: 'Admin', description: 'Full system access' },
    { id: 2, name: 'Doctor', description: 'View patients, orders, results, reports' },
    { id: 3, name: 'Lab Technician', description: 'Manage samples and results' },
    { id: 4, name: 'Receptionist', description: 'Register patients, create orders, billing' },
    { id: 5, name: 'Accountant', description: 'Billing and payments' },
  ]);
  console.log('Seeded roles');

  // ── Branches ──────────────────────────────────────────────────────
  await Branch.bulkCreate([
    { id: 1, name: 'Main Lab', address: '123 Main Street', city: 'Karachi', phone: '021-1234567', createdAt: new Date('2024-01-01') },
    { id: 2, name: 'City Lab', address: '456 City Road', city: 'Lahore', phone: '042-7654321', createdAt: new Date('2024-02-01') },
    { id: 3, name: 'Hospital Lab', address: '789 Hospital Ave', city: 'Islamabad', phone: '051-9876543', createdAt: new Date('2024-03-01') },
  ]);
  console.log('Seeded branches');

  // ── Users ─────────────────────────────────────────────────────────
  await User.bulkCreate([
    { id: 1, name: 'Admin User', email: 'admin@lms.com', passwordHash: hash('admin123'), roleId: 1, roleName: 'Admin', branchId: 1, phone: '03001234567', status: 'active', createdAt: new Date('2024-01-01') },
    { id: 2, name: 'Dr. Sarah Ahmed', email: 'doctor@lms.com', passwordHash: hash('doctor123'), roleId: 2, roleName: 'Doctor', branchId: 1, phone: '03009876543', status: 'active', createdAt: new Date('2024-01-05') },
    { id: 3, name: 'Ali Hassan', email: 'labtech@lms.com', passwordHash: hash('labtech123'), roleId: 3, roleName: 'Lab Technician', branchId: 1, phone: '03111234567', status: 'active', createdAt: new Date('2024-01-10') },
    { id: 4, name: 'Ayesha Khan', email: 'receptionist@lms.com', passwordHash: hash('recep123'), roleId: 4, roleName: 'Receptionist', branchId: 1, phone: '03211234567', status: 'active', createdAt: new Date('2024-01-15') },
    { id: 5, name: 'Usman Malik', email: 'accountant@lms.com', passwordHash: hash('acct123'), roleId: 5, roleName: 'Accountant', branchId: 2, phone: '03311234567', status: 'active', createdAt: new Date('2024-01-20') },
  ]);
  console.log('Seeded users');

  // ── Patients ──────────────────────────────────────────────────────
  await Patient.bulkCreate([
    { id: 1, firstName: 'Muhammad', lastName: 'Ali', gender: 'male', dateOfBirth: new Date('1990-05-15'), age: 34, idCardNumber: '42101-1234567-1', phone: '03001111111', email: 'mali@email.com', address: '10 Garden Road', bloodGroup: 'A+', createdAt: new Date('2024-03-01') },
    { id: 2, firstName: 'Fatima', lastName: 'Zahra', gender: 'female', dateOfBirth: new Date('1985-08-22'), age: 39, idCardNumber: '42101-2345678-2', phone: '03002222222', email: 'fzahra@email.com', address: '22 Park Lane', bloodGroup: 'B+', createdAt: new Date('2024-03-05') },
    { id: 3, firstName: 'Ahmed', lastName: 'Raza', gender: 'male', dateOfBirth: new Date('2000-12-01'), age: 24, idCardNumber: '35202-3456789-3', phone: '03003333333', address: '5 Green Street', bloodGroup: 'O+', createdAt: new Date('2024-03-10') },
    { id: 4, firstName: 'Zainab', lastName: 'Hussain', gender: 'female', dateOfBirth: new Date('1978-03-30'), age: 46, idCardNumber: '35202-4567890-4', phone: '03004444444', email: 'zhussain@email.com', address: '88 Hill View', bloodGroup: 'AB-', createdAt: new Date('2024-03-12') },
    { id: 5, firstName: 'Omar', lastName: 'Farooq', gender: 'male', dateOfBirth: new Date('1995-07-11'), age: 29, idCardNumber: '61101-5678901-5', phone: '03005555555', address: '33 Blue Bay', bloodGroup: 'A-', createdAt: new Date('2024-03-15') },
  ]);
  console.log('Seeded patients');

  // ── Tests ─────────────────────────────────────────────────────────
  await Test.bulkCreate([
    { id: 1, name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 500, sampleType: 'Blood', normalRange: 'See individual parameters', createdAt: new Date('2024-01-01') },
    { id: 2, name: 'Blood Sugar Fasting', category: 'Biochemistry', price: 200, sampleType: 'Blood', normalRange: '70-100 mg/dL', createdAt: new Date('2024-01-01') },
    { id: 3, name: 'Lipid Profile', category: 'Biochemistry', price: 800, sampleType: 'Blood', normalRange: 'Total Cholesterol < 200 mg/dL', createdAt: new Date('2024-01-01') },
    { id: 4, name: 'Thyroid Function Test (TFT)', category: 'Endocrinology', price: 1200, sampleType: 'Blood', normalRange: 'TSH: 0.4-4.0 mIU/L', createdAt: new Date('2024-01-01') },
    { id: 5, name: 'Urine Routine', category: 'Urinalysis', price: 300, sampleType: 'Urine', normalRange: 'Normal appearance', createdAt: new Date('2024-01-01') },
    { id: 6, name: 'Liver Function Test (LFT)', category: 'Biochemistry', price: 900, sampleType: 'Blood', normalRange: 'ALT: 7-40 U/L', createdAt: new Date('2024-01-01') },
    { id: 7, name: 'HbA1c', category: 'Diabetes', price: 600, sampleType: 'Blood', normalRange: 'Below 5.7%', createdAt: new Date('2024-01-01') },
    { id: 8, name: 'Uric Acid', category: 'Biochemistry', price: 350, sampleType: 'Blood', normalRange: '3.5-7.2 mg/dL', createdAt: new Date('2024-01-01') },
  ]);
  console.log('Seeded tests');

  // ── Test Orders ───────────────────────────────────────────────────
  await TestOrder.bulkCreate([
    { id: 1, patientId: 1, doctorName: 'Dr. Sarah Ahmed', branchId: 1, status: 'completed', orderDate: new Date('2024-03-15'), createdBy: 4 },
    { id: 2, patientId: 2, doctorName: 'Dr. Imran Khan', branchId: 1, status: 'processing', orderDate: new Date('2024-03-18'), createdBy: 4 },
    { id: 3, patientId: 3, doctorName: 'Dr. Sarah Ahmed', branchId: 1, status: 'sample_collected', orderDate: new Date('2024-03-20'), createdBy: 4 },
    { id: 4, patientId: 4, doctorName: 'Dr. Tariq Jamil', branchId: 2, status: 'pending', orderDate: new Date('2024-03-22'), createdBy: 4 },
    { id: 5, patientId: 5, doctorName: 'Dr. Sarah Ahmed', branchId: 1, status: 'completed', orderDate: new Date('2024-03-25'), createdBy: 4 },
  ]);
  console.log('Seeded test orders');

  // ── Order Items ───────────────────────────────────────────────────
  await OrderItem.bulkCreate([
    { id: 1, orderId: 1, testId: 1, price: 500, status: 'completed' },
    { id: 2, orderId: 1, testId: 2, price: 200, status: 'completed' },
    { id: 3, orderId: 2, testId: 3, price: 800, status: 'processing' },
    { id: 4, orderId: 2, testId: 4, price: 1200, status: 'processing' },
    { id: 5, orderId: 3, testId: 5, price: 300, status: 'collected' },
    { id: 6, orderId: 4, testId: 1, price: 500, status: 'pending' },
    { id: 7, orderId: 5, testId: 6, price: 900, status: 'completed' },
    { id: 8, orderId: 5, testId: 7, price: 600, status: 'completed' },
  ]);
  console.log('Seeded order items');

  // ── Samples ───────────────────────────────────────────────────────
  await Sample.bulkCreate([
    { id: 1, orderItemId: 1, sampleType: 'Blood', collectedBy: 3, collectionTime: new Date('2024-03-15T09:30:00'), status: 'completed' },
    { id: 2, orderItemId: 2, sampleType: 'Blood', collectedBy: 3, collectionTime: new Date('2024-03-15T09:35:00'), status: 'completed' },
    { id: 3, orderItemId: 3, sampleType: 'Blood', collectedBy: 3, collectionTime: new Date('2024-03-18T10:30:00'), status: 'processing' },
    { id: 4, orderItemId: 5, sampleType: 'Urine', collectedBy: 3, collectionTime: new Date('2024-03-20T11:30:00'), status: 'in_lab' },
  ]);
  console.log('Seeded samples');

  // ── Results ───────────────────────────────────────────────────────
  await Result.bulkCreate([
    { id: 1, orderItemId: 1, resultValue: 'Hb: 13.5, WBC: 7500, RBC: 4.8, Platelets: 250000', unit: 'various', normalRange: 'Hb 13-17 g/dL', resultStatus: 'normal', enteredBy: 3, verifiedBy: 2, createdAt: new Date('2024-03-15T14:00:00') },
    { id: 2, orderItemId: 2, resultValue: '95', unit: 'mg/dL', normalRange: '70-100 mg/dL', resultStatus: 'normal', enteredBy: 3, verifiedBy: 2, createdAt: new Date('2024-03-15T14:15:00') },
    { id: 3, orderItemId: 7, resultValue: 'Total: 210, LDL: 140, HDL: 45, TG: 150', unit: 'mg/dL', normalRange: 'Total < 200', resultStatus: 'abnormal', enteredBy: 3, verifiedBy: 2, createdAt: new Date('2024-03-25T16:00:00') },
  ]);
  console.log('Seeded results');

  // ── Reports ───────────────────────────────────────────────────────
  await Report.bulkCreate([
    { id: 1, orderId: 1, reportUrl: '/reports/report_order_1.pdf', generatedBy: 2, generatedAt: new Date('2024-03-15T15:00:00'), status: 'final' },
    { id: 2, orderId: 5, reportUrl: '/reports/report_order_5.pdf', generatedBy: 2, generatedAt: new Date('2024-03-25T17:00:00'), status: 'final' },
  ]);
  console.log('Seeded reports');

  // ── Invoices ──────────────────────────────────────────────────────
  await Invoice.bulkCreate([
    { id: 1, orderId: 1, totalAmount: 700, discount: 0, tax: 0, netAmount: 700, status: 'paid', createdAt: new Date('2024-03-15') },
    { id: 2, orderId: 2, totalAmount: 2000, discount: 100, tax: 0, netAmount: 1900, status: 'unpaid', createdAt: new Date('2024-03-18') },
    { id: 3, orderId: 3, totalAmount: 300, discount: 0, tax: 0, netAmount: 300, status: 'unpaid', createdAt: new Date('2024-03-20') },
    { id: 4, orderId: 5, totalAmount: 1500, discount: 150, tax: 0, netAmount: 1350, status: 'paid', createdAt: new Date('2024-03-25') },
  ]);
  console.log('Seeded invoices');

  // ── Payments ──────────────────────────────────────────────────────
  await Payment.bulkCreate([
    { id: 1, invoiceId: 1, amount: 700, paymentMethod: 'cash', paymentDate: new Date('2024-03-15T09:15:00'), receivedBy: 4 },
    { id: 2, invoiceId: 4, amount: 1350, paymentMethod: 'card', paymentDate: new Date('2024-03-25T14:30:00'), receivedBy: 4 },
  ]);
  console.log('Seeded payments');

  // ── Audit Logs ────────────────────────────────────────────────────
  await AuditLog.bulkCreate([
    { id: 1, userId: 4, action: 'CREATE', entityType: 'Patient', entityId: 1, timestamp: new Date('2024-03-01') },
    { id: 2, userId: 4, action: 'CREATE', entityType: 'TestOrder', entityId: 1, timestamp: new Date('2024-03-15') },
    { id: 3, userId: 3, action: 'UPDATE', entityType: 'Sample', entityId: 1, timestamp: new Date('2024-03-15T09:30:00') },
    { id: 4, userId: 3, action: 'CREATE', entityType: 'Result', entityId: 1, timestamp: new Date('2024-03-15T14:00:00') },
    { id: 5, userId: 2, action: 'VERIFY', entityType: 'Result', entityId: 1, timestamp: new Date('2024-03-15T14:30:00') },
  ]);
  console.log('Seeded audit logs');

  // ── Notifications ─────────────────────────────────────────────────
  await Notification.bulkCreate([
    { id: 1, userId: 2, message: 'New test results ready for Order #1', status: 'unread', createdAt: new Date('2024-03-15T15:00:00') },
    { id: 2, userId: 4, message: 'Payment received for Invoice #1', status: 'read', createdAt: new Date('2024-03-15T09:15:00') },
    { id: 3, userId: 3, message: 'Sample pending collection for Order #4', status: 'unread', createdAt: new Date('2024-03-22') },
  ]);
  console.log('Seeded notifications');

  // ── Settings ──────────────────────────────────────────────────────
  await Settings.bulkCreate([
    {
      type: 'lab',
      data: {
        name: 'ClearPath Diagnostics',
        address: '123 Main Street, Karachi',
        phone: '021-1234567',
        email: 'info@clearpathlab.com',
        website: 'www.clearpathlab.com',
        logo: '/logo.png',
        reportFooter: 'Results are valid for 30 days from date of collection.',
      },
    },
    {
      type: 'email',
      data: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'noreply@clearpathlab.com',
        fromName: 'ClearPath Diagnostics',
        enabled: true,
      },
    },
  ]);
  console.log('Seeded settings');

  // Reset sequences so new inserts don't clash with seeded IDs
  await sequelize.query(`
    SELECT setval(pg_get_serial_sequence('"Role"', 'id'), MAX(id)) FROM "Role";
    SELECT setval(pg_get_serial_sequence('"Branch"', 'id'), MAX(id)) FROM "Branch";
    SELECT setval(pg_get_serial_sequence('"User"', 'id'), MAX(id)) FROM "User";
    SELECT setval(pg_get_serial_sequence('"Patient"', 'id'), MAX(id)) FROM "Patient";
    SELECT setval(pg_get_serial_sequence('"Test"', 'id'), MAX(id)) FROM "Test";
    SELECT setval(pg_get_serial_sequence('"TestOrder"', 'id'), MAX(id)) FROM "TestOrder";
    SELECT setval(pg_get_serial_sequence('"OrderItem"', 'id'), MAX(id)) FROM "OrderItem";
    SELECT setval(pg_get_serial_sequence('"Sample"', 'id'), MAX(id)) FROM "Sample";
    SELECT setval(pg_get_serial_sequence('"Result"', 'id'), MAX(id)) FROM "Result";
    SELECT setval(pg_get_serial_sequence('"Report"', 'id'), MAX(id)) FROM "Report";
    SELECT setval(pg_get_serial_sequence('"Invoice"', 'id'), MAX(id)) FROM "Invoice";
    SELECT setval(pg_get_serial_sequence('"Payment"', 'id'), MAX(id)) FROM "Payment";
    SELECT setval(pg_get_serial_sequence('"AuditLog"', 'id'), MAX(id)) FROM "AuditLog";
    SELECT setval(pg_get_serial_sequence('"Notification"', 'id'), MAX(id)) FROM "Notification";
  `);
  console.log('Reset sequences');

  console.log('\n✅ PostgreSQL lms database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('  admin@lms.com        / admin123');
  console.log('  doctor@lms.com       / doctor123');
  console.log('  labtech@lms.com      / labtech123');
  console.log('  receptionist@lms.com / recep123');
  console.log('  accountant@lms.com   / acct123');

  await sequelize.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
