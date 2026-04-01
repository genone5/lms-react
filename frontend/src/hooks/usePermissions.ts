import { useAuth } from './useAuth';
import type { RoleName } from '../types';

const MODULE_ACCESS: Record<string, RoleName[]> = {
  patients: ['Admin', 'Doctor', 'Lab Technician', 'Receptionist'],
  tests: ['Admin', 'Doctor', 'Lab Technician'],
  orders: ['Admin', 'Doctor', 'Receptionist'],
  samples: ['Admin', 'Lab Technician', 'Receptionist'],
  results: ['Admin', 'Doctor', 'Lab Technician'],
  reports: ['Admin', 'Doctor', 'Lab Technician'],
  billing: ['Admin', 'Receptionist', 'Accountant'],
  payments: ['Admin', 'Receptionist', 'Accountant'],
  users: ['Admin'],
  roles: ['Admin'],
  branches: ['Admin'],
  analytics: ['Admin', 'Accountant'],
  settings: ['Admin'],
};

export const usePermissions = () => {
  const { user } = useAuth();
  const role = user?.role as RoleName | undefined;

  const canAccess = (module: string): boolean => {
    if (!role) return false;
    return MODULE_ACCESS[module]?.includes(role) ?? false;
  };

  const isAdmin = role === 'Admin';
  const isDoctor = role === 'Doctor';
  const isLabTech = role === 'Lab Technician';
  const isReceptionist = role === 'Receptionist';
  const isAccountant = role === 'Accountant';

  return { canAccess, isAdmin, isDoctor, isLabTech, isReceptionist, isAccountant, role };
};
