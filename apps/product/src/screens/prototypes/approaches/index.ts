import type { ScreenDef } from '../../../types.js';
import { approachScreen } from './Approach.js';
import type { ApproachKey } from './data.js';

const states = (key: string, label: string) => [
  { key: 'default', label: `${label} — default`, figmaNode: `proto:approach:${key}`, section: 'Prototype' },
];

/**
 * Prototype — the approach tabs with no Figma frame yet. One route, one
 * screen per approach; the Valuations tabs link here until frames exist.
 */
export const screens: ScreenDef[] = [
  ['external-valuation', 'External Valuation', 'Enter an outside appraisal with its source and date.'],
  ['specified-share-value', 'Specified Share Value', 'Specify a price per share for each series of the Cap Table version in view.'],
  ['public-comps', 'Public Comps', 'Pick public comparables, see where each figure came from and weight the multiples.'],
  ['transaction-comps', 'Transaction Comps', 'Pick comparable transactions or enter them by hand, and weight the multiples.'],
].map(([key, title, summary]): ScreenDef => ({
  component: approachScreen(key as ApproachKey),
  id: `prototype.approach.${key}`,
  title: `${title} (prototype)`,
  figmaPage: 'Prototype · approaches',
  route: `/prototypes/approach/:companyId/${key}`,
  summary: summary!,
  states: states(key!, title!),
}));
