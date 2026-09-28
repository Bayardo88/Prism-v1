import type { ScreenDef } from '../../types.js';
import { routes, companyPattern } from '../../routes.js';
import { Summary } from './Summary.js';
import { Conclusions } from './Conclusions.js';
import { Backsolve } from './Backsolve.js';

const figmaPage = '08 · Company · Valuations';

/** Screens from Figma page 08 · Company · Valuations (7:9). */
export const screens: ScreenDef[] = [
  {
    id: 'company.valuations.summary',
    title: 'Valuation Summary',
    figmaPage,
    route: companyPattern(routes.company.valuationSummary),
    summary: 'See how every approach rolls into enterprise and equity value, and how equity is allocated across scenarios to each security.',
    component: Summary,
    states: [
      { key: 'default', label: 'Valuations — Summary (empty states)', figmaNode: '11:24301', section: 'Valuation Summary' },
      { key: 'populated', label: 'Valuations — Summary', figmaNode: '16:10558', section: 'Valuation Summary' },
    ],
  },
  {
    id: 'company.valuations.conclusions',
    title: 'Valuation Conclusions',
    figmaPage,
    route: companyPattern(routes.company.valuationConclusions),
    summary: 'Read the concluded value and MOIC of every fund position, by entity and fund.',
    component: Conclusions,
    states: [
      { key: 'default', label: 'Valuations — Conclusions', figmaNode: '16:10794', section: 'Valuation Summary' },
    ],
  },
  {
    id: 'company.valuations.backsolve',
    title: 'Backsolve',
    figmaPage,
    route: companyPattern(routes.company.backsolve),
    summary: 'Solve for the equity value implied by a transaction: allocation methods, target security and shares.',
    component: Backsolve,
    states: [
      { key: 'default', label: 'Valuations — Backsolve', figmaNode: '19:20045', section: 'Backsolve & Add Approach' },
      { key: 'scrolled', label: 'Valuations — Backsolve (scrolled)', figmaNode: '19:26154', section: 'Backsolve & Add Approach' },
      { key: 'add-approach-menu', label: 'Valuations — Backsolve · Add approach menu', figmaNode: '19:26394', section: 'Backsolve & Add Approach' },
      { key: 'duplicate-methods', label: 'Valuations — Backsolve (duplicate allocation methods error)', figmaNode: '19:20527', section: 'Validation Errors & Unsaved Changes' },
      { key: 'method-menu', label: 'Valuations — Backsolve · Allocation method menu (must be unique)', figmaNode: '19:29164', section: 'Validation Errors & Unsaved Changes' },
      { key: 'security-selected', label: 'Valuations — Backsolve · Security selected (unsaved)', figmaNode: '19:35448', section: 'Validation Errors & Unsaved Changes' },
      { key: 'unsaved-confirm', label: 'Valuations — Backsolve · Unsaved changes confirmation', figmaNode: '19:37640', section: 'Validation Errors & Unsaved Changes' },
      { key: 'validation-banner', label: 'Valuations — Backsolve · Validation errors banner', figmaNode: '19:36020', section: 'Validation Errors & Unsaved Changes' },
    ],
  },
];
