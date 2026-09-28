import type { ScreenDef } from '../../types.js';
import { routes } from '../../routes.js';
import { CompGroups } from './CompGroups.js';

/** Screens from this Figma page. */
export const screens: ScreenDef[] = [
  {
    id: 'admin.comp-groups',
    title: 'Comp Groups',
    figmaPage: '14 · Comp Groups',
    route: routes.admin.compGroups,
    summary: 'Maintain the firm’s public and transaction comparable groups that valuations draw their multiples from.',
    component: CompGroups,
    states: [
      { key: 'default', label: 'Comp Groups — Public comp group', figmaNode: '19:37494', section: 'Comp Groups' },
      { key: 'speed-dial', label: 'Comp Groups — Add comp group speed dial open', figmaNode: '19:42969', section: 'Comp Groups' },
      { key: 'new-transaction', label: 'Comp Groups — New transaction comp group', figmaNode: '19:45657', section: 'Comp Groups' },
    ],
  },
];
