import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { itemService } from '../services/itemService';
import { CAMPUS_ZONES } from '../../../constants/index.js';

export const ReportFoundItemPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    discoveredLocation: '',
    campusZone: 'Central Library',
    dateFound: new Date().toISOString().split('T')[0],
    timeFound: '14:30',
    condition: 'brand_new',
    storageLocation: 'Student Union Library Desk 2',
    description: '',
    distinctiveFeatures: '',
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
    const { id, name, value, type, checked } = e.target;
    const fieldName = id || name;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: type === 'checkbox' ? checked : value,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.title || !formData.categoryId || !formData.discoveredLocation || !formData.dateFound) {
      setErrorMessage('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    try {
      setSubmitting(true);

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
        } catch (err) {
          images.push({
            url: item.preview,
            publicId: 'local_preview',
            isPrimary: images.length === 0,
          });
        }
      }

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
        description: formData.description || `Found ${formData.title} at ${formData.discoveredLocation}. Condition: ${formData.condition}. Currently stored at: ${formData.storageLocation}`,
        distinctiveFeatures: formData.distinctiveFeatures,
        type: 'FOUND',
        location: {
          name: formData.discoveredLocation,
          campusZone: formData.campusZone,
        },
        itemDate: new Date(`${formData.dateFound}T${formData.timeFound || '12:00'}:00Z`),
        approximateTime: formData.timeFound,
        condition: formData.condition,
        storageLocation: formData.storageLocation,
        images,
      };

      await itemService.createReport(payload);
      setSuccessMessage('Found item log submitted to campus custodian review!');

      setTimeout(() => {
        navigate('/my-reports');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-space-2xl">
      {/* Contextual Breadcrumb & Top Utility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant dark:text-[#A8B5CA]">
          <Link to="/" className="hover:text-primary dark:hover:text-[#4D8DFF] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-on-surface dark:text-[#F8FAFC] font-semibold">Report Found Item</span>
        </nav>
        <div className="flex items-center gap-space-sm">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high dark:bg-[#1D2A40] text-on-surface-variant dark:text-[#A8B5CA] font-label-sm text-label-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-[#4D8DFF] animate-pulse"></span>
            Campus Intake Mode: Active
          </span>
          <div className="hidden sm:flex items-center text-outline font-code-tabular text-body-sm bg-surface-container-lowest dark:bg-[#151F30] px-2 py-1 rounded shadow-sm border border-outline-variant/30">
            SEC-ID: #8841-B
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-highest dark:from-[#1D2A40] dark:via-[#151F30] dark:to-[#151F30] p-space-lg mb-space-xl shadow-sm border border-outline-variant/30 dark:border-[#29364A]">
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none text-primary dark:text-[#4D8DFF]">
          <span className="material-symbols-outlined text-[180px]">inventory_2</span>
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-[#4D8DFF] font-label-sm text-label-sm mb-space-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">format_image_left</span>
            Verified Custody Protocol
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-[#F8FAFC] tracking-tight font-bold mb-space-xs">
            Report a Found Item
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-[#A8B5CA] max-w-2xl">
            Log items discovered across campus facilities, departments, or transit loops. Structured cataloging enables rapid AI Smart Matching to reunite lost property safely.
          </p>
        </div>
      </div>

      {/* Error / Success Notifications */}
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

      {/* Intake Form Master Wrapper */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: Item Discovery Details (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Section 1: Core Physical Item Attributes */}
            <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
              <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 dark:border-[#29364A]">
                <div className="flex items-center gap-space-sm">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container-high dark:bg-[#1D2A40] text-primary dark:text-[#4D8DFF]">
                    <span className="material-symbols-outlined text-[18px]">devices</span>
                  </span>
                  <div>
                    <h2 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                      Item Characteristics
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                      General visible metadata used for owner matching
                    </p>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container dark:bg-[#1D2A40] text-on-surface-variant dark:text-[#A8B5CA]">
                  Part 1 of 3
                </span>
              </div>

              {/* Item Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="font-label-lg text-label-lg text-on-surface dark:text-[#F8FAFC] font-semibold flex items-center justify-between">
                  <span>
                    Item Title or Name <span className="text-error">*</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">Distinct, concise label</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Wireless Over-Ear Headphones (Silver)"
                  className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Category Selection */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="categoryId" className="font-label-lg text-label-lg text-on-surface dark:text-[#F8FAFC] font-semibold">
                  Category Classification <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3.5 pr-10 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">
                    unfold_more
                  </span>
                </div>
              </div>

              {/* Discovered Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="discoveredLocation" className="font-label-lg text-label-lg text-on-surface dark:text-[#F8FAFC] font-semibold">
                    Discovered Location <span className="text-error">*</span>
                  </label>
                  <input
                    id="discoveredLocation"
                    type="text"
                    required
                    value={formData.discoveredLocation}
                    onChange={handleInputChange}
                    placeholder="e.g., Table 14 near window, Student Cafeteria"
                    className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="campusZone" className="font-label-lg text-label-lg text-on-surface dark:text-[#F8FAFC] font-semibold">
                    Campus Zone <span className="text-error">*</span>
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

              {/* Date & Time Found */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dateFound" className="font-label-lg text-label-lg text-on-surface dark:text-[#F8FAFC] font-semibold">
                    Date Discovered <span className="text-error">*</span>
                  </label>
                  <input
                    id="dateFound"
                    type="date"
                    required
                    value={formData.dateFound}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="timeFound" className="font-label-lg text-label-lg text-on-surface dark:text-[#F8FAFC] font-semibold">
                    Approximate Time
                  </label>
                  <input
                    id="timeFound"
                    type="time"
                    value={formData.timeFound}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Condition & Physical State */}
            <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
              <div className="flex items-center gap-space-sm pb-space-xs border-b border-outline-variant/20 dark:border-[#29364A]">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container-high dark:bg-[#1D2A40] text-primary dark:text-[#4D8DFF]">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </span>
                <div>
                  <h2 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                    Physical Condition
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                    Accurate condition scoring speeds up claimant identification
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                {[
                  { value: 'brand_new', label: 'Like New', sub: 'No wear', icon: 'verified' },
                  { value: 'good', label: 'Good', sub: 'Light use', icon: 'check_circle' },
                  { value: 'worn', label: 'Scratched', sub: 'Visible wear', icon: 'report' },
                  { value: 'damaged', label: 'Damaged', sub: 'Broken parts', icon: 'broken_image' },
                ].map((pill) => (
                  <label
                    key={pill.value}
                    onClick={() => setFormData((prev) => ({ ...prev, condition: pill.value }))}
                    className={`group relative flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all border text-center ${
                      formData.condition === pill.value
                        ? 'bg-primary-container text-on-primary border-primary font-semibold shadow-md'
                        : 'bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border-outline-variant/30 hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] mb-1">
                      {pill.icon}
                    </span>
                    <span className="font-label-md text-label-md">{pill.label}</span>
                    <span className="font-label-sm text-label-sm opacity-80">{pill.sub}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 3: Where is the item stored now? */}
            <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
              <div className="flex items-center gap-space-sm pb-space-xs border-b border-outline-variant/20 dark:border-[#29364A]">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container-high dark:bg-[#1D2A40] text-primary dark:text-[#4D8DFF]">
                  <span className="material-symbols-outlined text-[18px]">warehouse</span>
                </span>
                <div>
                  <h2 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                    Where is the item stored now?
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
                    Clarifies pickup dispatch location for claimant verification
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-space-xs">
                {[
                  {
                    title: 'Student Union Library Desk 2 (Recommended)',
                    desc: 'Handed over to central verified custody for secure intake',
                    val: 'Student Union Library Desk 2',
                  },
                  {
                    title: 'Department Security Desk Safe',
                    desc: 'Stored at building entrance or faculty administration safe',
                    val: 'Department Security Desk Safe',
                  },
                  {
                    title: 'Finder Personal Custody',
                    desc: 'Will coordinate handover when claimant identity is verified',
                    val: 'Finder Personal Custody',
                  },
                ].map((opt) => (
                  <label
                    key={opt.val}
                    onClick={() => setFormData((prev) => ({ ...prev, storageLocation: opt.val }))}
                    className={`flex items-start gap-space-md p-space-md rounded-xl transition-colors cursor-pointer border ${
                      formData.storageLocation === opt.val
                        ? 'bg-primary-fixed/40 dark:bg-primary/20 border-primary text-on-surface dark:text-[#F8FAFC]'
                        : 'bg-surface-container-low dark:bg-[#1D2A40] border-outline-variant/30 hover:bg-surface-container text-on-surface dark:text-[#F8FAFC]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="storageLocation"
                      checked={formData.storageLocation === opt.val}
                      onChange={() => {}}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <p className="font-label-md font-semibold">{opt.title}</p>
                      <p className="font-body-sm text-on-surface-variant dark:text-[#A8B5CA]">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Media & Additional Notes (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Visual Confirmation Photo Upload */}
            <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
              <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 dark:border-[#29364A]">
                <div className="flex items-center gap-space-sm">
                  <span className="w-7 h-7 rounded-lg bg-surface-container-high dark:bg-[#1D2A40] flex items-center justify-center font-label-md text-label-md text-primary dark:text-[#4D8DFF] font-bold">
                    📸
                  </span>
                  <h2 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                    Photographic Proof
                  </h2>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA] font-medium">
                  Multi-photo
                </span>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="relative rounded-xl p-space-lg text-center cursor-pointer transition-all bg-surface-container-low dark:bg-[#1D2A40] hover:bg-surface-container border-2 border-dashed border-outline-variant dark:border-[#29364A] flex flex-col items-center justify-center min-h-[170px]"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-[#4D8DFF] flex items-center justify-center mb-space-sm">
                  <span className="material-symbols-outlined text-[26px]">add_a_photo</span>
                </div>
                <p className="font-label-lg text-label-lg text-on-surface dark:text-[#F8FAFC] font-semibold mb-0.5">
                  Upload item snapshots
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA] max-w-xs">
                  Photos showing front, back, or distinctive markings
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
                  className="mt-space-md px-space-md py-1.5 rounded-lg bg-surface-container-lowest dark:bg-[#151F30] shadow-sm text-primary dark:text-[#4D8DFF] font-label-md text-label-md font-semibold border border-outline-variant/30"
                >
                  Select Photos
                </button>
              </div>

              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-space-md p-space-sm rounded-lg bg-surface-container-low dark:bg-[#1D2A40] border border-outline-variant/30"
                >
                  <img src={file.preview} alt={file.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] truncate">
                      {file.name}
                    </p>
                    <p className="font-body-sm text-xs text-on-surface-variant dark:text-[#A8B5CA]">{file.size}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-1 rounded text-on-surface-variant hover:text-error"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Distinctive Marks & Serial */}
            <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
              <h2 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold">
                Distinctive Marks & Additional Notes
              </h2>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="distinctiveFeatures" className="font-label-md text-on-surface dark:text-[#F8FAFC]">
                  Identifying Details / Markings
                </label>
                <textarea
                  id="distinctiveFeatures"
                  rows="3"
                  value={formData.distinctiveFeatures}
                  onChange={handleInputChange}
                  placeholder="Sticker on bottom, scuffs, keychain initials, or case color"
                  className="p-3 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-body-md text-body-md border border-outline-variant/40 dark:border-[#29364A] placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* BOTTOM ACTION BAR (12 cols) */}
          <div className="lg:col-span-12 mt-space-md">
            <div className="bg-surface-container-lowest dark:bg-[#151F30] rounded-xl p-space-md shadow-md flex flex-col sm:flex-row items-center justify-between gap-space-md border border-outline-variant/40 dark:border-[#29364A]">
              <div className="flex items-center gap-space-sm text-on-surface-variant dark:text-[#A8B5CA]">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="font-body-sm text-body-sm">
                  Submissions enter administrative intake moderation before public listing
                </span>
              </div>
              <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/my-reports')}
                  className="px-space-md py-2 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all shadow-md flex items-center gap-space-xs font-semibold cursor-pointer disabled:opacity-75"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      <span>Recording Intake...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Found Item Report</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
