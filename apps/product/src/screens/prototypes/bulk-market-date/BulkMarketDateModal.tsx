/**
 * Bulk Actions → Update market date (domain-logic.md §3, P3; training S12).
 *
 * DOC: one action refreshes the market date of several companies at once
 * without rebuilding measurements or copying valuation data. The invariant is
 * spelled out in the dialog and enforced by the model (`valuation.bulkMarketDate`
 * only moves each company's market date): no measurement, version, Cap Table
 * or transaction date is created or changed. VERIFY: batch scope and rollback.
 */
import { useMemo, useState } from 'react';
import {
  Banner, Button, Checkbox, DatePicker, Modal, ModalSearch, Text, space,
} from '@scalar/design-system';
import { companies, type Company } from '../../../data/fixtures.js';
import { valuation } from '../../../domain/context.js';
import { usFromIso } from '../../../domain/model.js';

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function BulkMarketDateModal({ open, onClose, onDone }: {
  open: boolean;
  onClose: () => void;
  /** Called with what was updated, for the page's confirmation. */
  onDone: (summary: { count: number; date: string }) => void;
}) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [date, setDate] = useState<string | undefined>();
  const q = query.trim().toLowerCase();
  const list = useMemo(() => companies.filter((c) => c.name.toLowerCase().includes(q)), [q]);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const apply = () => {
    if (!date || !picked.length) return;
    const chosen: Company[] = companies.filter((c) => picked.includes(c.id));
    valuation.bulkMarketDate(chosen, date);
    onDone({ count: chosen.length, date });
    setPicked([]);
    setDate(undefined);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update market date"
      size="l"
      footer={
        <>
          <Text step="s" tone="secondary">{`${picked.length} compan${picked.length === 1 ? 'y' : 'ies'} selected`}</Text>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: space.s }}>
            <Button variant="tertiary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" disabled={!date || !picked.length} onClick={apply}>
              {date ? `Update market date to ${usFromIso(date)}` : 'Update market date'}
            </Button>
          </div>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
        <Banner tone="info" title="This is not a rollover">
          Each selected company keeps its current measurement. Only the date its market prices and comps are fetched for changes. No measurements or versions are created.
        </Banner>
        <div style={{ display: 'flex', gap: space.l, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
            <Text step="m" weight="semiBold">New market date</Text>
            <DatePicker value={date ? new Date(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10))) : undefined} onChange={(d) => setDate(toIso(d))} aria-label="New market date" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs, flex: 1, minWidth: 0 }}>
            <ModalSearch placeholder="Search companies…" aria-label="Search companies" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '40vh', overflowY: 'auto' }}>
              {list.map((c) => (
                <Checkbox key={c.id} size="s" checked={picked.includes(c.id)} onChange={() => toggle(c.id)}>{c.name}</Checkbox>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
