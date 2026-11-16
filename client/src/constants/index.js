export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

export const ITEM_TYPES = {
  LOST: 'LOST',
  FOUND: 'FOUND',
};

export const ITEM_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RESOLVED: 'RESOLVED',
};

export const CLAIM_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
};

export const NOTIFICATION_TYPES = {
  REPORT_SUBMITTED: 'REPORT_SUBMITTED',
  REPORT_APPROVED: 'REPORT_APPROVED',
  REPORT_REJECTED: 'REPORT_REJECTED',
  CLAIM_SUBMITTED: 'CLAIM_SUBMITTED',
  CLAIM_APPROVED: 'CLAIM_APPROVED',
  CLAIM_REJECTED: 'CLAIM_REJECTED',
  AI_MATCH_FOUND: 'AI_MATCH_FOUND',
  SYSTEM: 'SYSTEM',
};

export const DEFAULT_CATEGORIES = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Keys & Access Cards', slug: 'keys' },
  { name: 'Bags & Luggage', slug: 'bags' },
  { name: 'Jewelry & Watches', slug: 'jewelry' },
  { name: 'Wallets & Money', slug: 'wallets' },
  { name: 'Documents & IDs', slug: 'documents' },
  { name: 'Clothing & Apparel', slug: 'clothing' },
  { name: 'Books & Supplies', slug: 'books' },
  { name: 'Other Personal Item', slug: 'other' },
];

export const CAMPUS_ZONES = [
  'Central Library',
  'Engineering Hall',
  'Student Union / Cafeteria',
  'Tech Quad Lawn',
  'Recreation Gym Courts',
  'Science Complex',
  'North Transit Hub',
  'Administration Building',
];
