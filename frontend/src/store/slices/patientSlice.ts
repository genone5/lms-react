import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getPatients, createPatient, updatePatient, deletePatient } from '../../services/patient.service';
import type { Patient } from '../../types';

interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: PatientState = { patients: [], selectedPatient: null, total: 0, loading: false, error: null };

export const fetchPatients = createAsyncThunk('patients/fetchAll', async (params?: Record<string, unknown>) => {
  return await getPatients(params);
});

export const addPatient = createAsyncThunk('patients/create', async (data: Partial<Patient>) => {
  return await createPatient(data);
});

export const editPatient = createAsyncThunk('patients/update', async ({ id, data }: { id: number; data: Partial<Patient> }) => {
  return await updatePatient(id, data);
});

export const removePatient = createAsyncThunk('patients/delete', async (id: number) => {
  await deletePatient(id);
  return id;
});

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setSelectedPatient(state, action: PayloadAction<Patient | null>) { state.selectedPatient = action.payload; },
    clearError(state) { state.error = null; },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPatients.pending, state => { state.loading = true; })
      .addCase(fetchPatients.fulfilled, (state, action) => { state.loading = false; state.patients = action.payload.data; state.total = action.payload.total || 0; })
      .addCase(fetchPatients.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch'; })
      .addCase(addPatient.fulfilled, (state, action) => { state.patients.unshift(action.payload); state.total += 1; })
      .addCase(editPatient.fulfilled, (state, action) => { const idx = state.patients.findIndex(p => p.id === action.payload.id); if (idx !== -1) state.patients[idx] = action.payload; })
      .addCase(removePatient.fulfilled, (state, action) => { state.patients = state.patients.filter(p => p.id !== action.payload); state.total -= 1; });
  },
});

export const { setSelectedPatient, clearError } = patientSlice.actions;
export default patientSlice.reducer;
