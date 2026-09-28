/**
 * Every screen in the product, in Figma page order. Each Figma page owns one
 * module under screens/; this file only concatenates them.
 */
import type { ScreenDef, ScreenState } from './types.js';
import { match } from './router.js';
import { screens as p01Home } from './screens/p01-home/index.js';
import { screens as p02Intelligence } from './screens/p02-intelligence/index.js';
import { screens as p03Valuations } from './screens/p03-valuations/index.js';
import { screens as p04Waterfalls } from './screens/p04-waterfalls/index.js';
import { screens as p05Documents } from './screens/p05-documents/index.js';
import { screens as p06CompanySummaryFinancials } from './screens/p06-company-summary-financials/index.js';
import { screens as p07CompanyCapTable } from './screens/p07-company-cap-table/index.js';
import { screens as p08CompanyValuations } from './screens/p08-company-valuations/index.js';
import { screens as p09CompanyWaterfall } from './screens/p09-company-waterfall/index.js';
import { screens as p10CompanyDocuments } from './screens/p10-company-documents/index.js';
import { screens as p11CompanyOverviewSettings } from './screens/p11-company-overview-settings/index.js';
import { screens as p12Account } from './screens/p12-account/index.js';
import { screens as p13UserManagement } from './screens/p13-user-management/index.js';
import { screens as p14CompGroups } from './screens/p14-comp-groups/index.js';
import { screens as p15AuditLogs } from './screens/p15-audit-logs/index.js';
import { screens as p16FirmSettings } from './screens/p16-firm-settings/index.js';

export const allScreens: ScreenDef[] = [p01Home, p02Intelligence, p03Valuations, p04Waterfalls, p05Documents, p06CompanySummaryFinancials, p07CompanyCapTable, p08CompanyValuations, p09CompanyWaterfall, p10CompanyDocuments, p11CompanyOverviewSettings, p12Account, p13UserManagement, p14CompGroups, p15AuditLogs, p16FirmSettings].flat();

export interface Resolved {
  screen: ScreenDef;
  state: ScreenState;
  params: Record<string, string>;
}

/** Find the screen for a path. Unknown states fall back to the default one. */
export function resolve(path: string, stateKey?: string | null): Resolved | null {
  for (const screen of allScreens) {
    const params = match(screen.route, path);
    if (!params) continue;
    const state = screen.states.find((s) => s.key === stateKey) ?? screen.states[0];
    if (state) return { screen, state, params };
  }
  return null;
}

/** Find the screen and state drawn in a given Figma frame. */
export function byFigmaNode(nodeId: string): { screen: ScreenDef; state: ScreenState } | null {
  for (const screen of allScreens) {
    const state = screen.states.find((s) => s.figmaNode === nodeId);
    if (state) return { screen, state };
  }
  return null;
}

/** A concrete path for a screen — company routes get the demo company. */
export function examplePath(screen: ScreenDef): string {
  return screen.route.replace(':companyId', 'abc-co');
}
