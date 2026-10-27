/**
 * The product's domain model: measurements, versions, approaches and the
 * valuation context a company page reads (docs/product/domain-logic.md §2–§4, §8).
 *
 * Pure data and reducers only — no React, no formatting. `context.ts` holds the
 * store and the hooks. Everything here is prototype state: seeded from the
 * company record, mutated in memory and kept for the browser session.
 *
 * Evidence marks follow the contract: DOC (shown in training), INFER, VERIFY.
 */

export type FinancialScenario = 'base' | 'downside';
export type CapTableScenario = 'base' | 'option-pool';

export interface FinancialVersion { id: string; name: string; scenario: FinancialScenario }

/** A Cap Table version and the Fund Ownership version paired with it (DOC: 1:1). */
export interface CapTableVersion {
  id: string;
  name: string;
  scenario: CapTableScenario;
  ownership: { id: string; name: string };
}

export type ApproachType =
  | 'gpc' | 'ma-comps' | 'backsolve' | 'external' | 'ssv' | 'dcf' | 'future-exit' | 'transaction-comps';

export interface Approach {
  id: string;
  type: ApproachType;
  name: string;
  /** Percent of the concluded value, 0–100. Calibrated approaches carry no weight. */
  weight: number;
  /** DOC: a calibrated approach is read-only reference and left out of the summary. */
  calibrated: boolean;
}

export interface AllocationScenario { id: string; method: 'Waterfall' | 'OPM' | 'CSE'; weight: number }

/**
 * The product's valuation workflow status — the same six values the company
 * record and the firm pages use (`ModalStatus`). DOC: draft values are not
 * reported; ready-for-audit is read-only for the auditor; published values
 * appear in fund and firm summaries. The firm pages already treat `final` as
 * reported, so `isReported` keeps that. VERIFY: the transition graph and who
 * may move it.
 */
export type ValuationWorkflowStatus = 'draft' | 'in-progress' | 'in-review' | 'ready-for-audit' | 'final' | 'published';

export const isReported = (v: Pick<ValuationVersion, 'status'> | undefined) => v?.status === 'final' || v?.status === 'published';

export interface ValuationVersion {
  id: string;
  name: string;
  status: ValuationWorkflowStatus;
  approaches: Approach[];
  scenarios: AllocationScenario[];
}

export type MeasurementOrigin =
  | { kind: 'seed' }
  | { kind: 'rollover'; from: string; keepMarketData: boolean; excludeValuation: boolean; excludeDocuments: boolean };

export interface Measurement {
  /** ISO date. The valuation as-of date. */
  date: string;
  /** ISO date. Market observations are fetched for this date — independent of `date` (P2). */
  marketDate: string;
  origin: MeasurementOrigin;
  /** False when a rollover excluded documents (the source keeps its own). */
  documents: boolean;
  financials: FinancialVersion[];
  capTables: CapTableVersion[];
  valuations: ValuationVersion[];
}

export interface CompanyModel { companyId: string; measurements: Measurement[] }

export type ViewAs = 'analyst' | 'auditor';

/** What a company page is looking at. One per company (P1). */
export interface ValuationContext {
  companyId: string;
  measurementDate: string;
  financialVersionId: string;
  capTableVersionId: string;
  valuationVersionId: string;
  breakpointMode: 'calculated' | 'custom';
  viewAs: ViewAs;
}

/** The minimum a seed needs from a company record. */
export interface CompanySeed { id: string; asOfIso: string; valuationStatus?: ValuationWorkflowStatus }

/* ---------------------------------------------------------------- dates -- */

const pad = (n: number) => String(n).padStart(2, '0');

/** Last day of the month `months` before (negative) or after an ISO date's month. */
export function monthEnd(iso: string, months: number): string {
  const [y, m] = iso.split('-').map(Number) as [number, number];
  const d = new Date(Date.UTC(y, m - 1 + months + 1, 0));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** MM/DD/YYYY → ISO. Returns undefined for anything else. */
export function isoFromUs(us: string | undefined): string | undefined {
  const m = us?.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return undefined;
  const [month, day] = [Number(m[1]), Number(m[2])];
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  return `${m[3]}-${pad(month)}-${pad(day)}`;
}

/** ISO → MM/DD/YYYY. */
export const usFromIso = (iso: string) => `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(0, 4)}`;

/* ----------------------------------------------------------------- seed -- */

const financialsSeed = (): FinancialVersion[] => [
  { id: 'fin-primary', name: 'Primary Financial Statement', scenario: 'base' },
  { id: 'fin-downside', name: 'Downside Case', scenario: 'downside' },
];

const capTablesSeed = (): CapTableVersion[] => [
  { id: 'ct-primary', name: 'Primary Captable', scenario: 'base', ownership: { id: 'own-primary', name: 'Primary Fund Ownership' } },
  { id: 'ct-secondary', name: 'Secondary Captable', scenario: 'option-pool', ownership: { id: 'own-secondary', name: 'Secondary Fund Ownership' } },
];

function valuationSeed(date: string, status: ValuationWorkflowStatus): ValuationVersion {
  return {
    id: 'val-1',
    name: `Version 1 - ${date}`,
    status,
    approaches: [
      { id: 'a-gpc', type: 'gpc', name: 'GPC', weight: 50, calibrated: false },
      { id: 'a-ma', type: 'ma-comps', name: 'M&A Comps', weight: 50, calibrated: false },
      { id: 'a-backsolve', type: 'backsolve', name: 'Backsolve', weight: 0, calibrated: false },
    ],
    scenarios: [
      { id: 's-waterfall', method: 'Waterfall', weight: 75 },
      { id: 's-opm', method: 'OPM', weight: 25 },
    ],
  };
}

/** A company's measurements: its as-of date and the three quarter-ends before it. */
export function seedCompany(c: CompanySeed): CompanyModel {
  // The Figma header draws ABC Co's version as Ready for Audit.
  const latest: ValuationWorkflowStatus = c.id === 'abc-co' ? 'ready-for-audit' : c.valuationStatus ?? 'draft';
  const dates = [c.asOfIso, monthEnd(c.asOfIso, -3), monthEnd(c.asOfIso, -6), monthEnd(c.asOfIso, -9)];
  return {
    companyId: c.id,
    measurements: dates.map((date, i) => ({
      date,
      marketDate: date,
      origin: { kind: 'seed' },
      documents: true,
      financials: financialsSeed(),
      capTables: capTablesSeed(),
      // Earlier measurements were concluded and published; the latest follows the record.
      valuations: [valuationSeed(date, i === 0 ? latest : 'published')],
    })),
  };
}

/* -------------------------------------------------------------- context -- */

export function measurementOf(model: CompanyModel, date: string): Measurement {
  return model.measurements.find((m) => m.date === date) ?? model.measurements[0]!;
}

/** The context a company opens in: its latest measurement and each first version. */
export function defaultContext(model: CompanyModel, date?: string): ValuationContext {
  const m = date ? measurementOf(model, date) : model.measurements[0]!;
  return {
    companyId: model.companyId,
    measurementDate: m.date,
    financialVersionId: m.financials[0]!.id,
    capTableVersionId: m.capTables[0]!.id,
    valuationVersionId: m.valuations[0]?.id ?? '',
    breakpointMode: 'calculated',
    viewAs: 'analyst',
  };
}

/**
 * Identity of the data a page shows. A page's local edits are keyed on it, so a
 * measurement or version switch starts from that version's data — never the
 * previous one's (BUG-04, BUG-07). Presentation-only settings are left out.
 */
export const contextKey = (c: ValuationContext) =>
  [c.companyId, c.measurementDate, c.financialVersionId, c.capTableVersionId, c.valuationVersionId].join('|');

/** Apply a context change. Changing measurement resets every version to that measurement's first (P4). */
export function changeContext(model: CompanyModel, ctx: ValuationContext, patch: Partial<ValuationContext>): ValuationContext {
  if (patch.measurementDate && patch.measurementDate !== ctx.measurementDate) {
    return { ...defaultContext(model, patch.measurementDate), breakpointMode: ctx.breakpointMode, viewAs: ctx.viewAs };
  }
  return { ...ctx, ...patch, companyId: ctx.companyId };
}

export interface Resolved {
  ctx: ValuationContext;
  key: string;
  model: CompanyModel;
  measurement: Measurement;
  financial: FinancialVersion;
  capTable: CapTableVersion;
  /** Always the Cap Table version's pair. */
  ownership: CapTableVersion['ownership'];
  valuation: ValuationVersion | undefined;
  /** The auditor reads a version; nothing is editable (DOC). */
  readOnly: boolean;
}

export function resolve(model: CompanyModel, ctx: ValuationContext): Resolved {
  const measurement = measurementOf(model, ctx.measurementDate);
  const financial = measurement.financials.find((v) => v.id === ctx.financialVersionId) ?? measurement.financials[0]!;
  const capTable = measurement.capTables.find((v) => v.id === ctx.capTableVersionId) ?? measurement.capTables[0]!;
  const valuation = measurement.valuations.find((v) => v.id === ctx.valuationVersionId) ?? measurement.valuations[0];
  return {
    ctx, key: contextKey(ctx), model, measurement, financial, capTable, ownership: capTable.ownership, valuation,
    readOnly: ctx.viewAs === 'auditor',
  };
}

/* ------------------------------------------------------------- reducers -- */

const replaceMeasurement = (model: CompanyModel, m: Measurement): CompanyModel => ({
  ...model, measurements: model.measurements.map((x) => (x.date === m.date ? m : x)),
});

export function updateMeasurement(model: CompanyModel, date: string, fn: (m: Measurement) => Measurement): CompanyModel {
  return replaceMeasurement(model, fn(measurementOf(model, date)));
}

export function updateValuation(
  model: CompanyModel, date: string, versionId: string, fn: (v: ValuationVersion) => ValuationVersion,
): CompanyModel {
  return updateMeasurement(model, date, (m) => ({
    ...m, valuations: m.valuations.map((v) => (v.id === versionId ? fn(v) : v)),
  }));
}

/** P2: only the market date moves. Measurement date, versions and transactions are untouched. */
export const setMarketDate = (model: CompanyModel, date: string, marketDate: string) =>
  updateMeasurement(model, date, (m) => ({ ...m, marketDate }));

const nextId = (prefix: string, taken: string[]) => {
  let i = taken.length + 1;
  while (taken.includes(`${prefix}-${i}`)) i += 1;
  return `${prefix}-${i}`;
};

export type VersionKind = 'financial' | 'capTable' | 'valuation';

/**
 * Save as New Version: clone the version in view under a new id and name. The
 * original is untouched (P4). A cloned Cap Table gets its own paired ownership.
 * A cloned valuation starts as an unpublished draft. Returns the new id.
 */
export function cloneVersion(model: CompanyModel, ctx: ValuationContext, kind: VersionKind, name: string): [CompanyModel, string] {
  const m = measurementOf(model, ctx.measurementDate);
  if (kind === 'financial') {
    const src = m.financials.find((v) => v.id === ctx.financialVersionId) ?? m.financials[0]!;
    const id = nextId('fin', m.financials.map((v) => v.id));
    return [replaceMeasurement(model, { ...m, financials: [...m.financials, { ...src, id, name }] }), id];
  }
  if (kind === 'capTable') {
    const src = m.capTables.find((v) => v.id === ctx.capTableVersionId) ?? m.capTables[0]!;
    const id = nextId('ct', m.capTables.map((v) => v.id));
    const copy: CapTableVersion = { ...src, id, name, ownership: { id: `own-${id}`, name: `${name} Fund Ownership` } };
    return [replaceMeasurement(model, { ...m, capTables: [...m.capTables, copy] }), id];
  }
  const src = m.valuations.find((v) => v.id === ctx.valuationVersionId) ?? m.valuations[0];
  const id = nextId('val', m.valuations.map((v) => v.id));
  const copy: ValuationVersion = src
    ? { ...src, id, name, status: 'draft', approaches: src.approaches.map((a) => ({ ...a })), scenarios: src.scenarios.map((s) => ({ ...s })) }
    : { ...valuationSeed(m.date, 'draft'), id, name, approaches: [] };
  return [replaceMeasurement(model, { ...m, valuations: [...m.valuations, copy] }), id];
}

export interface RolloverOptions {
  from: string;
  to: string;
  keepMarketData: boolean;
  excludeValuation: boolean;
  excludeDocuments: boolean;
}

export type RolloverCheck = { ok: true } | { ok: false; reason: string };

/** INFER: a rollover only moves forward and never lands on an existing measurement. */
export function checkRollover(model: CompanyModel, o: Pick<RolloverOptions, 'from' | 'to'>): RolloverCheck {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(o.to)) return { ok: false, reason: 'Choose a target measurement date.' };
  if (o.to <= o.from) return { ok: false, reason: 'The target date must be after the source measurement date.' };
  if (model.measurements.some((m) => m.date === o.to)) return { ok: false, reason: 'A measurement already exists on that date. Rollover never overwrites a measurement.' };
  return { ok: true };
}

/**
 * Rollover (DOC): carry a measurement forward to a new date. The source is
 * never changed. `keepMarketData` keeps the source market date, otherwise the
 * market date moves to the target. `excludeValuation` leaves the new
 * measurement with no valuation versions; `excludeDocuments` carries no
 * documents. VERIFY: exactly which records the real product copies.
 */
export function rollover(model: CompanyModel, o: RolloverOptions): CompanyModel {
  const check = checkRollover(model, o);
  if (!check.ok) throw new Error(check.reason);
  const src = measurementOf(model, o.from);
  const next: Measurement = {
    date: o.to,
    marketDate: o.keepMarketData ? src.marketDate : o.to,
    origin: { kind: 'rollover', from: o.from, keepMarketData: o.keepMarketData, excludeValuation: o.excludeValuation, excludeDocuments: o.excludeDocuments },
    documents: !o.excludeDocuments && src.documents,
    financials: src.financials.map((v) => ({ ...v })),
    capTables: src.capTables.map((v) => ({ ...v, ownership: { ...v.ownership } })),
    valuations: o.excludeValuation ? [] : src.valuations.map((v) => ({
      ...v,
      name: v.name.replace(src.date, o.to),
      status: 'draft',
      approaches: v.approaches.map((a) => ({ ...a })),
      scenarios: v.scenarios.map((s) => ({ ...s })),
    })),
  };
  const measurements = [...model.measurements, next].sort((a, b) => (a.date < b.date ? 1 : -1));
  return { ...model, measurements };
}

/** Approaches that count towards the concluded value: every one not calibrated (DOC). */
export const includedApproaches = (v: ValuationVersion | undefined) => (v?.approaches ?? []).filter((a) => !a.calibrated);
