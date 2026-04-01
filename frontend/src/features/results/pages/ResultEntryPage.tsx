import { useEffect, useState } from 'react';
import { Table, Button, Typography, Modal, Form, Input, Select, message, Tag } from 'antd';
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getResults, enterResult, verifyResult } from '../../../services/result.service';
import { getOrderItems } from '../../../services/order.service';
import { getOrders } from '../../../services/order.service';
import { StatusBadge } from '../../../shared/ui/Badge/StatusBadge';
import { formatDateTime } from '../../../utils/formatDate';
import type { Result } from '../../../types';

const { Title } = Typography;

export function ResultEntryPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const load = () => { setLoading(true); getResults().then(setResults).finally(() => setLoading(false)); };
  useEffect(load, []);
  useEffect(() => { getOrders({ status: 'sample_collected', limit: 100 }).then(r => setOrders(r.data || [])); }, []);

  const handleOrderChange = async (orderId: number) => {
    setSelectedOrderId(orderId);
    const items = await getOrderItems(orderId);
    setOrderItems(items.filter((i: any) => !results.find(r => r.orderItemId === i.id)));
  };

  const handleEnter = async (values: Record<string, unknown>) => {
    await enterResult(values as any);
    message.success('Result entered');
    setModalOpen(false);
    form.resetFields();
    load();
  };

  const handleVerify = async (id: number) => {
    await verifyResult(id);
    message.success('Result verified');
    load();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName' },
    { title: 'Test', dataIndex: 'testName', key: 'testName' },
    { title: 'Value', key: 'value', render: (_: unknown, r: Result) => `${r.resultValue} ${r.unit}` },
    { title: 'Normal Range', dataIndex: 'normalRange', key: 'normalRange' },
    { title: 'Status', dataIndex: 'resultStatus', key: 'resultStatus', render: (s: string) => <StatusBadge status={s} /> },
    { title: 'Verified By', dataIndex: 'verifiedByName', key: 'verifiedByName', render: (v: string) => v ? <Tag color="green">{v}</Tag> : <Tag color="orange">Pending</Tag> },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => formatDateTime(d) },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, r: Result) => !r.verifiedBy ? (
        <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleVerify(r.id)}>Verify</Button>
      ) : null,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Test Results</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Enter Result</Button>
      </div>
      <Table dataSource={results} columns={columns} rowKey="id" loading={loading} bordered size="middle" pagination={{ pageSize: 10 }} />

      <Modal open={modalOpen} title="Enter Test Result" onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Save Result" destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleEnter}>
          <Form.Item label="Order" name="orderId">
            <Select showSearch optionFilterProp="label" onChange={handleOrderChange}
              options={orders.map(o => ({ label: `#${o.id} - ${o.patientName} (${o.doctorName})`, value: o.id }))} />
          </Form.Item>
          <Form.Item label="Test" name="orderItemId" rules={[{ required: true }]}>
            <Select options={orderItems.map(i => ({ label: i.testName, value: i.id }))} />
          </Form.Item>
          <Form.Item label="Result Value" name="resultValue" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Unit" name="unit" rules={[{ required: true }]}>
            <Input placeholder="e.g. mg/dL, g/dL, U/L" />
          </Form.Item>
          <Form.Item label="Normal Range" name="normalRange" rules={[{ required: true }]}>
            <Input placeholder="e.g. 70-100 mg/dL" />
          </Form.Item>
          <Form.Item label="Result Status" name="resultStatus" rules={[{ required: true }]}>
            <Select options={['normal','abnormal','critical'].map(s => ({ label: s.toUpperCase(), value: s }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
