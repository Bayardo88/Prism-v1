import type { ScreenDef } from '../../types.js';
import { routes } from '../../routes.js';
import { Summaries } from './Summaries.js';
import { ScheduleOfInvestments } from './ScheduleOfInvestments.js';
import { DailyNav } from './DailyNav.js';

const figmaPage = '02 · Intelligence';

/** Screens from Figma page 02 · Intelligence. */
export const screens: ScreenDef[] = [
  {
    id: 'intelligence.summaries',
    title: 'Summaries',
    figmaPage,
    route: routes.intelligence.summaries,
    summary: 'Review the whole portfolio in one configurable grid — ownership, invested capital, value metrics, preferences and valuation status per company — and save the column set as a view.',
    component: Summaries,
    states: [
      { key: 'default', label: 'Summaries — Firm Summary', figmaNode: '11:17914', section: 'Summaries — Grid & scroll states' },
      { key: 'scrolled-value-metrics', label: 'Summaries — Scrolled (Value metrics)', figmaNode: '16:11594', section: 'Summaries — Grid & scroll states' },
      { key: 'scrolled-preferences', label: 'Summaries — Scrolled (Preferences & projections)', figmaNode: '16:12542', section: 'Summaries — Grid & scroll states' },
      { key: 'scrolled-status-end', label: 'Summaries — Scrolled (Valuation status end)', figmaNode: '19:14796', section: 'Summaries — Grid & scroll states' },
      { key: 'column-selected', label: 'Summaries — Column selected', figmaNode: '19:15817', section: 'Summaries — Grid & scroll states' },
      { key: 'cell-trend', label: 'Summaries — Cell trend popover', figmaNode: '19:24372', section: 'Summaries — Grid & scroll states' },
      { key: 'saved-view-menu', label: 'Summaries — Saved view menu', figmaNode: '19:32650', section: 'Summaries — Menus & dialogs' },
      { key: 'create-view', label: 'Summaries — Create Summary View', figmaNode: '19:40655', section: 'Summaries — Menus & dialogs' },
      { key: 'page-actions', label: 'Summaries — Page actions menu', figmaNode: '19:33030', section: 'Summaries — Menus & dialogs' },
      { key: 'user-menu', label: 'User Menu — Open', figmaNode: '19:43157', section: 'Summaries — Menus & dialogs' },
      { key: 'user-menu-firm-settings', label: 'User Menu — Firm Settings expanded', figmaNode: '19:43612', section: 'Summaries — Menus & dialogs' },
    ],
  },
  {
    id: 'intelligence.schedule-of-investments',
    title: 'Schedule of Investments',
    figmaPage,
    route: routes.intelligence.scheduleOfInvestments,
    summary: 'See every security the firm holds, grouped by company in its own currency, with invested capital, shares, ownership and realized / unrealized value.',
    component: ScheduleOfInvestments,
    states: [
      { key: 'default', label: 'Schedule of Investments — By company', figmaNode: '19:45879', section: 'Schedule of Investments' },
    ],
  },
  {
    id: 'intelligence.daily-nav',
    title: 'Daily NAV',
    figmaPage,
    route: routes.intelligence.dailyNav,
    summary: 'Mark every company daily against its previous valuation, secondary-market prices and public comps, then validate, preview, finalize and send the NAV report.',
    component: DailyNav,
    states: [
      { key: 'default', label: 'Daily NAV — Previous valuation & secondary data', figmaNode: '19:49440', section: 'Daily NAV' },
      { key: 'public-comps', label: 'Daily NAV — Public comps & NAV status', figmaNode: '19:50974', section: 'Daily NAV' },
      { key: 'report-menu', label: 'Daily NAV — Report menu open', figmaNode: '19:53212', section: 'Daily NAV' },
    ],
  },
];
