import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Pagination from '../../../components/common/Pagination';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import ImageModal from '../../../components/common/ImageModal';
import { TableSkeleton } from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';

const ClaimVerification = () => {
  const [claims, setClaims] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Inspection Drawer
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Review Decision Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [adminNote, setAdminNote] = useState('');
  const [decisionLoading, setDecisionLoading] = useState(false);

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState('');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await adminService.getClaims({
        page,
        limit: 10,
        status: statusFilter,
        search,
      });
      setClaims(res.claims);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [page, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchClaims();
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const handleOpenClaimDetail = async (claimId) => {
    try {
      setShowDrawer(true);
      setDrawerLoading(true);
      const res = await adminService.getClaim(claimId);
      setSelectedClaim(res);
    } catch (err) {
      alert(err.message || 'Failed to load claim details.');
      setShowDrawer(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleExecuteDecision = async () => {
    if (!selectedClaim) return;
    try {
      setDecisionLoading(true);
      await adminService.reviewClaim(selectedClaim._id, {
        status: decisionType,
        adminNote: adminNote.trim() || (decisionType === 'APPROVED' ? 'Proof of ownership validated.' : 'Insufficient evidence.'),
      });
      setDecisionModalOpen(false);
      setShowDrawer(false);
      setSelectedClaim(null);
      setAdminNote('');
      await fetchClaims();
    } catch (err) {
      alert(err.message || 'Failed to submit claim decision.');
    } finally {
      setDecisionLoading(false);
    }
  };

  const pendingCount = claims.filter((c) => c.status === 'PENDING').length;
  const approvedCount = claims.filter((c) => c.status === 'APPROVED').length;

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-container/10 text-primary text-[11px] font-semibold uppercase tracking-wider">
              Chain of Custody v4.2
            </span>
            <span className="text-outline text-xs">•</span>
            <span className="text-on-surface-variant text-xs">Station #01 - North Precinct Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Claim Verification Center
          </h1>
          <p className="text-sm text-on-surface-variant">
            Audit uploaded ownership evidence, serial proof, receipts, and authorize cryptographic release passes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              statusFilter === 'PENDING'
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container-low dark:bg-surface-container text-on-surface border-outline-variant/30'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">pending_actions</span>
            <span>Needs Verification ({pendingCount})</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Pending */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Pending Claims Queue</span>
            <span className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface font-code-tabular">{pendingCount}</span>
              <span className="text-xs text-error font-semibold">Urgent Review</span>
            </div>
            <span className="font-code-tabular text-[11px] text-on-surface-variant">Active SLA: 45m</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-error h-full rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* KPI 2: Approved / Issued */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Ready for Pickup</span>
            <span className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface font-code-tabular">{approvedCount}</span>
              <span className="text-xs text-on-surface-variant">Passes Issued</span>
            </div>
            <span className="text-[11px] text-primary font-semibold">Safe Bays 1-8</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '90%' }}></div>
          </div>
        </div>

        {/* KPI 3: Security & Fraud Safeguard */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Self-Claim Guard</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">shield</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-600 font-code-tabular">Enforced</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">Zero-Collusion Active</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* KPI 4: Turnaround */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-surface shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Avg Turnaround</span>
            <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-on-surface font-code-tabular">2.4</span>
              <span className="text-xs text-on-surface-variant">hours</span>
            </div>
            <div className="flex items-center text-secondary text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_down</span>
              <span>18% faster</span>
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-secondary-container h-full rounded-full" style={{ width: '62%' }}></div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search claims by claimant name, item title, claim ID..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 dark:border-outline/20"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {['all', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low dark:bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {st === 'all' ? 'All Claims' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20 overflow-hidden flex flex-col">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : claims.length === 0 ? (
          <EmptyState
            icon="verified_user"
            title="No claims matching criteria"
            description="All pending claims have been verified or no records match your filter."
            actionLabel="View All Claims"
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
                  <th className="py-3.5 px-4">Claim Reference</th>
                  <th className="py-3.5 px-4">Claimant Information</th>
                  <th className="py-3.5 px-4">Claimed Item</th>
                  <th className="py-3.5 px-4">Evidence Submitted</th>
                  <th className="py-3.5 px-4">Verification State</th>
                  <th className="py-3.5 px-4 text-right">Audit &amp; Release</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 dark:divide-outline/10 text-on-surface">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-surface-container-low/50 dark:hover:bg-surface-container/40 transition-colors group">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-code-tabular font-bold text-primary">
                          #CLM-{claim._id.toString().slice(-4).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-code-tabular">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{claim.claimantId?.name}</span>
                        <span className="text-[11px] text-on-surface-variant">{claim.claimantId?.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 min-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0 border border-outline-variant/30">
                          <img
                            src={
                              claim.itemId?.images?.[0]?.url ||
                              'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=150&q=80'
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-on-surface truncate">{claim.itemId?.title || 'Unknown Item'}</span>
                          <span className="text-[11px] text-on-surface-variant truncate">
                            Depot: {claim.itemId?.location?.depot || 'Central Vault'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-medium text-[11px]">
                        <span className="material-symbols-outlined text-[14px] text-secondary">attachment</span>
                        {claim.evidence?.length || 0} File(s) Attached
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {claim.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Pending Review
                        </span>
                      )}
                      {claim.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Approved &amp; Reunited
                        </span>
                      )}
                      {claim.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-semibold text-[11px]">
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenClaimDetail(claim._id)}
                        className="px-3 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 ml-auto transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        Inspect &amp; Decide
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

      {/* Claim Detail Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-surface-container-lowest dark:bg-surface h-full shadow-2xl border-l border-outline-variant/30 dark:border-outline/20 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            {drawerLoading ? (
              <div className="m-auto">
                <span className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></span>
              </div>
            ) : selectedClaim ? (
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-outline-variant/20 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-primary font-code-tabular">
                      #CLM-{selectedClaim._id.toString().slice(-4).toUpperCase()}
                    </span>
                    <h2 className="text-lg font-bold text-on-surface">Ownership Verification Dossier</h2>
                  </div>
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {/* Claimant Summary */}
                <div className="p-4 rounded-xl bg-surface-container-low dark:bg-surface-container/50 flex flex-col gap-2 text-xs">
                  <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Claimant Information</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface text-sm">{selectedClaim.claimantId?.name}</span>
                    <span className="text-on-surface-variant">{selectedClaim.claimantId?.email}</span>
                  </div>
                  <div className="text-on-surface-variant">Phone: {selectedClaim.claimantId?.phone || 'Not recorded'}</div>
                </div>

                {/* Claimed Item Details */}
                <div className="p-4 rounded-xl border border-outline-variant/30 dark:border-outline/20 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        selectedClaim.itemId?.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80'
                      }
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover border border-outline-variant/30 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{selectedClaim.itemId?.title}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{selectedClaim.itemId?.description}</p>
                      <span className="text-[11px] text-primary font-semibold mt-1 inline-block">
                        Depot: {selectedClaim.itemId?.location?.depot || 'Main Campus Vault'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claimant's Statement / Description */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Claimant Affidavit / Description
                  </span>
                  <div className="p-3.5 rounded-xl bg-surface-container-low dark:bg-surface-container text-xs text-on-surface leading-relaxed border border-outline-variant/20">
                    "{selectedClaim.claimDescription}"
                  </div>
                </div>

                {/* Uploaded Evidence Gallery */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Uploaded Evidence &amp; Proof ({selectedClaim.evidence?.length || 0})
                  </span>
                  {selectedClaim.evidence?.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">No documentary files uploaded with this claim.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedClaim.evidence?.map((file, idx) => (
                        <div
                          key={idx}
                          onClick={() => setLightboxUrl(file.url)}
                          className="p-2 rounded-lg bg-surface-container-low dark:bg-surface-container border border-outline-variant/30 cursor-pointer hover:border-primary transition-all flex flex-col items-center text-center gap-1.5"
                        >
                          <img src={file.url} alt="Proof" className="w-full h-24 object-cover rounded" />
                          <span className="text-[11px] font-semibold text-primary uppercase">{file.type || 'DOCUMENT'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sibling claims note */}
                {selectedClaim.siblingClaims?.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">warning</span>
                    <span>
                      Notice: {selectedClaim.siblingClaims.length} other claim(s) exist for this item. Approving this claim will automatically reject all other pending claims.
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Action buttons */}
            <div className="pt-4 border-t border-outline-variant/30 dark:border-outline/20 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowDrawer(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container"
              >
                Close
              </button>

              {selectedClaim?.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      setDecisionType('REJECTED');
                      setDecisionModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-error bg-error-container/30 hover:bg-error-container/50 transition-colors"
                  >
                    Reject Claim
                  </button>
                  <button
                    onClick={() => {
                      setDecisionType('APPROVED');
                      setDecisionModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-on-primary bg-primary hover:bg-primary-container shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Authorize &amp; Resolve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      <ConfirmationModal
        isOpen={decisionModalOpen}
        title={decisionType === 'APPROVED' ? 'Authorize Ownership Claim & Release' : 'Reject Claim'}
        message={
          decisionType === 'APPROVED'
            ? `Approving claim #CLM-${selectedClaim?._id.toString().slice(-4).toUpperCase()} will mark the property as RESOLVED, dismiss any conflicting claims, and issue a digital pickup pass to ${selectedClaim?.claimantId?.name}.`
            : `Reject claim for ${selectedClaim?.claimantId?.name}? A notification will be dispatched.`
        }
        confirmLabel={decisionType === 'APPROVED' ? 'Confirm Release' : 'Confirm Rejection'}
        isDestructive={decisionType === 'REJECTED'}
        isLoading={decisionLoading}
        onConfirm={handleExecuteDecision}
        onClose={() => setDecisionModalOpen(false)}
      >
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-xs font-semibold text-on-surface">Administrative Decision Notes</label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Document verification method, serial numbers matched, or reason for dismissal..."
            className="w-full h-20 p-2.5 rounded-lg border border-outline-variant/40 dark:border-outline/30 bg-surface-container-low dark:bg-surface text-xs text-on-surface outline-none"
          ></textarea>
        </div>
      </ConfirmationModal>

      {/* Lightbox */}
      <ImageModal isOpen={!!lightboxUrl} imageUrl={lightboxUrl} onClose={() => setLightboxUrl('')} />
    </div>
  );
};

export default ClaimVerification;
