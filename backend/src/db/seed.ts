import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './connection.js';
import { setCounterTo } from './counter.js';
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
  await connectDB();

  // Clear all collections
  await Promise.all([
    Role.deleteMany({}), Branch.deleteMany({}), User.deleteMany({}),
    Patient.deleteMany({}), Test.deleteMany({}), TestOrder.deleteMany({}),
    OrderItem.deleteMany({}), Sample.deleteMany({}), Result.deleteMany({}),
    Report.deleteMany({}), Invoice.deleteMany({}), Payment.deleteMany({}),
    AuditLog.deleteMany({}), Notification.deleteMany({}), Settings.deleteMany({}),
    mongoose.connection.collection('counters').deleteMany({}),
  ]);

  console.log('Cleared all collections');

  // ── Roles ─────────────────────────────────────────────────────────
  await Role.insertMany([
    { id: 1, name: 'Admin', description: 'Full system access' },
    { id: 2, name: 'Doctor', description: 'View patients, orders, results, reports' },
    { id: 3, name: 'Lab Technician', description: 'Manage samples and results' },
    { id: 4, name: 'Receptionist', description: 'Register patients, create orders, billing' },
    { id: 5, name: 'Accountant', description: 'Billing and payments' },
  ]);
  await setCounterTo('role', 5);
  console.log('Seeded roles');

  // ── Branches ──────────────────────────────────────────────────────
  await Branch.insertMany([
    { id: 1, name: 'Main Lab', address: '123 Main Street', city: 'Karachi', phone: '021-1234567', createdAt: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'City Lab', address: '456 City Road', city: 'Lahore', phone: '042-7654321', createdAt: '2024-02-01T00:00:00Z' },
    { id: 3, name: 'Hospital Lab', address: '789 Hospital Ave', city: 'Islamabad', phone: '051-9876543', createdAt: '2024-03-01T00:00:00Z' },
  ]);
  await setCounterTo('branch', 3);
  console.log('Seeded branches');

  // ── Users ─────────────────────────────────────────────────────────
  await User.insertMany([
    { id: 1, name: 'Admin User', email: 'admin@lms.com', passwordHash: hash('admin123'), roleId: 1, roleName: 'Admin', branchId: 1, phone: '03001234567', status: 'active', createdAt: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'Dr. Sarah Ahmed', email: 'doctor@lms.com', passwordHash: hash('doctor123'), roleId: 2, roleName: 'Doctor', branchId: 1, phone: '03009876543', status: 'active', createdAt: '2024-01-05T00:00:00Z' },
    { id: 3, name: 'Ali Hassan', email: 'labtech@lms.com', passwordHash: hash('labtech123'), roleId: 3, roleName: 'Lab Technician', branchId: 1, phone: '03111234567', status: 'active', createdAt: '2024-01-10T00:00:00Z' },
    { id: 4, name: 'Ayesha Khan', email: 'receptionist@lms.com', passwordHash: hash('recep123'), roleId: 4, roleName: 'Receptionist', branchId: 1, phone: '03211234567', status: 'active', createdAt: '2024-01-15T00:00:00Z' },
    { id: 5, name: 'Usman Malik', email: 'accountant@lms.com', passwordHash: hash('acct123'), roleId: 5, roleName: 'Accountant', branchId: 2, phone: '03311234567', status: 'active', createdAt: '2024-01-20T00:00:00Z' },
  ]);
  await setCounterTo('user', 5);
  console.log('Seeded users');

  // ── Patients ──────────────────────────────────────────────────────
  await Patient.insertMany([
    { id: 1, firstName: 'Muhammad', lastName: 'Ali', gender: 'male', dateOfBirth: '1990-05-15', age: 34, idCardNumber: '42101-1234567-1', phone: '03001111111', email: 'mali@email.com', address: '10 Garden Road', bloodGroup: 'A+', createdAt: '2024-03-01T09:00:00Z' },
    { id: 2, firstName: 'Fatima', lastName: 'Zahra', gender: 'female', dateOfBirth: '1985-08-22', age: 39, idCardNumber: '42101-2345678-2', phone: '03002222222', email: 'fzahra@email.com', address: '22 Park Lane', bloodGroup: 'B+', createdAt: '2024-03-05T10:30:00Z' },
    { id: 3, firstName: 'Ahmed', lastName: 'Raza', gender: 'male', dateOfBirth: '2000-12-01', age: 24, idCardNumber: '35202-3456789-3', phone: '03003333333', address: '5 Green Street', bloodGroup: 'O+', createdAt: '2024-03-10T11:00:00Z' },
    { id: 4, firstName: 'Zainab', lastName: 'Hussain', gender: 'female', dateOfBirth: '1978-03-30', age: 46, idCardNumber: '35202-4567890-4', phone: '03004444444', email: 'zhussain@email.com', address: '88 Hill View', bloodGroup: 'AB-', createdAt: '2024-03-12T08:00:00Z' },
    { id: 5, firstName: 'Omar', lastName: 'Farooq', gender: 'male', dateOfBirth: '1995-07-11', age: 29, idCardNumber: '61101-5678901-5', phone: '03005555555', address: '33 Blue Bay', bloodGroup: 'A-', createdAt: '2024-03-15T14:00:00Z' },
  ]);
  await setCounterTo('patient', 5);
  console.log('Seeded patients');

  // ── Tests ─────────────────────────────────────────────────────────
  await Test.insertMany([
    { id: 1, name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 500, sampleType: 'Blood', normalRange: 'See individual parameters', createdAt: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'Blood Sugar Fasting', category: 'Biochemistry', price: 200, sampleType: 'Blood', normalRange: '70-100 mg/dL', createdAt: '2024-01-01T00:00:00Z' },
    { id: 3, name: 'Lipid Profile', category: 'Biochemistry', price: 800, sampleType: 'Blood', normalRange: 'Total Cholesterol < 200 mg/dL', createdAt: '2024-01-01T00:00:00Z' },
    { id: 4, name: 'Thyroid Function Test (TFT)', category: 'Endocrinology', price: 1200, sampleType: 'Blood', normalRange: 'TSH: 0.4-4.0 mIU/L', createdAt: '2024-01-01T00:00:00Z' },
    { id: 5, name: 'Urine Routine', category: 'Urinalysis', price: 300, sampleType: 'Urine', normalRange: 'Normal appearance', createdAt: '2024-01-01T00:00:00Z' },
    { id: 6, name: 'Liver Function Test (LFT)', category: 'Biochemistry', price: 900, sampleType: 'Blood', normalRange: 'ALT: 7-40 U/L', createdAt: '2024-01-01T00:00:00Z' },
    { id: 7, name: 'HbA1c', category: 'Diabetes', price: 600, sampleType: 'Blood', normalRange: 'Below 5.7%', createdAt: '2024-01-01T00:00:00Z' },
    { id: 8, name: 'Uric Acid', category: 'Biochemistry', price: 350, sampleType: 'Blood', normalRange: '3.5-7.2 mg/dL', createdAt: '2024-01-01T00:00:00Z' },
  ]);
  await setCounterTo('test', 8);
  console.log('Seeded tests');

  // ── Test Orders ───────────────────────────────────────────────────
  await TestOrder.insertMany([
    { id: 1, patientId: 1, doctorName: 'Dr. Sarah Ahmed', branchId: 1, status: 'completed', orderDate: '2024-03-15T09:00:00Z', createdBy: 4 },
    { id: 2, patientId: 2, doctorName: 'Dr. Imran Khan', branchId: 1, status: 'processing', orderDate: '2024-03-18T10:00:00Z', createdBy: 4 },
    { id: 3, patientId: 3, doctorName: 'Dr. Sarah Ahmed', branchId: 1, status: 'sample_collected', orderDate: '2024-03-20T11:00:00Z', createdBy: 4 },
    { id: 4, patientId: 4, doctorName: 'Dr. Tariq Jamil', branchId: 2, status: 'pending', orderDate: '2024-03-22T08:00:00Z', createdBy: 4 },
    { id: 5, patientId: 5, doctorName: 'Dr. Sarah Ahmed', branchId: 1, status: 'completed', orderDate: '2024-03-25T14:00:00Z', createdBy: 4 },
  ]);
  await setCounterTo('testorder', 5);
  console.log('Seeded test orders');

  // ── Order Items ───────────────────────────────────────────────────
  await OrderItem.insertMany([
    { id: 1, orderId: 1, testId: 1, price: 500, status: 'completed' },
    { id: 2, orderId: 1, testId: 2, price: 200, status: 'completed' },
    { id: 3, orderId: 2, testId: 3, price: 800, status: 'processing' },
    { id: 4, orderId: 2, testId: 4, price: 1200, status: 'processing' },
    { id: 5, orderId: 3, testId: 5, price: 300, status: 'collected' },
    { id: 6, orderId: 4, testId: 1, price: 500, status: 'pending' },
    { id: 7, orderId: 5, testId: 6, price: 900, status: 'completed' },
    { id: 8, orderId: 5, testId: 7, price: 600, status: 'completed' },
  ]);
  await setCounterTo('orderitem', 8);
  console.log('Seeded order items');

  // ── Samples ───────────────────────────────────────────────────────
  await Sample.insertMany([
    { id: 1, orderItemId: 1, sampleType: 'Blood', collectedBy: 3, collectionTime: '2024-03-15T09:30:00Z', status: 'completed' },
    { id: 2, orderItemId: 2, sampleType: 'Blood', collectedBy: 3, collectionTime: '2024-03-15T09:35:00Z', status: 'completed' },
    { id: 3, orderItemId: 3, sampleType: 'Blood', collectedBy: 3, collectionTime: '2024-03-18T10:30:00Z', status: 'processing' },
    { id: 4, orderItemId: 5, sampleType: 'Urine', collectedBy: 3, collectionTime: '2024-03-20T11:30:00Z', status: 'in_lab' },
  ]);
  await setCounterTo('sample', 4);
  console.log('Seeded samples');

  // ── Results ───────────────────────────────────────────────────────
  await Result.insertMany([
    { id: 1, orderItemId: 1, resultValue: 'Hb: 13.5, WBC: 7500, RBC: 4.8, Platelets: 250000', unit: 'various', normalRange: 'Hb 13-17 g/dL', resultStatus: 'normal', enteredBy: 3, verifiedBy: 2, createdAt: '2024-03-15T14:00:00Z' },
    { id: 2, orderItemId: 2, resultValue: '95', unit: 'mg/dL', normalRange: '70-100 mg/dL', resultStatus: 'normal', enteredBy: 3, verifiedBy: 2, createdAt: '2024-03-15T14:15:00Z' },
    { id: 3, orderItemId: 7, resultValue: 'Total: 210, LDL: 140, HDL: 45, TG: 150', unit: 'mg/dL', normalRange: 'Total < 200', resultStatus: 'abnormal', enteredBy: 3, verifiedBy: 2, createdAt: '2024-03-25T16:00:00Z' },
  ]);
  await setCounterTo('result', 3);
  console.log('Seeded results');

  // ── Reports ───────────────────────────────────────────────────────
  await Report.insertMany([
    { id: 1, orderId: 1, reportUrl: '/reports/report_order_1.pdf', generatedBy: 2, generatedAt: '2024-03-15T15:00:00Z', status: 'final' },
    { id: 2, orderId: 5, reportUrl: '/reports/report_order_5.pdf', generatedBy: 2, generatedAt: '2024-03-25T17:00:00Z', status: 'final' },
  ]);
  await setCounterTo('report', 2);
  console.log('Seeded reports');

  // ── Invoices ──────────────────────────────────────────────────────
  await Invoice.insertMany([
    { id: 1, orderId: 1, totalAmount: 700, discount: 0, tax: 0, netAmount: 700, status: 'paid', createdAt: '2024-03-15T09:00:00Z' },
    { id: 2, orderId: 2, totalAmount: 2000, discount: 100, tax: 0, netAmount: 1900, status: 'unpaid', createdAt: '2024-03-18T10:00:00Z' },
    { id: 3, orderId: 3, totalAmount: 300, discount: 0, tax: 0, netAmount: 300, status: 'unpaid', createdAt: '2024-03-20T11:00:00Z' },
    { id: 4, orderId: 5, totalAmount: 1500, discount: 150, tax: 0, netAmount: 1350, status: 'paid', createdAt: '2024-03-25T14:00:00Z' },
  ]);
  await setCounterTo('invoice', 4);
  console.log('Seeded invoices');

  // ── Payments ──────────────────────────────────────────────────────
  await Payment.insertMany([
    { id: 1, invoiceId: 1, amount: 700, paymentMethod: 'cash', paymentDate: '2024-03-15T09:15:00Z', receivedBy: 4 },
    { id: 2, invoiceId: 4, amount: 1350, paymentMethod: 'card', paymentDate: '2024-03-25T14:30:00Z', receivedBy: 4 },
  ]);
  await setCounterTo('payment', 2);
  console.log('Seeded payments');

  // ── Audit Logs ────────────────────────────────────────────────────
  await AuditLog.insertMany([
    { id: 1, userId: 4, action: 'CREATE', entityType: 'Patient', entityId: 1, timestamp: '2024-03-01T09:00:00Z' },
    { id: 2, userId: 4, action: 'CREATE', entityType: 'TestOrder', entityId: 1, timestamp: '2024-03-15T09:00:00Z' },
    { id: 3, userId: 3, action: 'UPDATE', entityType: 'Sample', entityId: 1, timestamp: '2024-03-15T09:30:00Z' },
    { id: 4, userId: 3, action: 'CREATE', entityType: 'Result', entityId: 1, timestamp: '2024-03-15T14:00:00Z' },
    { id: 5, userId: 2, action: 'VERIFY', entityType: 'Result', entityId: 1, timestamp: '2024-03-15T14:30:00Z' },
  ]);
  await setCounterTo('auditlog', 5);
  console.log('Seeded audit logs');

  // ── Notifications ─────────────────────────────────────────────────
  await Notification.insertMany([
    { id: 1, userId: 2, message: 'New test results ready for Order #1', status: 'unread', createdAt: '2024-03-15T15:00:00Z' },
    { id: 2, userId: 4, message: 'Payment received for Invoice #1', status: 'read', createdAt: '2024-03-15T09:15:00Z' },
    { id: 3, userId: 3, message: 'Sample pending collection for Order #4', status: 'unread', createdAt: '2024-03-22T08:00:00Z' },
  ]);
  await setCounterTo('notification', 3);
  console.log('Seeded notifications');

  // ── Settings ──────────────────────────────────────────────────────
  await Settings.insertMany([
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

  console.log('\n✅ Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('  admin@lms.com       / admin123');
  console.log('  doctor@lms.com      / doctor123');
  console.log('  labtech@lms.com     / labtech123');
  console.log('  receptionist@lms.com / recep123');
  console.log('  accountant@lms.com  / acct123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
