import { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Typography, Space } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  DashboardOutlined, UserOutlined, ExperimentOutlined, OrderedListOutlined,
  DatabaseOutlined, BarChartOutlined, DollarOutlined, FileTextOutlined,
  TeamOutlined, SafetyCertificateOutlined, BranchesOutlined, SettingOutlined,
  BellOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  MedicineBoxOutlined, AuditOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', path: '/dashboard', roles: [] },
  { key: 'patients', icon: <UserOutlined />, label: 'Patients', path: '/patients', roles: ['Admin', 'Doctor', 'Lab Technician', 'Receptionist'] },
  { key: 'tests', icon: <ExperimentOutlined />, label: 'Tests Catalog', path: '/tests', roles: ['Admin', 'Doctor', 'Lab Technician'] },
  { key: 'orders', icon: <OrderedListOutlined />, label: 'Test Orders', path: '/orders', roles: ['Admin', 'Doctor', 'Receptionist'] },
  { key: 'samples', icon: <DatabaseOutlined />, label: 'Sample Collection', path: '/samples', roles: ['Admin', 'Lab Technician', 'Receptionist'] },
  { key: 'results', icon: <BarChartOutlined />, label: 'Results', path: '/results', roles: ['Admin', 'Doctor', 'Lab Technician'] },
  { key: 'reports', icon: <FileTextOutlined />, label: 'Reports', path: '/reports', roles: ['Admin', 'Doctor', 'Lab Technician'] },
  { key: 'billing', icon: <DollarOutlined />, label: 'Billing', path: '/billing', roles: ['Admin', 'Receptionist', 'Accountant'] },
  { key: 'payments', icon: <AuditOutlined />, label: 'Payments', path: '/payments', roles: ['Admin', 'Receptionist', 'Accountant'] },
  { key: 'users', icon: <TeamOutlined />, label: 'User Management', path: '/users', roles: ['Admin'] },
  { key: 'roles', icon: <SafetyCertificateOutlined />, label: 'Roles & Permissions', path: '/roles', roles: ['Admin'] },
  { key: 'branches', icon: <BranchesOutlined />, label: 'Branches', path: '/branches', roles: ['Admin'] },
  { key: 'analytics', icon: <MedicineBoxOutlined />, label: 'Analytics', path: '/analytics', roles: ['Admin', 'Accountant'] },
  { key: 'settings', icon: <SettingOutlined />, label: 'Settings', path: '/settings', roles: ['Admin'] },
];

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = menuItems.filter(item =>
    item.roles.length === 0 || (user && item.roles.includes(user.role))
  );

  const selectedKey = visibleItems.find(item => location.pathname.startsWith(item.path))?.key || 'dashboard';

  const userDropdown = [
    { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, danger: true },
  ];

  const handleUserMenu = ({ key }: { key: string }) => {
    if (key === 'logout') { logout(); navigate('/login'); }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={240} theme="dark" className="lms-sider">
        <div className="lms-logo">
          <span className="logo-icon">🔬</span>
          {!collapsed && <span className="logo-text">ClearPath LMS</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={visibleItems.map(item => ({ key: item.key, icon: item.icon, label: item.label, onClick: () => navigate(item.path) }))}
        />
      </Sider>

      <Layout>
        <Header className="lms-header">
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} className="lms-collapse-btn" />
          <div className="lms-header-right">
            <Badge count={2} size="small">
              <Button type="text" icon={<BellOutlined />} size="large" />
            </Badge>
            <Dropdown menu={{ items: userDropdown, onClick: handleUserMenu }} placement="bottomRight">
              <Space style={{ cursor: 'pointer', marginLeft: 8 }}>
                <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                {!collapsed && (
                  <div style={{ lineHeight: 1.2 }}>
                    <Text strong style={{ fontSize: 13, display: 'block' }}>{user?.name}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{user?.role}</Text>
                  </div>
                )}
              </Space>
            </Dropdown>
          </div>
        </Header>

        <Content className="lms-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
