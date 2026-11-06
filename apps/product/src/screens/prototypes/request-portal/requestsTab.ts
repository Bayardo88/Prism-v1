/**
 * Documents › Requests, as the platform's Tier 2 tab. The tab opens the
 * request portal's sender view: the one last opened in this session (its
 * company and scenario), else ABC Co as a Scalar analyst.
 */
const KEY = 'scalar.portal.requests-tab';
const DEFAULT = '/prototypes/request-portal/abc-co-request?scenario=scalar-company&viewer=sender&controls=off';

export function rememberRequestsTab(path: string): void {
  try { window.sessionStorage.setItem(KEY, path); } catch { /* private mode: the default is fine */ }
}

export function requestsTabHref(): string {
  try { return window.sessionStorage.getItem(KEY) ?? DEFAULT; } catch { return DEFAULT; }
}
