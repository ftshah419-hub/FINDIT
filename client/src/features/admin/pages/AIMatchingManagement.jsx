import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Pagination from '../../../components/common/Pagination';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import ImageModal from '../../../components/common/ImageModal';
import { TableSkeleton } from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';

const AIMatchingManagement = () => {
  const [matches, setMatches] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Review modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [reviewAction, setReviewAction] = useState('CONFIRM'); // 'CONFIRM' | 'DISMISS' | 'INVESTIGATE'
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState('');

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const minScore = scoreFilter === 'high' ? 85 : scoreFilter === 'moderate' ? 60 : undefined;
      const res = await adminService.getAIMatches({
        page,
        limit: 8,
        status: statusFilter,
        minScore,
      });
      setMatches(res.matches);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching AI matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [page, statusFilter, scoreFilter]);

  const handleExecuteReview = async () => {
    if (!selectedMatch) return;
    try {
      setReviewLoading(true);
      await adminService.reviewAIMatch(selectedMatch._id, {
        action: reviewAction,
        notes: reviewNotes,
      });
      setModalOpen(false);
      setSelectedMatch(null);
      setReviewNotes('');
      await fetchMatches();
    } catch (err) {
      alert(err.message || 'Failed to update AI match status.');
    } finally {
      setReviewLoading(false);
    }
  };

  const highMatchCount = matches.filter((m) => m.similarityScore >= 85).length;

  return (
    <div className="w-full flex flex-col">
      {/* Safeguard Banner */}
      <div className="w-full bg-secondary text-on-secondary px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-secondary-fixed text-[20px]">gavel</span>
          <p className="text-xs">
            <span className="font-bold text-white uppercase tracking-wider mr-1">
              Institutional Safeguard Protocol:
            </span>
            AI match predictions are advisory only. Custody release strictly requires physical inspection or cryptographically verified proof of ownership.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-on-secondary-container/40 px-3 py-1 rounded-full text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-secondary-fixed tracking-wide uppercase text-[10px]">
            Zero-Auto-Release Enforced
          </span>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Screen Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              <span className="text-[11px] uppercase tracking-widest font-bold">
                Neural Audit &amp; Vector Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              AI Matching Management
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl">
              Configure similarity thresholds, audit computer vision vectors, and review automated candidate matches across lost and found intakes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setScoreFilter(scoreFilter === 'high' ? 'all' : 'high');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                scoreFilter === 'high'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-low dark:bg-surface-container text-on-surface border-outline-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>High Similarity Only (&gt;85%)</span>
            </button>
          </div>
        </div>

        {/* Telemetry Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl p-5 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Total Suggestions</span>
              <span className="p-2 rounded-lg bg-surface-container text-primary">
                <span className="material-symbols-outlined text-[18px]">hub</span>
              </span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-on-surface font-code-tabular">{pagination?.total || matches.length}</span>
                <span className="text-xs text-secondary font-semibold">Active Radar</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">+18.4% intake velocity</p>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl p-5 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">High Similarity (&gt;85%)</span>
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-600 font-code-tabular">{highMatchCount}</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[10px] font-semibold">
                  Critical Queue
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">Recommended for manual review</p>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '88%' }}></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl p-5 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Cosine Threshold</span>
              <span className="p-2 rounded-lg bg-surface-container text-tertiary">
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </span>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-bold text-on-surface font-code-tabular">0.85</span>
              <p className="text-[11px] text-on-surface-variant mt-1">Configured in System Settings</p>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl p-5 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Automated Resolution</span>
              <span className="p-2 rounded-lg bg-error-container text-error">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-error">Disabled (0%)</span>
              <p className="text-[11px] text-on-surface-variant mt-1">Advisory matching only</p>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-error h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-surface-container-lowest dark:bg-surface rounded-xl shadow-xs border border-outline-variant/30 dark:border-outline/20 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-on-surface-variant font-semibold uppercase text-[11px]">Match State:</span>
            {['all', 'PENDING', 'CONFIRMED', 'DISMISSED', 'REVIEWED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-low dark:bg-surface-container text-on-surface hover:bg-surface-container'
                }`}
              >
                {st === 'all' ? 'All Candidates' : st}
              </button>
            ))}
          </div>
        </div>

        {/* AI Matches Grid */}
        {loading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : matches.length === 0 ? (
          <EmptyState
            icon="psychology"
            title="No AI match candidates in this tier"
            description="All radar matches have been processed or no reports meet the confidence threshold."
            actionLabel="Reset Score Filter"
            onAction={() => {
              setScoreFilter('all');
              setStatusFilter('all');
            }}
          />
        ) : (
          <div className="flex flex-col gap-5">
            {matches.map((match) => (
              <div
                key={match._id}
                className="bg-surface-container-lowest dark:bg-surface rounded-2xl p-5 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col lg:flex-row gap-5 items-stretch justify-between"
              >
                {/* Left: Lost Item vs Found Item Side-by-side */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lost Item Card */}
                  <div className="p-4 rounded-xl bg-surface-container-low dark:bg-surface-container/50 border border-outline-variant/20 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        onClick={() => match.lostItemId?.images?.[0]?.url && setLightboxUrl(match.lostItemId.images[0].url)}
                        className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden shrink-0 border border-outline-variant/30 cursor-pointer"
                      >
                        {match.lostItemId?.images?.[0]?.url ? (
                          <img src={match.lostItemId.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[20px]">search_off</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="px-2 py-0.5 rounded bg-error-container/40 text-on-error-container text-[10px] font-bold uppercase w-fit">
                          LOST REPORT
                        </span>
                        <h4 className="font-bold text-on-surface text-xs sm:text-sm truncate mt-1">
                          {match.lostItemId?.title}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                          {match.lostItemId?.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                      <span>Owner: {match.lostItemId?.reportedBy?.name || 'User'}</span>
                      <span className="font-code-tabular">
                        {new Date(match.lostItemId?.dateTime || match.lostItemId?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Found Item Card */}
                  <div className="p-4 rounded-xl bg-surface-container-low dark:bg-surface-container/50 border border-outline-variant/20 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        onClick={() => match.foundItemId?.images?.[0]?.url && setLightboxUrl(match.foundItemId.images[0].url)}
                        className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden shrink-0 border border-outline-variant/30 cursor-pointer"
                      >
                        {match.foundItemId?.images?.[0]?.url ? (
                          <img src={match.foundItemId.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="px-2 py-0.5 rounded bg-primary-fixed/40 text-on-primary-fixed text-[10px] font-bold uppercase w-fit">
                          FOUND ITEM IN CUSTODY
                        </span>
                        <h4 className="font-bold text-on-surface text-xs sm:text-sm truncate mt-1">
                          {match.foundItemId?.title}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                          {match.foundItemId?.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                      <span>Depot: {match.foundItemId?.location?.depot || 'Central Vault'}</span>
                      <span className="font-code-tabular">
                        {new Date(match.foundItemId?.dateTime || match.foundItemId?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score, Similarities & Actions */}
                <div className="lg:w-80 flex flex-col justify-between gap-4 p-4 rounded-xl bg-surface-container-low/40 dark:bg-surface-container/20 border border-outline-variant/20">
                  <div>
                    {/* Score badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-bold font-code-tabular text-primary">
                          {match.similarityScore}%
                        </span>
                        <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Similarity</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        match.similarityScore >= 85
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {match.similarityScore >= 85 ? 'HIGH CONFIDENCE' : 'MODERATE MATCH'}
                      </span>
                    </div>

                    {/* Matched Features */}
                    <div className="space-y-1 mb-2">
                      <span className="text-[10px] uppercase font-semibold text-on-surface-variant">Matched Attributes:</span>
                      {match.matchingFeatures?.slice(0, 3).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-1.5 text-[11px] text-on-surface">
                          <span className="material-symbols-outlined text-[13px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
                          <span className="leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Differences if any */}
                    {match.differences?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-on-surface-variant">Differences:</span>
                        {match.differences.map((diff, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
                            <span className="material-symbols-outlined text-[13px] shrink-0 mt-0.5">info</span>
                            <span className="leading-tight">{diff}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                    <button
                      onClick={() => {
                        setSelectedMatch(match);
                        setReviewAction('CONFIRM');
                        setModalOpen(true);
                      }}
                      className="flex-1 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">thumb_up</span>
                      Confirm Match
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMatch(match);
                        setReviewAction('DISMISS');
                        setModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-error rounded-lg text-xs font-semibold transition-colors"
                      title="Dismiss Match"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Review Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        title={reviewAction === 'CONFIRM' ? 'Confirm AI Match Suggestion' : 'Dismiss AI Match'}
        message={
          reviewAction === 'CONFIRM'
            ? `Confirming this match will notify the owner of "${selectedMatch?.lostItemId?.title}" that a verified match has been spotted in campus custody.`
            : `Dismiss this AI match suggestion between "${selectedMatch?.lostItemId?.title}" and "${selectedMatch?.foundItemId?.title}"?`
        }
        confirmLabel={reviewAction === 'CONFIRM' ? 'Confirm & Notify' : 'Dismiss Match'}
        isDestructive={reviewAction === 'DISMISS'}
        isLoading={reviewLoading}
        onConfirm={handleExecuteReview}
        onClose={() => {
          setModalOpen(false);
          setSelectedMatch(null);
          setReviewNotes('');
        }}
      >
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-xs font-semibold text-on-surface">Administrative Review Notes</label>
          <input
            type="text"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="e.g., Verified visual serial tag match or false positive."
            className="w-full h-9 px-3 rounded-lg border border-outline-variant/40 dark:border-outline/30 bg-surface-container-low dark:bg-surface text-xs text-on-surface outline-none"
          />
        </div>
      </ConfirmationModal>

      {/* Lightbox */}
      <ImageModal isOpen={!!lightboxUrl} imageUrl={lightboxUrl} onClose={() => setLightboxUrl('')} />
    </div>
  );
};

export default AIMatchingManagement;
