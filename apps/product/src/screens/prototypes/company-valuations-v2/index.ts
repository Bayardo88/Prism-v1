import type { ScreenDef } from '../../../types.js';
import { CompanyValuationsV2 } from './CompanyValuationsV2.js';

/** Prototype — a Valuations overview landing for one company: headline, versions, approaches, concluded value. */
export const screens: ScreenDef[] = [
  {
    id: 'prototype.company-valuations-v2',
    title: 'Company Valuations Overview (prototype)',
    figmaPage: 'Prototype · company-valuations-v2',
    route: '/prototypes/company-valuations-v2/:companyId',
    summary: 'See a company’s current valuation at a glance — headline value, version history, approaches and concluded value per fund — and open any tab from it.',
    component: CompanyValuationsV2,
    states: [
      { key: 'default', label: 'Valuations Overview — default', figmaNode: 'proto:company-valuations-v2:1', section: 'Prototype' },
      { key: 'no-approaches', label: 'Valuations Overview — new version, no approaches', figmaNode: 'proto:company-valuations-v2:2', section: 'Prototype' },
    ],
  },
];
