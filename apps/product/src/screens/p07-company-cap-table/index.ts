import type { ScreenDef } from '../../types.js';
import { routes, companyPattern } from '../../routes.js';
import { CapTable } from './CapTable.js';
import { FundOwnership } from './FundOwnership.js';
import { Breakpoints } from './Breakpoints.js';
import { CashFlowLedger } from './CashFlowLedger.js';

const figmaPage = '07 · Company · Cap Table';

/** Screens from Figma page 07 · Company · Cap Table (7:8). */
export const screens: ScreenDef[] = [
  {
    id: 'company.cap-table.securities',
    title: 'Cap Table',
    figmaPage,
    route: companyPattern(routes.company.capTable),
    summary: 'Maintain the company’s securities — type, issue price, shares and preferences — and see ownership and the firm’s holdings.',
    component: CapTable,
    states: [
      { key: 'default', label: 'Cap Table — Securities', figmaNode: '11:15081', section: 'Cap Table' },
      { key: 'new-column', label: 'Cap Table — New security column', figmaNode: '11:18882', section: 'Cap Table' },
      { key: 'security-type-menu', label: 'Cap Table — Security Type menu open', figmaNode: '11:19396', section: 'Cap Table' },
    ],
  },
  {
    id: 'company.cap-table.fund-ownership',
    title: 'Fund Ownership',
    figmaPage,
    route: companyPattern(routes.company.fundOwnership),
    summary: 'Record what each fund holds in each security: entity, investment date, capital, shares and proceeds.',
    component: FundOwnership,
    states: [
      { key: 'default', label: 'Fund Ownership — VIP Fund', figmaNode: '11:24812', section: 'Fund Ownership' },
      { key: 'new-column', label: 'Fund Ownership — New ownership column', figmaNode: '16:10022', section: 'Fund Ownership' },
    ],
  },
  {
    id: 'company.cap-table.breakpoints',
    title: 'Breakpoint Analysis',
    figmaPage,
    route: companyPattern(routes.company.breakpoints),
    summary: 'Review the calculated equity breakpoints, or switch to custom breakpoints and enter them by hand.',
    component: Breakpoints,
    states: [
      { key: 'calculated', label: 'Breakpoints — Calculated', figmaNode: '16:14388', section: 'Breakpoints' },
      { key: 'custom-3', label: 'Breakpoints — Custom (3)', figmaNode: '19:14358', section: 'Breakpoints' },
      { key: 'custom-4', label: 'Breakpoints — Custom (4 added)', figmaNode: '19:17438', section: 'Breakpoints' },
    ],
  },
  {
    id: 'company.cap-table.cash-flow-ledger',
    title: 'Cash Flow Ledger',
    figmaPage,
    route: companyPattern(routes.company.cashFlowLedger),
    summary: 'Log investments, distributions and sales per position and see each fund’s cost basis and gross IRR.',
    component: CashFlowLedger,
    states: [
      { key: 'default', label: 'Cash Flow Ledger — Transactions', figmaNode: '19:19341', section: 'Cash Flow Ledger' },
      { key: 'new-row', label: 'Cash Flow Ledger — New transaction row', figmaNode: '19:21138', section: 'Cash Flow Ledger' },
    ],
  },
];
