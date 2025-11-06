'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values);

      // Store token in localStorage
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.user));

      message.success('Uspešna prijava!');

      // Redirect based on user role
      if (response.user.role === 'ADMIN') {
        router.push('/');
      } else if (response.user.role === 'LIBRARIAN') {
        router.push('/');
      } else {
        message.error('Nemate pristup admin panelu');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Prijava nije uspela');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <Title level={3} style={{ margin: 0, color: '#1976d2' }}>
            Bibliobus Admin
          </Title>
          <Text type="secondary">
            Administrator panel za bibliotekare
          </Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Molimo unesite email!' },
              { type: 'email', message: 'Molimo unesite validan email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="email@primjer.ba"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Lozinka"
            rules={[
              { required: true, message: 'Molimo unesite lozinku!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Unesite lozinku"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 48 }}
            >
              {loading ? 'Prijavljivanje...' : 'Prijavi se'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space direction="vertical" size="small">
            <Text type="secondary" style={{ fontSize: 12 }}>
              Za pristup potrebna je bibliotekarska ili administratorska uloga
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Zaboravili ste lozinku? Kontaktirajte administratora sistema
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
}