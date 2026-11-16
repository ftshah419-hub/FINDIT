import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC] dark:bg-[#0B1220]">
        <div className="w-10 h-10 border-4 border-[#2457E8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    const destination = user?.role === 'ADMIN' ? '/admin' : '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
};
