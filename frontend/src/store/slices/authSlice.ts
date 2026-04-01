import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login as loginService, logout as logoutService, getStoredUser } from '../../services/auth.service';
import type { AuthUser } from '../../types';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: getStoredUser(),
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk('auth/login', async (creds: { email: string; password: string }) => {
  return await loginService(creds.email, creds.password);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
      logoutService();
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginThunk.pending, state => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginThunk.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Login failed'; });
  },
});

export const { setUser, clearUser, clearError } = authSlice.actions;
export default authSlice.reducer;
