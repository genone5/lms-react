import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTests, createTest, updateTest, deleteTest } from '../../services/test.service';
import type { Test } from '../../types';

interface TestState { tests: Test[]; total: number; loading: boolean; error: string | null; }
const initialState: TestState = { tests: [], total: 0, loading: false, error: null };

export const fetchTests = createAsyncThunk('tests/fetchAll', async (params?: Record<string, unknown>) => getTests(params));
export const addTest = createAsyncThunk('tests/create', async (data: Partial<Test>) => createTest(data));
export const editTest = createAsyncThunk('tests/update', async ({ id, data }: { id: number; data: Partial<Test> }) => updateTest(id, data));
export const removeTest = createAsyncThunk('tests/delete', async (id: number) => { await deleteTest(id); return id; });

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: { clearError(state) { state.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchTests.pending, state => { state.loading = true; })
      .addCase(fetchTests.fulfilled, (state, action) => { state.loading = false; state.tests = action.payload.data; state.total = action.payload.total || 0; })
      .addCase(fetchTests.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed'; })
      .addCase(addTest.fulfilled, (state, action) => { state.tests.unshift(action.payload); })
      .addCase(editTest.fulfilled, (state, action) => { const i = state.tests.findIndex(t => t.id === action.payload.id); if (i !== -1) state.tests[i] = action.payload; })
      .addCase(removeTest.fulfilled, (state, action) => { state.tests = state.tests.filter(t => t.id !== action.payload); });
  },
});

export const { clearError } = testSlice.actions;
export default testSlice.reducer;
