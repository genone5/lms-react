import { useEffect, useState } from 'react';
import { Table, Typography, Tag } from 'antd';
import { getPayments } from '../../../services/billing.service';
import { formatDateTime, formatCurrency } from '../../../utils/formatDate';
import type { Payment } from '../../../types';

const { Title } = Typography;

export function PaymentListPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getPayments().then(r => setPayments(r.data || [])).finally(() => setLoading(false)); }, []);

  const columns = [
    { title: 'Receipt #', dataIndex: 'id', key: 'id', width: 80, render: (id: number) => `REC-${id.toString().padStart(4,'0')}` },
    { title: 'Invoice #', dataIndex: 'invoiceId', key: 'invoiceId', render: (id: number) => `INV-${id.toString().padStart(4,'0')}` },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a: number) => <strong>{formatCurrency(a)}</strong> },
    { title: 'Method', dataIndex: 'paymentMethod', key: 'paymentMethod', render: (m: string) => <Tag color="blue">{m.toUpperCase()}</Tag> },
    { title: 'Date', dataIndex: 'paymentDate', key: 'paymentDate', render: (d: string) => formatDateTime(d) },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Payment History</Title>
      <Table dataSource={payments} columns={columns} rowKey="id" loading={loading} bordered size="middle" pagination={{ pageSize: 10 }} />
    </div>
  );
}
