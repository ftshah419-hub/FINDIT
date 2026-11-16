import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiMatchService } from '../services/aiMatchService';
import { claimService } from '../services/claimService';

export const AISmartMatchPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ userLostItems: [], matches: [] });
  const [selectedLostId, setSelectedLostId] = useState(null);
  const [claimModalMatch, setClaimModalMatch] = useState(null);
  const [claimForm, setClaimForm] = useState({ proofDescription: '', identifyingDetails: '' });
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimError, setClaimError] = useState('');

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await aiMatchService.getUserMatches();
      if (res.data) {
        setData(res.data);
        if (res.data.userLostItems?.length > 0) {
          setSelectedLostId(res.data.userLostItems[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load AI matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleDismiss = async (matchId) => {
    try {
      await aiMatchService.dismissMatch(matchId);
      setData((prev) => ({
        ...prev,
        matches: prev.matches.filter((m) => m._id !== matchId),
      }));
    } catch (err) {
      console.error('Failed to dismiss match:', err);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimModalMatch) return;
    setClaimError('');
    setClaimSuccess('');

    try {
      setClaimSubmitting(true);
      await claimService.submitClaim(claimModalMatch.foundItemId._id, {
        proofDescription: claimForm.proofDescription,
        identifyingDetails: claimForm.identifyingDetails,
      });
      setClaimSuccess('Claim dossier successfully submitted to campus security review!');
      setTimeout(() => {
        setClaimModalMatch(null);
        navigate('/my-claims');
      }, 1500);
    } catch (err) {
      setClaimError(err.message || 'Failed to submit claim.');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const activeLostItem = data.userLostItems.find((i) => i._id === selectedLostId) || data.userLostItems[0];
  const activeMatches = data.matches.filter(
    (m) => m.lostItemId?._id === selectedLostId || m.lostItemId === selectedLostId
  );
  const topMatch = activeMatches[0] || data.matches[0];

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-space-2xl">
      {/* AI Disclaimer & Live Radar Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-high dark:bg-[#151F30] p-space-md shadow-sm border border-outline-variant/30 dark:border-[#29364A]">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md relative z-10">
          <div className="flex items-start gap-space-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">radar</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-headline-sm text-headline-sm text-on-surface dark:text-[#F8FAFC] font-bold">
                  FINDIT AI Smart Match Radar
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest dark:bg-[#1D2A40] px-space-sm py-0.5 font-label-sm text-label-sm text-primary dark:text-[#4D8DFF] shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-secondary-container animate-pulse"></span>
                  Neural Engine Active • v4.2
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA] max-w-4xl">
                AI suggestions are algorithmic similarity recommendations based on multi-factor metadata matching. They do <strong className="text-on-surface dark:text-[#F8FAFC] font-semibold">NOT</strong> constitute verified legal ownership.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-xs self-start lg:self-center shrink-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
              Last scanned: 4 mins ago
            </span>
            <button
              onClick={fetchMatches}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-container-lowest dark:bg-[#1D2A40] px-space-sm py-1.5 font-label-md text-label-md text-secondary dark:text-[#4D8DFF] hover:bg-surface-container transition-colors shadow-xs border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              Re-scan Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Lost Item Selector Context Switcher */}
      <div className="flex flex-col space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-md text-label-md uppercase tracking-wider text-outline font-semibold">
              Comparing against your lost report
            </span>
            <span className="material-symbols-outlined text-[16px] text-outline">help_outline</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
            {data.userLostItems.length} Active Reports in Orbit
          </span>
        </div>

        {/* Switcher Pills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {data.userLostItems.map((item) => {
            const isSelected = item._id === selectedLostId;
            const itemMatches = data.matches.filter((m) => m.lostItemId?._id === item._id);

            return (
              <div
                key={item._id}
                onClick={() => setSelectedLostId(item._id)}
                className={`relative flex items-center justify-between p-space-md rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-surface-container-lowest dark:bg-[#151F30] shadow-md border-primary dark:border-[#4D8DFF]'
                    : 'bg-surface-container-lowest/70 dark:bg-[#151F30]/60 hover:bg-surface-container-lowest border-outline-variant/30'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container rounded-l-xl"></div>
                )}
                <div className="flex items-center gap-space-md pl-space-xs">
                  <div className="h-12 w-12 rounded-lg bg-surface-container dark:bg-[#1D2A40] flex items-center justify-center text-primary dark:text-[#4D8DFF] shrink-0">
                    <span className="material-symbols-outlined text-[26px]">laptop_mac</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                        {item.title}
                      </span>
                      {isSelected && (
                        <span className="inline-flex rounded-full bg-secondary-fixed dark:bg-secondary/20 px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-fixed dark:text-[#79A9FF] font-semibold">
                          Active Selection
                        </span>
                      )}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                      Report #LST-{item._id.toString().slice(-4).toUpperCase()} • Reported {new Date(item.itemDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm">
                  <div className="text-right hidden sm:block">
                    <span className="block font-label-sm text-label-sm text-primary dark:text-[#4D8DFF] font-semibold">
                      {itemMatches.length} Matches Detected
                    </span>
                    <span className="font-code-tabular text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                      {itemMatches[0]?.similarityScore || 0}% Peak
                    </span>
                  </div>
                  <span className={`material-symbols-outlined ${isSelected ? 'text-primary dark:text-[#4D8DFF]' : 'text-outline'}`}>
                    {isSelected ? 'check_circle' : 'chevron_right'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary High-Confidence Match Card */}
      {topMatch ? (
        <section className="space-y-space-md">
          <div className="flex items-baseline justify-between flex-wrap gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <div className="flex h-3 w-3 rounded-full bg-primary-container"></div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-[#F8FAFC] font-bold">
                Highest Confidence Match candidate
              </h2>
            </div>
            <span className="font-code-tabular text-label-md text-on-surface-variant dark:text-[#A8B5CA]">
              Calculated with Visual Embeddings + Geospatial Triangulation
            </span>
          </div>

          <div className="rounded-xl bg-surface-container-lowest dark:bg-[#151F30] shadow-md overflow-hidden border border-outline-variant/40 dark:border-[#29364A]">
            {/* Top Score Header Banner */}
            <div className="bg-gradient-to-r from-surface-container via-surface-container-low to-surface-container-lowest dark:from-[#1D2A40] dark:via-[#151F30] dark:to-[#151F30] p-space-md flex flex-wrap items-center justify-between gap-space-md border-b border-outline-variant/30">
              <div className="flex items-center gap-space-md">
                {/* Radial Indicator */}
                <div className="relative flex h-16 w-16 items-center justify-center shrink-0">
                  <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-highest dark:text-[#29364A]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    ></path>
                    <path
                      className="text-primary-container dark:text-[#4D8DFF]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${topMatch.similarityScore}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    ></path>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-title-md text-title-md text-primary dark:text-[#4D8DFF] font-bold">
                      {topMatch.similarityScore}%
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed dark:bg-primary/20 px-2.5 py-0.5 font-label-md text-label-md text-on-primary-fixed dark:text-[#4D8DFF] font-semibold">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      {topMatch.similarityScore >= 85 ? 'Very High Match Probability' : 'Moderate Match Probability'}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA] font-code-tabular">
                      Found Catalog Ref: #FND-{topMatch.foundItemId?._id?.toString().slice(-4).toUpperCase()}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface dark:text-[#F8FAFC] mt-0.5">
                    Found at <strong className="font-semibold">{topMatch.foundItemId?.location?.name}</strong> • Custody: {topMatch.foundItemId?.storageLocation}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-space-sm">
                <span className="inline-flex items-center gap-1 text-on-surface-variant dark:text-[#A8B5CA] font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-primary dark:text-[#4D8DFF]">verified</span>
                  Item in Official Campus Custody
                </span>
              </div>
            </div>

            {/* Side-by-Side Visual & Attribute Deep Dive */}
            <div className="p-space-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
                {/* Left Column: User's Lost Report */}
                <div className="flex flex-col space-y-space-md p-space-md rounded-xl bg-surface-container-low dark:bg-[#1D2A40] border border-outline-variant/30">
                  <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[20px] text-outline">person_pin</span>
                      <span className="font-label-lg text-label-lg font-semibold text-on-surface dark:text-[#F8FAFC]">
                        Your Lost Item Report (#LST-{topMatch.lostItemId?._id?.toString().slice(-4).toUpperCase()})
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">Owner Record</span>
                  </div>

                  {/* Image */}
                  <div className="relative h-56 w-full overflow-hidden rounded-lg bg-surface-container shadow-xs">
                    <img
                      className="h-full w-full object-cover"
                      src={
                        topMatch.lostItemId?.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={topMatch.lostItemId?.title}
                    />
                    <div className="absolute bottom-2 left-2 rounded-md bg-surface/90 dark:bg-[#151F30]/90 backdrop-blur-sm px-2 py-1 font-label-sm text-label-sm text-on-surface dark:text-[#F8FAFC] flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-primary dark:text-[#4D8DFF]">photo_camera</span>
                      Reference Photo Provided
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="space-y-space-xs divide-y divide-outline-variant/20">
                    <div className="flex justify-between py-1 text-body-sm">
                      <span className="text-on-surface-variant dark:text-[#A8B5CA]">Device / Title:</span>
                      <span className="text-on-surface dark:text-[#F8FAFC] font-semibold text-right">{topMatch.lostItemId?.title}</span>
                    </div>
                    <div className="flex justify-between py-1 text-body-sm">
                      <span className="text-on-surface-variant dark:text-[#A8B5CA]">Category:</span>
                      <span className="text-on-surface dark:text-[#F8FAFC] font-semibold text-right">{topMatch.lostItemId?.categoryId?.name || 'Electronics'}</span>
                    </div>
                    <div className="flex justify-between py-1 text-body-sm">
                      <span className="text-on-surface-variant dark:text-[#A8B5CA]">Key Identifiers:</span>
                      <span className="text-on-surface dark:text-[#F8FAFC] font-semibold text-right">{topMatch.lostItemId?.distinctiveFeatures || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 text-body-sm">
                      <span className="text-on-surface-variant dark:text-[#A8B5CA]">Last Seen:</span>
                      <span className="text-on-surface dark:text-[#F8FAFC] font-semibold text-right">{topMatch.lostItemId?.location?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Campus Discovered Item */}
                <div className="flex flex-col space-y-space-md p-space-md rounded-xl bg-surface-container-low dark:bg-[#1D2A40] border border-outline-variant/30">
                  <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[20px] text-primary dark:text-[#4D8DFF]">inventory_2</span>
                      <span className="font-label-lg text-label-lg font-semibold text-on-surface dark:text-[#F8FAFC]">
                        Campus Discovered Item (#FND-{topMatch.foundItemId?._id?.toString().slice(-4).toUpperCase()})
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">Custodian Record</span>
                  </div>

                  {/* Image */}
                  <div className="relative h-56 w-full overflow-hidden rounded-lg bg-surface-container shadow-xs">
                    <img
                      className="h-full w-full object-cover"
                      src={
                        topMatch.foundItemId?.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={topMatch.foundItemId?.title}
                    />
                    <div className="absolute bottom-2 left-2 rounded-md bg-surface/90 dark:bg-[#151F30]/90 backdrop-blur-sm px-2 py-1 font-label-sm text-label-sm text-on-surface dark:text-[#F8FAFC] flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-secondary dark:text-[#4D8DFF]">inventory_2</span>
                      Discovered Property Vault
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="space-y-space-xs divide-y divide-outline-variant/20">
                    <div className="flex justify-between py-1 text-body-sm">
                      <span className="text-on-surface-variant dark:text-[#A8B5CA]">Discovered Title:</span>
                      <span className="text-on-surface dark:text-[#F8FAFC] font-semibold text-right">{topMatch.foundItemId?.title}</span>
                    </div>
                    <div className="flex justify-between py-1 text-body-sm">
                      <span className="text-on-surface-variant dark:text-[#A8B5CA]">Condition:</span>
                      <span className="text-on-surface dark:text-[#F8FAFC] font-semibold text-right capitalize">{topMatch.foundItemId?.condition || 'Good'}</span>
                    </div>
                    <div className="flex justify-between py-1 text-body-sm">
                      <span className="text-on-surface-variant dark:text-[#A8B5CA]">Observed Marks:</span>
                      <span className="text-on-surface dark:text-[#F8FAFC] font-semibold text-right">{topMatch.foundItemId?.distinctiveFeatures || 'Standard markings'}</span>
                    </div>
                    <div className="flex justify-between py-1 text-body-sm">
                      <span className="text-on-surface-variant dark:text-[#A8B5CA]">Custody Depot:</span>
                      <span className="text-on-surface dark:text-[#F8FAFC] font-semibold text-right">{topMatch.foundItemId?.storageLocation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matching Factors Checklist */}
              <div className="mt-space-lg p-space-md rounded-xl bg-surface-container dark:bg-[#1D2A40]/60 border border-outline-variant/30">
                <h4 className="font-label-md uppercase tracking-wider text-outline font-semibold mb-2">
                  Matching Features Matrix
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {topMatch.matchingFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-on-surface dark:text-[#F8FAFC]">
                      <span className="material-symbols-outlined text-[16px] text-success">
                        check_circle
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-space-lg flex items-center justify-between gap-space-md flex-wrap pt-space-sm border-t border-outline-variant/20">
                <button
                  onClick={() => handleDismiss(topMatch._id)}
                  className="px-space-md py-2.5 rounded-lg bg-surface-container dark:bg-[#1D2A40] text-on-surface-variant dark:text-[#A8B5CA] hover:bg-surface-container-high font-label-md font-medium transition-colors"
                >
                  Dismiss Suggestion
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/items/${topMatch.foundItemId?._id}`)}
                    className="px-space-md py-2.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-md font-medium hover:bg-surface-container transition-colors border border-outline-variant/30"
                  >
                    View Found Record
                  </button>
                  <button
                    onClick={() => setClaimModalMatch(topMatch)}
                    className="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-lg font-semibold hover:bg-primary-container transition-all shadow-md flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Initiate Verification Claim</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="p-16 bg-surface-container-lowest dark:bg-[#151F30] rounded-xl text-center border border-outline-variant/40 dark:border-[#29364A]">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">
            radar
          </span>
          <h3 className="font-headline-sm font-bold text-on-surface dark:text-[#F8FAFC]">
            No High-Confidence Matches Detected
          </h3>
          <p className="font-body-md text-on-surface-variant dark:text-[#A8B5CA] mt-1 max-w-md mx-auto">
            The neural intake engine runs continuous background audits across all newly deposited campus items. You will receive an instant notification when similarity crosses 80%.
          </p>
        </div>
      )}

      {/* Claim Initiation Modal */}
      {claimModalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-surface-container-lowest dark:bg-[#151F30] rounded-2xl p-6 shadow-2xl border border-outline-variant/40 dark:border-[#29364A]">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[24px] text-primary dark:text-[#4D8DFF]">
                verified
              </span>
              <h3 className="font-headline-sm font-bold text-on-surface dark:text-[#F8FAFC]">
                Submit Ownership Claim
              </h3>
            </div>

            <p className="font-body-sm text-on-surface-variant dark:text-[#A8B5CA] mb-4">
              Filing claim for <strong className="text-on-surface dark:text-[#F8FAFC]">{claimModalMatch.foundItemId?.title}</strong> (#FND-{claimModalMatch.foundItemId?._id?.toString().slice(-4).toUpperCase()}). Evidence submitted will remain private between you and authorized campus desk reviewers.
            </p>

            {claimError && (
              <p className="p-3 mb-4 rounded-lg bg-error/10 text-error text-sm font-medium">{claimError}</p>
            )}
            {claimSuccess && (
              <p className="p-3 mb-4 rounded-lg bg-success/10 text-success text-sm font-medium">{claimSuccess}</p>
            )}

            <form onSubmit={handleClaimSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                  Proof of Ownership Description <span className="text-error">*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  value={claimForm.proofDescription}
                  onChange={(e) => setClaimForm({ ...claimForm, proofDescription: e.target.value })}
                  placeholder="Describe secret marks, lockscreen passwords, contents, receipts, or circumstances under which you misplaced this property..."
                  className="w-full p-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                  Unique Identifying Numbers or Marks
                </label>
                <input
                  type="text"
                  value={claimForm.identifyingDetails}
                  onChange={(e) => setClaimForm({ ...claimForm, identifyingDetails: e.target.value })}
                  placeholder="Serial numbers, case stickers, scratches, initials..."
                  className="w-full h-10 px-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setClaimModalMatch(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimSubmitting}
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-all"
                >
                  {claimSubmitting ? 'Filing Dossier...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
