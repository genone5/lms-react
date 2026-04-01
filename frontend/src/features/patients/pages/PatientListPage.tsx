import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Input, Modal, Form, Select, DatePicker, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients, addPatient, editPatient, removePatient, setSelectedPatient } from '../../../store/slices/patientSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import type { Patient } from '../../../types';
import { formatDate } from '../../../utils/formatDate';
import { BLOOD_GROUPS, GENDER_OPTIONS } from '../../../utils/constants';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Search } = Input;

export function PatientListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { patients, loading, total } = useSelector((state: RootState) => state.patients);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [form] = Form.useForm();

  useEffect(() => { dispatch(fetchPatients({ page, limit: 10, search })); }, [dispatch, page, search]);

  const openCreate = () => { setEditingPatient(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (p: Patient) => {
    setEditingPatient(p);
    form.setFieldsValue({ ...p, dateOfBirth: p.dateOfBirth ? dayjs(p.dateOfBirth) : null });
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    const data = { ...values, dateOfBirth: values.dateOfBirth ? (values.dateOfBirth as dayjs.Dayjs).format('YYYY-MM-DD') : undefined };
    if (editingPatient) {
      await dispatch(editPatient({ id: editingPatient.id, data }));
      message.success('Patient updated');
    } else {
      await dispatch(addPatient(data as Partial<Patient>));
      message.success('Patient created');
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    await dispatch(removePatient(id));
    message.success('Patient deleted');
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Name', key: 'name', render: (_: unknown, p: Patient) => `${p.firstName} ${p.lastName}` },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', render: (g: string) => <Tag>{g?.toUpperCase()}</Tag> },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Blood Group', dataIndex: 'bloodGroup', key: 'bloodGroup' },
    { title: 'Registered', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => formatDate(d) },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, p: Patient) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/patients/${p.id}`)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(p)} />
          <Popconfirm title="Delete patient?" onConfirm={() => handleDelete(p.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Patients</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Patient</Button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Search placeholder="Search by name or phone..." onSearch={setSearch} onChange={e => !e.target.value && setSearch('')} allowClear style={{ maxWidth: 300 }} />
      </div>
      <Table dataSource={patients} columns={columns} rowKey="id" loading={loading} bordered size="middle"
        pagination={{ current: page, pageSize: 10, total, onChange: setPage, showSizeChanger: false, showTotal: t => `Total ${t} patients` }} />

      <Modal open={modalOpen} title={editingPatient ? 'Edit Patient' : 'New Patient'} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Save" width={640} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Space style={{ width: '100%' }} direction="horizontal">
            <Form.Item label="First Name" name="firstName" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 12 }}>
              <Input />
            </Form.Item>
            <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 12 }}>
              <Input />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }}>
            <Form.Item label="Gender" name="gender" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 12 }}>
              <Select options={GENDER_OPTIONS} />
            </Form.Item>
            <Form.Item label="Date of Birth" name="dateOfBirth" style={{ flex: 1, marginBottom: 12 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }}>
            <Form.Item label="Phone" name="phone" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 12 }}>
              <Input />
            </Form.Item>
            <Form.Item label="Blood Group" name="bloodGroup" style={{ flex: 1, marginBottom: 12 }}>
              <Select options={BLOOD_GROUPS.map(b => ({ label: b, value: b }))} allowClear />
            </Form.Item>
          </Space>
          <Form.Item label="Email" name="email" rules={[{ type: 'email' }]} style={{ marginBottom: 12 }}>
            <Input />
          </Form.Item>
          <Form.Item label="Address" name="address" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
