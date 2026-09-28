import { db, user } from '../../data/fixtures.js';

export type Role = 'Firm Admin' | 'Analyst' | 'Auditor' | 'Company User';
export const ROLES: Role[] = ['Firm Admin', 'Analyst', 'Auditor', 'Company User'];

export interface FirmUser {
  email: string;
  name: string;
  initials: string;
  role: Role;
  /** Table value ("06/01/2026" or "Has not logged in yet"). */
  lastLogin: string;
  /** Long form for the profile header. */
  lastLoginLong?: string;
}

export const users: FirmUser[] = [
  { email: 'scalar@spatical.com', name: 'scalar@spatical.com', initials: 'SC', role: 'Analyst', lastLogin: '06/01/2026', lastLoginLong: 'Monday, June 1, 2026' },
  { email: 'test.steven@spatical.com', name: 'Steven Test', initials: 'ST', role: 'Analyst', lastLogin: '08/15/2022', lastLoginLong: 'Monday, August 15, 2022' },
  { email: 'gabriel.canepa@scalar.io', name: 'Gabriel Canepa', initials: 'GC', role: 'Firm Admin', lastLogin: '09/21/2026', lastLoginLong: 'Monday, September 21, 2026' },
  { email: 'testingtheinviteagain@spatical.com', name: 'testingtheinviteagain@spatical.com', initials: 'TI', role: 'Analyst', lastLogin: 'Has not logged in yet' },
  { email: 'steven.hansen@scalar.io', name: 'Steven Hansen', initials: 'SH', role: 'Firm Admin', lastLogin: '09/21/2026', lastLoginLong: 'Monday, September 21, 2026' },
  { email: 'auditor@spatical.com', name: 'Auditor', initials: 'AU', role: 'Auditor', lastLogin: '04/09/2025', lastLoginLong: 'Wednesday, April 9, 2025' },
  { email: user.email, name: user.name, initials: user.initials, role: 'Firm Admin', lastLogin: '09/22/2026', lastLoginLong: 'Tuesday, September 22, 2026' },
];

/** Permission matrix rows: every fund and every portfolio company, from the db. */
export const funds = db.funds.all().map((f) => f.name);
export const permissionCompanies = db.companies.all().map((c) => c.name);
