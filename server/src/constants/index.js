const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

const ITEM_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RESOLVED: 'RESOLVED',
};

const ITEM_TYPES = {
  LOST: 'LOST',
  FOUND: 'FOUND',
};

const CLAIM_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
};

const AI_MATCH_STATUS = {
  PENDING: 'PENDING',
  REVIEWED: 'REVIEWED',
  DISMISSED: 'DISMISSED',
  CONFIRMED: 'CONFIRMED',
};

const REPORT_STATUS = {
  PENDING: 'PENDING',
  REVIEWED: 'REVIEWED',
  DISMISSED: 'DISMISSED',
  RESOLVED: 'RESOLVED',
};

const CAMPUS_DEPOTS = [
  { id: 'central-library', name: 'Central Library (Main Vault)', capacity: '38%' },
  { id: 'tech-center', name: 'Science & Tech Center Desk', capacity: '26%' },
  { id: 'athletics-complex', name: 'Athletics & Recreation Hub', capacity: '21%' },
  { id: 'student-union', name: 'Student Union Welcome Center', capacity: '15%' },
];

module.exports = {
  ROLES,
  ITEM_STATUS,
  ITEM_TYPES,
  CLAIM_STATUS,
  AI_MATCH_STATUS,
  REPORT_STATUS,
  CAMPUS_DEPOTS,
};
