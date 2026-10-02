/**
 * Demo data for the Company Valuations v2 prototype. Every figure is derived
 * from the company record (equityValue, fairValue, invested, moic) so the page
 * agrees with the rest of the product. Older versions are the same company
 * scaled back quarter by quarter — synthetic, deterministic.
 */
import { usDate } from '../../../data/db.js';
import type { Company } from '../../../data/fixtures.js';
import { statusView } from '../../p02-intelligence/data.js';

export interface ValuationVersion {
  key: string;
  /** "Version 4 - 2026-06-30". */
  label: string;
  /** ISO measurement date. */
  isoDate: string;
  date: string;
  status: (typeof statusView)[keyof typeof statusView] & { key: Company['valuationStatus'] };
  /** 1 for the current version; earlier ones are scaled back. */
  scale: number;
  equityValue: number;
  fairValue: number;
}

/** Quarter-end ISO date `back` quarters before `iso`. */
function quarterBack(iso: string, back: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1 - back * 3, 0));
  return end.toISOString().slice(0, 10);
}

const SCALES = [1, 0.93, 0.88, 0.8];

/** Newest first. The newest carries the company's workflow status; earlier ones are Published. */
export function versionsFor(c: Company): ValuationVersion[] {
  return SCALES.map((scale, i) => {
    const isoDate = i === 0 ? c.asOfIso : quarterBack(c.asOfIso, i);
    const key: Company['valuationStatus'] = i === 0 ? c.valuationStatus : 'published';
    return {
      key: `v${SCALES.length - i}`,
      label: `Version ${SCALES.length - i} - ${isoDate}`,
      isoDate,
      date: usDate(isoDate),
      status: { ...statusView[key], key },
      scale,
      equityValue: Math.round(c.equityValue * scale),
      fairValue: Math.round(c.fairValue * scale),
    };
  });
}

/** Approaches in the version, with the weight each carries into the enterprise value. */
export const APPROACH_WEIGHTS = [
  { label: 'GPC', weight: 50 },
  { label: 'M&A Comps', weight: 50 },
] as const;

/** "$122,397" → 122397, so approach rows from p08 can be scaled per version. */
export const moneyToNumber = (s?: string) => Number((s ?? '').replace(/[^0-9.-]/g, '')) || 0;

export const moic = (value: number, invested: number) => `${(invested ? value / invested : 0).toFixed(2)}x`;
