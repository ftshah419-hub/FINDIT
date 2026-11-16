import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemService } from '../services/itemService';
import { claimService } from '../services/claimService';
import { useAuth } from '../../../context/AuthContext';

export const ItemDetailPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Claim Modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimForm, setClaimForm] = useState({ proofDescription: '', identifyingDetails: '' });
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await itemService.getItemById(itemId);
        setItem(res.data);
      } catch (err) {
        setError(err.message || 'Item not found');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError('');
    setClaimSuccess('');

    try {
      setClaimSubmitting(true);
      await claimService.submitClaim(item._id, {
        proofDescription: claimForm.proofDescription,
        identifyingDetails: claimForm.identifyingDetails,
      });
      setClaimSuccess('Claim submitted successfully! You can track custody verification under My Claims.');
      setTimeout(() => {
        setClaimModalOpen(false);
        navigate('/my-claims');
      }, 1500);
    } catch (err) {
      setClaimError(err.message || 'Failed to submit claim.');
    } finally {
      setClaimSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-4">
          sync
        </span>
        <p className="font-body-md text-on-surface-variant">Loading item profile...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-16 text-center bg-surface-container-lowest dark:bg-[#151F30] rounded-xl border border-outline-variant/30">
        <span className="material-symbols-outlined text-[48px] text-error mb-2">error</span>
        <h2 className="font-headline-sm font-bold text-on-surface dark:text-[#F8FAFC]">
          Item Not Found
        </h2>
        <p className="font-body-md text-on-surface-variant mt-1">{error}</p>
        <Link
          to="/items"
          className="mt-6 inline-block px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isOwner = user?._id && item.reportedBy?._id && user._id === item.reportedBy._id;
  const canClaim = item.type === 'FOUND' && !isOwner && item.status === 'APPROVED';

  return (
    <div className="flex flex-col w-full pb-space-2xl">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-md text-on-surface-variant dark:text-[#A8B5CA] mb-space-md">
        <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
        <Link to="/items" className="hover:text-primary transition-colors">Catalog</Link>
        <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
        <span className="text-on-surface dark:text-[#F8FAFC] font-semibold truncate max-w-xs">{item.title}</span>
      </nav>

      {/* Main Item Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left Column: Visual Gallery (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-space-md">
          {/* Main Photo Container */}
          <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-surface-container dark:bg-[#1D2A40] border border-outline-variant/30 dark:border-[#29364A] shadow-sm">
            <img
              src={
                item.images?.[activeImageIdx]?.url ||
                'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
              }
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-label-md font-bold uppercase tracking-wider shadow-md ${
                  item.type === 'FOUND' ? 'bg-[#16845B] text-white' : 'bg-[#B7791F] text-white'
                }`}
              >
                {item.type}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-code-tabular text-label-sm font-semibold">
                #{item._id.toString().slice(-4).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Gallery Thumbnails */}
          {item.images?.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {item.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIdx === i ? 'border-primary dark:border-[#4D8DFF]' : 'border-outline-variant/40 opacity-70'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Privacy Security Note */}
          <div className="p-space-md rounded-xl bg-surface-container-low dark:bg-[#151F30] border border-outline-variant/30 flex items-center gap-space-sm text-on-surface-variant dark:text-[#A8B5CA] text-xs">
            <span className="material-symbols-outlined text-[20px] text-primary dark:text-[#4D8DFF] shrink-0">
              shield
            </span>
            <span>
              All claimant evidence, contact numbers, and private serial identifiers are encrypted and protected by FINDIT Custodian Shield.
            </span>
          </div>
        </div>

        {/* Right Column: Metadata, Status & Actions (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-space-lg">
          <div className="bg-surface-container-lowest dark:bg-[#151F30] p-space-xl rounded-2xl border border-outline-variant/40 dark:border-[#29364A] shadow-sm flex flex-col gap-space-md">
            <div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant dark:text-[#A8B5CA] font-semibold uppercase tracking-wider">
                <span>{item.categoryId?.name || 'General Item'}</span>
                <span className="font-code-tabular">
                  {new Date(item.itemDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface dark:text-[#F8FAFC] font-bold mt-1">
                {item.title}
              </h1>
              {item.brand && (
                <p className="font-label-md text-primary dark:text-[#4D8DFF] font-semibold mt-0.5">
                  Brand / Model: {item.brand}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="font-label-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                Item Description
              </span>
              <p className="font-body-md text-on-surface-variant dark:text-[#A8B5CA] leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Distinctive Features */}
            {item.distinctiveFeatures && (
              <div className="p-space-md rounded-xl bg-surface-container-low dark:bg-[#1D2A40] border border-outline-variant/30">
                <span className="font-label-sm font-semibold text-primary dark:text-[#4D8DFF] uppercase tracking-wider block mb-1">
                  Distinctive Identifiers / Condition
                </span>
                <p className="font-body-sm text-on-surface dark:text-[#F8FAFC]">
                  {item.distinctiveFeatures}
                </p>
              </div>
            )}

            {/* Location & Custody Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
              <div className="p-3 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] border border-outline-variant/30">
                <div className="flex items-center gap-1.5 text-xs text-outline font-semibold uppercase">
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                  <span>{item.type === 'FOUND' ? 'Discovered At' : 'Last Seen At'}</span>
                </div>
                <p className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC] mt-1 truncate">
                  {item.location?.name}
                </p>
                <p className="font-body-sm text-xs text-on-surface-variant dark:text-[#A8B5CA]">
                  Zone: {item.location?.campusZone || 'Main Campus'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] border border-outline-variant/30">
                <div className="flex items-center gap-1.5 text-xs text-outline font-semibold uppercase">
                  <span className="material-symbols-outlined text-[16px] text-secondary">warehouse</span>
                  <span>Physical Custody</span>
                </div>
                <p className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC] mt-1 truncate">
                  {item.storageLocation || 'Campus Security Desk'}
                </p>
                <p className="font-body-sm text-xs text-on-surface-variant dark:text-[#A8B5CA]">
                  Intake: Verified Staff Node
                </p>
              </div>
            </div>

            {/* Actions Strip */}
            <div className="pt-space-md border-t border-outline-variant/30 dark:border-[#29364A] flex items-center justify-between gap-space-md flex-wrap">
              <span className="font-body-sm text-xs text-on-surface-variant dark:text-[#A8B5CA]">
                Status: <strong className="text-on-surface dark:text-[#F8FAFC]">{item.status}</strong>
              </span>

              {canClaim && (
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <span>Claim This Item</span>
                </button>
              )}

              {isOwner && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary dark:text-[#4D8DFF] font-semibold">
                    (You reported this item)
                  </span>
                  <Link
                    to="/my-reports"
                    className="px-4 py-2 rounded-lg bg-surface-container-high dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-md font-medium"
                  >
                    Manage in My Reports
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {claimModalOpen && (
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
              Filing claim for <strong className="text-on-surface dark:text-[#F8FAFC]">{item.title}</strong> (#{item._id.toString().slice(-4).toUpperCase()}). Provide specific details to enable the security custodian to verify your ownership.
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
                  placeholder="Explain how/where you lost it, contents inside, lockscreen wallpaper, or circumstances..."
                  className="w-full p-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                  Identifying Marks or Serial Numbers
                </label>
                <input
                  type="text"
                  value={claimForm.identifyingDetails}
                  onChange={(e) => setClaimForm({ ...claimForm, identifyingDetails: e.target.value })}
                  placeholder="Serial prefix, scratches, stickers, custom engraving..."
                  className="w-full h-10 px-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimSubmitting}
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-all"
                >
                  {claimSubmitting ? 'Submitting Dossier...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
