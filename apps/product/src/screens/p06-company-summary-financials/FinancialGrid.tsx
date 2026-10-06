/**
 * The financial-statement grid shared by Income Statement, Performance
 * Metrics, Balance Sheet and KPIs: the row-label column, historical periods,
 * the brand period rule, a run of Projections columns and a trailing group
 * (LTM / NTM, or As Of) set apart by a gutter.
 *
 * Built on `DataGrid` + `Row` with the grid-pattern cells directly inside;
 * `groupHead` carries the Projections / LTM / NTM tier. The tracks are passed
 * explicitly (`columns`) only because the period rule and the gutter are
 * tracks of their own — derived from the header they would each get a `1fr`
 * share. Value columns keep the header-sized `minmax(max-content, 1fr)` track.
 *
 * A column menu (KPI Copy / Delete) is drawn outside the grid, anchored to its
 * header, because the grid scrolls sideways inside itself and would clip it.
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  ColumnGroupHeader, DataGrid, Footnote, GridColumnDivider, GridColumnHeader, GridValueCell, Row, RowLabelCell,
  color, size, zIndex, type RowLabelType, type ValueKind,
} from '@scalar/design-system';
import type { GridRowDef, GridValue } from './data.js';

export interface GridColumn {
  key: string;
  /** Header label, one line ("FY 2024", "12/31/2024"). */
  label: string;
  zone: 'hist' | 'proj' | 'trail';
  /** Group header above the column: "Projections", "LTM", "NTM", "As Of". */
  group?: string;
  /** The header is an editable date (LTM / NTM / As Of). */
  editableDate?: boolean;
  /** Footnote reference drawn beside the label. */
  footnote?: string;
  /** Active column (blue top tab) — used by the KPI column menu. */
  selected?: boolean;
  /** Replaces the group-header slot above this column (e.g. a column-actions trigger). */
  groupSlot?: ReactNode;
}

export interface GridRow extends GridRowDef {
  key?: string;
  /** Makes the row label expandable. */
  expanded?: boolean;
  onToggle?: () => void;
  /** Replaces the label text (e.g. an "Enter data" placeholder). */
  labelContent?: ReactNode;
}

type Slot = { kind: 'label' } | { kind: 'rule' } | { kind: 'gutter' } | { kind: 'col'; col: GridColumn; i: number };

function slotsFor(cols: GridColumn[]): Slot[] {
  const out: Slot[] = [{ kind: 'label' }];
  cols.forEach((col, i) => {
    const prev = cols[i - 1];
    if (col.zone === 'proj' && prev?.zone !== 'proj') out.push({ kind: 'rule' });
    if (col.zone === 'trail' && prev?.zone !== 'trail') out.push({ kind: 'gutter' });
    out.push({ kind: 'col', col, i });
  });
  return out;
}

const TRACK: Record<Slot['kind'], string> = {
  label: 'minmax(max-content, 2.4fr)',
  rule: 'max-content',
  gutter: size.icon.m,
  col: 'minmax(max-content, 1fr)',
};

function cellValue(v: GridValue, emptyKind: ValueKind, key: string) {
  if (v === undefined) return <GridValueCell key={key} kind={emptyKind} />;
  if (typeof v === 'string') return <GridValueCell key={key} kind={emptyKind === 'total' ? 'total' : 'calculated'}>{v}</GridValueCell>;
  return <GridValueCell key={key} kind={v.kind} state={v.focused ? 'focused' : 'default'}>{v.v}</GridValueCell>;
}

/** An empty track (group-head blanks, the LTM gutter): page-white, never zebra. */
const blank = (key: string) => <div key={key} aria-hidden style={{ background: color.bg.surface }} />;

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
  const hasGroups = columns.some((c) => c.group || c.groupSlot);
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

  const groupHead = hasGroups ? slots.map((s, n) => {
    const k = `g${n}`;
    if (s.kind === 'rule') return <GridColumnDivider key={k} type="period" />;
    if (s.kind !== 'col') return blank(k);
    if (s.col.groupSlot) return <div key={k} style={{ background: color.bg.surface }}>{s.col.groupSlot}</div>;
    if (!s.col.group) return blank(k);
    return <ColumnGroupHeader key={k} span={1} styleVariant={s.col.zone === 'proj' ? 'emphasis' : 'default'}>{s.col.group}</ColumnGroupHeader>;
  }) : undefined;

  const head = slots.map((s, n) => {
    const k = `h${n}`;
    if (s.kind === 'label') return <GridColumnHeader key={k} grow={2.4}>{title}</GridColumnHeader>;
    if (s.kind === 'rule') return <GridColumnDivider key={k} type="period" />;
    if (s.kind === 'gutter') return blank(k);
    const c = s.col;
    return (
      <GridColumnHeader key={k} numeric editable={c.editableDate} selected={c.selected} data-col={c.key}>
        {c.label}
        {c.footnote && <Footnote>[{c.footnote}]</Footnote>}
      </GridColumnHeader>
    );
  });

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <DataGrid label={label ?? title} columns={slots.map((s) => TRACK[s.kind])} groupHead={groupHead} head={<>{head}</>}>
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
                if (s.kind === 'gutter') return blank(k);
                return cellValue(r.values?.[s.i], emptyKind, k);
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
  key: `fy${y}`, label: `FY ${y}`, zone, group: zone === 'proj' ? 'Projections' : undefined,
});

/** A period column dated at the fiscal year end (`MM/DD`), as the Balance Sheet shows it. */
export const yearEnd = (y: number, zone: GridColumn['zone'], monthDay: string): GridColumn => ({
  key: `ye${y}`, label: `${monthDay}/${y}`, zone, group: zone === 'proj' ? 'Projections' : undefined,
});
