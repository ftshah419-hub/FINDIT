import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { QuickSearchModal } from '../components/QuickSearchModal';

export const UserLayout = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-[#0B1220] text-on-surface dark:text-[#F8FAFC]">
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <main className="w-full pt-16 flex-1 bg-surface dark:bg-[#0B1220] px-margin py-space-xl">
        <Outlet />
      </main>
      <Footer />
      <QuickSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
