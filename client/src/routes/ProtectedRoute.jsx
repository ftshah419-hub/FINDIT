import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC] dark:bg-[#0B1220]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#2457E8] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#64748B] dark:text-[#A8B5CA]">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
