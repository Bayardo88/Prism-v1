/**
 * A dependency-free hash router. Routes look like `#/companies/abc-co/summary`
 * and take an optional `?state=<key>` that selects a screen state, so every
 * Figma frame has a URL of its own.
 */
import { useEffect, useState } from 'react';

export interface Location {
  path: string;
  query: URLSearchParams;
}

function read(): Location {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path = '/', search = ''] = raw.split('?');
  return { path: path || '/', query: new URLSearchParams(search) };
}

export function useLocation(): Location {
  const [loc, setLoc] = useState(read);
  useEffect(() => {
    const on = () => setLoc(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return loc;
}

/** Build an href for an in-app path. Use it for every link and menu item. */
export function href(path: string, state?: string): string {
  return `#${path}${state ? `?state=${encodeURIComponent(state)}` : ''}`;
}

export function navigate(path: string, state?: string): void {
  window.location.hash = href(path, state).slice(1);
}

/** Match `/companies/:companyId/summary` against a path. Returns params or null. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    const a = p[i]!;
    const b = s[i]!;
    if (a.startsWith(':')) params[a.slice(1)] = decodeURIComponent(b);
    else if (a !== b) return null;
  }
  return params;
}

/** Fill a pattern: `fill('/companies/:companyId/summary', { companyId: 'abc-co' })`. */
export function fill(pattern: string, params: Record<string, string>): string {
  return pattern.replace(/:([A-Za-z]+)/g, (_, k: string) => encodeURIComponent(params[k] ?? k));
}
