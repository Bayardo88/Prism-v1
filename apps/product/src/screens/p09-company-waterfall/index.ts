import type { ScreenDef } from '../../types.js';
import { routes, companyPattern } from '../../routes.js';
import { CompanyWaterfall } from './CompanyWaterfall.js';

const section = 'Waterfall Views';

/** Screens from Figma page "09 · Company · Waterfall". */
export const screens: ScreenDef[] = [{
  id: 'company.waterfall',
  title: 'Waterfall',
  figmaPage: '09 · Company · Waterfall',
  route: companyPattern(routes.company.waterfall),
  summary: 'Set the exit assumptions for one company and save them as named waterfall views.',
  component: CompanyWaterfall,
  states: [
    { key: 'default', label: 'Waterfall — Current view', figmaNode: '19:46787', section },
    { key: 'create-view', label: 'Waterfall — Create waterfall view modal', figmaNode: '19:48005', section },
    { key: 'saved-view', label: 'Waterfall — Saved view "test"', figmaNode: '19:48097', section },
  ],
}];
