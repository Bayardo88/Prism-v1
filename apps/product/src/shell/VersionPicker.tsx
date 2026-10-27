/**
 * Version picker for the Financials, Cap Table and Valuation versions of the
 * measurement in view (domain-logic.md §4). A light-surface `Selector` that
 * opens a searchable panel of versions with "Save as New Version".
 *
 * - Picking a version changes the company's valuation context, so every page
 *   of the company follows it. With unsaved edits on the page it asks first.
 * - "Save as New Version" clones the version in view (the original is kept)
 *   and switches to the clone. A Cap Table clone gets its own Fund Ownership pair.
 */
import { useState, type ReactNode } from 'react';
import { Button, ComboboxPanel, Icon, Selector, icons, space, zIndex } from '@scalar/design-system';
import type { Company } from '../data/fixtures.js';
import { useValuationContext, valuation } from '../domain/context.js';
import type { VersionKind } from '../domain/model.js';
import { guarded } from '../domain/useDirtyGuard.js';

const LABEL: Record<VersionKind, string> = { financial: 'Financials Version', capTable: 'Cap Table Version', valuation: 'Version' };
const LIST: Record<VersionKind, string> = { financial: 'Financials versions', capTable: 'Cap table versions', valuation: 'Valuation versions' };

export interface VersionPickerProps {
  company: Company;
  kind: VersionKind;
  /** Open on first render (Figma states that draw the menu open). */
  initialOpen?: boolean;
  /** Overrides the trigger label. */
  label?: string;
}

export function VersionPicker({ company, kind, initialOpen = false, label }: VersionPickerProps) {
  const v = useValuationContext(company);
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState('');

  const list = kind === 'financial' ? v.measurement.financials : kind === 'capTable' ? v.measurement.capTables : v.measurement.valuations;
  const current = kind === 'financial' ? v.financial : kind === 'capTable' ? v.capTable : v.valuation;
  const items = list
    .filter((x) => x.name.toLowerCase().includes(query.trim().toLowerCase()))
    .map((x) => ({ value: x.id, label: x.name, detail: kind === 'capTable' && 'ownership' in x ? `Paired: ${x.ownership.name}` : undefined }));

  const pick = (id: string) => {
    setOpen(false);
    if (id !== current?.id) guarded(() => valuation.selectVersion(company, kind, id));
  };
  const saveAsNew = () => {
    setOpen(false);
    const base = kind === 'valuation' ? `Version ${list.length + 1} - ${v.measurement.date}` : `${current?.name ?? 'Version'} (copy ${list.length})`;
    guarded(() => valuation.saveAsNewVersion(company, kind, base));
  };

  return (
    <Anchored
      open={open}
      popover={
        <ComboboxPanel
          autoFocus
          label={LIST[kind]}
          items={items}
          value={current?.id}
          query={query}
          onQueryChange={setQuery}
          onEscape={() => setOpen(false)}
          searchPlaceholder="Find a Version"
          onSelect={pick}
          footer={
            <Button variant="secondary" leadingIcon={<Icon size="xs" tone="inherit"><icons.Add /></Icon>} onClick={saveAsNew} disabled={v.readOnly}>
              Save as New Version
            </Button>
          }
        />
      }
    >
      <Selector
        surface="surface"
        label={label ?? LABEL[kind]}
        value={current?.name ?? 'No version'}
        expanded={open}
        onClick={() => setOpen((o) => !o)}
      />
    </Anchored>
  );
}

/** A trigger with an anchored popover. The trigger owns open state (AI-GUIDE §7). */
export function Anchored({ children, popover, open }: { children: ReactNode; popover: ReactNode; open: boolean }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      {open && (
        <span style={{ position: 'absolute', top: '100%', right: 0, marginTop: space.xs, zIndex: zIndex.overlay }}>{popover}</span>
      )}
    </span>
  );
}
