import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';
export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'red';

export interface ThemeState {
  mode: ThemeMode;
  color: ThemeColor;
}

const STORAGE_KEY = 'lms_theme';

const load = (): ThemeState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { mode: 'light', color: 'blue' };
};

const save = (state: ThemeState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const initialState: ThemeState = load();

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      save({ ...state });
    },
    setColor(state, action: PayloadAction<ThemeColor>) {
      state.color = action.payload;
      save({ ...state });
    },
    toggleMode(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      save({ ...state });
    },
  },
});

export const { setMode, setColor, toggleMode } = themeSlice.actions;
export default themeSlice.reducer;
