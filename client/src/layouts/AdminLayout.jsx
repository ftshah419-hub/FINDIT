import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-surface dark:bg-background text-on-surface flex flex-col font-sans transition-colors duration-200">
      <Header />
      <main className="w-full pt-16 xl:pt-16 flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
