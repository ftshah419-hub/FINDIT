import React from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';

export const AdminDashboardPage = () => {
  const { user, logout, logoutAll, refreshUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#F4F7FC] dark:bg-[#0B1220] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Bar */}
        <header className="bg-white dark:bg-[#151F30] rounded-2xl border border-[#DCE4F0] dark:border-[#29364A] px-6 py-4 mb-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#101C36] dark:bg-[#1D2A40] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#4D8DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" strokeWidth="2.2" strokeDasharray="3 2" />
                <circle cx="11" cy="11" r="3" fill="#4D8DFF" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 16l4 4" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#101C36] dark:text-[#F8FAFC]">
                FIND<span className="text-[#2457E8]">IT</span>
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshUser}
              className="px-3 py-1.5 text-xs font-semibold border border-[#DCE4F0] dark:border-[#29364A] rounded-xl hover:bg-[#F4F7FC] dark:hover:bg-[#1D2A40] text-[#101C36] dark:text-[#F8FAFC] transition-colors"
            >
              Refresh Role
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#2457E8] hover:bg-[#101C36] text-white rounded-xl transition-colors shadow-sm"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Admin Verified Banner */}
        <div className="bg-gradient-to-r from-[#101C36] to-[#1D2A40] rounded-2xl p-6 text-white mb-6 shadow-md border border-[#29364A]">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg uppercase tracking-wider">
              Role: ADMIN Verified
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Administrator Control Center
          </h2>
          <p className="text-xs text-[#A8B5CA] leading-relaxed max-w-2xl">
            This account was granted Administrator privileges via the manual MongoDB Atlas workflow. Backend authorization middleware enforces this role in real time.
          </p>
        </div>

        {/* Admin Details */}
        <div className="bg-white dark:bg-[#151F30] rounded-2xl border border-[#DCE4F0] dark:border-[#29364A] p-6 shadow-sm mb-6">
          <h3 className="text-base font-bold text-[#101C36] dark:text-[#F8FAFC] mb-4">
            Administrator Credentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-[#F4F7FC] dark:bg-[#1D2A40] rounded-xl border border-[#DCE4F0] dark:border-[#29364A]">
              <span className="text-xs uppercase tracking-wider text-[#64748B] dark:text-[#A8B5CA] font-semibold block mb-1">
                Admin Name
              </span>
              <p className="font-semibold text-[#101C36] dark:text-[#F8FAFC]">{user?.name}</p>
              <p className="text-xs text-[#64748B] dark:text-[#A8B5CA] mt-0.5">{user?.email}</p>
            </div>

            <div className="p-4 bg-[#F4F7FC] dark:bg-[#1D2A40] rounded-xl border border-[#DCE4F0] dark:border-[#29364A]">
              <span className="text-xs uppercase tracking-wider text-[#64748B] dark:text-[#A8B5CA] font-semibold block mb-1">
                System Status
              </span>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">Active & Verified</p>
              <p className="text-xs text-[#64748B] dark:text-[#A8B5CA] mt-0.5">Authorization Level: Tier-1 Admin</p>
            </div>
          </div>
        </div>

        {/* Session Controls */}
        <div className="bg-white dark:bg-[#151F30] rounded-2xl border border-[#DCE4F0] dark:border-[#29364A] p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#101C36] dark:text-[#F8FAFC] mb-2">
            Administrative Session Actions
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#A8B5CA] mb-4">
            Terminate all active administrative sessions across every logged-in machine or device.
          </p>
          <button
            onClick={logoutAll}
            className="px-4 py-2 text-xs font-semibold border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
          >
            Revoke All Admin Sessions
          </button>
        </div>
      </div>
    </div>
  );
};
