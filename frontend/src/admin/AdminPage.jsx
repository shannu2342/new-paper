import React, { useState } from 'react';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';

const AdminPage = () => {
  const [hasToken, setHasToken] = useState(Boolean(localStorage.getItem('admin-token')));

  if (!hasToken) {
    return <AdminLogin onSuccess={() => setHasToken(true)} />;
  }

  return <AdminDashboard />;
};

export default AdminPage;
