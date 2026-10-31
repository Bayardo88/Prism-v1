/**
 * Who sent the request, who is looking, and whether the link still works.
 *
 * These are PROTOTYPE switches: in production they come from the request record
 * (sender, recipient), the session (who is signed in) and the link token. They
 * live in the URL (`?scenario=…&viewer=…&link=…`) so a teammate can be sent any
 * combination.
 */
import { useEffect, useState } from 'react';
import { companyById, type Company } from '../../../data/fixtures.js';

export type ScenarioId = 'scalar-company' | 'scalar-fund-admin' | 'firm-company';
/** `sender` is a Scalar user, or a firm user when the firm sent the request. */
export type Viewer = 'responder' | 'sender';
export type LinkState = 'active' | 'expired';

export interface Scenario {
  id: ScenarioId;
  label: string;
  /** Whose logo is in the top row. */
  brand: 'scalar' | 'firm';
  /** Who the request is from, in copy. */
  senderName: string;
  /** What a `sender` viewer is called. */
  senderRole: string;
  /** Companies the recipient answers for. One, except for a fund admin. */
  companies: Company[];
  /** Show "Powered by Scalar" in the help and privacy dialogs. */
  poweredBy: boolean;
  recipient: { name: string; email: string };
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  'scalar-company': {
    id: 'scalar-company',
    label: 'Scalar → company',
    brand: 'scalar',
    senderName: 'Scalar',
    senderRole: 'Scalar user',
    companies: [companyById('abc-co')],
    poweredBy: false,
    recipient: { name: 'Maria López', email: 'maria.lopez@abcco.com' },
  },
  'scalar-fund-admin': {
    id: 'scalar-fund-admin',
    label: 'Scalar → fund admin',
    brand: 'scalar',
    senderName: 'Scalar',
    senderRole: 'Scalar user',
    companies: [companyById('abc-co'), companyById('databricks'), companyById('cohesity')],
    poweredBy: false,
    recipient: { name: 'Jordan Reyes', email: 'jordan.reyes@harborfundadmin.com' },
  },
  'firm-company': {
    id: 'firm-company',
    label: 'Firm → portfolio company',
    brand: 'firm',
    senderName: 'Spatical Ventures',
    senderRole: 'Firm user',
    companies: [companyById('abc-co')],
    poweredBy: true,
    recipient: { name: 'Maria López', email: 'maria.lopez@abcco.com' },
  },
};

export const SCENARIO_IDS = Object.keys(SCENARIOS) as ScenarioId[];

/** "maria.lopez@abcco.com" → "m•••@abcco.com". */
export const maskEmail = (email: string) => {
  const [user = '', domain = ''] = email.split('@');
  return `${user.slice(0, 1)}•••@${domain}`;
};

export interface PrototypeConfig {
  scenario: ScenarioId;
  viewer: Viewer;
  link: LinkState;
  /** `controls=off` hides the Prototype view panel, for links that show one fixed view. */
  controls: boolean;
}

function read(): PrototypeConfig {
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const scenario = q.get('scenario') as ScenarioId | null;
  return {
    scenario: scenario && scenario in SCENARIOS ? scenario : 'scalar-company',
    viewer: q.get('viewer') === 'sender' ? 'sender' : 'responder',
    link: q.get('link') === 'expired' ? 'expired' : 'active',
    controls: q.get('controls') !== 'off',
  };
}

/** Read and write the switches in the hash query. The screen's `state` is kept, so nothing remounts. */
export function usePrototypeConfig() {
  const [config, setConfig] = useState(read);
  useEffect(() => {
    const on = () => setConfig(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const update = (patch: Partial<PrototypeConfig>) => {
    const next = { ...config, ...patch };
    const [path = '', search = ''] = window.location.hash.replace(/^#/, '').split('?');
    const q = new URLSearchParams(search);
    q.set('scenario', next.scenario);
    q.set('viewer', next.viewer);
    q.set('link', next.link);
    window.location.hash = `${path}?${q.toString()}`;
  };
  return [config, update] as const;
}
