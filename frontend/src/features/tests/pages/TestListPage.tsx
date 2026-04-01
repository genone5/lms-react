import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Input, Modal, Form, InputNumber, Select, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTests, addTest, editTest, removeTest } from '../../../store/slices/testSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import type { Test } from '../../../types';
import { formatCurrency } from '../../../utils/formatDate';
import { getTestCategories } from '../../../services/test.service';

const { Title } = Typography;
const { Search } = Input;

export function TestListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { tests, loading, total } = useSelector((state: RootState) => state.tests);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [form] = Form.useForm();

  useEffect(() => { dispatch(fetchTests({ page, limit: 10, search })); }, [dispatch, page, search]);
  useEffect(() => { getTestCategories().then(setCategories); }, []);

  const openCreate = () => { setEditingTest(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (t: Test) => { setEditingTest(t); form.setFieldsValue(t); setModalOpen(true); };

  const handleSubmit = async (values: Partial<Test>) => {
    if (editingTest) {
      await dispatch(editTest({ id: editingTest.id, data: values }));
      message.success('Test updated');
    } else {
      await dispatch(addTest(values));
      message.success('Test created');
    }
    setModalOpen(false);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Test Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (c: string) => <Tag color="blue">{c}</Tag> },
    { title: 'Sample Type', dataIndex: 'sampleType', key: 'sampleType' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (p: number) => formatCurrency(p) },
    { title: 'Normal Range', dataIndex: 'normalRange', key: 'normalRange', render: (r: string) => r || '-' },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, t: Test) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(t)} />
          <Popconfirm title="Delete test?" onConfirm={() => { dispatch(removeTest(t.id)); message.success('Deleted'); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Tests Catalog</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Test</Button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Search placeholder="Search tests..." onSearch={setSearch} onChange={e => !e.target.value && setSearch('')} allowClear style={{ maxWidth: 300 }} />
      </div>
      <Table dataSource={tests} columns={columns} rowKey="id" loading={loading} bordered size="middle"
        pagination={{ current: page, pageSize: 10, total, onChange: setPage, showTotal: t => `Total ${t} tests` }} />

      <Modal open={modalOpen} title={editingTest ? 'Edit Test' : 'New Test'} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Save" destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Test Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Select mode="tags" options={categories.map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item label="Price (Rs.)" name="price" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item label="Sample Type" name="sampleType" rules={[{ required: true }]}>
            <Select options={['Blood', 'Urine', 'Stool', 'Sputum', 'Swab'].map(s => ({ label: s, value: s }))} />
          </Form.Item>
          <Form.Item label="Normal Range" name="normalRange">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
