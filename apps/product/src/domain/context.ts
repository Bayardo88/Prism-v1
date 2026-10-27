/**
 * The store behind the domain model and the hooks company pages read it with.
 *
 *   const v = useValuationContext(company);   // v.measurement, v.capTable, v.ownership, v.valuation…
 *   valuation.selectVersion(company, 'capTable', 'ct-secondary');
 *
 * One context per company (P1), shared by every page of that company, kept for
 * the browser session (sessionStorage). Companies are seeded lazily from their
 * record and only stored once something about them changes.
 */
import { useMemo, useSyncExternalStore } from 'react';
import {
  changeContext, cloneVersion, defaultContext, resolve, rollover, seedCompany, setMarketDate, updateValuation,
  type Approach, type CompanyModel, type CompanySeed, type Resolved, type RolloverOptions, type ValuationContext,
  type ValuationVersion, type ValuationWorkflowStatus, type VersionKind,
} from './model.js';

interface State {
  companies: Record<string, CompanyModel>;
  contexts: Record<string, ValuationContext>;
}

const KEY = 'scalar.product.model.v1';

function load(): State {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch { /* storage unavailable — start fresh */ }
  return { companies: {}, contexts: {} };
}

let state: State = load();
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch { /* not persisted; still works */ }
  for (const l of listeners) l();
}

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const snapshot = () => state;

/* Seeds are cached so an untouched company reads as the same object every render. */
const seeds = new Map<string, CompanyModel>();
const seedCtx = new Map<string, ValuationContext>();

function modelOf(s: State, c: CompanySeed): CompanyModel {
  const stored = s.companies[c.id];
  if (stored) return stored;
  let seeded = seeds.get(c.id);
  if (!seeded) { seeded = seedCompany(c); seeds.set(c.id, seeded); }
  return seeded;
}

function ctxOf(s: State, c: CompanySeed): ValuationContext {
  const stored = s.contexts[c.id];
  if (stored) return stored;
  let ctx = seedCtx.get(c.id);
  if (!ctx) { ctx = defaultContext(modelOf(s, c)); seedCtx.set(c.id, ctx); }
  return ctx;
}

/** Read without subscribing (event handlers, other modules). */
export const readContext = (c: CompanySeed): Resolved => resolve(modelOf(state, c), ctxOf(state, c));

/** Everything a company page needs to know about what it is showing. */
export function useValuationContext(c: CompanySeed): Resolved {
  const s = useSyncExternalStore(subscribe, snapshot, snapshot);
  const model = modelOf(s, c);
  const ctx = ctxOf(s, c);
  return useMemo(() => resolve(model, ctx), [model, ctx]);
}

/** Just the data identity of a company's context — App remounts a screen when it changes. */
export function useContextKey(c: CompanySeed | undefined): string {
  const s = useSyncExternalStore(subscribe, snapshot, snapshot);
  return c ? resolve(modelOf(s, c), ctxOf(s, c)).key : '';
}

/** Subscribe to the whole store (firm-level pages that list many companies). */
export function useDomainVersion(): State {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** The latest valuation of a company as stored, for firm-level reporting. */
export function latestValuationOf(c: CompanySeed): ValuationVersion | undefined {
  return modelOf(state, c).measurements[0]?.valuations[0];
}

/**
 * Firm pages read a company's workflow status from here, so publishing on the
 * company's Valuations page shows up in Intelligence and firm Valuations (P8).
 */
export function workflowStatusOf(c: CompanySeed & { valuationStatus: ValuationWorkflowStatus }): ValuationWorkflowStatus {
  return latestValuationOf(c)?.status ?? c.valuationStatus;
}

function write(c: CompanySeed, model: CompanyModel, ctx: ValuationContext) {
  commit({ companies: { ...state.companies, [c.id]: model }, contexts: { ...state.contexts, [c.id]: ctx } });
}

/** Every change to the model goes through here. */
export const valuation = {
  setContext(c: CompanySeed, patch: Partial<ValuationContext>) {
    const model = modelOf(state, c);
    write(c, model, changeContext(model, ctxOf(state, c), patch));
  },
  selectMeasurement(c: CompanySeed, date: string) {
    valuation.setContext(c, { measurementDate: date });
  },
  selectVersion(c: CompanySeed, kind: VersionKind, id: string) {
    const field = kind === 'financial' ? 'financialVersionId' : kind === 'capTable' ? 'capTableVersionId' : 'valuationVersionId';
    valuation.setContext(c, { [field]: id });
  },
  /** Clone the version in view and switch to the clone. */
  saveAsNewVersion(c: CompanySeed, kind: VersionKind, name: string) {
    const ctx = ctxOf(state, c);
    const [model, id] = cloneVersion(modelOf(state, c), ctx, kind, name);
    const field = kind === 'financial' ? 'financialVersionId' : kind === 'capTable' ? 'capTableVersionId' : 'valuationVersionId';
    write(c, model, { ...ctx, [field]: id });
  },
  setMarketDate(c: CompanySeed, marketDate: string) {
    const ctx = ctxOf(state, c);
    write(c, setMarketDate(modelOf(state, c), ctx.measurementDate, marketDate), ctx);
  },
  /** Status and review flags of the valuation version in view. */
  setValuation(c: CompanySeed, fn: (v: ValuationVersion) => ValuationVersion) {
    const ctx = ctxOf(state, c);
    write(c, updateValuation(modelOf(state, c), ctx.measurementDate, ctx.valuationVersionId, fn), ctx);
  },
  setApproach(c: CompanySeed, id: string, patch: Partial<Approach>) {
    valuation.setValuation(c, (v) => ({
      ...v,
      approaches: v.approaches.map((a) => (a.id === id ? { ...a, ...patch, ...(patch.calibrated ? { weight: 0 } : {}) } : a)),
    }));
  },
  addApproach(c: CompanySeed, approach: Approach) {
    valuation.setValuation(c, (v) => (v.approaches.some((a) => a.type === approach.type)
      ? v
      : { ...v, approaches: [...v.approaches, approach] }));
  },
  setScenarioWeight(c: CompanySeed, id: string, weight: number) {
    valuation.setValuation(c, (v) => ({ ...v, scenarios: v.scenarios.map((s) => (s.id === id ? { ...s, weight } : s)) }));
  },
  /** Creates the target measurement; the source is untouched. Opens the new one. */
  rollover(c: CompanySeed, options: RolloverOptions) {
    const model = rollover(modelOf(state, c), options);
    write(c, model, changeContext(model, ctxOf(state, c), { measurementDate: options.to }));
  },
  /** Bulk market-date update: moves each company's market date only (no measurements, no versions). */
  bulkMarketDate(companies: CompanySeed[], marketDate: string) {
    let next = state;
    for (const c of companies) {
      const ctx = ctxOf(next, c);
      next = {
        companies: { ...next.companies, [c.id]: setMarketDate(modelOf(next, c), ctx.measurementDate, marketDate) },
        contexts: { ...next.contexts, [c.id]: ctx },
      };
    }
    commit(next);
  },
  /** Prototype only: forget every change (Catalog "Reset prototype data"). */
  reset() {
    seeds.clear();
    seedCtx.clear();
    commit({ companies: {}, contexts: {} });
  },
};
