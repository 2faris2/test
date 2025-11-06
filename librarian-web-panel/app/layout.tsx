import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const theme = {
  token: {
    colorPrimary: '#1976d2',
    colorSuccess: '#4caf50',
    colorWarning: '#ff9800',
    colorError: '#f44336',
    borderRadius: 8,
  },
};

export const metadata = {
  title: 'Bibliobus - Admin Panel',
  description: 'Administrator panel for Bibliobus library system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bs">
      <body className={inter.className}>
        <ConfigProvider theme={theme}>
          <AntdRegistry>
            {children}
          </AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}