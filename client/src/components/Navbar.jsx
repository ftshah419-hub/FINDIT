import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar = ({ onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Browse Items', path: '/items' },
    { name: 'Report Lost', path: '/report-lost' },
    { name: 'Report Found', path: '/report-found' },
    { name: 'My Reports', path: '/my-reports' },
    { name: 'My Claims', path: '/my-claims' },
    { name: 'AI Smart Match', path: '/ai-matches' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 dark:bg-[#151F30]/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30 dark:border-[#29364A]">
      <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center gap-space-lg shrink-0">
          <Link to="/" className="flex items-center gap-space-sm group">
            <img
              alt="FINDIT Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/ALJJyrD3hGqNORwBuJrLbyFmAMOLEvyHp2n5j7FqKfEFywPbcE3sAH99koyRZDEkYv_7l0yUzNHDA1r76ZG_CUhcTug3VIA_ZsbWmnpVkRhHevey5K4RktCgrPS99BDRqAaVpwtoLe_ssf1OkbHfvw3C5rrYBoHvz6YcMGZjEusTTuDR3hUvHSlN0NPE_y1zeIvzSZNwokDjKng2Nc6TjS31uo08lvTzg2nQhoVIfi_G4g"
            />
            <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-primary dark:text-[#4D8DFF]">
              FINDIT
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-space-xs">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `px-space-sm py-1.5 rounded-lg font-label-lg text-label-lg transition-colors ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                      : 'text-on-surface-variant dark:text-[#A8B5CA] hover:bg-surface-container-high dark:hover:bg-[#1D2A40] hover:text-on-surface dark:hover:text-[#F8FAFC]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Console Actions: Quick Search, Notifications, Dark Mode, Profile */}
        <div className="flex items-center gap-space-md shrink-0">
          {/* Quick Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-space-xs px-space-md py-1.5 bg-surface-container-low dark:bg-[#1D2A40] rounded-lg text-on-surface-variant dark:text-[#A8B5CA] border border-outline-variant/40 dark:border-[#29364A] hover:bg-surface-container dark:hover:bg-[#243550] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span className="font-body-sm text-body-sm pr-space-md">Quick search items...</span>
            <kbd className="font-code-tabular text-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest dark:bg-[#29364A] text-on-surface dark:text-[#F8FAFC] font-medium">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              aria-label="Notifications"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-2 rounded-lg text-on-surface-variant dark:text-[#A8B5CA] hover:bg-surface-container-high dark:hover:bg-[#1D2A40] hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-surface-container-lowest dark:bg-[#151F30] border border-outline-variant/50 dark:border-[#29364A] shadow-xl z-50 overflow-hidden">
                <div className="p-space-md flex items-center justify-between border-b border-outline-variant/30 dark:border-[#29364A] bg-surface-container-low/50 dark:bg-[#1D2A40]/50">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-title-md text-title-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-on-primary">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="font-label-sm text-primary dark:text-[#4D8DFF] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/20 dark:divide-[#29364A]">
                  {notifications.length === 0 ? (
                    <div className="p-space-lg text-center text-on-surface-variant dark:text-[#A8B5CA] font-body-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          if (!n.isRead) markAsRead(n._id);
                          if (n.relatedItemId) navigate(`/items/${n.relatedItemId._id || n.relatedItemId}`);
                          else if (n.relatedClaimId) navigate('/my-claims');
                          setShowNotifications(false);
                        }}
                        className={`p-space-md hover:bg-surface-container-low dark:hover:bg-[#1D2A40] transition-colors cursor-pointer flex items-start gap-space-sm ${
                          !n.isRead ? 'bg-primary-fixed/20 dark:bg-primary/10' : ''
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary dark:text-[#4D8DFF] shrink-0 mt-0.5">
                          {n.type === 'AI_MATCH_FOUND'
                            ? 'auto_awesome'
                            : n.type === 'CLAIM_SUBMITTED'
                            ? 'verified'
                            : 'info'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-label-md text-label-md font-semibold text-on-surface dark:text-[#F8FAFC] truncate">
                            {n.title}
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA] line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                          <span className="font-code-tabular text-[11px] text-outline mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-outline-variant/30 dark:border-[#29364A] bg-surface-container-low/30 dark:bg-[#1D2A40]/30 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="font-label-sm text-primary dark:text-[#4D8DFF] font-medium hover:underline"
                  >
                    View All Activity Feeds
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            aria-label="Theme Toggle"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-on-surface-variant dark:text-[#A8B5CA] hover:bg-surface-container-high dark:hover:bg-[#1D2A40] hover:text-on-surface dark:hover:text-[#F8FAFC] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {darkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-space-sm pl-space-xs text-left group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-primary shrink-0 ring-2 ring-primary/20">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-on-primary text-[18px] flex items-center justify-center h-full">
                    person
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] leading-tight font-semibold">
                  {user?.name || 'Alex Chen'}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA] leading-tight">
                  {user?.role === 'ADMIN' ? 'Administrator' : 'Verified User'}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest dark:bg-[#151F30] border border-outline-variant/50 dark:border-[#29364A] shadow-xl z-50 overflow-hidden py-1">
                <div className="px-4 py-2 border-b border-outline-variant/30 dark:border-[#29364A]">
                  <p className="font-label-md text-label-md font-semibold text-on-surface dark:text-[#F8FAFC] truncate">
                    {user?.name}
                  </p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant dark:text-[#A8B5CA] truncate">
                    {user?.email}
                  </p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-on-surface-variant dark:text-[#A8B5CA] hover:bg-surface-container-low dark:hover:bg-[#1D2A40] hover:text-on-surface transition-colors font-label-md"
                >
                  <span className="material-symbols-outlined text-[18px]">account_circle</span>
                  <span>My Profile & Settings</span>
                </Link>
                <Link
                  to="/my-reports"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-on-surface-variant dark:text-[#A8B5CA] hover:bg-surface-container-low dark:hover:bg-[#1D2A40] hover:text-on-surface transition-colors font-label-md"
                >
                  <span className="material-symbols-outlined text-[18px]">folder_managed</span>
                  <span>My Reports Dossier</span>
                </Link>
                <Link
                  to="/my-claims"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-on-surface-variant dark:text-[#A8B5CA] hover:bg-surface-container-low dark:hover:bg-[#1D2A40] hover:text-on-surface transition-colors font-label-md"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>My Claims Tracking</span>
                </Link>
                <div className="border-t border-outline-variant/30 dark:border-[#29364A] my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-error hover:bg-error-container/20 transition-colors font-label-md text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="xl:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-outline-variant/20 dark:border-[#29364A] gap-1 bg-surface-container-lowest/50 dark:bg-[#151F30]/50 no-scrollbar">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) =>
              `px-3 py-1 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'text-on-surface-variant dark:text-[#A8B5CA] hover:bg-surface-container-low'
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
