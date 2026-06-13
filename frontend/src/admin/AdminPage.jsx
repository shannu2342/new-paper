import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard.jsx';

const AdminPage = () => {
  const [hasToken, setHasToken] = useState(Boolean(localStorage.getItem('admin-token')));

  if (!hasToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminDashboard onLogout={() => setHasToken(false)} />;
};

export default AdminPage;
