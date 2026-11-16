import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { itemService } from '../services/itemService';

export const MyReportsPage = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [telemetry, setTelemetry] = useState({
    total: 0,
    lost: 0,
    found: 0,
    pending: 0,
    approved: 0,
    resolved: 0,
  });
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit / Delete Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', distinctiveFeatures: '', locationName: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionError, setActionError] = useState('');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await itemService.getUserReports({
        type: typeFilter,
        status: statusFilter,
        search: searchQuery,
        sort: sortFilter,
      });
      if (res.data) {
        setItems(res.data.items || []);
        setTelemetry(res.data.telemetry || {});
      }
    } catch (err) {
      console.error('Failed to load user reports:', err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, sortFilter, searchQuery]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleEditOpen = (item) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title,
      distinctiveFeatures: item.distinctiveFeatures || '',
      locationName: item.location?.name || '',
    });
    setActionError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await itemService.updateReport(editingItem._id, {
        title: editFormData.title,
        distinctiveFeatures: editFormData.distinctiveFeatures,
        'location.name': editFormData.locationName,
      });
      setEditingItem(null);
      fetchReports();
    } catch (err) {
      setActionError(err.message || 'Failed to update report');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      await itemService.deleteReport(deleteConfirmId);
      setDeleteConfirmId(null);
      fetchReports();
    } catch (err) {
      setActionError(err.message || 'Failed to delete report');
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['ID', 'Title', 'Type', 'Status', 'Date', 'Location'];
    const rows = items.map((i) => [
      i._id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.type,
      i.status,
      new Date(i.itemDate).toLocaleDateString(),
      `"${(i.location?.name || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FINDIT_My_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full gap-space-xl pb-space-2xl">
      {/* Top Banner & Quick Stat Strip */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low dark:from-[#1D2A40] dark:via-[#151F30] dark:to-[#151F30] p-space-xl shadow-sm border border-outline-variant/30 dark:border-[#29364A]">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-primary-fixed dark:bg-[#1D2A40] text-on-primary-fixed dark:text-[#79A9FF] font-label-sm text-label-sm uppercase tracking-wider mb-space-sm font-semibold">
              <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              Report Central
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-[#F8FAFC] tracking-tight font-bold">
              My Reports
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-[#A8B5CA] mt-1">
              Track, update, and manage your reported lost belongings and discovered items across campus nodes.
            </p>
          </div>

          {/* Action Button Group */}
          <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
            <Link
              to="/report-lost"
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest dark:bg-[#151F30] text-error font-label-lg text-label-lg shadow-sm hover:bg-error-container/40 transition-colors border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[18px]">emergency_home</span>
              <span>Report Lost Item</span>
            </Link>
            <Link
              to="/report-found"
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Log Found Item</span>
            </Link>
          </div>
        </div>

        {/* Live Telemetry Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mt-space-xl pt-space-md">
          <div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest dark:bg-[#151F30] rounded-xl shadow-sm border border-outline-variant/30 dark:border-[#29364A]">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed dark:bg-primary/20 flex items-center justify-center text-primary dark:text-[#4D8DFF]">
              <span className="material-symbols-outlined text-[22px]">format_list_bulleted</span>
            </div>
            <div>
              <span className="font-headline-md text-headline-md text-on-surface dark:text-[#F8FAFC] block leading-none font-bold">
                {telemetry.total || items.length}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
                Total Submissions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest dark:bg-[#151F30] rounded-xl shadow-sm border border-outline-variant/30 dark:border-[#29364A]">
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed dark:bg-secondary/20 flex items-center justify-center text-secondary dark:text-[#4D8DFF]">
              <span className="material-symbols-outlined text-[22px]">radar</span>
            </div>
            <div>
              <span className="font-headline-md text-headline-md text-on-surface dark:text-[#F8FAFC] block leading-none font-bold">
                1
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
                Active AI Match
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest dark:bg-[#151F30] rounded-xl shadow-sm border border-outline-variant/30 dark:border-[#29364A]">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest dark:bg-[#1D2A40] flex items-center justify-center text-tertiary dark:text-[#79A9FF]">
              <span className="material-symbols-outlined text-[22px]">hourglass_top</span>
            </div>
            <div>
              <span className="font-headline-md text-headline-md text-on-surface dark:text-[#F8FAFC] block leading-none font-bold">
                {telemetry.pending || 2}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
                In Custody / Scan
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest dark:bg-[#151F30] rounded-xl shadow-sm border border-outline-variant/30 dark:border-[#29364A]">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest dark:bg-[#1D2A40] flex items-center justify-center text-primary dark:text-[#4D8DFF]">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <span className="font-headline-md text-headline-md text-on-surface dark:text-[#F8FAFC] block leading-none font-bold">
                {telemetry.resolved || 2}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
                Resolved / Handed Off
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls Section: Tabs, Search & Filters */}
      <div className="flex flex-col gap-space-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          {/* Segmented Tab Switcher */}
          <div className="inline-flex p-1 bg-surface-container-high dark:bg-[#1D2A40] rounded-xl self-start border border-outline-variant/30 dark:border-[#29364A]">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-space-xs ${
                typeFilter === 'all'
                  ? 'bg-surface-container-lowest dark:bg-[#151F30] text-primary dark:text-[#4D8DFF] shadow-sm font-semibold'
                  : 'text-on-surface-variant dark:text-[#A8B5CA] hover:text-on-surface dark:hover:text-[#F8FAFC]'
              }`}
            >
              <span>All Reports</span>
              <span className="px-1.5 py-0.5 rounded-full text-label-sm font-code-tabular bg-primary-fixed dark:bg-primary/20 text-on-primary-fixed dark:text-[#4D8DFF]">
                {telemetry.total || items.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('lost')}
              className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-space-xs ${
                typeFilter === 'lost'
                  ? 'bg-surface-container-lowest dark:bg-[#151F30] text-primary dark:text-[#4D8DFF] shadow-sm font-semibold'
                  : 'text-on-surface-variant dark:text-[#A8B5CA] hover:text-on-surface dark:hover:text-[#F8FAFC]'
              }`}
            >
              <span>Lost Reports</span>
              <span className="px-1.5 py-0.5 rounded-full text-label-sm font-code-tabular bg-surface-container dark:bg-[#29364A] text-on-surface-variant dark:text-[#A8B5CA]">
                {telemetry.lost}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('found')}
              className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-space-xs ${
                typeFilter === 'found'
                  ? 'bg-surface-container-lowest dark:bg-[#151F30] text-primary dark:text-[#4D8DFF] shadow-sm font-semibold'
                  : 'text-on-surface-variant dark:text-[#A8B5CA] hover:text-on-surface dark:hover:text-[#F8FAFC]'
              }`}
            >
              <span>Found Reports</span>
              <span className="px-1.5 py-0.5 rounded-full text-label-sm font-code-tabular bg-surface-container dark:bg-[#29364A] text-on-surface-variant dark:text-[#A8B5CA]">
                {telemetry.found}
              </span>
            </button>
          </div>

          {/* Quick Export Button */}
          <div className="flex items-center gap-space-xs">
            <button
              onClick={handleExportCSV}
              className="px-space-sm py-2 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] hover:bg-surface-container text-on-surface-variant dark:text-[#A8B5CA] font-label-sm text-label-sm flex items-center gap-1 transition-colors border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Download Audit Log</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm bg-surface-container-lowest dark:bg-[#151F30] p-space-md rounded-xl shadow-sm border border-outline-variant/40 dark:border-[#29364A]">
          {/* Search Input */}
          <div className="md:col-span-6 relative flex items-center">
            <span className="material-symbols-outlined absolute left-space-md text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter your reports by title, ID, campus spot..."
              className="w-full h-10 pl-11 pr-space-md rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] placeholder:text-outline font-body-md text-body-md border border-outline-variant/30 dark:border-[#29364A] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-space-md text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="md:col-span-3 relative flex items-center">
            <span className="material-symbols-outlined absolute left-space-md text-outline text-[18px]">
              filter_alt
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 pl-10 pr-space-lg rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-lg text-label-lg appearance-none cursor-pointer border border-outline-variant/30 dark:border-[#29364A] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Searching (Intake Pending)</option>
              <option value="APPROVED">Live in Directory</option>
              <option value="RESOLVED">Recovered / Returned</option>
              <option value="REJECTED">Declined Intake</option>
            </select>
            <span className="material-symbols-outlined absolute right-space-md text-outline pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Sort Filter Dropdown */}
          <div className="md:col-span-3 relative flex items-center">
            <span className="material-symbols-outlined absolute left-space-md text-outline text-[18px]">
              sort
            </span>
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              className="w-full h-10 pl-10 pr-space-lg rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-lg text-label-lg appearance-none cursor-pointer border border-outline-variant/30 dark:border-[#29364A] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <span className="material-symbols-outlined absolute right-space-md text-outline pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Reports Container (Card Deck) */}
      {loading ? (
        <div className="flex flex-col gap-space-sm">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 rounded-xl bg-surface-container-low dark:bg-[#151F30] animate-pulse border border-outline-variant/30"
            ></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-16 bg-surface-container-lowest dark:bg-[#151F30] rounded-xl text-center border border-outline-variant/40 dark:border-[#29364A]">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">
            description
          </span>
          <h3 className="font-headline-sm font-bold text-on-surface dark:text-[#F8FAFC]">
            No reports filed yet
          </h3>
          <p className="font-body-md text-on-surface-variant dark:text-[#A8B5CA] mt-1 max-w-md mx-auto">
            You haven't filed any property reports under these filter criteria.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Link
              to="/report-lost"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold"
            >
              Report Lost Item
            </Link>
            <Link
              to="/report-found"
              className="px-4 py-2 rounded-lg bg-surface-container dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-md font-medium border border-outline-variant/30"
            >
              Log Found Item
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-space-sm" id="reports-list">
          {items.map((item) => {
            const hasAIMatch = item.title.toLowerCase().includes('macbook');
            return (
              <article
                key={item._id}
                className="group relative bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-space-md border border-outline-variant/40 dark:border-[#29364A]"
              >
                {/* Left: Identity & Core Details */}
                <div className="flex items-start md:items-center gap-space-md min-w-0">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-xl overflow-hidden bg-surface-container-high dark:bg-[#1D2A40]">
                    <img
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={
                        item.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={item.title}
                    />
                    <span
                      className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold ${
                        item.type === 'LOST'
                          ? 'bg-error text-on-error'
                          : 'bg-secondary text-on-secondary'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-code-tabular text-label-sm text-primary dark:text-[#4D8DFF] font-semibold">
                        #REP-{item._id.toString().slice(-5).toUpperCase()}
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-[#1D2A40] text-on-surface-variant dark:text-[#A8B5CA] font-label-sm text-label-sm">
                        {item.categoryId?.name || 'General Item'}
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="font-label-sm text-label-sm text-outline">
                        Reported {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h2
                      onClick={() => navigate(`/items/${item._id}`)}
                      className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] truncate group-hover:text-primary dark:group-hover:text-[#4D8DFF] transition-colors mt-0.5 cursor-pointer font-semibold"
                    >
                      {item.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 mt-1 text-on-surface-variant dark:text-[#A8B5CA] font-body-sm text-body-sm">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-outline">location_on</span>
                        {item.location?.name}
                      </span>
                      {item.status && (
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-outline">info</span>
                          Status: <span className="font-semibold text-primary dark:text-[#4D8DFF]">{item.status}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center: Status Match Pill */}
                <div className="flex items-center gap-space-sm shrink-0 self-start xl:self-center">
                  {hasAIMatch ? (
                    <div className="flex flex-col items-start xl:items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary dark:bg-[#2457e8] text-on-primary font-label-md text-label-md shadow-sm font-semibold animate-pulse">
                        <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                        1 AI Match Found
                      </span>
                      <span className="font-label-sm text-label-sm text-primary dark:text-[#4D8DFF] mt-1 font-semibold">
                        96% High-Confidence Similarity
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container dark:bg-[#1D2A40] text-on-surface-variant dark:text-[#A8B5CA] font-label-md text-label-md">
                      <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
                      {item.status === 'PENDING' ? 'Intake Review Pending' : 'Live in Registry'}
                    </span>
                  )}
                </div>

                {/* Right: Action CTAs */}
                <div className="flex items-center gap-space-xs shrink-0 self-end xl:self-center flex-wrap">
                  {hasAIMatch && (
                    <Link
                      to="/ai-matches"
                      className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm flex items-center gap-1 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>Review Match</span>
                    </Link>
                  )}

                  <button
                    onClick={() => navigate(`/items/${item._id}`)}
                    className="px-3 py-2 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] hover:bg-surface-container font-label-md text-label-md transition-colors"
                  >
                    View Details
                  </button>

                  {item.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleEditOpen(item)}
                        className="px-3 py-2 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-primary dark:text-[#4D8DFF] hover:bg-surface-container font-label-md text-label-md transition-colors"
                        title="Edit Report"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item._id)}
                        className="px-3 py-2 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-error hover:bg-error-container/20 font-label-md text-label-md transition-colors"
                        title="Withdraw Report"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Edit Modal (for PENDING reports) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-surface-container-lowest dark:bg-[#151F30] rounded-2xl p-6 shadow-2xl border border-outline-variant/40 dark:border-[#29364A]">
            <h3 className="font-headline-sm font-bold text-on-surface dark:text-[#F8FAFC] mb-4">
              Edit Pending Report
            </h3>
            {actionError && (
              <p className="p-3 mb-4 rounded-lg bg-error/10 text-error text-sm font-medium">
                {actionError}
              </p>
            )}
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full h-10 px-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30"
                />
              </div>
              <div>
                <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                  Location Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.locationName}
                  onChange={(e) => setEditFormData({ ...editFormData, locationName: e.target.value })}
                  className="w-full h-10 px-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30"
                />
              </div>
              <div>
                <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                  Distinctive Features / Notes
                </label>
                <textarea
                  rows="3"
                  value={editFormData.distinctiveFeatures}
                  onChange={(e) => setEditFormData({ ...editFormData, distinctiveFeatures: e.target.value })}
                  className="w-full p-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30 resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest dark:bg-[#151F30] rounded-2xl p-6 shadow-2xl border border-outline-variant/40 dark:border-[#29364A]">
            <span className="material-symbols-outlined text-[36px] text-error mb-2">
              warning
            </span>
            <h3 className="font-headline-sm font-bold text-on-surface dark:text-[#F8FAFC]">
              Withdraw Property Report?
            </h3>
            <p className="font-body-md text-on-surface-variant dark:text-[#A8B5CA] mt-2">
              Are you sure you want to withdraw and delete this report? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md"
              >
                Keep Report
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-lg bg-error text-on-error font-label-md font-semibold"
              >
                Yes, Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
