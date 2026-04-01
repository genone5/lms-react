export const ROLES = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  LAB_TECH: 'Lab Technician',
  RECEPTIONIST: 'Receptionist',
  ACCOUNTANT: 'Accountant',
} as const;

export const ORDER_STATUSES = ['pending', 'sample_collected', 'processing', 'completed', 'cancelled'] as const;

export const SAMPLE_STATUSES = ['collected', 'in_lab', 'processing', 'completed'] as const;

export const RESULT_STATUSES = ['normal', 'abnormal', 'critical'] as const;

export const INVOICE_STATUSES = ['unpaid', 'paid', 'cancelled'] as const;

export const PAYMENT_METHODS = ['cash', 'card', 'online', 'insurance'] as const;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export const STATUS_COLORS: Record<string, string> = {
  pending: 'orange',
  sample_collected: 'blue',
  processing: 'purple',
  completed: 'green',
  cancelled: 'red',
  collected: 'blue',
  in_lab: 'cyan',
  normal: 'green',
  abnormal: 'orange',
  critical: 'red',
  unpaid: 'orange',
  paid: 'green',
  active: 'green',
  inactive: 'red',
  final: 'green',
  draft: 'orange',
};
