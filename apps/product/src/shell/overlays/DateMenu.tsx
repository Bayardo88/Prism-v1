/**
 * Date menu — the measurement-date picker under "Date" in the Primary Menu
 * (Figma 01 · Home: "Home — Date dropdown open"). A searchable Combobox Panel
 * of measurement dates, newest first, with "Show N more measurement dates"
 * and "Add Measurement Date".
 *
 * On a company page it lists that company's measurements and picking one
 * changes the company's valuation context (P1), asking first if the page has
 * unsaved edits. "Add Measurement Date" opens Rollover, which creates a new
 * measurement from an existing one. On firm pages the date is a portfolio
 * filter and picking one only closes the menu.
 */
import { useMemo, useState } from 'react';
import { Button, ComboboxPanel, Icon, icons } from '@scalar/design-system';
import { measurementDates, MENU_PAGE } from './data.js';
import { Popover } from './Popover.js';
import type { OverlayProps } from './index.js';
import { useValuationContext, valuation } from '../../domain/context.js';
import { usFromIso } from '../../domain/model.js';
import { guarded } from '../../domain/useDirtyGuard.js';
import { openRollover } from '../../screens/prototypes/rollover/state.js';
import type { Company } from '../../data/fixtures.js';

export function DateMenu({ company, onClose }: OverlayProps) {
  return company ? <CompanyDateMenu company={company} onClose={onClose} /> : <FirmDateMenu onClose={onClose} />;
}

function DatePanel({ dates, current, onSelect, onAdd }: {
  dates: string[]; current: string; onSelect: (d: string) => void; onAdd: () => void;
}) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const matches = useMemo(() => dates.filter((d) => d.toLowerCase().includes(query.trim().toLowerCase())), [dates, query]);
  const visible = expanded || query ? matches : matches.slice(0, MENU_PAGE);
  const hidden = matches.length - visible.length;

  return (
    <ComboboxPanel
      autoFocus
      label="Measurement dates"
      searchPlaceholder="Find a Measurement Date"
      query={query}
      onQueryChange={setQuery}
      items={visible.map((d) => ({ value: d, label: d }))}
      value={current}
      onSelect={onSelect}
      showMore={hidden > 0 ? { label: `Show ${hidden} more measurement dates`, onClick: () => setExpanded(true) } : undefined}
      footer={
        <Button
          variant="secondary"
          leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}
          onClick={onAdd}
          style={{ width: '100%' }}
        >
          Add Measurement Date
        </Button>
      }
    />
  );
}

function FirmDateMenu({ onClose }: { onClose: () => void }) {
  return (
    <Popover onClose={onClose} placement={{ left: '30.5%' }} label="Measurement date">
      <DatePanel dates={measurementDates} current={measurementDates[0]!} onSelect={onClose} onAdd={onClose} />
    </Popover>
  );
}

function CompanyDateMenu({ company, onClose }: { company: Company; onClose: () => void }) {
  const { model, measurement } = useValuationContext(company);
  const label = (iso: string, i: number) => (i === 0 ? `Most Recent (${usFromIso(iso)})` : usFromIso(iso));
  const dates = model.measurements.map((m, i) => label(m.date, i));
  const current = label(measurement.date, model.measurements.findIndex((m) => m.date === measurement.date));
  const pick = (shown: string) => {
    onClose();
    const iso = model.measurements[dates.indexOf(shown)]?.date;
    if (iso && iso !== measurement.date) guarded(() => valuation.selectMeasurement(company, iso));
  };
  return (
    <Popover onClose={onClose} placement={{ left: '30.5%' }} label="Measurement date">
      <DatePanel dates={dates} current={current} onSelect={pick} onAdd={() => { onClose(); openRollover(company.id); }} />
    </Popover>
  );
}
