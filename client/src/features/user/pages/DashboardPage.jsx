import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../services/userService';
import { aiMatchService } from '../services/aiMatchService';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [featuredMatchDismissed, setFeaturedMatchDismissed] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await userService.getDashboardStats();
        setData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data?.stats || {
    totalLostReports: 3,
    totalFoundReports: 2,
    activeClaims: 1,
    resolvedRecoveries: 4,
    smartMatchAlerts: 1,
    auditIntegrity: 94,
    identityLevel: 'Identity Level 3',
  };

  const featuredMatch = data?.featuredMatch;
  const recentItems = data?.recentCampusItems || [];
  const recentNotifications = data?.recentNotifications || [];

  const handleDismissMatch = async () => {
    if (featuredMatch?._id) {
      try {
        await aiMatchService.dismissMatch(featuredMatch._id);
      } catch (e) {
        // Ignore
      }
    }
    setFeaturedMatchDismissed(true);
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col w-full">
      {/* Top Welcome & System Status Bar */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low dark:bg-[#151F30] p-space-lg shadow-sm mb-space-xl border border-outline-variant/30 dark:border-[#29364A]">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-primary-container/10 via-secondary-container/5 to-transparent blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md relative z-10">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-highest dark:bg-[#1D2A40] text-on-surface-variant dark:text-[#A8B5CA] font-code-tabular text-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-[#4D8DFF] animate-pulse"></span>
                CAMPUS NETWORK ACTIVE
              </span>
              <span className="font-body-sm text-body-sm text-outline">|</span>
              <span className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                {currentDateFormatted}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-[#F8FAFC] tracking-tight mt-1 font-bold">
              Welcome back, <span className="text-primary dark:text-[#4D8DFF]">{user?.name || 'Alex Chen'}</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-[#A8B5CA] max-w-2xl">
              Your campus recovery hub has updated match predictions. {stats.smartMatchAlerts > 0 ? `${stats.smartMatchAlerts} potential match requires your immediate review.` : 'All campus nodes reporting normal operational status.'}
            </p>
          </div>

          {/* Quick Status Metric Ring */}
          <div className="flex items-center gap-space-lg shrink-0 bg-surface-container-lowest/80 dark:bg-[#1D2A40]/80 backdrop-blur-sm p-space-sm rounded-xl shadow-sm border border-outline-variant/30 dark:border-[#29364A]">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-highest dark:text-[#29364A]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                ></path>
                <path
                  className="text-primary dark:text-[#4D8DFF]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="85, 100"
                  strokeLinecap="round"
                  strokeWidth="3"
                ></path>
              </svg>
              <span className="absolute font-code-tabular font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                {stats.auditIntegrity}%
              </span>
            </div>
            <div className="flex flex-col pr-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA] uppercase tracking-wider">
                Audit Integrity
              </span>
              <span className="font-label-lg text-label-lg text-on-surface dark:text-[#F8FAFC] font-semibold">
                {stats.identityLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-lg mb-space-xl">
        {/* Stat 1: Total Lost Reports */}
        <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group border border-outline-variant/40 dark:border-[#29364A]">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] font-medium tracking-wide">
              TOTAL LOST REPORTS
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container dark:bg-[#1D2A40] flex items-center justify-center text-primary dark:text-[#4D8DFF] group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">search_off</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display text-display text-on-surface dark:text-[#F8FAFC] font-bold tracking-tight">
                {stats.totalLostReports}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] font-normal">
                reports filed
              </span>
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 px-2 py-1 rounded bg-secondary-fixed/50 dark:bg-secondary/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-secondary dark:bg-[#4D8DFF] animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-on-secondary-fixed dark:text-[#79A9FF] font-semibold">
                {stats.smartMatchAlerts} smart match alert
              </span>
            </div>
          </div>
        </div>

        {/* Stat 2: Total Found Reports */}
        <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group border border-outline-variant/40 dark:border-[#29364A]">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] font-medium tracking-wide">
              TOTAL FOUND REPORTS
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container dark:bg-[#1D2A40] flex items-center justify-center text-secondary dark:text-[#4D8DFF] group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
              <span className="material-symbols-outlined text-[22px]">pan_tool</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display text-display text-on-surface dark:text-[#F8FAFC] font-bold tracking-tight">
                {stats.totalFoundReports}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] font-normal">
                items turned in
              </span>
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-high dark:bg-[#1D2A40] w-fit">
              <span className="material-symbols-outlined text-secondary dark:text-[#4D8DFF] text-[14px]">done_all</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA] font-medium">
                1 handed over to security
              </span>
            </div>
          </div>
        </div>

        {/* Stat 3: Active Claims */}
        <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group border border-outline-variant/40 dark:border-[#29364A]">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] font-medium tracking-wide">
              ACTIVE CLAIMS
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container dark:bg-[#1D2A40] flex items-center justify-center text-primary-container dark:text-[#4D8DFF] group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display text-display text-on-surface dark:text-[#F8FAFC] font-bold tracking-tight">
                {stats.activeClaims}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] font-normal">
                claim active
              </span>
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-highest dark:bg-[#1D2A40] w-fit">
              <span className="material-symbols-outlined text-primary dark:text-[#4D8DFF] text-[14px]">hourglass_top</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA] font-medium">
                Under desk verification
              </span>
            </div>
          </div>
        </div>

        {/* Stat 4: Resolved Recoveries */}
        <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group border border-outline-variant/40 dark:border-[#29364A]">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] font-medium tracking-wide">
              RESOLVED RECOVERIES
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container dark:bg-[#1D2A40] flex items-center justify-center text-primary dark:text-[#4D8DFF] group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display text-display text-on-surface dark:text-[#F8FAFC] font-bold tracking-tight">
                {stats.resolvedRecoveries}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] font-normal">
                items returned
              </span>
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 px-2 py-1 rounded bg-secondary-fixed/40 dark:bg-secondary/20 w-fit">
              <span className="material-symbols-outlined text-secondary dark:text-[#4D8DFF] text-[14px]">task_alt</span>
              <span className="font-label-sm text-label-sm text-secondary dark:text-[#79A9FF] font-semibold">
                100% verified transfer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Command Strip */}
      <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-md shadow-sm mb-space-xl flex flex-wrap items-center justify-between gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
        <div className="flex items-center gap-space-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-primary dark:bg-[#4D8DFF]"></div>
          <span className="font-label-lg text-label-lg text-on-surface dark:text-[#F8FAFC] font-semibold">
            Quick Actions Hub
          </span>
          <span className="hidden sm:inline font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
            — Register lost property, log campus findings, or search archives
          </span>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          <Link
            to="/report-lost"
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary transition-all duration-150 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Report Lost Item</span>
          </Link>
          <Link
            to="/report-found"
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest dark:bg-[#1D2A40] text-primary dark:text-[#4D8DFF] border border-outline-variant/30 dark:border-[#29364A] font-label-lg text-label-lg hover:bg-surface-container transition-all duration-150 shadow-sm active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">front_hand</span>
            <span>Report Found Item</span>
          </Link>
          <Link
            to="/items"
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container dark:bg-[#1D2A40] text-on-surface-variant dark:text-[#A8B5CA] font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface transition-all duration-150"
          >
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            <span>Browse Items Catalog</span>
          </Link>
        </div>
      </div>

      {/* AI Smart Matching Radar Widget */}
      {!featuredMatchDismissed && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container-low to-surface-container-lowest dark:from-[#1D2A40] dark:via-[#151F30] dark:to-[#151F30] p-space-lg shadow-md mb-space-xl border border-outline-variant/40 dark:border-[#29364A]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="flex items-start gap-space-md max-w-3xl">
              <div className="relative w-14 h-14 rounded-xl bg-primary dark:bg-[#2457e8] text-on-primary flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[30px]">radar</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <span className="font-label-sm text-label-sm font-semibold tracking-wider text-primary dark:text-[#4D8DFF] uppercase bg-primary-fixed dark:bg-[#1D2A40] px-2 py-0.5 rounded">
                    FINDIT AI Radar
                  </span>
                  <span className="font-code-tabular text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
                    Item Match Index #AI-9941
                  </span>
                  <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed dark:bg-secondary/20 text-on-secondary-fixed dark:text-[#79A9FF] font-semibold">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    {featuredMatch?.similarityScore || 94}% Confidence Match
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-[#F8FAFC] mt-1 font-bold">
                  High-Confidence Match Identified for Your {featuredMatch?.lostItemId?.title || 'MacBook Pro 14"'}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-[#A8B5CA] mt-0.5">
                  Your item reported lost closely matches <strong className="text-on-surface dark:text-[#F8FAFC]">Found Item #{featuredMatch?.foundItemId?._id?.toString().slice(-4).toUpperCase() || 'FND-8821'}</strong> deposited at <span className="inline-flex items-center gap-0.5 text-secondary dark:text-[#4D8DFF] font-medium"><span className="material-symbols-outlined text-[15px]">location_on</span> {featuredMatch?.foundItemId?.storageLocation || 'Student Union Library Desk 2'}</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-sm shrink-0 self-end lg:self-center">
              <button
                onClick={handleDismissMatch}
                className="px-space-md py-2.5 rounded-lg bg-surface-container dark:bg-[#1D2A40] text-on-surface-variant dark:text-[#A8B5CA] font-label-lg text-label-lg hover:bg-surface-container-high transition-colors"
              >
                Dismiss
              </button>
              <Link
                to="/ai-matches"
                className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary dark:bg-[#2457e8] text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all"
              >
                <span>View Match & Claim</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Split Section: Recently Reported Items (8 Cols) vs Recent Activity (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left 8 Columns: Live Inventory Feed */}
        <section className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary dark:text-[#4D8DFF] font-semibold">
                  Live Inventory Feed
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-[#F8FAFC] font-bold tracking-tight">
                Recently Reported Items on Campus
              </h3>
            </div>
            <Link
              to="/items"
              className="font-label-md text-label-md text-secondary dark:text-[#4D8DFF] hover:text-primary font-semibold flex items-center gap-0.5 transition-colors"
            >
              <span>View All Campus Feeds</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {recentItems.map((item) => (
              <article
                key={item._id}
                onClick={() => navigate(`/items/${item._id}`)}
                className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group border border-outline-variant/40 dark:border-[#29364A] cursor-pointer"
              >
                <div className="relative w-full h-44 bg-surface-container dark:bg-[#1D2A40] overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={
                      item.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={item.title}
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold tracking-wide uppercase shadow-sm ${
                        item.type === 'FOUND'
                          ? 'bg-secondary text-on-secondary'
                          : 'bg-error text-on-error'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-on-surface/80 backdrop-blur-md text-surface-bright font-code-tabular text-label-sm">
                    #{item._id.toString().slice(-4).toUpperCase()}
                  </div>
                </div>

                <div className="p-space-md flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold group-hover:text-primary dark:group-hover:text-[#4D8DFF] transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA] line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-sm bg-surface-container-low dark:bg-[#1D2A40] rounded-lg p-2 flex flex-col gap-1 text-on-surface-variant dark:text-[#A8B5CA]">
                    <div className="flex items-center gap-1 text-label-sm font-label-sm">
                      <span className="material-symbols-outlined text-primary dark:text-[#4D8DFF] text-[15px]">
                        location_on
                      </span>
                      <span className="truncate">{item.location?.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-label-sm font-label-sm text-outline">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {new Date(item.itemDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="font-code-tabular text-on-surface-variant dark:text-[#A8B5CA] font-medium">
                        {item.location?.campusZone || 'Campus Hub'}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Campus Location Hotspot Mini-Module */}
          <div className="rounded-xl bg-surface-container-lowest dark:bg-[#151F30] p-space-md shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-lg bg-surface-container dark:bg-[#1D2A40] flex items-center justify-center text-primary dark:text-[#4D8DFF] shrink-0">
                <span className="material-symbols-outlined text-[26px]">map</span>
              </div>
              <div>
                <h5 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Lost & Found Collection Depots
                </h5>
                <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                  4 open intake desks ready for physical property verification today.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-sm shrink-0 w-full md:w-auto">
              <Link
                to="/items?campusZone=Central Library"
                className="w-full md:w-auto px-space-md py-2 rounded-lg bg-surface-container dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-md text-label-md hover:bg-surface-container-high transition-colors text-center"
              >
                View Campus Intake Desks
              </Link>
            </div>
          </div>
        </section>

        {/* Right 4 Columns: Recent Activity Timeline */}
        <aside className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Audit Stream
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-[#F8FAFC] font-bold tracking-tight">
                Recent Activity
              </h3>
            </div>
            <button
              onClick={() => navigate('/notifications')}
              className="p-1.5 rounded-lg text-on-surface-variant dark:text-[#A8B5CA] hover:bg-surface-container dark:hover:bg-[#1D2A40] transition-colors"
              title="Filter activity"
            >
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>

          <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm flex flex-col border border-outline-variant/40 dark:border-[#29364A]">
            {recentNotifications.map((n, idx) => (
              <div
                key={n._id}
                className={`relative flex items-start gap-space-md ${
                  idx < recentNotifications.length - 1 ? 'pb-space-lg' : ''
                }`}
              >
                {idx < recentNotifications.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-surface-container-highest dark:bg-[#29364A]"></div>
                )}
                <div className="w-8 h-8 rounded-full bg-secondary-fixed dark:bg-secondary/30 text-on-secondary-fixed dark:text-[#79A9FF] flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">
                    {n.type === 'AI_MATCH_FOUND' ? 'auto_awesome' : n.type === 'CLAIM_SUBMITTED' ? 'verified' : 'task_alt'}
                  </span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-space-xs">
                    <span className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold truncate">
                      {n.title}
                    </span>
                    <span className="font-code-tabular text-label-sm text-outline shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA] mt-0.5">
                    {n.message}
                  </p>
                  {n.relatedItemId && (
                    <Link
                      to={`/items/${n.relatedItemId._id || n.relatedItemId}`}
                      className="mt-1.5 inline-block font-label-sm text-label-sm text-primary dark:text-[#4D8DFF] font-medium hover:underline"
                    >
                      View Record Status →
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {/* Action Footer in Aside */}
            <div className="mt-space-lg pt-space-md bg-surface-container-low/60 dark:bg-[#1D2A40]/60 -mx-space-lg -mb-space-lg p-space-md rounded-b-xl flex items-center justify-between border-t border-outline-variant/20 dark:border-[#29364A]">
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
                Live audit logging enabled
              </span>
              <Link
                to="/notifications"
                className="font-label-sm text-label-sm text-primary dark:text-[#4D8DFF] font-semibold hover:underline"
              >
                Full Log
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
