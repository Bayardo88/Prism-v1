import type { ScreenDef } from '../../types.js';
import { routes, companyPattern } from '../../routes.js';
import { SummaryHoldings } from './SummaryHoldings.js';
import { IncomeStatement } from './IncomeStatement.js';
import { BalanceSheet } from './BalanceSheet.js';
import { Kpis } from './Kpis.js';

const figmaPage = '06 · Company · Summary & Financials';

/** Screens from this Figma page. */
export const screens: ScreenDef[] = [
  {
    id: 'company.summary.holdings',
    title: 'Summary Holdings',
    figmaPage,
    route: companyPattern(routes.company.summary),
    summary: "See every fund's position in the company — invested capital, shares, ownership and value — with fund and firm totals.",
    component: SummaryHoldings,
    states: [
      { key: 'default', label: 'Summary — Summary Holdings', figmaNode: '11:9624', section: 'Summary' },
    ],
  },
  {
    id: 'company.financials.income-statement',
    title: 'Income Statement',
    figmaPage,
    route: companyPattern(routes.company.incomeStatement),
    summary: 'Review and edit the historical and projected P&L, LTM and NTM, that feeds every valuation.',
    component: IncomeStatement,
    states: [
      { key: 'default', label: 'Financials — Income Statement', figmaNode: '11:20696', section: 'Income Statement' },
      { key: 'version-menu', label: 'Financials — Version selector open', figmaNode: '11:25364', section: 'Income Statement' },
      { key: 'actions-menu', label: 'Financials — Company actions menu open', figmaNode: '19:12054', section: 'Income Statement' },
      { key: 'notes-drawer', label: 'Financials — Notes drawer open', figmaNode: '19:18159', section: 'Income Statement' },
    ],
  },
  {
    id: 'company.financials.balance-sheet',
    title: 'Balance Sheet',
    figmaPage,
    route: companyPattern(routes.company.balanceSheet),
    summary: 'Enter assets, liabilities and equity by period; expand each section to its line items and add historical or projection years.',
    component: BalanceSheet,
    states: [
      { key: 'default', label: 'Financials — Balance Sheet', figmaNode: '19:21548', section: 'Balance Sheet' },
      { key: 'expanded', label: 'Financials — Balance Sheet expanded', figmaNode: '19:25279', section: 'Balance Sheet' },
      { key: 'add-year-menu', label: 'Financials — Balance Sheet add year menu open', figmaNode: '19:27953', section: 'Balance Sheet' },
      { key: 'historical-added', label: 'Financials — Balance Sheet historical year added', figmaNode: '19:30302', section: 'Balance Sheet' },
      { key: 'projection-added', label: 'Financials — Balance Sheet projection year added', figmaNode: '19:34233', section: 'Balance Sheet' },
    ],
  },
  {
    id: 'company.financials.kpis',
    title: 'KPIs',
    figmaPage,
    route: companyPattern(routes.company.kpis),
    summary: 'Track company-specific KPIs by period alongside the financial statements.',
    component: Kpis,
    states: [
      { key: 'default', label: 'Financials — KPIs empty', figmaNode: '19:38184', section: 'KPIs' },
      { key: 'row-added', label: 'Financials — KPIs row added', figmaNode: '19:40300', section: 'KPIs' },
      { key: 'column-menu', label: 'Financials — KPI column menu open', figmaNode: '19:41933', section: 'KPIs' },
    ],
  },
];
