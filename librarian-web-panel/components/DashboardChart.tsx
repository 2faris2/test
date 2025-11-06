'use client';

import React from 'react';
import { Card, Typography } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const { Title } = Typography;

const DashboardChart: React.FC = () => {
  // Mock data - in real app, this would come from API
  const data = [
    { month: 'Jan', posudbe: 400, clanovi: 240, dostave: 320 },
    { month: 'Feb', posudbe: 300, clanovi: 280, dostave: 380 },
    { month: 'Mar', posudbe: 600, clanovi: 320, dostave: 420 },
    { month: 'Apr', posudbe: 800, clanovi: 360, dostave: 480 },
    { month: 'May', posudbe: 700, clanovi: 400, dostave: 520 },
    { month: 'Jun', posudbe: 900, clanovi: 440, dostave: 580 },
    { month: 'Jul', posudbe: 750, clanovi: 480, dostave: 620 },
    { month: 'Aug', posudbe: 850, clanovi: 520, dostave: 680 },
    { month: 'Sep', posudbe: 950, clanovi: 560, dostave: 720 },
    { month: 'Oct', posudbe: 1000, clanovi: 600, dostave: 780 },
    { month: 'Nov', posudbe: 1100, clanovi: 640, dostave: 820 },
    { month: 'Dec', posudbe: 1200, clanovi: 680, dostave: 880 },
  ];

  return (
    <Card className="chart-container">
      <Title level={4}>Mjesečna statistika</Title>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="posudbe"
            stroke="#1976d2"
            strokeWidth={2}
            name="Posudbe"
          />
          <Line
            type="monotone"
            dataKey="clanovi"
            stroke="#4caf50"
            strokeWidth={2}
            name="Novi članovi"
          />
          <Line
            type="monotone"
            dataKey="dostave"
            stroke="#ff9800"
            strokeWidth={2}
            name="Bibliobus dostave"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default DashboardChart;