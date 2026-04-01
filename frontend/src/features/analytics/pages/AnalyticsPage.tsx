import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Spin, Statistic } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getRevenueReport, getTestVolume, getPatientStats } from '../../../services/analytics.service';
import { formatCurrency } from '../../../utils/formatDate';

const { Title } = Typography;
const COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#f5222d'];

export function AnalyticsPage() {
  const [revenue, setRevenue] = useState<any>(null);
  const [testVolume, setTestVolume] = useState<any>(null);
  const [patientStats, setPatientStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRevenueReport(), getTestVolume(), getPatientStats()])
      .then(([r, t, p]) => { setRevenue(r); setTestVolume(t); setPatientStats(p); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Analytics & Reports</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total Revenue" value={formatCurrency(revenue?.totalRevenue || 0)} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Pending Revenue" value={formatCurrency(revenue?.pendingRevenue || 0)} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total Patients" value={patientStats?.total || 0} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Top Tests by Volume">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={testVolume?.topTests || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1677ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Patients by Gender">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={patientStats?.byGender || []} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={80} label>
                  {(patientStats?.byGender || []).map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
