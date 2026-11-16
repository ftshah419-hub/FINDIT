import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Pagination from '../../../components/common/Pagination';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { TableSkeleton } from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';

const ComplaintManagement = () => {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Review modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [decisionStatus, setDecisionStatus] = useState('RESOLVED');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReports({
        page,
        limit: 10,
        status: statusFilter,
        search,
      });
      setReports(res.reports);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchReports();
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const handleExecuteReview = async () => {
    if (!selectedReport) return;
    try {
      setSaving(true);
      await adminService.reviewReport(selectedReport._id, {
        status: decisionStatus,
        adminNote: adminNote.trim(),
      });
      setModalOpen(false);
      setSelectedReport(null);
      setAdminNote('');
      await fetchReports();
    } catch (err) {
      alert(err.message || 'Failed to submit complaint review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-code-tabular text-[11px] uppercase tracking-widest text-error font-semibold bg-error-container/40 text-on-error-container px-2.5 py-0.5 rounded-full">
              Trust &amp; Safety
            </span>
            <span className="text-xs text-on-surface-variant font-code-tabular">
              Abuse &amp; Fraud Queue
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Complaint &amp; Report Management
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Review user-submitted abuse complaints, suspicious listings, and fraudulent claims across the platform.
          </p>
        </div>

        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
            statusFilter === 'PENDING'
              ? 'bg-error text-white border-error'
              : 'bg-surface-container-low dark:bg-surface-container text-on-surface border-outline-variant/30'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">report</span>
          <span>Pending Complaints</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest dark:bg-surface p-4 rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints by reason, reporter, item title..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 dark:border-outline/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low dark:bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {st === 'all' ? 'All Complaints' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20 overflow-hidden flex flex-col">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : reports.length === 0 ? (
          <EmptyState
            icon="sentiment_satisfied"
            title="No complaints in queue"
            description="The platform trust and safety feed is clean."
            actionLabel="View All Reports"
            onAction={() => {
              setSearch('');
              setStatusFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low dark:bg-surface-container text-on-surface-variant font-semibold uppercase tracking-wider text-[11px] border-b border-outline-variant/20">
                  <th className="py-3.5 px-4">Complaint Reason</th>
                  <th className="py-3.5 px-4">Reported Item</th>
                  <th className="py-3.5 px-4">Filed By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 dark:divide-outline/10 text-on-surface">
                {reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-surface-container-low/50 dark:hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 min-w-[220px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{rep.reason}</span>
                        <span className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                          {rep.description}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary">{rep.itemId?.title || 'Unknown Property'}</span>
                        <span className="text-[10px] text-on-surface-variant font-code-tabular">
                          #{rep.itemId?._id?.toString().slice(-4).toUpperCase()}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{rep.reporterId?.name || 'User'}</span>
                        <span className="text-[11px] text-on-surface-variant">{rep.reporterId?.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-on-surface-variant font-code-tabular">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                        rep.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : rep.status === 'RESOLVED'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {rep.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedReport(rep);
                          setDecisionStatus(rep.status === 'PENDING' ? 'RESOLVED' : rep.status);
                          setAdminNote(rep.adminNote || '');
                          setModalOpen(true);
                        }}
                        className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold transition-colors"
                      >
                        Inspect &amp; Resolve
                      </button>
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
        isOpen={modalOpen}
        title="Resolve Abuse Complaint"
        message={`Reviewing complaint for item: ${selectedReport?.itemId?.title || 'N/A'}`}
        confirmLabel="Save Resolution"
        isLoading={saving}
        onConfirm={handleExecuteReview}
        onClose={() => setModalOpen(false)}
      >
        <div className="flex flex-col gap-3 mt-2">
          <div className="p-3 rounded-lg bg-surface-container-low dark:bg-surface-container text-xs text-on-surface-variant">
            <p className="font-semibold text-on-surface">Complaint Rationale:</p>
            <p className="mt-1">{selectedReport?.description}</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Resolution Decision</label>
            <select
              value={decisionStatus}
              onChange={(e) => setDecisionStatus(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-outline-variant/40 dark:border-outline/30 bg-surface-container-low dark:bg-surface text-xs text-on-surface outline-none"
            >
              <option value="RESOLVED">RESOLVED (Action Taken)</option>
              <option value="DISMISSED">DISMISSED (Invalid Complaint)</option>
              <option value="REVIEWED">REVIEWED (Under Investigation)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Administrative Audit Note</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Record investigative findings, warnings issued, or dismissal reason..."
              className="w-full h-16 p-2 rounded-lg border border-outline-variant/40 dark:border-outline/30 bg-surface-container-low dark:bg-surface text-xs text-on-surface outline-none"
            ></textarea>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default ComplaintManagement;
