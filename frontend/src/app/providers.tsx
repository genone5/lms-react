import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './store';
import { AuthProvider } from '../core/auth/AuthProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 6,
          },
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </ConfigProvider>
    </Provider>
  );
}
