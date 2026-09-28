import type { ScreenDef } from '../../types.js';
import { routes } from '../../routes.js';
import { Waterfalls } from './Waterfalls.js';

const section = 'Firm Waterfall Scenario';

/** Screens from Figma page "04 · Waterfalls (Firm)". */
export const screens: ScreenDef[] = [{
  id: 'waterfalls.scenario',
  title: 'Waterfalls',
  figmaPage: '04 · Waterfalls (Firm)',
  route: routes.waterfalls,
  summary: 'Model an exit for any portfolio company and read the firm’s total exit proceeds.',
  component: Waterfalls,
  states: [
    { key: 'default', label: 'Waterfalls — New scenario', figmaNode: '16:5197', section },
    { key: 'backside-blocks', label: 'Waterfalls — Backside Blocks scenario', figmaNode: '16:13493', section },
    { key: 'company-picker', label: 'Waterfalls — Company picker open', figmaNode: '19:13989', section },
    { key: 'workspace-documents', label: 'Waterfalls — Workspace drawer · Documents', figmaNode: '19:17752', section },
  ],
}];
