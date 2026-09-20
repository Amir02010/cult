import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import DashboardPage from './DashboardPage';
import OrdersPage from './OrdersPage';
import MenuManagerPage from './MenuManagerPage';
import TablesPage from './TablesPage';
import SettingsPage from './SettingsPage';
import './admin.css';

export default function AdminApp() {
  const { status, user } = useAuth();

  if (status === 'checking') {
    return (
      <div className="admin-boot">
        <span className="admin-boot__spinner" />
      </div>
    );
  }

  if (status !== 'authenticated') return <AdminLogin />;

  const isAdmin = user && user.role === 'admin';

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="menu" element={isAdmin ? <MenuManagerPage /> : <Navigate to="/admin/orders" replace />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="settings" element={isAdmin ? <SettingsPage /> : <Navigate to="/admin/orders" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
