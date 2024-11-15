import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/auth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { role } = useAuth();

  if (role !== 'admin') {
    return <Navigate to="/ducech/administrador" />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export const TecnicoRoute = ({ children }) => {
  const { role } = useAuth();

  if (role !== 'tecnico') {
    return <Navigate to="/ducech/tecnico" />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export const ClienteRoute = ({ children }) => {
  const { role } = useAuth();

  if (role !== 'cliente') {
    return <Navigate to="/ducech/cliente" />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
};
