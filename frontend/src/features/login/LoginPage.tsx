import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';

const { Title, Text } = Typography;

export function LoginPage() {
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: { email: string; password: string }) => {
    const result = await login(values.email, values.password);
    if ((result as any).payload?.token) navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔬</div>
          <Title level={3} style={{ margin: 0 }}>ClearPath LMS</Title>
          <Text type="secondary">Laboratory Management System</Text>
        </div>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Invalid email' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email address" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Password is required' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>Sign In</Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Demo: admin@lms.com / admin123</Text>
        </div>
      </Card>
    </div>
  );
}
