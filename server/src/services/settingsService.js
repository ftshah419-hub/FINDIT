import { SystemSetting } from '../models/index.js';
import { logActivity } from './activityLogService.js';

// Default platform settings seeded if not found
const DEFAULT_SETTINGS = [
  {
    key: 'aiMatchingThreshold',
    value: 85,
    description: 'Minimum AI vector cosine similarity score required for high-priority radar alert.',
  },
  {
    key: 'claimReviewSlaHours',
    value: 24,
    description: 'Target SLA turnaround in hours for initial claim evidence inspection.',
  },
  {
    key: 'requireManualItemApproval',
    value: true,
    description: 'Whether lost & found reports require administrative approval before public display.',
  },
  {
    key: 'maxImageUploadSizeMb',
    value: 10,
    description: 'Maximum permissible image upload size in megabytes for item photos & claim evidence.',
  },
  {
    key: 'depotStorageAlertThreshold',
    value: 75,
    description: 'Depot physical capacity usage percentage that triggers custody overflow alerts.',
  },
  {
    key: 'autoNotifyOnAiMatch',
    value: true,
    description: 'Automatically dispatch advisory notification to claimant when high similarity match is detected.',
  },
];

/**
 * Fetch all platform settings (initializing defaults if empty)
 */
export const getSettings = async () => {
  let settings = await SystemSetting.find().populate('updatedBy', 'name email').sort({ key: 1 });

  if (settings.length === 0) {
    for (const def of DEFAULT_SETTINGS) {
      await SystemSetting.findOneAndUpdate({ key: def.key }, def, { upsert: true, new: true });
    }
    settings = await SystemSetting.find().populate('updatedBy', 'name email').sort({ key: 1 });
  }

  return settings;
};

/**
 * Update a setting by key
 */
export const updateSetting = async (key, { value, description }, adminUser) => {
  const setting = await SystemSetting.findOne({ key });

  if (!setting) {
    const error = new Error(`Setting with key "${key}" not found.`);
    error.statusCode = 404;
    throw error;
  }

  const prevValue = setting.value;
  setting.value = value;
  if (description) setting.description = description;
  setting.updatedBy = adminUser._id;
  await setting.save();

  await logActivity({
    actorId: adminUser._id,
    action: 'SETTING_UPDATED',
    entityType: 'SystemSetting',
    entityId: setting._id,
    description: `Administrator ${adminUser.name} updated platform setting "${key}" to ${JSON.stringify(value)}.`,
    metadata: { key, previousValue: prevValue, newValue: value },
  });

  return setting;
};

export default {
  getSettings,
  updateSetting,
};
