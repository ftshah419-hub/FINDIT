import React, { useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../services/userService';
import { itemService } from '../services/itemService';

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Alex Chen',
    phone: user?.phone || '+1 (555) 234-5678',
  });
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const uploadRes = await itemService.uploadImage(file);
        if (uploadRes.data?.url) {
          setProfileImage(uploadRes.data.url);
          await userService.updateProfile({ profileImage: uploadRes.data.url });
          updateUser({ profileImage: uploadRes.data.url });
          setProfileSuccess('Profile picture updated successfully!');
          setTimeout(() => setProfileSuccess(''), 3000);
        }
      } catch (err) {
        setProfileError('Failed to upload image. Please try another file.');
      }
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    try {
      setUpdatingProfile(true);
      const res = await userService.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        profileImage,
      });
      if (res.data) {
        updateUser(res.data);
        setProfileSuccess('Profile information saved successfully!');
        setTimeout(() => setProfileSuccess(''), 3000);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    try {
      setUpdatingPassword(true);
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Check your current password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-space-xl pb-space-2xl">
      {/* Profile Header */}
      <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/30 dark:border-[#29364A]">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-[#F8FAFC]">
            Account & Profile Settings
          </h1>
          <p className="font-body-md text-on-surface-variant dark:text-[#A8B5CA] mt-1">
            Manage your verified identity, emergency contact number, and login credentials.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error font-label-md font-semibold transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-xl">
        {/* Left Column: Avatar & Overview (4 Cols) */}
        <div className="md:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest dark:bg-[#151F30] p-space-lg rounded-2xl border border-outline-variant/40 dark:border-[#29364A] shadow-sm flex flex-col items-center text-center">
            {/* Avatar with Upload Badge */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-primary/10 mb-4 group ring-4 ring-primary/20">
              <img
                src={profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                <span className="text-[11px] font-semibold mt-1">Change</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <h3 className="font-title-md font-bold text-on-surface dark:text-[#F8FAFC]">
              {user?.name || 'Alex Chen'}
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant dark:text-[#A8B5CA] mt-0.5">
              {user?.email || 'alex.chen@campus.edu'}
            </p>

            <div className="mt-4 px-3 py-1 rounded-full bg-secondary-fixed/50 dark:bg-secondary/20 text-on-secondary-fixed dark:text-[#79A9FF] text-xs font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>Identity Level 3 Verified</span>
            </div>

            <div className="w-full border-t border-outline-variant/20 dark:border-[#29364A] mt-6 pt-4 text-left space-y-2">
              <div className="flex justify-between text-xs text-on-surface-variant dark:text-[#A8B5CA]">
                <span>Role:</span>
                <span className="font-semibold text-on-surface dark:text-[#F8FAFC]">{user?.role || 'USER'}</span>
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant dark:text-[#A8B5CA]">
                <span>Campus Network:</span>
                <span className="font-semibold text-success">Active Connected</span>
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant dark:text-[#A8B5CA]">
                <span>Custodian Shield:</span>
                <span className="font-semibold text-primary dark:text-[#4D8DFF]">Protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms (8 Cols) */}
        <div className="md:col-span-8 flex flex-col gap-space-xl">
          {/* Profile Form */}
          <div className="bg-surface-container-lowest dark:bg-[#151F30] p-space-xl rounded-2xl border border-outline-variant/40 dark:border-[#29364A] shadow-sm">
            <h2 className="font-title-md font-bold text-on-surface dark:text-[#F8FAFC] mb-4 pb-2 border-b border-outline-variant/20">
              Personal Information
            </h2>

            {profileSuccess && (
              <p className="p-3 mb-4 rounded-lg bg-success/10 text-success text-sm font-medium">{profileSuccess}</p>
            )}
            {profileError && (
              <p className="p-3 mb-4 rounded-lg bg-error/10 text-error text-sm font-medium">{profileError}</p>
            )}

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full h-10 px-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30"
                  />
                </div>

                <div>
                  <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-10 px-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                  Institutional Email (Read Only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'alex.chen@campus.edu'}
                  className="w-full h-10 px-3 mt-1 rounded-lg bg-surface-container dark:bg-[#1D2A40] text-on-surface-variant dark:text-[#A8B5CA] opacity-75 cursor-not-allowed border border-outline-variant/30"
                />
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-all"
                >
                  {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Security Form */}
          <div className="bg-surface-container-lowest dark:bg-[#151F30] p-space-xl rounded-2xl border border-outline-variant/40 dark:border-[#29364A] shadow-sm">
            <h2 className="font-title-md font-bold text-on-surface dark:text-[#F8FAFC] mb-4 pb-2 border-b border-outline-variant/20">
              Security & Password
            </h2>

            {passwordSuccess && (
              <p className="p-3 mb-4 rounded-lg bg-success/10 text-success text-sm font-medium">{passwordSuccess}</p>
            )}
            {passwordError && (
              <p className="p-3 mb-4 rounded-lg bg-error/10 text-error text-sm font-medium">{passwordError}</p>
            )}

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full h-10 px-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full h-10 px-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30"
                  />
                </div>

                <div>
                  <label className="font-label-md font-semibold text-on-surface dark:text-[#F8FAFC]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full h-10 px-3 mt-1 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] border border-outline-variant/30"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-all"
                >
                  {updatingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
