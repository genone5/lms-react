import { useEffect, useState } from 'react';
import { Table, Button, Tabs, Tag, Typography, Modal, Form, Select, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { getPendingSamples, collectSample, getSampleHistory } from '../../../services/sample.service';
import { StatusBadge } from '../../../shared/ui/Badge/StatusBadge';
import { formatDateTime } from '../../../utils/formatDate';

const { Title } = Typography;

export function SampleCollectionPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectModal, setCollectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    Promise.all([getPendingSamples(), getSampleHistory()])
      .then(([p, h]) => { setPending(p); setHistory(h); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCollect = async (values: { sampleType: string }) => {
    await collectSample({ orderItemId: selectedItem.id, sampleType: values.sampleType });
    message.success('Sample collected');
    setCollectModal(false);
    load();
  };

  const pendingColumns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId', width: 80 },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName' },
    { title: 'Test', dataIndex: 'testName', key: 'testName' },
    { title: 'Sample Type', dataIndex: 'sampleType', key: 'sampleType' },
    { title: 'Doctor', dataIndex: 'doctorName', key: 'doctorName' },
    { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate', render: (d: string) => formatDateTime(d) },
    {
      title: 'Action', key: 'action',
      render: (_: unknown, item: any) => (
        <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => { setSelectedItem(item); form.setFieldsValue({ sampleType: item.sampleType }); setCollectModal(true); }}>
          Collect
        </Button>
      ),
    },
  ];

  const historyColumns = [
    { title: 'Sample ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName' },
    { title: 'Test', dataIndex: 'testName', key: 'testName' },
    { title: 'Sample Type', dataIndex: 'sampleType', key: 'sampleType' },
    { title: 'Collected At', dataIndex: 'collectionTime', key: 'collectionTime', render: (d: string) => formatDateTime(d) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Sample Collection</Title>
      <Tabs defaultActiveKey="pending" items={[
        {
          key: 'pending', label: `Pending (${pending.length})`,
          children: <Table dataSource={pending} columns={pendingColumns} rowKey="id" loading={loading} bordered size="middle" pagination={{ pageSize: 10 }} />,
        },
        {
          key: 'history', label: 'Collection History',
          children: <Table dataSource={history} columns={historyColumns} rowKey="id" loading={loading} bordered size="middle" pagination={{ pageSize: 10 }} />,
        },
      ]} />

      <Modal open={collectModal} title={`Collect Sample — ${selectedItem?.testName}`} onCancel={() => setCollectModal(false)} onOk={() => form.submit()} okText="Confirm Collection" destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCollect}>
          <Form.Item label="Sample Type" name="sampleType" rules={[{ required: true }]}>
            <Select options={['Blood', 'Urine', 'Stool', 'Sputum', 'Swab'].map(s => ({ label: s, value: s }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
