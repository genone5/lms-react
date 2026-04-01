import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Modal, Form, Input, Select, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { getUsers, createUser, updateUser, toggleUserStatus } from '../../../services/user.service';
import { getRoles } from '../../../services/role.service';
import { getBranches } from '../../../services/branch.service';
import { StatusBadge } from '../../../shared/ui/Badge/StatusBadge';
import { formatDate } from '../../../utils/formatDate';
import type { User, Role, Branch } from '../../../types';

const { Title } = Typography;
const { Search } = Input;

export function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();

  const load = () => { setLoading(true); getUsers({ search }).then(r => setUsers(r.data || [])).finally(() => setLoading(false)); };
  useEffect(load, [search]);
  useEffect(() => { getRoles().then(setRoles); getBranches().then(setBranches); }, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (u: User) => { setEditing(u); form.setFieldsValue(u); setModalOpen(true); };

  const handleSubmit = async (values: Partial<User> & { password?: string }) => {
    if (editing) { await updateUser(editing.id, values); message.success('User updated'); }
    else { await createUser(values as any); message.success('User created'); }
    setModalOpen(false);
    load();
  };

  const handleToggle = async (id: number) => {
    await toggleUserStatus(id);
    message.success('Status updated');
    load();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'roleName', key: 'roleName', render: (r: string) => <Tag color="blue">{r}</Tag> },
    { title: 'Branch', dataIndex: 'branchName', key: 'branchName', render: (b: string) => b || '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => formatDate(d) },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, u: User) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(u)} />
          <Button size="small" icon={<UserSwitchOutlined />} onClick={() => handleToggle(u.id)} danger={u.status === 'active'}>
            {u.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>User Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New User</Button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Search placeholder="Search users..." onSearch={setSearch} onChange={e => !e.target.value && setSearch('')} allowClear style={{ maxWidth: 300 }} />
      </div>
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} bordered size="middle" pagination={{ pageSize: 10 }} />

      <Modal open={modalOpen} title={editing ? 'Edit User' : 'New User'} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Save" destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          {!editing && <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>}
          <Form.Item label="Role" name="roleId" rules={[{ required: true }]}>
            <Select options={roles.map(r => ({ label: r.name, value: r.id }))} />
          </Form.Item>
          <Form.Item label="Branch" name="branchId">
            <Select allowClear options={branches.map(b => ({ label: b.name, value: b.id }))} />
          </Form.Item>
          <Form.Item label="Phone" name="phone"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
