import type { ScreenDef } from '../../types.js';
import { routes } from '../../routes.js';
import { AuditLogs } from './AuditLogs.js';

/** Screens from this Figma page. */
export const screens: ScreenDef[] = [
  {
    id: 'admin.audit-logs',
    title: 'Audit Logs',
    figmaPage: '15 · Audit Logs',
    route: routes.admin.auditLogs,
    summary: 'Review who changed what, and when, across the firm — filtered by business unit, date range and product.',
    component: AuditLogs,
    states: [
      { key: 'default', label: 'Audit Logs — Log table', figmaNode: '19:47076', section: 'Audit Logs' },
    ],
  },
];
