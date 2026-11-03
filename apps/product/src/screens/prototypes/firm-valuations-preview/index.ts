import type { ScreenDef } from '../../../types.js';
import { FirmValuationsPreview } from './FirmValuationsPreview.js';

/** Prototype — Firm Valuations with a row preview drawer: see a company's valuation without leaving the list. */
export const screens: ScreenDef[] = [
  {
    id: 'prototype.firm-valuations-preview',
    title: 'Firm Valuations · preview drawer (prototype)',
    figmaPage: 'Prototype · firm-valuations-preview',
    route: '/prototypes/firm-valuations-preview',
    summary: "Click a company in the Firm Valuations grid to preview its latest valuation in a drawer (status, dates, headline values, open tasks, earlier measurements) and open the full valuation from there.",
    component: FirmValuationsPreview,
    states: [
      { key: 'default', label: 'Preview drawer — closed', figmaNode: 'proto:firm-valuations-preview:1', section: 'Prototype' },
      { key: 'open', label: 'Preview drawer — published valuation (Cohesity)', figmaNode: 'proto:firm-valuations-preview:2', section: 'Prototype' },
      { key: 'open-unpublished', label: 'Preview drawer — unpublished valuation (ABC Co)', figmaNode: 'proto:firm-valuations-preview:3', section: 'Prototype' },
    ],
  },
];
