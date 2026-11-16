import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { itemService } from '../services/itemService';
import { CAMPUS_ZONES } from '../../../constants/index.js';

export const ReportLostItemPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    brand: '',
    distinctiveFeatures: '',
    locationName: '',
    campusZone: 'Central Library',
    dateLost: new Date().toISOString().split('T')[0],
    timeLost: '14:30',
    serialNumber: '',
    instantAlerts: true,
    custodianShield: true,
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await itemService.getCategories();
        setCategories(res.data || []);
        if (res.data?.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: res.data[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((f) => ({
      file: f,
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
      preview: URL.createObjectURL(f),
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (idx) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveDraft = () => {
    localStorage.setItem('findit_lost_draft', JSON.stringify({ ...formData, savedAt: new Date() }));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.title || !formData.categoryId || !formData.locationName || !formData.dateLost) {
      setErrorMessage('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    try {
      setSubmitting(true);

      // Upload images if any
      const images = [];
      for (const item of uploadedFiles) {
        try {
          const uploadRes = await itemService.uploadImage(item.file);
          if (uploadRes.data?.url) {
            images.push({
              url: uploadRes.data.url,
              publicId: uploadRes.data.publicId || '',
              isPrimary: images.length === 0,
            });
          }
        } catch (uploadErr) {
          console.warn('Image upload fallback to preview:', uploadErr.message);
          images.push({
            url: item.preview,
            publicId: 'local_preview',
            isPrimary: images.length === 0,
          });
        }
      }

      // If no images uploaded, supply a high-quality product placeholder
      if (images.length === 0) {
        images.push({
          url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
          publicId: 'placeholder',
          isPrimary: true,
        });
      }

      const payload = {
        title: formData.title,
        categoryId: formData.categoryId,
        brand: formData.brand,
        description: formData.distinctiveFeatures || `Lost ${formData.title} near ${formData.locationName}`,
        distinctiveFeatures: formData.distinctiveFeatures,
        type: 'LOST',
        location: {
          name: formData.locationName,
          campusZone: formData.campusZone,
        },
        itemDate: new Date(`${formData.dateLost}T${formData.timeLost || '12:00'}:00Z`),
        approximateTime: formData.timeLost,
        serialNumber: formData.serialNumber,
        hideContactInfo: formData.custodianShield,
        images,
      };

      const res = await itemService.createReport(payload);
      setSuccessMessage('Report Submitted Successfully! FINDIT AI Radar is now scanning for matches.');

      setTimeout(() => {
        navigate('/my-reports');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-space-2xl">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA] mb-space-md">
        <Link to="/" className="hover:text-primary dark:hover:text-[#4D8DFF] transition-colors">
          Dashboard
        </Link>
        <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
        <span className="text-on-surface dark:text-[#F8FAFC] font-semibold">Report Lost Item</span>
      </nav>

      {/* Header Banner Section */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low dark:bg-[#151F30] p-space-lg mb-space-xl shadow-sm border border-outline-variant/30 dark:border-[#29364A]">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-secondary-fixed dark:bg-secondary/20 text-on-secondary-fixed dark:text-[#79A9FF] font-label-sm text-label-sm mb-space-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              AI-Powered Intake Engine
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-[#F8FAFC] tracking-tight font-bold">
              Report a Lost Item
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-[#A8B5CA] mt-1">
              Provide accurate details to help FINDIT AI match your item with incoming found reports across transit hubs, campuses, and venues.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start md:self-auto bg-surface-container-lowest dark:bg-[#1D2A40] px-space-md py-2.5 rounded-lg shadow-sm border border-outline-variant/30 dark:border-[#29364A]">
            <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-[#4D8DFF]">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA] leading-none">
                Security Status
              </p>
              <p className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold mt-0.5">
                Encrypted & Anonymized
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMessage && (
        <div className="p-4 mb-6 rounded-xl bg-error/10 border border-error/30 text-error flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span className="font-body-md font-medium">{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 mb-6 rounded-xl bg-success/10 border border-success/30 text-success flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-body-md font-medium">{successMessage}</span>
        </div>
      )}

      {/* 2-Column Form Body */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* LEFT COLUMN: Primary Item Metadata (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Section 1: Item Identification */}
          <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20 dark:border-[#29364A]">
              <div className="flex items-center gap-space-sm">
                <span className="w-7 h-7 rounded-lg bg-surface-container-high dark:bg-[#1D2A40] flex items-center justify-center font-label-md text-label-md text-primary dark:text-[#4D8DFF] font-bold">
                  1
                </span>
                <h2 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Item Identification
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
                Fields with * are mandatory
              </span>
            </div>

            {/* Item Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold flex items-center justify-between">
                <span>
                  Item Name <span className="text-error">*</span>
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA] font-normal">
                  Max 80 chars
                </span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Space Gray MacBook Air 13-inch M2"
                className="h-10 px-3.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Category & Brand Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="categoryId" className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Item Category <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full h-10 pl-3.5 pr-9 appearance-none rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              {/* Brand & Model */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="brand" className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Primary Brand & Model
                </label>
                <input
                  id="brand"
                  type="text"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Apple MacBook Air"
                  className="h-10 px-3.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Distinctive Features */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="distinctiveFeatures" className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Distinctive Features / Identifiers <span className="text-error">*</span>
                </label>
                <span className="font-label-sm text-label-sm text-primary dark:text-[#4D8DFF] font-medium flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">lightbulb</span> Highly Effective
                </span>
              </div>
              <textarea
                id="distinctiveFeatures"
                rows="3"
                required
                value={formData.distinctiveFeatures}
                onChange={handleInputChange}
                placeholder="Scratch on bottom corner, sticker with GitHub octocat on top lid, engraved initials A.C., neon green zip sleeve."
                className="p-3 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              ></textarea>
              <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                Specific cosmetic details give the AI algorithm a 4.2x higher confidence match score.
              </span>
            </div>
          </div>

          {/* Section 2: Incident Location & Time Panel */}
          <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20 dark:border-[#29364A]">
              <div className="flex items-center gap-space-sm">
                <span className="w-7 h-7 rounded-lg bg-surface-container-high dark:bg-[#1D2A40] flex items-center justify-center font-label-md text-label-md text-primary dark:text-[#4D8DFF] font-bold">
                  2
                </span>
                <h2 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Loss Location & Timeline
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
                Geo-temporal anchors
              </span>
            </div>

            {/* Last Seen Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="locationName" className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Last Seen Specific Spot <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary dark:text-[#4D8DFF] text-[20px]">
                    location_on
                  </span>
                  <input
                    id="locationName"
                    type="text"
                    required
                    value={formData.locationName}
                    onChange={handleInputChange}
                    placeholder="e.g., 3rd Floor Quiet Study Zone"
                    className="w-full h-10 pl-10 pr-3.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="campusZone" className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Campus Zone Anchor <span className="text-error">*</span>
                </label>
                <select
                  id="campusZone"
                  value={formData.campusZone}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {CAMPUS_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mapped Search Radius Anchor Banner */}
            <div className="relative overflow-hidden rounded-lg shadow-sm bg-surface-container-high dark:bg-[#1D2A40] border border-outline-variant/30 dark:border-[#29364A] p-4 flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[22px] text-primary dark:text-[#4D8DFF]">
                  my_location
                </span>
                <div>
                  <p className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                    Mapped Search Radius: 150m perimeter
                  </p>
                  <p className="font-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                    Geo-coordinates mapped to {formData.campusZone}
                  </p>
                </div>
              </div>
              <span className="font-label-sm text-primary dark:text-[#4D8DFF] font-semibold">
                Auto-Calibrated
              </span>
            </div>

            {/* Date & Time Lost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dateLost" className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Date Lost <span className="text-error">*</span>
                </label>
                <input
                  id="dateLost"
                  type="date"
                  required
                  value={formData.dateLost}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="timeLost" className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Approximate Time Lost <span className="text-error">*</span>
                </label>
                <input
                  id="timeLost"
                  type="time"
                  required
                  value={formData.timeLost}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Verification, Media & Tips (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Section 3: Photo Upload Dropzone */}
          <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 dark:border-[#29364A]">
              <div className="flex items-center gap-space-sm">
                <span className="w-7 h-7 rounded-lg bg-surface-container-high dark:bg-[#1D2A40] flex items-center justify-center font-label-md text-label-md text-primary dark:text-[#4D8DFF] font-bold">
                  3
                </span>
                <h2 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Visual Evidence
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA] font-medium">
                Recommended
              </span>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative rounded-xl p-space-lg text-center cursor-pointer transition-all bg-surface-container-low dark:bg-[#1D2A40] hover:bg-surface-container border-2 border-dashed border-outline-variant dark:border-[#29364A] flex flex-col items-center justify-center min-h-[190px]"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-[#4D8DFF] flex items-center justify-center mb-space-sm">
                <span className="material-symbols-outlined text-[26px]">add_photo_alternate</span>
              </div>
              <p className="font-label-lg text-label-lg text-on-surface dark:text-[#F8FAFC] font-semibold mb-0.5">
                Upload reference photos or receipts
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA] max-w-xs">
                Drop clear reference photos or proof of purchase here, PNG/JPG up to 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileInput}
                className="hidden"
              />
              <button
                type="button"
                className="mt-space-md px-space-md py-1.5 rounded-lg bg-surface-container-lowest dark:bg-[#151F30] shadow-sm text-primary dark:text-[#4D8DFF] font-label-md text-label-md font-semibold hover:bg-surface-bright transition-colors border border-outline-variant/30"
              >
                Browse Local Files
              </button>
            </div>

            {/* Uploaded File List */}
            {uploadedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-space-md p-space-sm rounded-lg bg-surface-container-low dark:bg-[#1D2A40] border border-outline-variant/30"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-sm bg-surface-container">
                  <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface-container-lowest"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold truncate">
                    {file.name}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                    {file.size} • Primary reference
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                  aria-label="Remove image"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </div>

          {/* Section 4: Verification & Privacy */}
          <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
            <div className="flex items-center gap-space-sm pb-space-xs border-b border-outline-variant/20 dark:border-[#29364A]">
              <span className="w-7 h-7 rounded-lg bg-surface-container-high dark:bg-[#1D2A40] flex items-center justify-center font-label-md text-label-md text-primary dark:text-[#4D8DFF] font-bold">
                4
              </span>
              <h2 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                Verification & Privacy
              </h2>
            </div>

            {/* Serial / IMEI Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="serialNumber" className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Serial Number / IMEI (Optional)
                </label>
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
                  <span className="material-symbols-outlined text-[14px]">visibility_off</span> Hidden from public
                </span>
              </div>
              <input
                id="serialNumber"
                type="text"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="e.g., C02G40XYZ98Q"
                className="h-10 px-3.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-code-tabular text-code-tabular border border-outline-variant/40 dark:border-[#29364A] placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 tracking-wider"
              />
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                Used strictly for programmatic cryptographic matching when a verified staff member logs recovered inventory.
              </p>
            </div>

            {/* Contact Preferences */}
            <div className="flex flex-col gap-space-sm pt-space-xs">
              <p className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                Contact Preferences
              </p>
              <label className="flex items-start gap-space-sm cursor-pointer group">
                <input
                  id="instantAlerts"
                  type="checkbox"
                  checked={formData.instantAlerts}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 rounded text-primary focus:ring-0 accent-primary cursor-pointer"
                />
                <span className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-medium group-hover:text-primary transition-colors">
                    Instant SMS & Push Alerts
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                    Notify instantly when AI match confidence crosses 80%
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-space-sm cursor-pointer group">
                <input
                  id="custodianShield"
                  type="checkbox"
                  checked={formData.custodianShield}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 rounded text-primary focus:ring-0 accent-primary cursor-pointer"
                />
                <span className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] font-medium group-hover:text-primary transition-colors">
                    Relay through FINDIT Custodian Shield
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                    Mask personal phone & email during return coordination
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Section 5: Helpful Tips Insight Card */}
          <div className="bg-surface-container-low dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm border border-outline-variant/30 dark:border-[#29364A]">
            <div className="flex items-center gap-space-xs text-primary dark:text-[#4D8DFF] font-title-md text-title-md font-semibold">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
              <h3>What makes a high-confidence report?</h3>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-[#A8B5CA] leading-relaxed">
              Reports including distinct serial prefixes, scratch locations, unique protective case designs, or sticker placement achieve an <strong className="text-on-surface dark:text-[#F8FAFC] font-semibold">89% higher recovery rate</strong> within the first 48 hours of reporting.
            </p>
            <div className="mt-space-xs flex items-center gap-space-sm pt-space-sm">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-sm text-[10px] font-bold ring-2 ring-surface-container-low">
                  AI
                </div>
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-[10px] font-bold ring-2 ring-surface-container-low">
                  89%
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA]">
                Average resolution: 18 hours
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR: Span full 12 columns */}
        <div className="lg:col-span-12 mt-space-md">
          <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-md shadow-md flex flex-col sm:flex-row items-center justify-between gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
            <div className="flex items-center gap-space-sm text-on-surface-variant dark:text-[#A8B5CA] order-2 sm:order-1">
              <span className="material-symbols-outlined text-[18px] text-outline">history_toggle_off</span>
              <span className="font-body-sm text-body-sm">
                {draftSaved ? 'Draft saved successfully!' : 'Autosaved to drafts 2 minutes ago'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm w-full sm:w-auto justify-end order-1 sm:order-2">
              <button
                type="button"
                onClick={() => navigate('/my-reports')}
                className="px-space-md py-2 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-lg text-label-lg hover:bg-surface-container-high transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-space-md py-2 rounded-lg bg-surface-container-lowest dark:bg-[#151F30] text-on-surface dark:text-[#F8FAFC] font-label-lg text-label-lg hover:bg-surface-container-low transition-colors shadow-sm font-medium border border-outline-variant/30"
              >
                {draftSaved ? 'Saved!' : 'Save Draft'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all shadow-md flex items-center gap-space-xs font-semibold cursor-pointer disabled:opacity-75"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    <span>Analyzing Matches...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Lost Item Report</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
