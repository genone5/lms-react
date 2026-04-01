import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../auth/AuthProvider';
import type { RoleName } from '../../types';

interface RoleGuardProps {
  roles: RoleName[];
  children: ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthContext();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.role as RoleName)) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
