import type { ScreenDef } from '../../types.js';
import { routes, companyPattern } from '../../routes.js';
import { CompanyOverview } from './CompanyOverview.js';
import { DailyNavSettings } from './DailyNavSettings.js';

const figmaPage = '11 · Company · Overview & Settings';

/** Screens from this Figma page. Both sit under Summary's sub-nav in the live app. */
export const screens: ScreenDef[] = [
  {
    id: 'company.overview',
    title: 'Company Overview',
    figmaPage,
    route: companyPattern(routes.company.overview),
    summary: 'See the company profile, status and external data (Capital IQ, mutual fund marks), and resolve a pending common-profile match.',
    component: CompanyOverview,
    states: [
      { key: 'default', label: 'Company Overview — Overview', figmaNode: '19:27294', section: 'Company Overview' },
    ],
  },
  {
    id: 'company.daily-nav-settings',
    title: 'Daily NAV Settings',
    figmaPage,
    route: companyPattern(routes.company.dailyNavSettings),
    summary: "Override the firm's Daily NAV alert thresholds for one company, link its external profile and track comps.",
    component: DailyNavSettings,
    states: [
      { key: 'default', label: 'Daily NAV Settings — Top', figmaNode: '19:37229', section: 'Daily NAV Settings' },
      { key: 'scrolled', label: 'Daily NAV Settings — Scrolled to bottom', figmaNode: '19:41641', section: 'Daily NAV Settings' },
    ],
  },
];
