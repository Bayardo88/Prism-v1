import type { ScreenDef } from '../../types.js';
import { routes } from '../../routes.js';
import { Home } from './Home.js';

const PAGE = '01 · Home & Global Navigation';
const FIRM = 'Firm Home & Global Navigation';
const PORTFOLIO = 'Portfolio Home & Add Company';

/** Screens from this Figma page. */
export const screens: ScreenDef[] = [
  {
    id: 'home.firm',
    title: 'Home',
    figmaPage: PAGE,
    route: routes.home,
    summary: 'Land on the firm: switch firms, jump into a product, or find a portfolio company in the A–Z directory.',
    component: Home,
    states: [
      { key: 'default', label: 'Home — Firm Portfolio', figmaNode: '7:18', section: FIRM },
      { key: 'companies-menu', label: 'Home — Companies dropdown open', figmaNode: '11:12608', section: FIRM },
      { key: 'date-menu', label: 'Home — Date dropdown open', figmaNode: '11:16075', section: FIRM },
      { key: 'search', label: 'Home — Global Search open', figmaNode: '11:20210', section: FIRM },
      { key: 'notifications', label: 'Home — Notifications popover', figmaNode: '11:23112', section: FIRM },
      { key: 'notification-settings', label: 'Home — Notification settings', figmaNode: '14:10216', section: FIRM },
    ],
  },
  {
    id: 'home.portfolio',
    title: 'Portfolio Home',
    figmaPage: PAGE,
    route: routes.portfolioHome,
    summary: 'Add a new portfolio company from the Companies menu and set its fiscal year and currencies.',
    component: Home,
    states: [
      { key: 'companies-add', label: 'Portfolio Home — Companies dropdown (Add New Company)', figmaNode: '16:14684', section: PORTFOLIO },
      { key: 'add-company', label: 'Portfolio Home — Add Company modal', figmaNode: '16:14723', section: PORTFOLIO },
    ],
  },
];
