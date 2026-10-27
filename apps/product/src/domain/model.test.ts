import { describe, expect, it } from 'vitest';
import {
  changeContext, checkRollover, cloneVersion, contextKey, defaultContext, includedApproaches, isReported, isoFromUs, monthEnd,
  resolve, rollover, seedCompany, setMarketDate, usFromIso,
} from './model.js';

const abc = seedCompany({ id: 'abc-co', asOfIso: '2024-12-31' });
const other = seedCompany({ id: 'other', asOfIso: '2026-06-30', valuationStatus: 'published' });

describe('dates', () => {
  it('steps back by quarter-ends', () => {
    expect(monthEnd('2024-12-31', -3)).toBe('2024-09-30');
    expect(monthEnd('2024-03-31', -1)).toBe('2024-02-29');
  });
  it('converts US and ISO dates', () => {
    expect(isoFromUs('8/7/2023')).toBe('2023-08-07');
    expect(isoFromUs('2023-08-07')).toBeUndefined();
    expect(usFromIso('2023-08-07')).toBe('08/07/2023');
  });
});

describe('seed', () => {
  it('gives a company its as-of measurement and three earlier ones, newest first', () => {
    expect(abc.measurements.map((m) => m.date)).toEqual(['2024-12-31', '2024-09-30', '2024-06-30', '2024-03-31']);
  });
  it('holds the market date apart from the measurement date (P2)', () => {
    const moved = setMarketDate(abc, '2024-12-31', '2025-01-15');
    expect(moved.measurements[0]!.marketDate).toBe('2025-01-15');
    expect(moved.measurements[0]!.date).toBe('2024-12-31');
  });
  it('pairs every Cap Table version with its own Fund Ownership version', () => {
    const ids = abc.measurements[0]!.capTables.map((v) => v.ownership.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('seeds the latest status from the record and earlier ones as published', () => {
    expect(abc.measurements[0]!.valuations[0]!.status).toBe('ready-for-audit');
    expect(isReported(abc.measurements[0]!.valuations[0])).toBe(false);
    expect(isReported(other.measurements[0]!.valuations[0])).toBe(true);
    expect(abc.measurements[1]!.valuations[0]!.status).toBe('published');
  });
});

describe('context', () => {
  it('resolves the paired ownership of the Cap Table in view', () => {
    const ctx = { ...defaultContext(abc), capTableVersionId: 'ct-secondary' };
    expect(resolve(abc, ctx).ownership.id).toBe('own-secondary');
  });
  it('resets every version when the measurement changes (P4)', () => {
    const ctx = { ...defaultContext(abc), capTableVersionId: 'ct-secondary', financialVersionId: 'fin-downside', viewAs: 'auditor' as const };
    const next = changeContext(abc, ctx, { measurementDate: '2024-09-30' });
    expect(next).toMatchObject({ measurementDate: '2024-09-30', capTableVersionId: 'ct-primary', financialVersionId: 'fin-primary', viewAs: 'auditor' });
  });
  it('keys page data on measurement and versions only', () => {
    const ctx = defaultContext(abc);
    expect(contextKey({ ...ctx, viewAs: 'auditor', breakpointMode: 'custom' })).toBe(contextKey(ctx));
    expect(contextKey({ ...ctx, capTableVersionId: 'ct-secondary' })).not.toBe(contextKey(ctx));
  });
});

describe('versions', () => {
  it('Save as New Version clones and leaves the original untouched', () => {
    const ctx = defaultContext(abc);
    const [model, id] = cloneVersion(abc, ctx, 'valuation', 'Version 2');
    const [v1, v2] = model.measurements[0]!.valuations;
    expect(v1).toBe(abc.measurements[0]!.valuations[0]);
    expect(v2).toMatchObject({ id, name: 'Version 2', status: 'draft' });
    expect(v2!.approaches).not.toBe(v1!.approaches);
  });
  it('a cloned Cap Table gets its own Fund Ownership pair', () => {
    const [model, id] = cloneVersion(abc, defaultContext(abc), 'capTable', 'Option pool 15%');
    const ct = model.measurements[0]!.capTables.find((v) => v.id === id)!;
    expect(ct.ownership.id).toBe(`own-${id}`);
  });
  it('a calibrated approach is left out of the summary', () => {
    const v = abc.measurements[0]!.valuations[0]!;
    const calibrated = { ...v, approaches: v.approaches.map((a) => (a.type === 'backsolve' ? { ...a, calibrated: true } : a)) };
    expect(includedApproaches(calibrated).map((a) => a.type)).toEqual(['gpc', 'ma-comps']);
  });
});

describe('rollover', () => {
  const base = { from: '2024-12-31', keepMarketData: false, excludeValuation: false, excludeDocuments: false };
  it('creates a new measurement and never changes the source', () => {
    const model = rollover(abc, { ...base, to: '2025-03-31' });
    expect(model.measurements[0]!.date).toBe('2025-03-31');
    expect(model.measurements.find((m) => m.date === '2024-12-31')).toBe(abc.measurements[0]);
  });
  it('moves the market date to the target unless asked to keep it', () => {
    expect(rollover(abc, { ...base, to: '2025-03-31' }).measurements[0]!.marketDate).toBe('2025-03-31');
    expect(rollover(abc, { ...base, to: '2025-03-31', keepMarketData: true }).measurements[0]!.marketDate).toBe('2024-12-31');
  });
  it('honours exclude valuation and exclude documents', () => {
    const m = rollover(abc, { ...base, to: '2025-03-31', excludeValuation: true, excludeDocuments: true }).measurements[0]!;
    expect(m.valuations).toEqual([]);
    expect(m.documents).toBe(false);
  });
  it('rolled valuations restart as unpublished drafts', () => {
    const v = rollover(abc, { ...base, to: '2025-03-31' }).measurements[0]!.valuations[0]!;
    expect([v.status, v.name]).toEqual(['draft', 'Version 1 - 2025-03-31']);
  });
  it('refuses to go backwards or onto an existing measurement', () => {
    expect(checkRollover(abc, { from: '2024-12-31', to: '2024-09-30' }).ok).toBe(false);
    expect(checkRollover(abc, { from: '2024-06-30', to: '2024-12-31' }).ok).toBe(false);
    expect(() => rollover(abc, { ...base, to: '2024-12-31' })).toThrow();
  });
});
