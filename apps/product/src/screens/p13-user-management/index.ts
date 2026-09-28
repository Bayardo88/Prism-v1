import type { ScreenDef } from '../../types.js';
import { routes } from '../../routes.js';
import { UserManagement } from './UserManagement.js';

/** Screens from this Figma page. */
export const screens: ScreenDef[] = [
  {
    id: 'admin.users',
    title: 'User Management',
    figmaPage: '13 · User Management',
    route: routes.admin.users,
    summary: 'Pick a firm user to review their role and Edit/View access per fund and company, or invite and remove users.',
    component: UserManagement,
    states: [
      { key: 'default', label: 'User Management — Firm Admin detail', figmaNode: '19:19113', section: 'User Management' },
      { key: 'analyst-row-actions', label: 'User Management — Analyst selected, row actions', figmaNode: '19:28790', section: 'User Management' },
    ],
  },
];
