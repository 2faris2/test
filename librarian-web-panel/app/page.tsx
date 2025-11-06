'use client';

import React from 'react';
import { Layout, Card, Row, Col, Statistic, Typography, Space } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  ReadOutlined,
  TruckOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import DashboardChart from '@/components/DashboardChart';
import RecentActivity from '@/components/RecentActivity';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

export default function Dashboard() {
  return (
    <Layout className="admin-layout">
      <Sider width={250} className="sidebar">
        <div className="logo">
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            📚 Bibliobus
          </Title>
        </div>
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={3} style={{ margin: 0 }}>
            Administrator Panel
          </Title>
        </Header>

        <Content className="content">
          <div className="page-header">
            <Title level={2}>Kontrolna tabla</Title>
            <p>Dobrodošli u Bibliobus admin panel</p>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Ukupno članova"
                  value={1128}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1976d2' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Ukupno knjiga"
                  value={15642}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#4caf50' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Aktivne posudbe"
                  value={387}
                  prefix={<ReadOutlined />}
                  valueStyle={{ color: '#ff9800' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Dostave danas"
                  value={23}
                  prefix={<TruckOutlined />}
                  valueStyle={{ color: '#9c27b0' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Chart Section */}
            <Col xs={24} lg={16}>
              <DashboardChart />
            </Col>

            {/* Recent Activity */}
            <Col xs={24} lg={8}>
              <RecentActivity />
            </Col>
          </Row>

          {/* Alerts Section */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="Obaveštenja i upozorenja">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ padding: 12, backgroundColor: '#fff3cd', borderRadius: 4 }}>
                    <ExclamationCircleOutlined style={{ color: '#856404', marginRight: 8 }} />
                    <span>5 knjiga treba da bude vraćeno danas</span>
                  </div>
                  <div style={{ padding: 12, backgroundColor: '#d1ecf1', borderRadius: 4 }}>
                    <ExclamationCircleOutlined style={{ color: '#0c5460', marginRight: 8 }} />
                    <span>3 nove registracije čekaju odobrenje</span>
                  </div>
                  <div style={{ padding: 12, backgroundColor: '#f8d7da', borderRadius: 4 }}>
                    <ExclamationCircleOutlined style={{ color: '#721c24', marginRight: 8 }} />
                    <span>Bibliobus ruta C je kasni 15 minuta</span>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}