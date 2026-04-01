import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Tabs, message, Spin, Switch } from 'antd';
import { Typography } from 'antd';
import { getLabInfo, updateLabInfo, getEmailSettings, updateEmailSettings } from '../../../services/settings.service';

const { Title } = Typography;

export function SettingsPage() {
  const [labForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLabInfo(), getEmailSettings()]).then(([lab, email]) => {
      labForm.setFieldsValue(lab);
      emailForm.setFieldsValue(email);
    }).finally(() => setLoading(false));
  }, []);

  const handleLabSave = async (values: Record<string, string>) => {
    await updateLabInfo(values);
    message.success('Lab information saved');
  };

  const handleEmailSave = async (values: Record<string, unknown>) => {
    await updateEmailSettings(values);
    message.success('Email settings saved');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin /></div>;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>System Settings</Title>
      <Tabs items={[
        {
          key: 'lab', label: 'Lab Information',
          children: (
            <Card>
              <Form form={labForm} layout="vertical" onFinish={handleLabSave} style={{ maxWidth: 600 }}>
                <Form.Item label="Lab Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item label="Address" name="address"><Input.TextArea rows={2} /></Form.Item>
                <Form.Item label="Phone" name="phone"><Input /></Form.Item>
                <Form.Item label="Email" name="email" rules={[{ type: 'email' }]}><Input /></Form.Item>
                <Form.Item label="Website" name="website"><Input /></Form.Item>
                <Form.Item label="Report Footer" name="reportFooter"><Input.TextArea rows={2} /></Form.Item>
                <Form.Item><Button type="primary" htmlType="submit">Save Lab Info</Button></Form.Item>
              </Form>
            </Card>
          ),
        },
        {
          key: 'email', label: 'Email Settings',
          children: (
            <Card>
              <Form form={emailForm} layout="vertical" onFinish={handleEmailSave} style={{ maxWidth: 600 }}>
                <Form.Item label="SMTP Host" name="smtpHost"><Input /></Form.Item>
                <Form.Item label="SMTP Port" name="smtpPort"><Input type="number" /></Form.Item>
                <Form.Item label="SMTP User" name="smtpUser"><Input /></Form.Item>
                <Form.Item label="From Name" name="fromName"><Input /></Form.Item>
                <Form.Item label="Email Enabled" name="enabled" valuePropName="checked"><Switch /></Form.Item>
                <Form.Item><Button type="primary" htmlType="submit">Save Email Settings</Button></Form.Item>
              </Form>
            </Card>
          ),
        },
      ]} />
    </div>
  );
}
