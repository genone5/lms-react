import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrders, createOrder, updateOrderStatus, cancelOrder } from '../../services/order.service';
import type { TestOrder } from '../../types';

interface OrderState { orders: TestOrder[]; total: number; loading: boolean; error: string | null; }
const initialState: OrderState = { orders: [], total: 0, loading: false, error: null };

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (params?: Record<string, unknown>) => getOrders(params));
export const addOrder = createAsyncThunk('orders/create', async (data: { patientId: number; doctorName: string; branchId: number; testIds: number[] }) => createOrder(data));
export const changeOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }: { id: number; status: string }) => updateOrderStatus(id, status));
export const abortOrder = createAsyncThunk('orders/cancel', async (id: number) => { await cancelOrder(id); return id; });

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: { clearError(state) { state.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload.data; state.total = action.payload.total || 0; })
      .addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed'; })
      .addCase(addOrder.fulfilled, (state, action) => { state.orders.unshift(action.payload); })
      .addCase(changeOrderStatus.fulfilled, (state, action) => { const i = state.orders.findIndex(o => o.id === action.payload.id); if (i !== -1) state.orders[i] = action.payload; })
      .addCase(abortOrder.fulfilled, (state, action) => { const i = state.orders.findIndex(o => o.id === action.payload); if (i !== -1) state.orders[i].status = 'cancelled'; });
  },
});

export const { clearError } = orderSlice.actions;
export default orderSlice.reducer;
