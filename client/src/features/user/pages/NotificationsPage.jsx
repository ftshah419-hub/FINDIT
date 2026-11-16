import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../context/NotificationContext';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'ai') return n.type === 'AI_MATCH_FOUND';
    if (filter === 'claim') return n.type.includes('CLAIM');
    return true;
  });

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-space-lg pb-space-2xl">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/30 dark:border-[#29364A]">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-[#F8FAFC]">
            Notifications Center
          </h1>
          <p className="font-body-md text-on-surface-variant dark:text-[#A8B5CA] mt-1">
            Real-time telemetry and activity logs across your reported items, claims, and AI matches.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-lg bg-surface-container dark:bg-[#1D2A40] text-primary dark:text-[#4D8DFF] font-label-md font-semibold hover:bg-surface-container-high transition-colors"
          >
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: 'all', label: 'All Feeds' },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'ai', label: 'AI Smart Matches' },
          { key: 'claim', label: 'Claim Dossiers' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-lg font-label-md text-label-md transition-colors ${
              filter === tab.key
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container dark:bg-[#1D2A40] text-on-surface-variant dark:text-[#A8B5CA] hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="h-64 rounded-xl bg-surface-container animate-pulse"></div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-16 text-center bg-surface-container-lowest dark:bg-[#151F30] rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">
            notifications_off
          </span>
          <h3 className="font-headline-sm font-bold text-on-surface dark:text-[#F8FAFC]">
            No Notifications Found
          </h3>
          <p className="font-body-md text-on-surface-variant dark:text-[#A8B5CA] mt-1">
            You're all caught up! Important updates will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredNotifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                if (!n.isRead) markAsRead(n._id);
                if (n.relatedItemId) navigate(`/items/${n.relatedItemId._id || n.relatedItemId}`);
                else if (n.relatedClaimId) navigate('/my-claims');
              }}
              className={`p-space-lg rounded-xl border transition-all cursor-pointer flex items-start gap-space-md ${
                !n.isRead
                  ? 'bg-primary-fixed/20 dark:bg-primary/10 border-primary/40 dark:border-[#4D8DFF]/40 shadow-sm'
                  : 'bg-surface-container-lowest dark:bg-[#151F30] border-outline-variant/40 dark:border-[#29364A] hover:bg-surface-container-low'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-secondary-fixed dark:bg-secondary/30 text-on-secondary-fixed dark:text-[#79A9FF] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  {n.type === 'AI_MATCH_FOUND'
                    ? 'auto_awesome'
                    : n.type === 'CLAIM_SUBMITTED'
                    ? 'verified'
                    : 'info'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="font-title-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                    {n.title}
                  </h4>
                  <span className="font-code-tabular text-xs text-outline">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="font-body-md text-on-surface-variant dark:text-[#A8B5CA] mt-1">
                  {n.message}
                </p>

                <div className="mt-3 flex items-center gap-3">
                  {n.relatedItemId && (
                    <span className="font-label-sm text-primary dark:text-[#4D8DFF] font-semibold hover:underline">
                      View Associated Item Record →
                    </span>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n._id);
                      }}
                      className="text-xs text-outline hover:text-on-surface"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
