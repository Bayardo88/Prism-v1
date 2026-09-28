import type { ScreenDef } from '../../types.js';
import { routes } from '../../routes.js';
import { FirmProfile } from './FirmProfile.js';
import { SingleSignOn } from './SingleSignOn.js';
import { Scim } from './Scim.js';
import { DailyNavSettings } from './DailyNavSettings.js';
import { DailyNavCompanies } from './DailyNavCompanies.js';
import { ScalarAi } from './ScalarAi.js';
import { FeatureSettings } from './FeatureSettings.js';

const figmaPage = '16 · Firm Settings';

/** Screens from this Figma page. */
export const screens: ScreenDef[] = [
  {
    id: 'firm-settings.profile',
    title: 'Firm Profile',
    figmaPage,
    route: routes.firmSettings.profile,
    summary: "Edit the firm's name, address, contact details and the icon and logo shown across the platform.",
    component: FirmProfile,
    states: [
      { key: 'default', label: 'Firm Settings — Firm Profile', figmaNode: '11:14839', section: 'Profile' },
    ],
  },
  {
    id: 'firm-settings.sso',
    title: 'Single Sign-On',
    figmaPage,
    route: routes.firmSettings.sso,
    summary: "Connect the firm's identity provider, choose how new SSO users are provisioned and copy Scalar's service-provider metadata.",
    component: SingleSignOn,
    states: [
      { key: 'default', label: 'Firm Settings — Single Sign-On', figmaNode: '11:18693', section: 'SSO' },
      { key: 'role-menu', label: 'Firm Settings — Single Sign-On · Default role menu open', figmaNode: '11:21710', section: 'SSO' },
    ],
  },
  {
    id: 'firm-settings.scim',
    title: 'SCIM',
    figmaPage,
    route: routes.firmSettings.scim,
    summary: 'Turn on SCIM provisioning, map identity-provider groups to Scalar roles and manage the SCIM bearer token.',
    component: Scim,
    states: [
      { key: 'default', label: 'Firm Settings — SCIM', figmaNode: '14:9854', section: 'SCIM' },
      { key: 'mapping-added', label: 'Firm Settings — SCIM · Mapping added', figmaNode: '14:11037', section: 'SCIM' },
    ],
  },
  {
    id: 'firm-settings.daily-nav',
    title: 'Daily NAV Settings',
    figmaPage,
    route: routes.firmSettings.dailyNav,
    summary: 'Set the firm-wide Daily NAV alert thresholds, trading market, report recipients, CSV template and delivery.',
    component: DailyNavSettings,
    states: [
      { key: 'default', label: 'Firm Settings — Daily NAV Settings', figmaNode: '16:14082', section: 'Daily NAV' },
      { key: 'market-menu', label: 'Firm Settings — Daily NAV Settings · Trading market menu open', figmaNode: '19:23323', section: 'Daily NAV' },
      { key: 'recipient-added', label: 'Firm Settings — Daily NAV Settings · Recipient added', figmaNode: '19:23627', section: 'Daily NAV' },
    ],
  },
  {
    id: 'firm-settings.daily-nav-companies',
    title: 'Daily NAV Companies',
    figmaPage,
    route: routes.firmSettings.dailyNavCompanies,
    summary: 'Enable Daily NAV per company, override its alert thresholds and link its Alexandria profile.',
    component: DailyNavCompanies,
    states: [
      { key: 'default', label: 'Firm Settings — Daily NAV Companies', figmaNode: '19:27576', section: 'Daily NAV' },
      { key: 'alexandria-modal', label: 'Firm Settings — Daily NAV Companies · Alexandria link modal', figmaNode: '19:39149', section: 'Daily NAV' },
    ],
  },
  {
    id: 'firm-settings.scalar-ai',
    title: 'Scalar AI',
    figmaPage,
    route: routes.firmSettings.scalarAi,
    summary: 'Cap the AI effort users may choose, set the default effort and switch AI features on or off for the firm.',
    component: ScalarAi,
    states: [
      { key: 'default', label: 'Firm Settings — Scalar AI', figmaNode: '19:42270', section: 'Scalar AI' },
      { key: 'max-menu', label: 'Firm Settings — Scalar AI · Maximum effort menu open', figmaNode: '19:42439', section: 'Scalar AI' },
      { key: 'default-menu', label: 'Firm Settings — Scalar AI · Default effort menu open (capped)', figmaNode: '19:42597', section: 'Scalar AI' },
    ],
  },
  {
    id: 'firm-settings.settings',
    title: 'Feature Settings',
    figmaPage,
    route: routes.firmSettings.settings,
    summary: 'Switch firm-wide features on or off: required 2FA, process-management columns, Daily NAV and number-format entry.',
    component: FeatureSettings,
    states: [
      { key: 'default', label: 'Firm Settings — Settings', figmaNode: '19:42781', section: 'Settings' },
    ],
  },
];
