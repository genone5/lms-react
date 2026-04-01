export type RoleName = 'Admin' | 'Doctor' | 'Lab Technician' | 'Receptionist' | 'Accountant';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: RoleName;
  roleId: number;
  branchId?: number;
  token: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  createdAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName?: string;
  branchId?: number;
  branchName?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface Test {
  id: number;
  name: string;
  category: string;
  price: number;
  sampleType: string;
  normalRange?: string;
  createdAt?: string;
}

export interface TestOrder {
  id: number;
  patientId: number;
  patientName?: string;
  doctorName: string;
  branchId: number;
  status: 'pending' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';
  orderDate: string;
  createdBy: number;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  testId: number;
  testName?: string;
  price: number;
  status: string;
}

export interface Sample {
  id: number;
  orderItemId: number;
  testName?: string;
  patientName?: string;
  sampleType: string;
  collectedBy: number;
  collectionTime: string;
  status: 'collected' | 'in_lab' | 'processing' | 'completed';
}

export interface Result {
  id: number;
  orderItemId: number;
  testName?: string;
  patientName?: string;
  orderId?: number;
  resultValue: string;
  unit: string;
  normalRange: string;
  resultStatus: 'normal' | 'abnormal' | 'critical';
  enteredBy: number;
  enteredByName?: string;
  verifiedBy?: number;
  verifiedByName?: string;
  createdAt: string;
}

export interface Report {
  id: number;
  orderId: number;
  patientName?: string;
  doctorName?: string;
  reportUrl: string;
  generatedBy: number;
  generatedAt: string;
  status: 'draft' | 'final';
}

export interface Invoice {
  id: number;
  orderId: number;
  patientName?: string;
  doctorName?: string;
  totalAmount: number;
  discount: number;
  tax: number;
  netAmount: number;
  status: 'unpaid' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface Payment {
  id: number;
  invoiceId: number;
  patientName?: string;
  invoiceNetAmount?: number;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'insurance';
  paymentDate: string;
  receivedBy: number;
}

export interface DashboardStats {
  totalPatients: number;
  pendingTests: number;
  samplesCollected: number;
  todayRevenue: number;
  completedTests: number;
  newPatients: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}
