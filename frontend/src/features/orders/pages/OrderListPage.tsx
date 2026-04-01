import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Select, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, addOrder, abortOrder } from '../../../store/slices/orderSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import type { TestOrder } from '../../../types';
import { StatusBadge } from '../../../shared/ui/Badge/StatusBadge';
import { formatDate } from '../../../utils/formatDate';
import { getPatients } from '../../../services/patient.service';
import { getTests } from '../../../services/test.service';
import { getBranches } from '../../../services/branch.service';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export function OrderListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { orders, loading, total } = useSelector((state: RootState) => state.orders);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [patients, setPatients] = useState<Array<{ id: number; firstName: string; lastName: string }>>([]);
  const [tests, setTests] = useState<Array<{ id: number; name: string; price: number }>>([]);
  const [branches, setBranches] = useState<Array<{ id: number; name: string }>>([]);
  const [form] = Form.useForm();

  useEffect(() => { dispatch(fetchOrders({ page, limit: 10, status: statusFilter })); }, [dispatch, page, statusFilter]);
  useEffect(() => {
    getPatients({ limit: 100 }).then(r => setPatients(r.data || []));
    getTests({ limit: 100 }).then(r => setTests(r.data || []));
    getBranches().then(setBranches);
  }, []);

  const handleCreate = async (values: Record<string, unknown>) => {
    await dispatch(addOrder(values as any));
    message.success('Order created');
    setModalOpen(false);
    form.resetFields();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName' },
    { title: 'Doctor', dataIndex: 'doctorName', key: 'doctorName' },
    { title: 'Date', dataIndex: 'orderDate', key: 'orderDate', render: (d: string) => formatDate(d) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
    { title: 'Tests', key: 'tests', render: (_: unknown, o: TestOrder) => o.items?.length || '-' },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, o: TestOrder) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/orders/${o.id}`)} />
          {o.status === 'pending' && (
            <Popconfirm title="Cancel order?" onConfirm={() => { dispatch(abortOrder(o.id)); message.success('Cancelled'); }}>
              <Button size="small" danger icon={<StopOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Test Orders</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Order</Button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Select placeholder="Filter by status" allowClear style={{ width: 200 }} onChange={setStatusFilter}
          options={['pending','sample_collected','processing','completed','cancelled'].map(s => ({ label: s.replace(/_/g,' ').toUpperCase(), value: s }))} />
      </div>
      <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} bordered size="middle"
        pagination={{ current: page, pageSize: 10, total, onChange: setPage, showTotal: t => `Total ${t} orders` }} />

      <Modal open={modalOpen} title="Create Test Order" onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Create Order" width={580} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item label="Patient" name="patientId" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label"
              options={patients.map(p => ({ label: `${p.firstName} ${p.lastName}`, value: p.id }))} />
          </Form.Item>
          <Form.Item label="Referring Doctor" name="doctorName" rules={[{ required: true }]}>
            <Input placeholder="Dr. Name" />
          </Form.Item>
          <Form.Item label="Branch" name="branchId" rules={[{ required: true }]}>
            <Select options={branches.map(b => ({ label: b.name, value: b.id }))} />
          </Form.Item>
          <Form.Item label="Tests" name="testIds" rules={[{ required: true, type: 'array', min: 1 }]}>
            <Select mode="multiple" showSearch optionFilterProp="label"
              options={tests.map(t => ({ label: `${t.name} - Rs.${t.price}`, value: t.id }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
