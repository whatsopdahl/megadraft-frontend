import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AuthenticatedLayout from '../components/AuthenticatedLayout';

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AuthenticatedLayout>{children}</AuthenticatedLayout> : <Navigate to="/" />;
};

export default RequireAuth;
