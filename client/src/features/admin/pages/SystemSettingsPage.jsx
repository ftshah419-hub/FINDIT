import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const SystemSettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSettings();
      setSettings(res);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key, newValue, description) => {
    try {
      setSavingKey(key);
      await adminService.updateSetting(key, { value: newValue, description });
      setSuccessMsg(`Setting "${key}" updated successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchSettings();
    } catch (err) {
      alert(err.message || 'Failed to update setting.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header Block */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="font-code-tabular text-[11px] uppercase tracking-widest text-primary font-semibold bg-primary/10 px-2.5 py-0.5 rounded-full">
            System Configuration
          </span>
          <span className="text-xs text-on-surface-variant font-code-tabular">
            Global Environment Controls
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          System Settings &amp; Policies
        </h1>
        <p className="text-sm text-on-surface-variant max-w-2xl">
          Configure real-time vector matching sensitivity, service level agreements (SLAs), upload thresholds, and custody rules.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading system configuration..." />
      ) : (
        <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20 divide-y divide-surface-container/60 dark:divide-outline/10 overflow-hidden">
          {settings.map((setting) => (
            <div key={setting._id || setting.key} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1 max-w-xl">
                <span className="font-code-tabular font-bold text-primary text-xs uppercase">
                  {setting.key}
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {setting.description || 'Configurable operational threshold.'}
                </p>
                {setting.updatedBy && (
                  <span className="text-[10px] text-on-surface-variant">
                    Last modified by: {setting.updatedBy.name || 'Admin'}
                  </span>
                )}
              </div>

              {/* Control input based on type */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {typeof setting.value === 'boolean' ? (
                  <button
                    disabled={savingKey === setting.key}
                    onClick={() => handleUpdate(setting.key, !setting.value, setting.description)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      setting.value
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {savingKey === setting.key ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : setting.value ? (
                      'ENABLED'
                    ) : (
                      'DISABLED'
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={setting.value}
                      id={`input-${setting.key}`}
                      className="w-24 h-9 px-3 rounded-lg border border-outline-variant/40 dark:border-outline/30 bg-surface-container-low dark:bg-surface text-xs text-on-surface font-code-tabular font-bold outline-none focus:ring-2 focus:ring-primary/20 text-center"
                    />
                    <button
                      disabled={savingKey === setting.key}
                      onClick={() => {
                        const val = document.getElementById(`input-${setting.key}`).value;
                        handleUpdate(setting.key, parseFloat(val), setting.description);
                      }}
                      className="h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
                    >
                      {savingKey === setting.key ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SystemSettingsPage;
