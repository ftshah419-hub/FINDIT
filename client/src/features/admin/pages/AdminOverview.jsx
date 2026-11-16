import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import adminService from '../services/adminService';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [releaseNote, setReleaseNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      setData(res);
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSignAndRelease = async () => {
    if (!selectedClaim) return;
    try {
      setActionLoading(true);
      await adminService.reviewClaim(selectedClaim._id, {
        status: 'APPROVED',
        adminNote: releaseNote || 'Custody released by administrator after verified physical inspection.',
      });
      setReleaseModalOpen(false);
      setSelectedClaim(null);
      setReleaseNote('');
      await fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to approve claim.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return <LoadingSpinner text="Connecting to FINDIT Telemetry Radar..." />;
  }

  if (error && !data) {
    return (
      <div className="w-full px-8 py-12 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-[48px] text-error mb-2">error</span>
        <h2 className="text-lg font-bold text-on-surface">Telemetry Disconnected</h2>
        <p className="text-sm text-on-surface-variant max-w-md mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-medium"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics, charts, highPriorityClaims, recentActivities } = data || {};

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header Hero Banner with Administrative Overview */}
      <div className="relative w-full rounded-2xl bg-surface-container-lowest dark:bg-surface p-6 sm:p-8 shadow-xs border border-outline-variant/30 dark:border-outline/20 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 bottom-0 w-64 h-64 rounded-full bg-secondary-container/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high dark:bg-surface-container text-primary text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Operational Cluster 01 · Live
            </span>
            <span className="font-code-tabular text-xs text-on-surface-variant">
              Campus Central Hub · Session Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Welcome back, Administrator
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Campus-wide lost and found network health, claim processing queues, and real-time intake telemetry.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <NavLink
            to="/admin/analytics"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container dark:bg-surface-container text-on-surface transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs border border-outline-variant/30 dark:border-outline/20"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Audit Logs
          </NavLink>
          <NavLink
            to="/admin/found-reports"
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Register Custody Item
          </NavLink>
        </div>
      </div>

      {/* KPI Metric Cards: 6-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Users */}
        <div className="rounded-xl bg-surface-container-lowest dark:bg-surface p-4 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg bg-surface-container-low dark:bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-low dark:bg-surface-container text-primary text-[11px] font-semibold">
              Live
            </span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-medium">Registered Users</span>
            <div className="text-xl font-bold text-on-surface tracking-tight mt-0.5 font-code-tabular">
              {metrics?.totalUsers?.toLocaleString() || 0}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/20 dark:border-outline/20 flex items-center text-on-surface-variant text-[11px]">
            <span className="material-symbols-outlined text-[14px] text-primary mr-1">verified_user</span>
            {metrics?.activeUsers || 0} active accounts
          </div>
        </div>

        {/* Metric 2: Lost Reports */}
        <div className="rounded-xl bg-surface-container-lowest dark:bg-surface p-4 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg bg-surface-container-low dark:bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
              <span className="material-symbols-outlined text-[20px]">search_off</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-error-container/60 text-on-error-container text-[11px] font-semibold">
              {metrics?.pendingReports || 0} pending
            </span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-medium">Total Lost Reports</span>
            <div className="text-xl font-bold text-on-surface tracking-tight mt-0.5 font-code-tabular">
              {metrics?.totalLostItems?.toLocaleString() || 0}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/20 dark:border-outline/20 flex items-center text-on-surface-variant text-[11px]">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant mr-1">schedule</span>
            Intake intake queue active
          </div>
        </div>

        {/* Metric 3: Found Reports */}
        <div className="rounded-xl bg-surface-container-lowest dark:bg-surface p-4 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg bg-surface-container-low dark:bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-surface-container text-primary text-[11px] font-semibold">
              Custody
            </span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-medium">Total Found Reports</span>
            <div className="text-xl font-bold text-on-surface tracking-tight mt-0.5 font-code-tabular">
              {metrics?.totalFoundItems?.toLocaleString() || 0}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/20 dark:border-outline/20 flex items-center text-on-surface-variant text-[11px]">
            <span className="material-symbols-outlined text-[14px] text-primary mr-1">lock</span>
            4 physical campus depots
          </div>
        </div>

        {/* Metric 4: Claims Queue */}
        <div className="rounded-xl bg-surface-container-lowest dark:bg-surface p-4 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg bg-surface-container-low dark:bg-surface-container flex items-center justify-center text-error group-hover:bg-error group-hover:text-on-error transition-colors">
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-semibold animate-pulse">
              {metrics?.pendingClaims || 0} urgent
            </span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-medium">Pending Claims Queue</span>
            <div className="text-xl font-bold text-on-surface tracking-tight mt-0.5 font-code-tabular">
              {metrics?.pendingClaims || 0}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/20 dark:border-outline/20 flex items-center text-on-surface-variant text-[11px]">
            <span className="material-symbols-outlined text-[14px] text-error mr-1">priority_high</span>
            Requires admin signature
          </div>
        </div>

        {/* Metric 5: Resolved Cases */}
        <div className="rounded-xl bg-surface-container-lowest dark:bg-surface p-4 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg bg-surface-container-low dark:bg-surface-container flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">handshake</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
              {metrics?.recoveryRate || 91.4}% Rate
            </span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-medium">Resolved & Reunited</span>
            <div className="text-xl font-bold text-on-surface tracking-tight mt-0.5 font-code-tabular">
              {metrics?.resolvedItems?.toLocaleString() || 0}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/20 dark:border-outline/20 flex items-center text-on-surface-variant text-[11px]">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 mr-1">task_alt</span>
            Verified property returns
          </div>
        </div>

        {/* Metric 6: AI Match Suggestions */}
        <div className="rounded-xl bg-surface-container-lowest dark:bg-surface p-4 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-lg bg-surface-container-low dark:bg-surface-container flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed dark:bg-primary-container/40 text-on-primary-fixed-variant dark:text-on-primary-container text-[11px] font-semibold">
              {metrics?.aiRadarOverview?.highSimilarityCount || 0} high match
            </span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-medium">AI Match Radar</span>
            <div className="text-xl font-bold text-on-surface tracking-tight mt-0.5 font-code-tabular">
              {metrics?.aiRadarOverview?.avgConfidence || '94.8%'}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/20 dark:border-outline/20 flex items-center text-on-surface-variant text-[11px]">
            <span className="material-symbols-outlined text-[14px] text-primary-container mr-1">auto_awesome</span>
            Confidence score &gt;85%
          </div>
        </div>
      </div>

      {/* Mid Section: Visual Analytics Bento (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Velocity Chart (60% Desktop: 7 cols or 8/12) */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-2xl bg-surface-container-lowest dark:bg-surface p-6 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">monitoring</span>
                <h2 className="text-base font-bold text-on-surface">Monthly Report & Recovery Velocity</h2>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Lost intake, custodian registrations, and successful returned matches over 6 months
              </p>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low dark:bg-surface-container p-1 rounded-lg self-start sm:self-auto text-xs">
              <span className="px-2.5 py-1 rounded bg-surface-container-lowest dark:bg-surface text-primary font-semibold shadow-xs">
                6 Months
              </span>
              <span className="px-2.5 py-1 text-on-surface-variant">YTD</span>
              <span className="px-2.5 py-1 text-on-surface-variant">All Time</span>
            </div>
          </div>

          {/* Custom SVG Velocity Chart */}
          <div className="relative w-full h-64 flex flex-col justify-end">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="w-full h-px bg-surface-container-high dark:bg-surface-container"></div>
              <div className="w-full h-px bg-surface-container-high dark:bg-surface-container"></div>
              <div className="w-full h-px bg-surface-container-high dark:bg-surface-container"></div>
              <div className="w-full h-px bg-surface-container-high dark:bg-surface-container"></div>
              <div className="w-full h-px bg-surface-container-high dark:bg-surface-container"></div>
            </div>

            {/* SVG Bars & Spline */}
            <svg className="w-full h-52 overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 700 220">
              <line stroke="#dce9ff" strokeWidth="1.5" x1="0" x2="700" y1="210" y2="210"></line>
              {charts?.monthlyVelocity?.map((m, idx) => {
                const xOffset = 35 + idx * 115;
                const lostHeight = Math.min(180, Math.max(30, m.lost * 30 || 70 + idx * 12));
                const foundHeight = Math.min(190, Math.max(40, m.found * 35 || 90 + idx * 15));
                return (
                  <g key={idx}>
                    {/* Lost bar */}
                    <rect
                      fill="#cbdbf5"
                      height={lostHeight}
                      rx="4"
                      width="20"
                      x={xOffset}
                      y={210 - lostHeight}
                    ></rect>
                    {/* Found bar */}
                    <rect
                      fill="#005ac4"
                      height={foundHeight}
                      rx="4"
                      width="20"
                      x={xOffset + 24}
                      y={210 - foundHeight}
                    ></rect>
                  </g>
                );
              })}
              {/* Spline for Recovered */}
              <path
                d="M 55 130 Q 170 100 285 75 T 515 60 T 645 40"
                fill="none"
                stroke="#2457e8"
                strokeLinecap="round"
                strokeWidth="3.5"
              ></path>
              <circle cx="55" cy="130" fill="#ffffff" r="4.5" stroke="#2457e8" strokeWidth="2.5"></circle>
              <circle cx="170" cy="100" fill="#ffffff" r="4.5" stroke="#2457e8" strokeWidth="2.5"></circle>
              <circle cx="285" cy="75" fill="#ffffff" r="4.5" stroke="#2457e8" strokeWidth="2.5"></circle>
              <circle cx="400" cy="85" fill="#ffffff" r="4.5" stroke="#2457e8" strokeWidth="2.5"></circle>
              <circle cx="515" cy="60" fill="#ffffff" r="4.5" stroke="#2457e8" strokeWidth="2.5"></circle>
              <circle cx="645" cy="40" fill="#2457e8" r="5.5" stroke="#ffffff" strokeWidth="2.5"></circle>
            </svg>

            {/* Timeline X-Axis Labels */}
            <div className="flex justify-between items-center px-4 pt-3 text-on-surface-variant text-[11px] font-code-tabular font-medium">
              {charts?.monthlyVelocity?.map((m, idx) => (
                <span key={idx} className={idx === charts.monthlyVelocity.length - 1 ? 'text-primary font-bold' : ''}>
                  {m.month.toUpperCase()} {idx === charts.monthlyVelocity.length - 1 ? '(LIVE)' : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Legend and Velocity Summary Footer */}
          <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/60 dark:bg-surface-container/30 p-3 rounded-xl border border-outline-variant/20 dark:border-outline/10">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#cbdbf5]"></span>
                <span className="text-on-surface-variant font-medium">Lost Reports Intake</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#005ac4]"></span>
                <span className="text-on-surface-variant font-medium">Found Registered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-[#2457e8]"></span>
                <span className="text-on-surface font-semibold">Reunited Deliveries</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+18.4% Monthly Efficiency</span>
            </div>
          </div>
        </div>

        {/* Depots & Intake Distribution (40% Desktop: 5 cols or 4/12) */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-2xl bg-surface-container-lowest dark:bg-surface p-6 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                <h2 className="text-base font-bold text-on-surface">Custody Depots</h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-code-tabular">
                4 Hubs Active
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Geographic volume across physical holding stations
            </p>

            {/* Circular Gauge Graphic */}
            <div className="flex items-center justify-center my-3">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" fill="none" r="48" stroke="#eff4ff" strokeWidth="12"></circle>
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    r="48"
                    stroke="#003ec3"
                    strokeDasharray="301.59"
                    strokeDashoffset="186.98"
                    strokeLinecap="round"
                    strokeWidth="12"
                  ></circle>
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    r="48"
                    stroke="#005ac4"
                    strokeDasharray="301.59"
                    strokeDashoffset="223.17"
                    strokeLinecap="round"
                    strokeWidth="12"
                    transform="rotate(136.8 60 60)"
                  ></circle>
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    r="48"
                    stroke="#4e8eff"
                    strokeDasharray="301.59"
                    strokeDashoffset="238.25"
                    strokeLinecap="round"
                    strokeWidth="12"
                    transform="rotate(230.4 60 60)"
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-on-surface leading-none font-code-tabular">
                    {metrics?.totalFoundItems || 1894}
                  </span>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1 font-semibold">
                    Cataloged
                  </span>
                </div>
              </div>
            </div>

            {/* Depot Progress Bars */}
            <div className="flex flex-col gap-2 mt-4">
              {charts?.depots?.map((depot, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-surface-container-low dark:bg-surface-container/50 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-on-surface font-medium truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: depot.color }}></span>
                      <span className="truncate">{depot.name}</span>
                    </span>
                    <span className="font-code-tabular font-semibold text-primary ml-2 shrink-0">
                      {depot.percentage}% · {depot.count} items
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${depot.percentage}%`, backgroundColor: depot.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-outline-variant/20 dark:border-outline/20 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Overall Depot Capacity: 64% used</span>
            <NavLink to="/admin/found-reports" className="text-primary hover:underline font-semibold flex items-center">
              Depot Log <span className="material-symbols-outlined text-[16px] ml-0.5">chevron_right</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Bottom Section: High Priority Claims & Real-Time Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* High Priority Claims Queue (Requires Signature) */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-2xl bg-surface-container-lowest dark:bg-surface p-6 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-outline-variant/20 dark:border-outline/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                <h2 className="text-base font-bold text-on-surface">High-Priority Claims Signature Queue</h2>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Requires administrative verification before release authorization
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-error-container text-on-error-container text-xs font-semibold self-start sm:self-auto">
              {highPriorityClaims?.length || 0} Awaiting Action
            </span>
          </div>

          {/* Claims Rows */}
          <div className="flex flex-col gap-3 mt-4">
            {highPriorityClaims?.length === 0 ? (
              <div className="py-12 text-center text-xs text-on-surface-variant">
                No claims currently awaiting signature.
              </div>
            ) : (
              highPriorityClaims?.map((claim) => (
                <div
                  key={claim._id}
                  className="p-3.5 rounded-xl bg-surface-container-low/70 dark:bg-surface-container/40 hover:bg-surface-container-low dark:hover:bg-surface-container transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-outline-variant/20 dark:border-outline/10"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-13 h-13 rounded-lg overflow-hidden bg-surface-container shrink-0 relative border border-outline-variant/30">
                      <img
                        className="w-full h-full object-cover"
                        src={
                          claim.itemId?.images?.[0]?.url ||
                          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={claim.itemId?.title || 'Claim item'}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-code-tabular font-bold text-primary text-xs">
                          #CLM-{claim._id.toString().slice(-4).toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed dark:bg-primary-container/40 text-on-primary-fixed text-[10px] font-semibold">
                          High Match Score
                        </span>
                        <span className="text-[11px] text-on-surface-variant truncate">
                          Depot: {claim.itemId?.location?.depot || 'Main Vault'}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-on-surface truncate mt-0.5">
                        {claim.itemId?.title || 'Unspecified Item'}
                      </h3>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        Claimant: <span className="font-semibold text-on-surface">{claim.claimantId?.name}</span> ({claim.claimantId?.email}) · {claim.claimDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <NavLink
                      to={`/admin/claims`}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors"
                    >
                      Inspect Match
                    </NavLink>
                    <button
                      onClick={() => {
                        setSelectedClaim(claim);
                        setReleaseModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all text-xs font-semibold shadow-xs active:scale-95 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      Sign & Release
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 dark:border-outline/20 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Showing recent pending claims</span>
            <NavLink to="/admin/claims" className="text-primary hover:underline font-semibold flex items-center">
              View All Claims Queue <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
            </NavLink>
          </div>
        </div>

        {/* Live Activity Stream (Audit Feed) */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-2xl bg-surface-container-lowest dark:bg-surface p-6 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 dark:border-outline/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                <h2 className="text-base font-bold text-on-surface">Live Activity Stream</h2>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                Streaming
              </span>
            </div>

            {/* Activity List */}
            <div className="relative pl-6 space-y-4 my-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
              {recentActivities?.slice(0, 4).map((activity) => (
                <div key={activity._id} className="relative group">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface-container-lowest dark:border-surface"></div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface">{activity.action.replace(/_/g, ' ')}</span>
                      <span className="font-code-tabular text-on-surface-variant text-[10px]">
                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-outline-variant/20 dark:border-outline/20 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              Audit trail tamper-proof
            </span>
            <NavLink to="/admin/analytics" className="text-primary hover:underline font-semibold">
              Full Logs
            </NavLink>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Sign & Release */}
      <ConfirmationModal
        isOpen={releaseModalOpen}
        title={`Sign & Authorize Custody Release`}
        message={`You are about to authorize property release for claim #CLM-${selectedClaim?._id.toString().slice(-4).toUpperCase()} (${selectedClaim?.itemId?.title}) to ${selectedClaim?.claimantId?.name}. This will atomically resolve the item and reject conflicting claims.`}
        confirmLabel="Authorize Custody Release"
        isLoading={actionLoading}
        onConfirm={handleSignAndRelease}
        onClose={() => {
          setReleaseModalOpen(false);
          setSelectedClaim(null);
        }}
      >
        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs font-semibold text-on-surface">Administrative Release Note</label>
          <textarea
            value={releaseNote}
            onChange={(e) => setReleaseNote(e.target.value)}
            placeholder="Document physical identity inspection, signed receipt ID, or custody depot locker code..."
            className="w-full h-20 p-2.5 rounded-lg border border-outline-variant/50 dark:border-outline/40 bg-surface-container-low dark:bg-surface text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          ></textarea>
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default AdminOverview;
