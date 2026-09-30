import type { ScreenDef } from '../../../types.js';
import { routes } from '../../../routes.js';
import { Reports } from './Reports.js';

/** Prototype — the Reports area in the Primary Menu, drawn only in the New Navigation file. */
export const screens: ScreenDef[] = [
  {
    id: 'prototype.reports',
    title: 'Reports (prototype)',
    figmaPage: 'Prototype · reports',
    route: routes.reports,
    summary: 'Request a report from the Scalar team or create one from the portfolio data.',
    component: Reports,
    states: [
      { key: 'default', label: 'Reports — default', figmaNode: 'proto:reports:1', section: 'Prototype' },
    ],
  },
];
