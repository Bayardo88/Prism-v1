/**
 * The financial-statement grid shared by Income Statement, Performance
 * Metrics, Balance Sheet and KPIs: a sticky row-label column, historical
 * periods, the brand period rule, a run of Projections columns and a trailing
 * group (LTM / NTM, or As Of) set apart by a gutter.
 *
 * Composed from the Grid Patterns layer (RowLabelCell, GridValueCell,
 * ColumnGroupHeader, GridColumnHeader, GridColumnDivider). Those cells take no
 * width, so each one sits in a flex box that owns the column width; the box is
 * `display: grid` so the cell stretches to fill it.
 */
import type { CSSProperties, ReactNode } from 'react';
import {
  ColumnGroupHeader, GridColumnDivider, GridColumnHeader, GridValueCell, Icon, RowLabelCell, Text,
  color, glyphs, space, zIndex, type RowLabelType, type ValueKind,
} from '@scalar/design-system';
import type { GridRowDef, GridValue } from './data.js';

export interface GridColumn {
  key: string;
  /** Header label, one line ("FY 2024", "12/31/2024"). */
  label: string;
  zone: 'hist' | 'proj' | 'trail';
  /** Group header above the column: "Projections", "LTM", "NTM", "As Of". */
  group?: string;
  /** The header is an editable date (LTM / NTM / As Of) — blue with a calendar glyph. */
  editableDate?: boolean;
  /** Footnote reference drawn beside the label. */
  footnote?: string;
  /** Active column (blue top tab) — used by the KPI column menu. */
  selected?: boolean;
  /** Content anchored under the header (a column Context Menu). */
  headerMenu?: ReactNode;
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

const labelBox: CSSProperties = { flex: '2.4 1 0', minWidth: 0, display: 'grid' };
const valueBox: CSSProperties = { flex: '1 1 0', minWidth: 0, display: 'grid', position: 'relative' };
const blank: CSSProperties = { ...valueBox, background: color.bg.surface };

function boxFor(cols: GridColumn[], i: number, base: CSSProperties = valueBox): CSSProperties {
  const c = cols[i]!;
  const firstTrail = c.zone === 'trail' && cols[i - 1]?.zone !== 'trail';
  return firstTrail ? { ...base, marginLeft: space.l } : base;
}

function cellValue(v: GridValue, emptyKind: ValueKind) {
  if (v === undefined) return <GridValueCell kind={emptyKind} />;
  if (typeof v === 'string') return <GridValueCell kind={emptyKind === 'total' ? 'total' : 'calculated'}>{v}</GridValueCell>;
  return <GridValueCell kind={v.kind} state={v.focused ? 'focused' : 'default'}>{v.v}</GridValueCell>;
}

/** Splits a row into hist | rule | proj | trail, calling `render` per column. */
function Cells({ cols, render }: { cols: GridColumn[]; render: (c: GridColumn, i: number) => ReactNode }) {
  const hasProj = cols.some((c) => c.zone === 'proj');
  const firstProj = cols.findIndex((c) => c.zone === 'proj');
  return (
    <>
      {cols.map((c, i) => (
        <FragmentWithRule key={c.key} rule={hasProj && i === firstProj}>{render(c, i)}</FragmentWithRule>
      ))}
    </>
  );
}

function FragmentWithRule({ rule, children }: { rule: boolean; children: ReactNode }) {
  return <>{rule && <GridColumnDivider type="period" />}{children}</>;
}

export function FinancialGrid({ title, columns, rows, label }: {
  title: string;
  columns: GridColumn[];
  rows: GridRow[];
  /** Accessible name of the grid; defaults to the title. */
  label?: string;
}) {
  const hasGroups = columns.some((c) => c.group || c.groupSlot);
  return (
    <div role="grid" aria-label={label ?? title} style={{ display: 'flex', flexDirection: 'column', background: color.bg.surface }}>
      {hasGroups && (
        <div role="row" style={{ display: 'flex' }}>
          <div style={{ ...labelBox, background: color.bg.surface }} />
          <Cells
            cols={columns}
            render={(c, i) => (
              <div style={boxFor(columns, i, c.group || c.groupSlot ? valueBox : blank)}>
                {c.groupSlot}
                {!c.groupSlot && c.group && (
                  <ColumnGroupHeader span={1} styleVariant={c.zone === 'proj' ? 'emphasis' : 'default'}>{c.group}</ColumnGroupHeader>
                )}
              </div>
            )}
          />
        </div>
      )}

      <div role="row" style={{ display: 'flex', position: 'sticky', top: 0, zIndex: zIndex.sticky }}>
        <div style={labelBox}><GridColumnHeader>{title}</GridColumnHeader></div>
        <Cells
          cols={columns}
          render={(c, i) => (
            <div style={boxFor(columns, i)}>
              <GridColumnHeader numeric selected={c.selected}>
                {c.editableDate ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: space['2xs'] }}>
                    <Text as="span" step="s" weight="semiBold" tone="editable">{c.label}</Text>
                    <Icon size="xs" tone="brand"><glyphs.Calendar /></Icon>
                  </span>
                ) : c.label}
                {c.footnote && <Text as="span" step="s" tone="link"> [{c.footnote}]</Text>}
              </GridColumnHeader>
              {c.headerMenu && (
                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: zIndex.overlay }}>{c.headerMenu}</div>
              )}
            </div>
          )}
        />
      </div>

      {rows.map((r, ri) => {
        const emptyKind: ValueKind = r.emptyKind ?? 'editable';
        return (
          <div role="row" key={r.key ?? `${r.label}-${ri}`} style={{ display: 'flex' }}>
            <div style={labelBox}>
              <RowLabelCell type={(r.type ?? 'line-item') as RowLabelType} expanded={r.expanded} onToggle={r.onToggle}>
                {r.labelContent ?? r.label}
              </RowLabelCell>
            </div>
            <Cells cols={columns} render={(_c, i) => <div style={boxFor(columns, i)}>{cellValue(r.values?.[i], emptyKind)}</div>} />
          </div>
        );
      })}
    </div>
  );
}

/* --- Column builders ------------------------------------------------------ */

export const fy = (y: number, zone: GridColumn['zone']): GridColumn => ({
  key: `fy${y}`, label: `FY ${y}`, zone, group: zone === 'proj' ? 'Projections' : undefined,
});

export const yearEnd = (y: number, zone: GridColumn['zone']): GridColumn => ({
  key: `ye${y}`, label: `12/31/${y}`, zone, group: zone === 'proj' ? 'Projections' : undefined,
});
