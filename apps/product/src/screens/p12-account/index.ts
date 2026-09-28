import type { ScreenDef } from '../../types.js';
import { routes } from '../../routes.js';
import { AccountSettings } from './AccountSettings.js';
import { TwoFactor } from './TwoFactor.js';

const PAGE = '12 · Account Settings';

/** Screens from this Figma page. */
export const screens: ScreenDef[] = [
  {
    id: 'account.settings',
    title: 'Account Settings',
    figmaPage: PAGE,
    route: routes.account.settings,
    summary: 'Edit your name and email, email preferences, UI zoom and profile picture.',
    component: AccountSettings,
    states: [
      { key: 'default', label: 'Account — Settings', figmaNode: '11:16416', section: 'Account Settings' },
    ],
  },
  {
    id: 'account.two-factor',
    title: 'Two-Factor Authentication',
    figmaPage: PAGE,
    route: routes.account.twoFactor,
    summary: 'See your two-factor status and manage one-time backup codes.',
    component: TwoFactor,
    states: [
      { key: 'default', label: 'Account — Two-Factor Authentication', figmaNode: '11:20549', section: 'Account Settings' },
    ],
  },
];
