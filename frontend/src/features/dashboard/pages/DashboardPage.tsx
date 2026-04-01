import { Row, Col, Card, Table, Tag, Typography, Spin } from 'antd';
import { UserOutlined, ExperimentOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getDailyActivity } from '../../../services/analytics.service';
import { getOrders } from '../../../services/order.service';
import { StatsCard } from '../../../shared/ui/Card/StatsCard';
import { StatusBadge } from '../../../shared/ui/Badge/StatusBadge';
import { formatDate, formatCurrency } from '../../../utils/formatDate';
import type { TestOrder, DashboardStats } from '../../../types';

const { Title } = Typography;

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<TestOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDailyActivity(), getOrders({ limit: 5 })])
      .then(([activity, ordersRes]) => {
        setStats(activity);
        setOrders(ordersRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const orderColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName' },
    { title: 'Doctor', dataIndex: 'doctorName', key: 'doctorName' },
    { title: 'Date', dataIndex: 'orderDate', key: 'orderDate', render: (d: string) => formatDate(d) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Dashboard Overview</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard title="New Patients Today" value={stats?.newPatients ?? 0} icon={<UserOutlined />} color="#1677ff" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard title="Pending Tests" value={stats?.pendingTests ?? 0} icon={<ExperimentOutlined />} color="#fa8c16" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard title="Completed Tests" value={stats?.completedTests ?? 0} icon={<CheckCircleOutlined />} color="#52c41a" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard title="Today's Revenue" value={formatCurrency(stats?.todayRevenue ?? 0)} icon={<DollarOutlined />} color="#722ed1" />
        </Col>
      </Row>

      <Card title="Recent Test Orders" bordered={false}>
        <Table dataSource={orders} columns={orderColumns} rowKey="id" pagination={false} size="middle" />
      </Card>
    </div>
  );
}
