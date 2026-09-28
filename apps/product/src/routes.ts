/**
 * Every route in the product, in one place. Screens link with
 * `href(routes.company.summary('abc-co'))`, never a hand-typed string, so the
 * information architecture can only change here.
 */
/** Company routes take the id; pass ':companyId' to get the route pattern. */
const c = (tail: string) => (companyId: string) => `/companies/${companyId}/${tail}`;

export const routes = {
  catalog: '/catalog',
  home: '/',
  portfolioHome: '/portfolio',
  intelligence: {
    summaries: '/intelligence/summaries',
    scheduleOfInvestments: '/intelligence/schedule-of-investments',
    dailyNav: '/intelligence/daily-nav',
  },
  valuations: '/valuations',
  waterfalls: '/waterfalls',
  documents: '/documents',
  company: {
    summary: c('summary'),
    incomeStatement: c('financials/income-statement'),
    balanceSheet: c('financials/balance-sheet'),
    kpis: c('financials/kpis'),
    capTable: c('cap-table/securities'),
    fundOwnership: c('cap-table/fund-ownership'),
    breakpoints: c('cap-table/breakpoints'),
    cashFlowLedger: c('cap-table/cash-flow-ledger'),
    valuationSummary: c('valuations/summary'),
    valuationConclusions: c('valuations/conclusions'),
    backsolve: c('valuations/backsolve'),
    waterfall: c('waterfall'),
    documents: c('documents'),
    informationRequest: c('documents/information-request'),
    questions: c('documents/questions'),
    overview: c('overview'),
    dailyNavSettings: c('daily-nav-settings'),
  },
  account: {
    settings: '/account/settings',
    twoFactor: '/account/two-factor',
  },
  admin: {
    users: '/admin/users',
    compGroups: '/admin/comp-groups',
    auditLogs: '/admin/audit-logs',
  },
  firmSettings: {
    profile: '/firm-settings/profile',
    sso: '/firm-settings/sso',
    scim: '/firm-settings/scim',
    dailyNav: '/firm-settings/daily-nav',
    dailyNavCompanies: '/firm-settings/daily-nav-companies',
    scalarAi: '/firm-settings/scalar-ai',
    settings: '/firm-settings/settings',
  },
} as const;


/** The pattern form of a company route, for ScreenDef.route. */
export const companyPattern = (f: (id: string) => string) => f(':companyId');
