import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Pagination from '../../../components/common/Pagination';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import ImageModal from '../../../components/common/ImageModal';
import { TableSkeleton } from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';

const LostReportManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Review modal (Approve / Reject)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Image lightbox
  const [lightboxUrl, setLightboxUrl] = useState('');

  const fetchLostItems = async () => {
    try {
      setLoading(true);
      const res = await adminService.getItems({
        type: 'LOST',
        page,
        limit: 10,
        search,
        status: statusFilter,
        categoryId: categoryFilter,
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching lost reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await adminService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.warn('Could not load categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchLostItems();
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchLostItems();
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const handleReviewDecision = async () => {
    if (!selectedItem) return;
    try {
      setReviewLoading(true);
      await adminService.reviewItem(selectedItem._id, {
        status: actionType,
        rejectionReason: actionType === 'REJECTED' ? rejectionReason : undefined,
      });
      setReviewModalOpen(false);
      setSelectedItem(null);
      setRejectionReason('');
      await fetchLostItems();
    } catch (err) {
      alert(err.message || 'Failed to submit review decision.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Stat computations
  const totalOpen = items.filter((i) => i.status === 'APPROVED' || i.status === 'PENDING').length;
  const pendingCount = items.filter((i) => i.status === 'PENDING').length;
  const resolvedCount = items.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Title & Action Bar Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider">
              Incident Intake Control
            </span>
            <span className="font-code-tabular text-xs text-on-surface-variant flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live System Feed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Lost Report Management
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Review and audit lost item reports filed by campus users across all facilities. Coordinate automated matching pipelines and enforce intake protocols.
          </p>
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              statusFilter === 'PENDING'
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container-low dark:bg-surface-container text-on-surface border-outline-variant/30'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">pending_actions</span>
            <span>Needs Review ({pendingCount})</span>
          </button>
        </div>
      </div>

      {/* Stat Metrical Cluster (Bento Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Total Active Lost</span>
            <span className="p-2 rounded-lg bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
            </span>
          </div>
          <div className="text-2xl font-bold text-on-surface tracking-tight font-code-tabular mt-1">
            {totalOpen}
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Pending Moderation</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600 tracking-tight font-code-tabular mt-1">
            {pendingCount}
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-600 h-full rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Resolved &amp; Returned</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight font-code-tabular mt-1">
            {resolvedCount}
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">AI Radar Match Status</span>
            <span className="p-2 rounded-lg bg-primary-container/20 text-primary">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </span>
          </div>
          <div className="text-2xl font-bold text-primary tracking-tight font-code-tabular mt-1">
            Active
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary-container h-full rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>
      </div>

      {/* Filter & Query Control Center */}
      <div className="flex flex-col gap-3 p-4 bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full lg:flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lost reports by item title, serial prefix, user email, building..."
              className="w-full h-10 pl-9 pr-8 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/30 dark:border-outline/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            {/* Category Filter */}
            <div className="relative w-full sm:w-44">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 dark:border-outline/20 font-medium"
              >
                <option value="all">Category: All</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-on-surface-variant">
                expand_more
              </span>
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 dark:border-outline/20 font-medium"
              >
                <option value="all">Status: All</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved / Published</option>
                <option value="REJECTED">Rejected</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-on-surface-variant">
                expand_more
              </span>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              title="Reset Filters"
              className="h-10 px-3 rounded-lg bg-surface-container-low dark:bg-surface-container hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center border border-outline-variant/30 dark:border-outline/20"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table Container */}
      <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20 overflow-hidden flex flex-col">
        {loading ? (
          <TableSkeleton rows={7} cols={6} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="No lost reports found"
            description="No lost item reports match the specified filters."
            actionLabel="View All Lost Reports"
            onAction={() => {
              setSearch('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low dark:bg-surface-container text-on-surface-variant font-semibold uppercase tracking-wider text-[11px] border-b border-outline-variant/20">
                  <th className="py-3.5 px-4">Item Details</th>
                  <th className="py-3.5 px-4">Reported By</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Incident Date / Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 dark:divide-outline/10 text-on-surface">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-surface-container-low/50 dark:hover:bg-surface-container/40 transition-colors group">
                    {/* Item title & thumbnail */}
                    <td className="py-3 px-4 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => item.images?.[0]?.url && setLightboxUrl(item.images[0].url)}
                          className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0 border border-outline-variant/30 cursor-pointer relative"
                        >
                          {item.images?.[0]?.url ? (
                            <img src={item.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                              <span className="material-symbols-outlined text-[18px]">image_not_supported</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-code-tabular text-[10px] text-primary font-bold">
                            #LST-{item._id.toString().slice(-4).toUpperCase()}
                          </span>
                          <span className="font-semibold text-on-surface truncate">{item.title}</span>
                          <span className="text-[11px] text-on-surface-variant truncate max-w-xs">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Reported by */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{item.reportedBy?.name || 'Anonymous User'}</span>
                        <span className="text-[11px] text-on-surface-variant truncate">{item.reportedBy?.email}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-medium text-[11px]">
                        {item.categoryId?.name || 'General'}
                      </span>
                    </td>

                    {/* Date / Location */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col text-on-surface-variant">
                        <span className="font-code-tabular font-medium text-on-surface">
                          {new Date(item.dateTime || item.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[11px] truncate">
                          {item.location?.building || item.location?.depot || 'Campus Perimeter'}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Approved
                        </span>
                      )}
                      {item.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Pending Review
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                          Rejected
                        </span>
                      )}
                      {item.status === 'RESOLVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          Resolved
                        </span>
                      )}
                    </td>

                    {/* Moderation Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setActionType('APPROVED');
                                setReviewModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[15px]">check</span>
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setActionType('REJECTED');
                                setReviewModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-surface-container hover:bg-error-container/30 text-error rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <span className="material-symbols-outlined text-[15px]">close</span>
                              Reject
                            </button>
                          </>
                        )}
                        {item.status === 'APPROVED' && (
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setActionType('REJECTED');
                              setReviewModalOpen(true);
                            }}
                            className="text-xs text-error hover:underline font-medium"
                          >
                            Unpublish / Reject
                          </button>
                        )}
                        {item.status === 'REJECTED' && (
                          <span className="text-[11px] text-on-surface-variant italic truncate max-w-xs">
                            Reason: {item.rejectionReason || 'Policy check'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Review Modal (Approve or Reject with mandatory rejection reason) */}
      <ConfirmationModal
        isOpen={reviewModalOpen}
        title={actionType === 'APPROVED' ? 'Approve Lost Item Report' : 'Reject Lost Item Report'}
        message={
          actionType === 'APPROVED'
            ? `Publish "${selectedItem?.title}" to public search and trigger AI radar matching?`
            : `Rejecting "${selectedItem?.title}" will remove it from public visibility. A rejection reason will be sent to the reporter.`
        }
        confirmLabel={actionType === 'APPROVED' ? 'Approve & Publish' : 'Confirm Rejection'}
        isDestructive={actionType === 'REJECTED'}
        isLoading={reviewLoading}
        onConfirm={handleReviewDecision}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedItem(null);
          setRejectionReason('');
        }}
      >
        {actionType === 'REJECTED' && (
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs font-semibold text-on-surface">
              Rejection Reason <span className="text-error">*</span>
            </label>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Inappropriate content, insufficient visual detail, or duplicate incident report..."
              className="w-full h-20 p-2.5 rounded-lg border border-outline-variant/50 dark:border-outline/40 bg-surface-container-low dark:bg-surface text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            ></textarea>
          </div>
        )}
      </ConfirmationModal>

      {/* Lightbox Modal */}
      <ImageModal isOpen={!!lightboxUrl} imageUrl={lightboxUrl} onClose={() => setLightboxUrl('')} />
    </div>
  );
};

export default LostReportManagement;
