/**
 * Market Date picker in the Valuations header (domain-logic.md §3, P2).
 *
 * The market date is the date market observations (prices, comps) are fetched
 * for. Editing it refreshes market-derived values for *this* measurement only:
 * the measurement date, the versions and every transaction date stay as they
 * are. It is not a rollover and creates nothing. The panel says so, and shows
 * the freshness of the market data with `DataFreshness`.
 */
import { useState } from 'react';
import { Button, DataFreshness, DatePicker, Selector, Text, color, elevation, radius, space } from '@scalar/design-system';
import type { Company } from '../data/fixtures.js';
import { useValuationContext, valuation } from '../domain/context.js';
import { usFromIso } from '../domain/model.js';
import { Anchored } from './VersionPicker.js';

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromIso = (iso: string) => new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));

export function MarketDatePicker({ company }: { company: Company }) {
  const { measurement, readOnly } = useValuationContext(company);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(measurement.marketDate);
  const changed = draft !== measurement.marketDate;

  const apply = () => {
    valuation.setMarketDate(company, draft);
    setOpen(false);
  };

  return (
    <Anchored
      open={open}
      popover={
        <div
          role="dialog"
          aria-label="Market date"
          style={{
            display: 'flex', flexDirection: 'column', gap: space.s, padding: space.m, width: 'max-content',
            background: color.bg.surfaceRaised, borderRadius: radius.m, boxShadow: elevation.overlay,
          }}
        >
          <DatePicker value={fromIso(draft)} onChange={(d) => setDraft(toIso(d))} aria-label="Market date" />
          <Text step="s" tone="secondary">
            {`Refreshes market prices and comps for the ${usFromIso(measurement.date)} measurement only. The measurement date does not change.`}
          </Text>
          <DataFreshness state={changed ? 'stale' : 'current'}>
            {changed ? `Market data still as of ${usFromIso(measurement.marketDate)}` : `Market data as of ${usFromIso(measurement.marketDate)}`}
          </DataFreshness>
          <div style={{ display: 'flex', gap: space.s, justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="s" onClick={() => { setDraft(measurement.marketDate); setOpen(false); }}>Cancel</Button>
            <Button size="s" onClick={apply} disabled={!changed || readOnly}>Update market date</Button>
          </div>
        </div>
      }
    >
      <Selector
        surface="surface"
        label="Market Date"
        value={usFromIso(measurement.marketDate)}
        expanded={open}
        onClick={() => { setDraft(measurement.marketDate); setOpen((o) => !o); }}
      />
    </Anchored>
  );
}
