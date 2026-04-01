import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Table, Tag, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getPatientHistory } from '../../../services/patient.service';
import { StatusBadge } from '../../../shared/ui/Badge/StatusBadge';
import { formatDate, formatCurrency } from '../../../utils/formatDate';

const { Title } = Typography;

export function PatientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) getPatientHistory(parseInt(id)).then(setData).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin /></div>;
  if (!data) return <div>Patient not found</div>;

  const { patient, orders } = data;
  const orderColumns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Doctor', dataIndex: 'doctorName', key: 'doctorName' },
    { title: 'Date', dataIndex: 'orderDate', key: 'orderDate', render: (d: string) => formatDate(d) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
    { title: 'Amount', key: 'amount', render: (_: unknown, o: any) => o.invoice ? formatCurrency(o.invoice.netAmount) : '-' },
  ];

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/patients')} style={{ marginBottom: 16 }}>Back to Patients</Button>
      <Title level={4}>{patient.firstName} {patient.lastName}</Title>
      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Name">{patient.firstName} {patient.lastName}</Descriptions.Item>
          <Descriptions.Item label="Gender"><Tag>{patient.gender?.toUpperCase()}</Tag></Descriptions.Item>
          <Descriptions.Item label="Date of Birth">{formatDate(patient.dateOfBirth)}</Descriptions.Item>
          <Descriptions.Item label="Blood Group">{patient.bloodGroup || '-'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{patient.phone}</Descriptions.Item>
          <Descriptions.Item label="Email">{patient.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>{patient.address || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="Test History">
        <Table dataSource={orders} columns={orderColumns} rowKey="id" size="middle" pagination={false} />
      </Card>
    </div>
  );
}
