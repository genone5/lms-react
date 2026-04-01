import { useEffect, useState } from 'react';
import { Table, Button, Typography, message } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { getReports, generateReport, downloadReport } from '../../../services/report.service';
import { StatusBadge } from '../../../shared/ui/Badge/StatusBadge';
import { formatDateTime } from '../../../utils/formatDate';
import type { Report } from '../../../types';
import { getOrders } from '../../../services/order.service';
import { Modal, Form, Select } from 'antd';

const { Title } = Typography;

export function ReportListPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const load = () => { setLoading(true); getReports().then(setReports).finally(() => setLoading(false)); };
  useEffect(load, []);
  useEffect(() => { getOrders({ status: 'completed', limit: 100 }).then(r => setOrders(r.data || [])); }, []);

  const handleGenerate = async (values: { orderId: number }) => {
    await generateReport(values.orderId);
    message.success('Report generated');
    setModalOpen(false);
    load();
  };

  const handleDownload = async (id: number) => {
    const data = await downloadReport(id);
    message.info(`Download link: ${data.url}`);
  };

  const columns = [
    { title: 'Report #', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName' },
    { title: 'Doctor', dataIndex: 'doctorName', key: 'doctorName' },
    { title: 'Generated At', dataIndex: 'generatedAt', key: 'generatedAt', render: (d: string) => formatDateTime(d) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, r: Report) => (
        <Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(r.id)}>Download</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Lab Reports</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Generate Report</Button>
      </div>
      <Table dataSource={reports} columns={columns} rowKey="id" loading={loading} bordered size="middle" pagination={{ pageSize: 10 }} />

      <Modal open={modalOpen} title="Generate Report" onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Generate" destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleGenerate}>
          <Form.Item label="Order" name="orderId" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={orders.map(o => ({ label: `#${o.id} - ${o.patientName}`, value: o.id }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
