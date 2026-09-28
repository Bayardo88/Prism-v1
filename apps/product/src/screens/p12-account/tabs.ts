import { routes } from '../../routes.js';
import type { PageTab } from '../../shell/PageHeader.js';

export const ACCOUNT_TABS: PageTab[] = [
  { key: 'settings', label: 'Settings', to: routes.account.settings },
  { key: 'two-factor', label: 'Two-Factor Authentication', to: routes.account.twoFactor },
];
