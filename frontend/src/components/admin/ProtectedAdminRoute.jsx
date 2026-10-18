import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ProtectedAdminRoute = () => {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message='Verifying administrator session...' />;
  }

  if (!admin) {
    return <Navigate to='/admin/login' state={{ from: location }} replace />;
  }

  return <Outlet />;
};
