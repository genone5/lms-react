import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import patientReducer from '../store/slices/patientSlice';
import testReducer from '../store/slices/testSlice';
import orderReducer from '../store/slices/orderSlice';
import themeReducer from '../store/slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientReducer,
    tests: testReducer,
    orders: orderReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
