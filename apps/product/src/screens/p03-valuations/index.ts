import type { ScreenDef } from '../../types.js';
import { routes } from '../../routes.js';
import { FirmValuations } from './FirmValuations.js';

/** Screens from Figma page 03 · Valuations (Firm). */
export const screens: ScreenDef[] = [
  {
    id: 'valuations.firm',
    title: 'Firm Valuations',
    figmaPage: '03 · Valuations (Firm)',
    route: routes.valuations,
    summary: "Track every company's latest valuation — date, open tasks, status, approaches and headline values — and open a company's valuation from its row.",
    component: FirmValuations,
    states: [
      { key: 'default', label: 'Valuations — Firm Portfolio Summary', figmaNode: '11:13919', section: 'Firm Valuations Grid' },
      { key: 'scrolled-add-column', label: 'Valuations — Grid scrolled to Add Column', figmaNode: '11:16597', section: 'Firm Valuations Grid' },
      { key: 'add-columns', label: 'Valuations — Add Columns modal', figmaNode: '14:1134', section: 'Firm Valuations Grid' },
    ],
  },
];
