'use client';

import React from 'react';
import { Card, Typography, List, Avatar, Space, Tag } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

interface ActivityItem {
  id: string;
  type: 'user' | 'book' | 'delivery' | 'reservation';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

const RecentActivity: React.FC = () => {
  // Mock data - in real app, this would come from API
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'user',
      title: 'Nova registracija',
      description: 'Amina Hodžić se registrovala',
      timestamp: 'pre 5 minuta',
      status: 'success',
    },
    {
      id: '2',
      type: 'delivery',
      title: 'Bibliobus dostava',
      description: 'Ruta A započela - Dolac, Mehurići, Turbe',
      timestamp: 'pre 15 minuta',
      status: 'success',
    },
    {
      id: '3',
      type: 'reservation',
      title: 'Nova rezervacija',
      description: '"Na drini ćuprija" rezervisana za bibliobus',
      timestamp: 'pre 30 minuta',
      status: 'warning',
    },
    {
      id: '4',
      type: 'book',
      title: 'Knjiga vraćena',
      description: '"Travnička hronika" vraćena u terminu',
      timestamp: 'pre 1 sat',
      status: 'success',
    },
    {
      id: '5',
      type: 'user',
      title: 'Član obnovio članarinu',
      description: 'Marko Marković - godišnja članarina',
      timestamp: 'pre 2 sata',
      status: 'success',
    },
  ];

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user':
        return <UserOutlined />;
      case 'book':
        return <BookOutlined />;
      case 'delivery':
        return <TruckOutlined />;
      case 'reservation':
        return <ExclamationCircleOutlined />;
      default:
        return <CheckCircleOutlined />;
    }
  };

  const getStatusColor = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card className="table-container">
      <Title level={4}>Nedavna aktivnost</Title>
      <List
        dataSource={activities}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar icon={getIcon(item.type)} />
              }
              title={
                <Space>
                  {item.title}
                  {item.status && (
                    <Tag color={getStatusColor(item.status)}>
                      {item.status === 'success' && '✓'}
                      {item.status === 'warning' && '!'}
                      {item.status === 'error' && '✗'}
                    </Tag>
                  )}
                </Space>
              }
              description={
                <div>
                  <div>{item.description}</div>
                  <small style={{ color: '#999' }}>{item.timestamp}</small>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default RecentActivity;