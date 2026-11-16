import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { claimService } from '../services/claimService';

export const MyClaimsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 3,
    underReview: 1,
    readyForPickup: 1,
    resolvedAndReturned: 1,
  });
  const [loading, setLoading] = useState(true);
  const [withdrawModalId, setWithdrawModalId] = useState(null);
  const [withdrawError, setWithdrawError] = useState('');

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const res = await claimService.getUserClaims();
      if (res.data) {
        setClaims(res.data.claims || []);
        setMetrics(res.data.metrics || {});
      }
    } catch (err) {
      console.error('Failed to load user claims:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleWithdrawConfirm = async () => {
    if (!withdrawModalId) return;
    try {
      await claimService.withdrawClaim(withdrawModalId);
      setWithdrawModalId(null);
      fetchClaims();
    } catch (err) {
      setWithdrawError(err.message || 'Failed to withdraw claim');
    }
  };

  return (
    <div className="flex flex-col w-full pb-space-2xl">
      {/* Top Utility Bar / Page Header Context */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
        <div className="flex flex-col gap-space-xs max-w-2xl">
          <div className="flex items-center gap-space-xs text-primary dark:text-[#4D8DFF] font-label-md flex-wrap font-semibold">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>AUDIT & RESOLUTION CENTER</span>
            <span className="text-outline-variant">•</span>
            <span className="font-code-tabular text-on-surface-variant dark:text-[#A8B5CA] uppercase">
              LOGGED IN AS {user?.name || 'ALEX CHEN'}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-[#F8FAFC] tracking-tight font-bold">
            My Claims
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-[#A8B5CA]">
            Monitor the real-time custody verification progress, security approvals, and pickup authorizations for items you have claimed.
          </p>
        </div>

        {/* Quick Actions / Live Audit Pulse */}
        <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
          <div className="px-space-md py-2 rounded-xl bg-surface-container dark:bg-[#1D2A40] flex items-center gap-space-sm text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            <span className="font-label-md text-label-md font-semibold">Custodian Desk Active</span>
          </div>
          <Link
            to="/items?type=found"
            className="px-space-md py-2 rounded-xl bg-primary text-on-primary font-label-lg flex items-center gap-space-xs hover:bg-primary-container transition-all shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Submit New Claim</span>
          </Link>
        </div>
      </section>

      {/* Metrics Grid with Subtle Gradients */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-2xl">
        {/* Metric 1 */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest dark:bg-[#151F30] p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/40 dark:border-[#29364A]">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA] uppercase tracking-wider">
                Total Dossiers
              </span>
              <div className="font-display text-display text-on-surface dark:text-[#F8FAFC] mt-1 font-bold">
                {String(metrics.total || claims.length).padStart(2, '0')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container dark:bg-[#1D2A40] flex items-center justify-center text-primary dark:text-[#4D8DFF]">
              <span className="material-symbols-outlined text-[20px]">folder_managed</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md text-on-surface-variant dark:text-[#A8B5CA] font-label-sm">
            <span className="font-semibold text-on-surface dark:text-[#F8FAFC]">100%</span>
            <span>identity match rate</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest dark:bg-[#151F30] p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/40 dark:border-[#29364A]">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-secondary dark:text-[#4D8DFF] uppercase tracking-wider font-semibold">
                Under Custody Review
              </span>
              <div className="font-display text-display text-secondary dark:text-[#4D8DFF] mt-1 font-bold">
                {String(metrics.underReview || 1).padStart(2, '0')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed dark:bg-secondary/20 flex items-center justify-center text-secondary dark:text-[#4D8DFF]">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md text-secondary dark:text-[#79A9FF] font-label-sm">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>Est. response: ~45 mins</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest dark:bg-[#151F30] p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/40 dark:border-[#29364A]">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-[#16845B] uppercase tracking-wider font-semibold">
                Ready for Pickup
              </span>
              <div className="font-display text-display text-[#16845B] mt-1 font-bold">
                {String(metrics.readyForPickup || 1).padStart(2, '0')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#16845B]/10 flex items-center justify-center text-[#16845B]">
              <span className="material-symbols-outlined text-[20px]">store</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md text-[#16845B] font-label-sm font-semibold">
            <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
            <span>Secure pass generated</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest dark:bg-[#151F30] p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/40 dark:border-[#29364A]">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                Resolved & Returned
              </span>
              <div className="font-display text-display text-on-surface-variant dark:text-[#A8B5CA] mt-1 font-bold">
                {String(metrics.resolvedAndReturned || 1).padStart(2, '0')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container dark:bg-[#1D2A40] flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md text-on-surface-variant dark:text-[#A8B5CA] font-label-sm">
            <span className="material-symbols-outlined text-[14px]">archive</span>
            <span>Archived into audit vault</span>
          </div>
        </div>
      </section>

      {/* Interactive Timeline / Active Dossiers Section */}
      <section className="flex flex-col gap-space-xl mb-space-2xl">
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30 dark:border-[#29364A]">
          <div className="flex items-center gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-[#F8FAFC] font-bold">
              Active Claims Stream
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-container dark:bg-[#1D2A40] text-on-surface-variant dark:text-[#A8B5CA] font-code-tabular text-label-sm">
              {claims.length} DOSSIERS
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-on-surface-variant dark:text-[#A8B5CA] font-body-sm">
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Auto-synced via Campus L&F Network</span>
          </div>
        </div>

        {/* Claim Dossier Cards */}
        {loading ? (
          <div className="h-64 rounded-xl bg-surface-container-low dark:bg-[#151F30] animate-pulse"></div>
        ) : claims.length === 0 ? (
          <div className="p-16 bg-surface-container-lowest dark:bg-[#151F30] rounded-xl text-center border border-outline-variant/40 dark:border-[#29364A]">
            <span className="material-symbols-outlined text-[48px] text-outline mb-2">
              verified
            </span>
            <h3 className="font-headline-sm font-bold text-on-surface dark:text-[#F8FAFC]">
              No Active Claims
            </h3>
            <p className="font-body-md text-on-surface-variant dark:text-[#A8B5CA] mt-1 max-w-md mx-auto">
              If you spotted your lost belongings in the public directory, submit an ownership claim to initiate custody verification.
            </p>
            <Link
              to="/items?type=found"
              className="mt-6 inline-block px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold"
            >
              Browse Found Items
            </Link>
          </div>
        ) : (
          claims.map((claim) => {
            const item = claim.itemId;
            const stage = claim.verificationStage || (claim.status === 'PENDING' ? 2 : claim.status === 'APPROVED' ? 3 : 1);

            return (
              <div
                key={claim._id}
                className="rounded-xl bg-surface-container-lowest dark:bg-[#151F30] shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-outline-variant/40 dark:border-[#29364A]"
              >
                {/* Card Sub-header bar */}
                <div className="bg-surface-container-low dark:bg-[#1D2A40] px-space-lg py-space-md flex flex-wrap items-center justify-between gap-space-md border-b border-outline-variant/20 dark:border-[#29364A]">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <span className="font-code-tabular text-label-lg font-semibold text-primary dark:text-[#4D8DFF] px-space-sm py-1 rounded bg-primary-fixed/60 dark:bg-primary/20">
                      #CLM-{claim._id.toString().slice(-4).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-space-xs text-on-surface-variant dark:text-[#A8B5CA] font-body-sm">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      <span>Submitted {new Date(claim.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-sm">
                    <span
                      className={`px-3 py-1 rounded-full font-label-md flex items-center gap-1.5 font-semibold ${
                        claim.status === 'APPROVED'
                          ? 'bg-[#16845B]/15 text-[#16845B]'
                          : claim.status === 'REJECTED'
                          ? 'bg-error/15 text-error'
                          : claim.status === 'WITHDRAWN'
                          ? 'bg-outline/15 text-outline'
                          : 'bg-secondary-fixed dark:bg-secondary/20 text-on-secondary-fixed dark:text-[#79A9FF]'
                      }`}
                    >
                      {claim.status === 'PENDING' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-[#4D8DFF] animate-pulse"></span>
                      )}
                      {claim.status === 'PENDING'
                        ? 'Under Custody Review'
                        : claim.status === 'APPROVED'
                        ? 'Pickup Authorized'
                        : claim.status}
                    </span>
                  </div>
                </div>

                {/* Main Card Body */}
                <div className="p-space-lg flex flex-col lg:flex-row gap-space-xl">
                  {/* Left: Item Visual & Metadata */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-space-md lg:w-72 shrink-0">
                    <div className="relative w-full sm:w-48 lg:w-full h-44 rounded-xl overflow-hidden bg-surface-container dark:bg-[#1D2A40]">
                      <img
                        className="w-full h-full object-cover"
                        src={
                          item?.images?.[0]?.url ||
                          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={item?.title || 'Claimed Asset'}
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface font-label-sm font-code-tabular">
                        Item #{item?._id?.toString().slice(-4).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-space-xs">
                      <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA] uppercase font-semibold">
                        Claimed Asset
                      </span>
                      <h3
                        onClick={() => navigate(`/items/${item?._id}`)}
                        className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-bold cursor-pointer hover:text-primary dark:hover:text-[#4D8DFF] transition-colors"
                      >
                        {item?.title || 'Found Property'}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                        {item?.description}
                      </p>

                      <div className="mt-space-xs p-space-sm rounded-lg bg-surface-container-low dark:bg-[#1D2A40] flex flex-col gap-1 text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30">
                        <div className="flex items-center gap-space-xs text-on-surface-variant dark:text-[#A8B5CA] font-label-sm">
                          <span className="material-symbols-outlined text-[16px] text-primary dark:text-[#4D8DFF]">
                            location_on
                          </span>
                          <span>Found at: {item?.location?.name || 'Campus'}</span>
                        </div>
                        <div className="flex items-center gap-space-xs text-on-surface-variant dark:text-[#A8B5CA] font-label-sm">
                          <span className="material-symbols-outlined text-[16px] text-secondary dark:text-[#4D8DFF]">
                            desk
                          </span>
                          <span>Desk: {item?.storageLocation || 'Security Desk'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Flow, Stepper & Evidence Vault */}
                  <div className="flex-1 flex flex-col justify-between gap-space-lg">
                    {/* Stepper */}
                    <div className="flex flex-col gap-space-sm">
                      <div className="flex items-center justify-between text-on-surface-variant dark:text-[#A8B5CA] font-label-sm">
                        <span>Verification Milestone</span>
                        <span className="text-primary dark:text-[#4D8DFF] font-semibold">
                          Stage {stage} of 4
                        </span>
                      </div>

                      {/* Stepper Indicators */}
                      <div className="grid grid-cols-4 gap-space-xs">
                        {[
                          { step: 1, title: 'Claim Submitted' },
                          { step: 2, title: 'Custody Review' },
                          { step: 3, title: 'Pickup Authorized' },
                          { step: 4, title: 'Handover / Done' },
                        ].map((s) => (
                          <div key={s.step} className="flex flex-col gap-space-xs">
                            <div
                              className={`h-2 rounded-full ${
                                stage >= s.step
                                  ? 'bg-primary dark:bg-[#4D8DFF]'
                                  : 'bg-surface-container-high dark:bg-[#29364A]'
                              }`}
                            ></div>
                            <div className="flex items-center gap-1 font-label-sm text-on-surface dark:text-[#F8FAFC]">
                              <span
                                className={`material-symbols-outlined text-[14px] ${
                                  stage >= s.step ? 'text-primary dark:text-[#4D8DFF]' : 'text-outline'
                                }`}
                              >
                                {stage > s.step ? 'check_circle' : stage === s.step ? 'radio_button_checked' : 'radio_button_unchecked'}
                              </span>
                              <span className="truncate">{s.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submitted Evidence Vault Summary */}
                    <div className="p-space-md rounded-xl bg-surface-container-low dark:bg-[#1D2A40] flex flex-col gap-space-sm border border-outline-variant/30">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm uppercase tracking-wider text-outline font-semibold">
                          Submitted Evidence Vault
                        </span>
                        <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">lock</span> Private to Custodian
                        </span>
                      </div>
                      <p className="font-body-sm text-on-surface dark:text-[#F8FAFC]">
                        <strong className="text-on-surface dark:text-[#F8FAFC]">Proof Note:</strong> {claim.proofDescription}
                      </p>
                      {claim.identifyingDetails && (
                        <p className="font-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                          <strong>Identifiers:</strong> {claim.identifyingDetails}
                        </p>
                      )}
                      {claim.adminNote && (
                        <div className="p-2 rounded bg-surface-container-highest dark:bg-[#29364A] text-xs font-medium text-primary dark:text-[#79A9FF]">
                          <strong>Custodian Review Note:</strong> {claim.adminNote}
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-space-sm pt-space-xs flex-wrap">
                      <div className="text-xs text-on-surface-variant dark:text-[#A8B5CA]">
                        Identity verified via Campus LDAP
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/items/${item?._id}`)}
                          className="px-4 py-2 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-md hover:bg-surface-container transition-colors border border-outline-variant/30"
                        >
                          View Official Found Record
                        </button>
                        {claim.status === 'PENDING' && (
                          <button
                            onClick={() => setWithdrawModalId(claim._id)}
                            className="px-4 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 font-label-md font-semibold transition-colors"
                          >
                            Withdraw Claim
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Withdraw Modal */}
      {withdrawModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest dark:bg-[#151F30] rounded-2xl p-6 shadow-2xl border border-outline-variant/40 dark:border-[#29364A]">
            <span className="material-symbols-outlined text-[36px] text-error mb-2">
              cancel
            </span>
            <h3 className="font-headline-sm font-bold text-on-surface dark:text-[#F8FAFC]">
              Withdraw Ownership Claim?
            </h3>
            <p className="font-body-md text-on-surface-variant dark:text-[#A8B5CA] mt-2">
              Are you sure you want to withdraw this claim? The custodian desk will be notified and your claim review will be cancelled.
            </p>
            {withdrawError && (
              <p className="p-2 mt-2 text-xs text-error font-medium">{withdrawError}</p>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setWithdrawModalId(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md"
              >
                Keep Active
              </button>
              <button
                onClick={handleWithdrawConfirm}
                className="px-5 py-2 rounded-lg bg-error text-on-error font-label-md font-semibold"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
