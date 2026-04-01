// This hook is superseded by the Redux patientSlice.
// Kept as a thin wrapper for backward compatibility.
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../../../app/store';
import { fetchPatients } from '../../../store/slices/patientSlice';

export function usePatients() {
  const dispatch = useDispatch<AppDispatch>();
  const { patients, loading } = useSelector((state: RootState) => state.patients);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  return { patients, loading };
}
