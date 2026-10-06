/**
 * Date menu — the measurement-date picker under "Date" in the Primary Menu
 * (Figma 01 · Home: "Home — Date dropdown open"). A searchable Combobox Panel
 * of measurement dates, newest first, with "Show N more measurement dates"
 * and "Add Measurement Date".
 *
 * The selected date is a portfolio-wide filter; in this prototype picking one
 * closes the menu (the value in force is owned by AppFrame's `date` prop).
 */
import { useMemo, useState } from 'react';
import { Button, ComboboxPanel, Icon, icons } from '@scalar/design-system';
import { measurementDates, MENU_PAGE } from './data.js';
import { Popover } from './Popover.js';
import type { OverlayProps } from './index.js';

export function DateMenu({ company, onClose }: OverlayProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const current = company ? `Most Recent (${company.asOf})` : measurementDates[0]!;
  const dates = company ? [current, ...measurementDates.slice(1)] : measurementDates;

  const matches = useMemo(() => dates.filter((d) => d.toLowerCase().includes(query.trim().toLowerCase())), [dates, query]);
  const visible = expanded || query ? matches : matches.slice(0, MENU_PAGE);
  const hidden = matches.length - visible.length;

  return (
    <Popover onClose={onClose} placement={{ left: '30.5%' }} label="Measurement date">
      <ComboboxPanel
        autoFocus
        label="Measurement dates"
        searchPlaceholder="Find a Measurement Date"
        query={query}
        onQueryChange={setQuery}
        items={visible.map((d) => ({ value: d, label: d }))}
        value={current}
        onSelect={onClose}
        showMore={hidden > 0 ? { label: `Show ${hidden} more measurement dates`, onClick: () => setExpanded(true) } : undefined}
        footer={
          <Button
            variant="secondary"
            leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}
            onClick={onClose}
            style={{ width: '100%' }}
          >
            Add Measurement Date
          </Button>
        }
      />
    </Popover>
  );
}
