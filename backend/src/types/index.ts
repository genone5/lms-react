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
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  roleId: number;
  roleName?: string;
  branchId?: number;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
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
  createdAt: string;
}

export interface TestOrder {
  id: number;
  patientId: number;
  doctorName: string;
  branchId: number;
  status: 'pending' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';
  orderDate: string;
  createdBy: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  testId: number;
  price: number;
  status: 'pending' | 'collected' | 'processing' | 'completed';
}

export interface Sample {
  id: number;
  orderItemId: number;
  sampleType: string;
  collectedBy: number;
  collectionTime: string;
  status: 'collected' | 'in_lab' | 'processing' | 'completed';
}

export interface Result {
  id: number;
  orderItemId: number;
  resultValue: string;
  unit: string;
  normalRange: string;
  resultStatus: 'normal' | 'abnormal' | 'critical';
  enteredBy: number;
  verifiedBy?: number;
  createdAt: string;
}

export interface Report {
  id: number;
  orderId: number;
  reportUrl: string;
  generatedBy: number;
  generatedAt: string;
  status: 'draft' | 'final';
}

export interface Invoice {
  id: number;
  orderId: number;
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
  amount: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'insurance';
  paymentDate: string;
  receivedBy: number;
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  timestamp: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
  roleId: number;
  roleName: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}
