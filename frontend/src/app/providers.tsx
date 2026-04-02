import { ReactNode } from 'react';
import { Provider, useSelector } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './store';
import { AuthProvider } from '../core/auth/AuthProvider';
import type { RootState } from './store';
import { buildAntTheme } from '../utils/themeConfig';

function ThemedApp({ children }: { children: ReactNode }) {
  const { mode, color } = useSelector((state: RootState) => state.theme);
  return (
    <ConfigProvider theme={buildAntTheme(mode, color)}>
      <div data-theme={mode} style={{ minHeight: '100vh' }}>
        <AuthProvider>{children}</AuthProvider>
      </div>
    </ConfigProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemedApp>{children}</ThemedApp>
    </Provider>
  );
}
