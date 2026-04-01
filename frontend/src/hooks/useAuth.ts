import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { loginThunk, clearUser } from '../store/slices/authSlice';
import type { RoleName } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const login = (email: string, password: string) => dispatch(loginThunk({ email, password }));
  const logout = () => dispatch(clearUser());
  const hasRole = (...roles: RoleName[]) => !!user && roles.includes(user.role as RoleName);

  return { user, loading, error, login, logout, isAuthenticated: !!user, hasRole };
};
