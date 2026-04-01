import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../../../services/branch.service';
import type { Branch } from '../../../types';

const { Title } = Typography;

export function BranchListPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form] = Form.useForm();

  const load = () => { setLoading(true); getBranches().then(setBranches).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (b: Branch) => { setEditing(b); form.setFieldsValue(b); setModalOpen(true); };

  const handleSubmit = async (values: Partial<Branch>) => {
    if (editing) { await updateBranch(editing.id, values); message.success('Branch updated'); }
    else { await createBranch(values); message.success('Branch created'); }
    setModalOpen(false);
    load();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Branch Name', dataIndex: 'name', key: 'name' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, b: Branch) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(b)} />
          <Popconfirm title="Delete branch?" onConfirm={() => { deleteBranch(b.id); message.success('Deleted'); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Branch Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Branch</Button>
      </div>
      <Table dataSource={branches} columns={columns} rowKey="id" loading={loading} bordered size="middle" pagination={false} />

      <Modal open={modalOpen} title={editing ? 'Edit Branch' : 'New Branch'} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Save" destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Branch Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="City" name="city" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Address" name="address" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item label="Phone" name="phone"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
