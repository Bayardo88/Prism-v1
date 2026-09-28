/** Demo data for Firm Settings (Spatical Ventures). Texts copied from the Figma frames. */

export const firmProfile = {
  street: '1474 N 2950 W',
  country: 'United States of America',
  state: 'UT',
  zip: '84043',
  phone: '8017479790',
};

export const countries = ['United States of America', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia'];

/** Firm roles, in the order the Default firm role menu lists them. */
export const firmRoles = [
  'Firm Admin', 'Analyst', 'Auditor', 'Full Access Viewer', 'Limited Viewer', 'Export Viewer', 'Document Viewer',
];

export const sso = {
  acsUrl: 'https://api.scalar.io/api/sso/acs/f785b3df-3cc4-4d9e-8f7f-6b83a7400cf3',
  entityId: 'https://api.scalar.io/api/saml/sp/121',
};

export const scim = {
  endpoint: 'https://api.scalar.io/scim/v2',
  token: 'scim_1sgLpQ7vR2mX9kT4',
  tokenCreated: '4/30/2026, 5:21:13 PM',
  mappings: [
    { group: 'Testers', role: 'Limited Viewer' },
    { group: 'Admins', role: 'Analyst' },
    { group: 'Auditors', role: 'Auditor' },
  ],
  revoked: [{ prefix: 'scim_eExe2', created: '4/30/2026, 5:00:03 PM', revoked: '4/30/2026, 5:21:13 PM' }],
};

export const tradingMarkets = [
  'New York Stock Exchange (XNYS)', 'Nasdaq (XNAS)', 'Toronto Stock Exchange (XTSE)', 'London Stock Exchange (XLON)',
  'Deutsche Börse Xetra (XETR)', 'Euronext Paris (XPAR)', 'Tokyo Stock Exchange (XTKS)',
  'Hong Kong Stock Exchange (XHKG)', 'Australian Securities Exchange (XASX)',
];

/** Scalar AI effort levels, lowest to highest. The last three use extra credits. */
export const effortLevels = ['Fastest', 'Standard', 'Balanced', 'High', 'Maximum'] as const;
export type Effort = (typeof effortLevels)[number];
export const premiumEfforts: readonly Effort[] = ['Balanced', 'High', 'Maximum'];
