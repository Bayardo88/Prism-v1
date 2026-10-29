/**
 * The financial-statement grid shared by Income Statement, Performance
 * Metrics, Balance Sheet and KPIs: the row-label column, historical periods,
 * the brand period rule, a run of projection columns (each `ColumnHeader` tagged
 * "Projection" through its `label`) and a trailing group (LTM / NTM, or As Of)
 * that follows the last projection directly, with no gutter between them.
 *
 * Built on `DataGrid` + `Row` with the grid-pattern cells directly inside;
 * There is no group row: a period's kind ("Projection", "LTM", "NTM", "As Of")
 * is the `ColumnHeader` label tag, and a column menu sits in its `actions`. The tracks are passed
 * explicitly (`columns`) only because the period rule is a track of its own —
 * derived from the header it would get a `1fr` share. Value columns keep the header-sized `minmax(max-content, 1fr)` track.
 *
 * A column menu (KPI Copy / Delete) is drawn outside the grid, anchored to its
 * header, because the grid scrolls sideways inside itself and would clip it.
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  DataGrid, Footnote, GridColumnDivider, ColumnHeader, GridValueCell, Row, RowLabelCell,
  icons, zIndex, type RowLabelType, type ValueKind,
} from '@scalar/design-system';
import type { GridRowDef, GridValue } from './data.js';
import { rescaleAmountText, useDisplayCurrency, useDisplayUnit } from '../../shell/displayUnit.js';
import type { CurrencyDisplayUnit } from '@scalar/design-system';

export interface GridColumn {
  key: string;
  /** Header label, one line ("FY 2024", "12/31/2024"). */
  label: string;
  zone: 'hist' | 'proj' | 'trail';
  /** Tag beside the header label (`ColumnHeader label`): "Projection", "LTM", "NTM", "As Of". */
  tag?: string;
  /** The header is an editable date (LTM / NTM / As Of). */
  editableDate?: boolean;
  /** Footnote reference drawn beside the label. */
  footnote?: string;
  /** Active column (blue top tab) — used by the KPI column menu. */
  selected?: boolean;
  /** Trailing header controls (`ColumnHeader actions`), e.g. a column-actions trigger. */
  actions?: ReactNode;
}

export interface GridRow extends GridRowDef {
  key?: string;
  /** Makes the row label expandable. */
  expanded?: boolean;
  onToggle?: () => void;
  /** Replaces the label text (e.g. an "Enter data" placeholder). */
  labelContent?: ReactNode;
}

type Slot = { kind: 'label' } | { kind: 'rule' } | { kind: 'col'; col: GridColumn; i: number };

function slotsFor(cols: GridColumn[]): Slot[] {
  const out: Slot[] = [{ kind: 'label' }];
  cols.forEach((col, i) => {
    const prev = cols[i - 1];
    if (col.zone === 'proj' && prev?.zone !== 'proj') out.push({ kind: 'rule' });
    out.push({ kind: 'col', col, i });
  });
  return out;
}

const TRACK: Record<Slot['kind'], string> = {
  label: 'minmax(max-content, 2.4fr)',
  rule: 'max-content',
  col: 'minmax(max-content, 1fr)',
};

/** One value cell; dollar amounts follow the Currency Selector's display unit and currency. */
function cellValue(v: GridValue, emptyKind: ValueKind, key: string, unit: CurrencyDisplayUnit, currency: string) {
  if (v === undefined) return <GridValueCell key={key} kind={emptyKind} />;
  if (typeof v === 'string') return <GridValueCell key={key} kind={emptyKind === 'total' ? 'total' : 'calculated'}>{rescaleAmountText(v, unit, currency)}</GridValueCell>;
  return <GridValueCell key={key} kind={v.kind} state={v.focused ? 'focused' : 'default'}>{v.v === undefined ? undefined : rescaleAmountText(v.v, unit, currency)}</GridValueCell>;
}

export function FinancialGrid({ title, columns, rows, label, menu }: {
  title: string;
  columns: GridColumn[];
  rows: GridRow[];
  /** Accessible name of the grid; defaults to the title. */
  label?: string;
  /** A column menu anchored under the header of `columnKey`. */
  menu?: { columnKey: string; content: ReactNode };
}) {
  const slots = slotsFor(columns);
  const unit = useDisplayUnit();
  const currency = useDisplayCurrency();
  const wrap = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null);
  const menuKey = menu?.columnKey;

  useLayoutEffect(() => {
    const head = menuKey && wrap.current?.querySelector<HTMLElement>(`[data-col="${menuKey}"]`);
    if (!head || !wrap.current) { setAnchor(null); return; }
    const box = wrap.current.getBoundingClientRect();
    const r = head.getBoundingClientRect();
    setAnchor({ left: r.left - box.left, top: r.bottom - box.top });
  }, [menuKey, columns.length]);

  const head = slots.map((s, n) => {
    const k = `h${n}`;
    if (s.kind === 'label') return <ColumnHeader key={k} grow={2.4}>{title}</ColumnHeader>;
    if (s.kind === 'rule') return <GridColumnDivider key={k} type="period" />;
    const c = s.col;
    return (
      <ColumnHeader key={k} numeric label={c.tag} actions={c.actions} input={c.editableDate} icon={c.editableDate ? <icons.CalendarToday /> : undefined} selected={c.selected} data-col={c.key}>
        {c.label}
        {c.footnote && <Footnote>[{c.footnote}]</Footnote>}
      </ColumnHeader>
    );
  });

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <DataGrid label={label ?? title} columns={slots.map((s) => TRACK[s.kind])} head={<>{head}</>}>
        {rows.map((r, ri) => {
          const emptyKind: ValueKind = r.emptyKind ?? 'editable';
          return (
            <Row key={r.key ?? `${r.label}-${ri}`} zebra={ri % 2 === 1}>
              {slots.map((s, n) => {
                const k = `c${n}`;
                if (s.kind === 'label') {
                  const type = (r.type ?? 'line-item') as RowLabelType;
                  const content = r.labelContent ?? r.label;
                  return r.expanded !== undefined && r.onToggle ? (
                    <RowLabelCell key={k} type={type} expanded={r.expanded} onToggle={r.onToggle}>{content}</RowLabelCell>
                  ) : (
                    <RowLabelCell key={k} type={type}>{content}</RowLabelCell>
                  );
                }
                if (s.kind === 'rule') return <GridColumnDivider key={k} type="period" />;
                return cellValue(r.values?.[s.i], emptyKind, k, unit, currency);
              })}
            </Row>
          );
        })}
      </DataGrid>
      {menu && anchor && (
        <div style={{ position: 'absolute', left: anchor.left, top: anchor.top, zIndex: zIndex.overlay }}>{menu.content}</div>
      )}
    </div>
  );
}

/* --- Column builders ------------------------------------------------------ */

export const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const fy = (y: number, zone: GridColumn['zone']): GridColumn => ({
  key: `fy${y}`, label: `FY ${y}`, zone, tag: zone === 'proj' ? 'Projection' : undefined,
});

/** A period column dated at the fiscal year end (`MM/DD`), as the Balance Sheet shows it. */
export const yearEnd = (y: number, zone: GridColumn['zone'], monthDay: string): GridColumn => ({
  key: `ye${y}`, label: `${monthDay}/${y}`, zone, tag: zone === 'proj' ? 'Projection' : undefined,
});
