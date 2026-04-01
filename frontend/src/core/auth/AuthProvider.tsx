import { createContext, ReactNode, useContext } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import type { AuthUser, RoleName } from '../../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasRole: (...roles: RoleName[]) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);

  const hasRole = (...roles: RoleName[]) => !!user && roles.includes(user.role as RoleName);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
