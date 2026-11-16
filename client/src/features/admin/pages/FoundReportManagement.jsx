import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Pagination from '../../../components/common/Pagination';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import ImageModal from '../../../components/common/ImageModal';
import { TableSkeleton } from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';

const FoundReportManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [depotFilter, setDepotFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Image lightbox
  const [lightboxUrl, setLightboxUrl] = useState('');

  const depotsList = [
    'Central Library (Main Vault)',
    'Science & Tech Center Desk',
    'Athletics & Recreation Hub',
    'Student Union Welcome Center',
  ];

  const fetchFoundItems = async () => {
    try {
      setLoading(true);
      const res = await adminService.getItems({
        type: 'FOUND',
        page,
        limit: 10,
        search,
        status: statusFilter,
        categoryId: categoryFilter,
        depot: depotFilter,
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching found reports:', err);
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
    fetchFoundItems();
  }, [page, statusFilter, categoryFilter, depotFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchFoundItems();
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
      await fetchFoundItems();
    } catch (err) {
      alert(err.message || 'Failed to submit review decision.');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed dark:bg-secondary-container/40 text-on-secondary-fixed text-[11px] font-semibold uppercase tracking-wider">
              Custody Vault Intake
            </span>
            <span className="font-code-tabular text-xs text-on-surface-variant flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Secure Custody Protocol
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Found Report Management
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Audit cataloged found property across campus custody depots, inspect serial labels and custodian bin placements, and release verified items.
          </p>
        </div>

        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
            statusFilter === 'PENDING'
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface-container-low dark:bg-surface-container text-on-surface border-outline-variant/30'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">pending</span>
          <span>Pending Vault Approvals</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 p-4 bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full lg:flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search found property by title, custodian, depot vault, bin code..."
              className="w-full h-10 pl-9 pr-8 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/30 dark:border-outline/20"
            />
          </div>

          {/* Depot Filter */}
          <div className="relative w-full sm:w-56">
            <select
              value={depotFilter}
              onChange={(e) => setDepotFilter(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 dark:border-outline/20 font-medium"
            >
              <option value="all">Depot: All Depots</option>
              {depotsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-on-surface-variant">
              expand_more
            </span>
          </div>

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
              <option value="APPROVED">In Safe Custody</option>
              <option value="RESOLVED">Returned to Owner</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-on-surface-variant">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Found Items Table */}
      <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20 overflow-hidden flex flex-col">
        {loading ? (
          <TableSkeleton rows={7} cols={6} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="inventory_2"
            title="No found items match criteria"
            description="Try resetting depot or category filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setStatusFilter('all');
              setCategoryFilter('all');
              setDepotFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low dark:bg-surface-container text-on-surface-variant font-semibold uppercase tracking-wider text-[11px] border-b border-outline-variant/20">
                  <th className="py-3.5 px-4">Cataloged Property</th>
                  <th className="py-3.5 px-4">Custodian / Finder</th>
                  <th className="py-3.5 px-4">Depot Location</th>
                  <th className="py-3.5 px-4">Date Intake</th>
                  <th className="py-3.5 px-4">Custody Status</th>
                  <th className="py-3.5 px-4 text-right">Vault Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 dark:divide-outline/10 text-on-surface">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-surface-container-low/50 dark:hover:bg-surface-container/40 transition-colors group">
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
                              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-code-tabular text-[10px] text-primary font-bold">
                            #FND-{item._id.toString().slice(-4).toUpperCase()}
                          </span>
                          <span className="font-semibold text-on-surface truncate">{item.title}</span>
                          <span className="text-[11px] text-on-surface-variant truncate max-w-xs">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{item.reportedBy?.name || 'Staff Member'}</span>
                        <span className="text-[11px] text-on-surface-variant truncate">{item.reportedBy?.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-primary">domain</span>
                        <span className="font-medium text-on-surface">{item.location?.depot || 'Central Vault'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-on-surface-variant font-code-tabular">
                      {new Date(item.dateTime || item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed dark:bg-primary-container/40 text-on-primary-fixed font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          In Safe Custody
                        </span>
                      )}
                      {item.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Pending Approval
                        </span>
                      )}
                      {item.status === 'RESOLVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Reunited & Handed Over
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-semibold text-[11px]">
                          Rejected
                        </span>
                      )}
                    </td>

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
                              className="px-2.5 py-1 bg-primary text-on-primary rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-primary-container shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[15px]">lock</span>
                              Accept to Vault
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setActionType('REJECTED');
                                setReviewModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-surface-container hover:bg-error-container/30 text-error rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {item.status === 'APPROVED' && (
                          <span className="text-[11px] text-on-surface-variant font-medium">
                            Ready for Claim
                          </span>
                        )}
                        {item.status === 'RESOLVED' && (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <span className="material-symbols-outlined text-[14px]">done_all</span> Case Closed
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

      {/* Review Modal */}
      <ConfirmationModal
        isOpen={reviewModalOpen}
        title={actionType === 'APPROVED' ? 'Accept Item to Safe Custody' : 'Reject Found Item Report'}
        message={
          actionType === 'APPROVED'
            ? `Accept "${selectedItem?.title}" into custody depot: ${selectedItem?.location?.depot || 'Main Vault'}?`
            : `Reject report for "${selectedItem?.title}"?`
        }
        confirmLabel={actionType === 'APPROVED' ? 'Accept into Depot' : 'Confirm Rejection'}
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
          <div className="flex flex-col gap-1 mt-2">
            <label className="text-xs font-semibold text-on-surface">Rejection Reason</label>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Duplicate report, prohibited campus item, or not in physical possession."
              className="w-full h-9 px-3 rounded-lg border border-outline-variant/40 dark:border-outline/30 bg-surface-container-low dark:bg-surface text-xs text-on-surface outline-none"
            />
          </div>
        )}
      </ConfirmationModal>

      {/* Lightbox Modal */}
      <ImageModal isOpen={!!lightboxUrl} imageUrl={lightboxUrl} onClose={() => setLightboxUrl('')} />
    </div>
  );
};

export default FoundReportManagement;
