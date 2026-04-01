import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Select, Modal, Form, InputNumber, message, Tag } from 'antd';
import { PlusOutlined, EyeOutlined, DollarOutlined } from '@ant-design/icons';
import { getInvoices, createInvoice, collectPayment } from '../../../services/billing.service';
import { getOrders } from '../../../services/order.service';
import { StatusBadge } from '../../../shared/ui/Badge/StatusBadge';
import { formatDate, formatCurrency } from '../../../utils/formatDate';
import type { Invoice } from '../../../types';

const { Title } = Typography;

export function InvoiceListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  const load = () => { setLoading(true); getInvoices({ status: statusFilter }).then(r => setInvoices(r.data || [])).finally(() => setLoading(false)); };
  useEffect(load, [statusFilter]);
  useEffect(() => { getOrders({ status: 'completed', limit: 100 }).then(r => setOrders(r.data || [])); }, []);

  const handleCreateInvoice = async (values: Record<string, unknown>) => {
    await createInvoice(values as any);
    message.success('Invoice created');
    setInvoiceModal(false);
    load();
  };

  const handlePayment = async (values: Record<string, unknown>) => {
    await collectPayment({ ...values, invoiceId: selectedInvoice?.id } as any);
    message.success('Payment collected');
    setPaymentModal(false);
    load();
  };

  const columns = [
    { title: 'Invoice #', dataIndex: 'id', key: 'id', width: 80, render: (id: number) => `INV-${id.toString().padStart(4,'0')}` },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName' },
    { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', render: (a: number) => formatCurrency(a) },
    { title: 'Discount', dataIndex: 'discount', key: 'discount', render: (d: number) => d > 0 ? formatCurrency(d) : '-' },
    { title: 'Net Amount', dataIndex: 'netAmount', key: 'netAmount', render: (a: number) => <strong>{formatCurrency(a)}</strong> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => formatDate(d) },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, inv: Invoice) => (
        <Space>
          {inv.status === 'unpaid' && (
            <Button size="small" type="primary" icon={<DollarOutlined />}
              onClick={() => { setSelectedInvoice(inv); paymentForm.setFieldsValue({ amount: inv.netAmount }); setPaymentModal(true); }}>
              Pay
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Billing & Invoices</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setInvoiceModal(true)}>Create Invoice</Button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Select placeholder="Filter by status" allowClear style={{ width: 180 }} onChange={setStatusFilter}
          options={['unpaid','paid','cancelled'].map(s => ({ label: s.toUpperCase(), value: s }))} />
      </div>
      <Table dataSource={invoices} columns={columns} rowKey="id" loading={loading} bordered size="middle" pagination={{ pageSize: 10 }} />

      <Modal open={invoiceModal} title="Create Invoice" onCancel={() => setInvoiceModal(false)} onOk={() => invoiceForm.submit()} okText="Create" destroyOnClose>
        <Form form={invoiceForm} layout="vertical" onFinish={handleCreateInvoice}>
          <Form.Item label="Order" name="orderId" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={orders.map(o => ({ label: `#${o.id} - ${o.patientName}`, value: o.id }))} />
          </Form.Item>
          <Form.Item label="Discount (Rs.)" name="discount" initialValue={0}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item label="Tax (Rs.)" name="tax" initialValue={0}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={paymentModal} title={`Collect Payment — INV-${selectedInvoice?.id?.toString().padStart(4,'0')}`} onCancel={() => setPaymentModal(false)} onOk={() => paymentForm.submit()} okText="Confirm Payment" destroyOnClose>
        <Form form={paymentForm} layout="vertical" onFinish={handlePayment}>
          <Form.Item label="Amount (Rs.)" name="amount" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item label="Payment Method" name="paymentMethod" rules={[{ required: true }]}>
            <Select options={['cash','card','online','insurance'].map(m => ({ label: m.toUpperCase(), value: m }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
