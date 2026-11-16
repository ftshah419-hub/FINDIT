import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { name: 'Overview', path: '/admin' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Lost Reports', path: '/admin/lost-reports' },
    { name: 'Found Reports', path: '/admin/found-reports' },
    { name: 'Claims', path: '/admin/claims' },
    { name: 'AI Matching', path: '/admin/ai-matching' },
    { name: 'Analytics & Logs', path: '/admin/analytics' },
    { name: 'Categories', path: '/admin/categories' },
    { name: 'Complaints', path: '/admin/complaints' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 dark:bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 dark:border-outline/20 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Brand and Logo */}
        <div className="flex items-center gap-6">
          <NavLink to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-lg shadow-sm">
              F
            </div>
            <span className="font-semibold text-lg text-on-surface tracking-tight">FINDIT</span>
            <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary text-[10px] font-semibold tracking-wider uppercase ml-1">
              ADMIN CONSOLE
            </span>
          </NavLink>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/admin'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-surface-container dark:bg-surface-container-high text-primary dark:text-primary-dynamic font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right utility icons & Profile */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle UI Theme"
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container hover:text-on-surface transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* User Profile & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-on-surface leading-tight">
                  {user?.name || 'Sarah Jenkins'}
                </p>
                <span className="text-[11px] text-secondary font-medium">
                  {user?.role === 'ADMIN' ? 'Superadmin' : 'Administrator'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm overflow-hidden border border-primary/20">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">person</span>
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest dark:bg-surface rounded-xl shadow-lg border border-outline-variant/40 dark:border-outline/30 py-1.5 z-50">
                <div className="px-4 py-2 border-b border-outline-variant/30 dark:border-outline/20">
                  <p className="text-xs font-semibold text-on-surface truncate">{user?.name}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">{user?.email}</p>
                </div>
                <NavLink
                  to="/admin/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-4 py-2 text-xs text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">settings</span>
                  System Settings
                </NavLink>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-error hover:bg-error-container/20 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="xl:hidden overflow-x-auto px-4 py-2 flex items-center gap-1.5 border-t border-outline-variant/20 dark:border-outline/10 bg-surface-container-low/50 dark:bg-surface/50">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/admin'}
            className={({ isActive }) =>
              `px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </div>
    </header>
  );
};

export default Header;
