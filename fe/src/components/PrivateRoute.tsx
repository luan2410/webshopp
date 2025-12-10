import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { isAuthenticated, role, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && role && !roles.includes(role)) {
    // User is authenticated but doesn't have the required role
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
