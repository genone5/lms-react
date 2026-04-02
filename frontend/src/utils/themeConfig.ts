import { theme as antTheme } from 'antd';
import type { ThemeConfig } from 'antd';
import type { ThemeColor, ThemeMode } from '../store/slices/themeSlice';

export const COLOR_PRESETS: Record<ThemeColor, { primary: string; label: string }> = {
  blue:   { primary: '#1677ff', label: 'Ocean Blue' },
  purple: { primary: '#722ed1', label: 'Royal Purple' },
  green:  { primary: '#52c41a', label: 'Forest Green' },
  orange: { primary: '#fa8c16', label: 'Sunset Orange' },
  red:    { primary: '#f5222d', label: 'Ruby Red' },
};

export const buildAntTheme = (mode: ThemeMode, color: ThemeColor): ThemeConfig => {
  const { primary } = COLOR_PRESETS[color];
  return {
    algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: primary,
      borderRadius: 6,
    },
  };
};
