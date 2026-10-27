/**
 * Rollover — create a new measurement from an existing one (domain-logic.md §3, P3).
 *
 * DOC: options Keep market data, Exclude valuation and Exclude documents; the
 * source measurement is carried forward, never edited. INFER: the preview of
 * what will be created, and the rule that the target must be a new, later date.
 * VERIFY: exactly which records the real product copies — the preview lists
 * only what the prototype copies.
 *
 * The title and the confirm button both say "Roll over", so it can't be taken
 * for a market-date update, which creates nothing.
 */
import { useMemo, useState } from 'react';
import {
  Banner, Button, Checkbox, Modal, RadioGroup, Radio, Text, space,
} from '@scalar/design-system';
import type { Company } from '../../../data/fixtures.js';
import { useValuationContext, valuation } from '../../../domain/context.js';
import { checkRollover, monthEnd, usFromIso } from '../../../domain/model.js';
import { guarded } from '../../../domain/useDirtyGuard.js';
import { closeRollover, useRolloverOpen } from './state.js';

export function RolloverDialog({ company }: { company: Company }) {
  const open = useRolloverOpen(company.id);
  return open ? <RolloverForm company={company} /> : null;
}

function RolloverForm({ company }: { company: Company }) {
  const v = useValuationContext(company);
  const [from, setFrom] = useState(v.measurement.date);
  const [to, setTo] = useState(() => monthEnd(v.model.measurements[0]!.date, 3));
  const [keepMarketData, setKeep] = useState(false);
  const [excludeValuation, setExcludeValuation] = useState(false);
  const [excludeDocuments, setExcludeDocuments] = useState(false);
  const source = v.model.measurements.find((m) => m.date === from)!;
  const check = checkRollover(v.model, { from, to });

  const targets = useMemo(() => [1, 2, 3, 4].map((q) => monthEnd(v.model.measurements[0]!.date, q * 3)), [v.model]);

  const confirm = () => {
    if (!check.ok) return;
    closeRollover();
    guarded(() => valuation.rollover(company, { from, to, keepMarketData, excludeValuation, excludeDocuments }));
  };

  const preview = [
    `${source.financials.length} financial version(s): ${source.financials.map((f) => f.name).join(', ')}`,
    `${source.capTables.length} cap table version(s), each with its paired Fund Ownership`,
    excludeValuation
      ? 'No valuation — the new measurement starts with an empty Valuations area'
      : `${source.valuations.length} valuation version(s), restarted as drafts`,
    excludeDocuments ? 'No documents' : 'Document references',
    keepMarketData
      ? `Market date stays ${usFromIso(source.marketDate)} (market data is not refreshed)`
      : `Market date moves to ${usFromIso(to)} (market data refreshes)`,
  ];

  return (
    <Modal
      open
      onClose={closeRollover}
      title="Roll over to a new measurement"
      size="l"
      footer={
        <>
          <Button variant="secondary" onClick={closeRollover}>Cancel</Button>
          <Button onClick={confirm} disabled={!check.ok}>{`Roll over to ${usFromIso(to)}`}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
        <Text step="m">
          {`Creates a new ${company.name} measurement from an existing one. The source measurement is not changed. To refresh prices without creating a measurement, change the Market Date instead.`}
        </Text>

        <RadioGroup label="Source measurement" value={from} onValueChange={setFrom}>
          {v.model.measurements.map((m) => <Radio key={m.date} value={m.date}>{usFromIso(m.date)}</Radio>)}
        </RadioGroup>

        <RadioGroup label="New measurement date" value={to} onValueChange={setTo} error={check.ok ? undefined : check.reason}>
          {targets.map((d) => <Radio key={d} value={d}>{usFromIso(d)}</Radio>)}
        </RadioGroup>

        <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
          <Checkbox checked={keepMarketData} onChange={(e) => setKeep(e.currentTarget.checked)} description="Keep the source market date and prices instead of refreshing them for the new date.">
            Keep market data
          </Checkbox>
          <Checkbox checked={excludeValuation} onChange={(e) => setExcludeValuation(e.currentTarget.checked)} description="Start the new measurement with no valuation versions.">
            Exclude valuation
          </Checkbox>
          <Checkbox checked={excludeDocuments} onChange={(e) => setExcludeDocuments(e.currentTarget.checked)} description="Leave documents with the source measurement. They are not deleted.">
            Exclude documents
          </Checkbox>
        </div>

        <Banner tone="info" title={`What ${usFromIso(to)} will start with`}>
          <ul style={{ margin: 0, paddingLeft: space.l }}>
            {preview.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </Banner>
      </div>
    </Modal>
  );
}
