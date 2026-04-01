import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRoles, createRole, updateRole, deleteRole } from '../../../services/role.service';
import type { Role } from '../../../types';

const { Title } = Typography;

export function RoleListPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const load = () => { setLoading(true); getRoles().then(setRoles).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: Role) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };

  const handleSubmit = async (values: Partial<Role>) => {
    if (editing) { await updateRole(editing.id, values); message.success('Role updated'); }
    else { await createRole(values); message.success('Role created'); }
    setModalOpen(false);
    load();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Role Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, r: Role) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Delete role?" onConfirm={() => { deleteRole(r.id); message.success('Deleted'); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Roles & Permissions</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Role</Button>
      </div>
      <Table dataSource={roles} columns={columns} rowKey="id" loading={loading} bordered size="middle" pagination={false} />

      <Modal open={modalOpen} title={editing ? 'Edit Role' : 'New Role'} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Save" destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Role Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Description" name="description"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
