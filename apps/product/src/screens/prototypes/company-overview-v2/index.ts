import type { ScreenDef } from '../../../types.js';
import { CompanyOverviewV2 } from './CompanyOverviewV2.js';

/** Prototype — Company Overview with provider-driven ZX stats, Public Comps and Board Presentations. */
export const screens: ScreenDef[] = [
  {
    id: 'prototype.company-overview-v2',
    title: 'Company Overview v2 (prototype)',
    figmaPage: 'Prototype · company-overview-v2',
    route: '/prototypes/company-overview-v2/:companyId',
    summary: 'Compare secondary-market index providers, public comps and the latest board deck for a company in one Overview page.',
    component: CompanyOverviewV2,
    states: [
      { key: 'default', label: 'Overview v2 — default', figmaNode: 'proto:company-overview-v2:1', section: 'Prototype' },
      { key: 'board-short', label: 'Overview v2 — short board content', figmaNode: 'proto:company-overview-v2:2', section: 'Prototype' },
      { key: 'board-long', label: 'Overview v2 — long board content', figmaNode: 'proto:company-overview-v2:3', section: 'Prototype' },
    ],
  },
];
