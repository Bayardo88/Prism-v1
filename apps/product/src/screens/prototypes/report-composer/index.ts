import type { ScreenDef } from '../../../types.js';
import { ReportComposer } from './ReportComposer.js';

/** Prototype — the analyst composes a company's client-facing 409A report. */
export const screens: ScreenDef[] = [
  {
    id: 'prototype.report-composer',
    title: '409A Report Composer (prototype)',
    figmaPage: 'Prototype · report-composer',
    route: '/prototypes/report-composer/:companyId',
    summary: 'Choose which sections a client sees and adjust displayed figures, with every override kept beside its source value.',
    component: ReportComposer,
    states: [
      { key: 'default', label: '409A Report Composer — default', figmaNode: 'proto:report-composer:1', section: 'Prototype' },
    ],
  },
];
