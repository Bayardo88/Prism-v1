/**
 * Valuations — Summary. How each approach (GPC, M&A comps…) rolls into the
 * enterprise and equity value, how the equity is allocated across scenarios
 * (Waterfall, OPM) and the resulting value per share of every security.
 *
 * States: default (a new version with no approaches or scenarios yet — two
 * empty states) · populated (the full summary; the Figma frame is 1247 tall).
 */
import { useEffect, useState, type ReactNode } from 'react';
import {
  AddColumnHeader, Button, Card, ColumnGroupHeader, EmptyState, GridColumnDivider, GridColumnHeader,
  GridValueCell, Icon, RowLabelCell, glyphs, space, type RowLabelType, type ValueKind,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { Sheet, SheetRow } from '../p07-company-cap-table/Sheet.js';
import { ValuationsLayout } from './ValuationsLayout.js';
import { ALLOCATION_ROWS, APPROACH_ROWS } from './data.js';

function Empty({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return (
    <div style={{ alignSelf: 'center', width: '32%', minWidth: 0 }}>
      <Card>
        <EmptyState
          type="no-data"
          icon={<Icon size="xl" tone="brand"><glyphs.Info /></Icon>}
          title={title}
          body={body}
          actions={<Button variant="secondary" onClick={onAction}>{action}</Button>}
        />
      </Card>
    </div>
  );
}

const cell = (kind: ValueKind, v: string | undefined, key: string) => <GridValueCell key={key} kind={kind}>{v}</GridValueCell>;

export function Summary({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [state]);
  const openMenu = () => setMenuOpen(true);
  const populated = state === 'populated';

  const row = (key: string, label: string, type: RowLabelType, cells: ReactNode[], dividerAt: number) => (
    <SheetRow key={key} label={label}>
      <RowLabelCell type={type}>{label}</RowLabelCell>
      {cells.slice(0, dividerAt)}
      <GridColumnDivider type="pinned" />
      {cells.slice(dividerAt)}
    </SheetRow>
  );

  return (
    <ValuationsLayout company={company} tab="summary" approachMenuOpen={menuOpen} onApproachMenuChange={setMenuOpen}>
      {!populated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: space['2xl'], paddingTop: space.xl }}>
          <Empty title="The Valuation has no approaches" body="Please add an approach to continue" action="Add approach" onAction={openMenu} />
          <Empty title="The Equity Allocation has no scenarios" body="Please add a scenario to continue" action="Add allocation scenario" onAction={openMenu} />
        </div>
      )}

      {populated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.xl }}>
          <Sheet
            label="Valuation summary"
            columns="minmax(0, 2.2fr) minmax(0, 1fr) minmax(0, 1fr) auto minmax(0, 1fr) minmax(0, 1fr) auto"
            width="78%"
          >
            <SheetRow label="Column groups">
              <GridColumnHeader>Valuation Summary</GridColumnHeader>
              <ColumnGroupHeader span={2}>Approaches</ColumnGroupHeader>
              <GridColumnDivider type="pinned" />
              <ColumnGroupHeader span={2} styleVariant="emphasis">Allocation Scenarios</ColumnGroupHeader>
              <AddColumnHeader onClick={openMenu}>Add Allocation Scenario</AddColumnHeader>
            </SheetRow>
            <SheetRow label="Columns">
              <GridColumnHeader>{''}</GridColumnHeader>
              <GridColumnHeader numeric>Enterprise Value</GridColumnHeader>
              <GridColumnHeader numeric>Equity Value</GridColumnHeader>
              <GridColumnDivider type="pinned" />
              <GridColumnHeader numeric>Waterfall</GridColumnHeader>
              <GridColumnHeader numeric>OPM</GridColumnHeader>
              <GridColumnHeader>{''}</GridColumnHeader>
            </SheetRow>
            {APPROACH_ROWS.map((r) => row(r.label, r.label, r.type,
              [cell(r.type === 'total' ? 'total' : 'calculated', r.ev, 'ev'), cell(r.type === 'total' ? 'total' : 'calculated', r.equity, 'eq'),
                cell(r.kind, r.waterfall, 'w'), cell(r.kind, r.opm, 'o'),
                <GridValueCell key="add" />], 2))}
          </Sheet>

          <Sheet
            label="Equity allocation"
            columns="minmax(0, 2.2fr) auto minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)"
            width="56%"
          >
            <SheetRow label="Column groups">
              <GridColumnHeader>Equity Allocation</GridColumnHeader>
              <GridColumnDivider type="pinned" />
              <ColumnGroupHeader span={2} styleVariant="emphasis">Allocation Scenarios</ColumnGroupHeader>
              <ColumnGroupHeader span={1}>Weighted</ColumnGroupHeader>
            </SheetRow>
            <SheetRow label="Columns">
              <GridColumnHeader>{''}</GridColumnHeader>
              <GridColumnDivider type="pinned" />
              <GridColumnHeader numeric>Waterfall</GridColumnHeader>
              <GridColumnHeader numeric>OPM</GridColumnHeader>
              <GridColumnHeader numeric>Weighted Value</GridColumnHeader>
            </SheetRow>
            {ALLOCATION_ROWS.map((r, i) => row(`${i}-${r.label}`, r.label, r.type,
              [cell(r.kind, r.values[0], 'w'),
                cell(r.kind, r.values[1], 'o'),
                cell(r.type === 'total' ? 'total' : 'calculated', r.values[2], 'x')], 0))}
          </Sheet>
        </div>
      )}
    </ValuationsLayout>
  );
}
