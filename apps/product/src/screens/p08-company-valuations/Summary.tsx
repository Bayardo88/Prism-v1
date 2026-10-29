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
  Button, Card, ColumnGroupHeader, DataGrid, EmptyState, GridColumnDivider, ColumnHeader,
  GridValueCell, Icon, Row, RowLabelCell, icons, space, type RowLabelType, type ValueKind,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { ValuationsLayout } from './ValuationsLayout.js';
import { allocationRowsFor, approachRowsFor } from './data.js';
import { useValuationContext } from '../../domain/context.js';
import { WeightingPanel } from './WeightingPanel.js';
import { AddColumn } from '../../shell/AddColumn.js';
import { useMoney } from '../../shell/displayUnit.js';

function Empty({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return (
    <div style={{ alignSelf: 'center', width: '32%', minWidth: 0 }}>
      <Card>
        <EmptyState
          type="no-data"
          icon={<Icon size="xl" tone="brand"><icons.Error /></Icon>}
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
  const v = useValuationContext(company);
  const [menuOpen, setMenuOpen] = useState(false);
  // Money follows the Currency Selector; per-share rows convert only.
  const money = useMoney();
  const m = (label: string, t: string | undefined) => (t === undefined ? t : /per share/i.test(label) ? money.price(t) : money.amount(t));
  useEffect(() => setMenuOpen(false), [state]);
  const openMenu = () => setMenuOpen(true);
  const populated = state === 'populated';

  const V = 'minmax(max-content, 1fr)';
  const row = (key: string, label: string, type: RowLabelType, cells: ReactNode[], dividerAt: number, zebra: boolean) => (
    <Row key={key} aria-label={label} zebra={zebra && type !== 'total'} type={type === 'total' ? 'total' : undefined}>
      <RowLabelCell type={type}>{label}</RowLabelCell>
      {cells.slice(0, dividerAt)}
      <GridColumnDivider type="pinned" />
      {cells.slice(dividerAt)}
    </Row>
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
          <DataGrid
            label="Valuation summary"
            columns={['minmax(max-content, 2fr)', V, V, 'auto', V, V, 'max-content']}
            style={{ width: '80%' }}
            groupHead={
              <>
                <ColumnHeader>Valuation Summary</ColumnHeader>
                <ColumnGroupHeader span={2}>Approaches</ColumnGroupHeader>
                <GridColumnDivider type="pinned" />
                <ColumnGroupHeader span={2} styleVariant="emphasis">Allocation Scenarios</ColumnGroupHeader>
                <AddColumn label="Add Allocation Scenario" onClick={openMenu} open={menuOpen} popup="menu" />
              </>
            }
            head={
              <>
                <ColumnHeader>{''}</ColumnHeader>
                <ColumnHeader numeric>Enterprise Value</ColumnHeader>
                <ColumnHeader numeric>Equity Value</ColumnHeader>
                <GridColumnDivider type="pinned" />
                <ColumnHeader numeric>Waterfall</ColumnHeader>
                <ColumnHeader numeric>OPM</ColumnHeader>
                <ColumnHeader>{''}</ColumnHeader>
              </>
            }
          >
            {approachRowsFor(company, v.valuation).map((r, i) => row(r.label, r.label, r.type,
              [cell(r.type === 'total' ? 'total' : 'calculated', m(r.label, r.ev), 'ev'), cell(r.type === 'total' ? 'total' : 'calculated', m(r.label, r.equity), 'eq'),
                cell(r.kind, m(r.label, r.waterfall), 'w'), cell(r.kind, m(r.label, r.opm), 'o'),
                <GridValueCell key="add" />], 2, i % 2 === 1))}
          </DataGrid>

          <DataGrid
            label="Equity allocation"
            columns={['minmax(max-content, 2fr)', 'auto', V, V, V]}
            style={{ width: '60%' }}
            groupHead={
              <>
                <ColumnHeader>Equity Allocation</ColumnHeader>
                <GridColumnDivider type="pinned" />
                <ColumnGroupHeader span={2} styleVariant="emphasis">Allocation Scenarios</ColumnGroupHeader>
                <ColumnGroupHeader span={1}>Weighted</ColumnGroupHeader>
              </>
            }
            head={
              <>
                <ColumnHeader>{''}</ColumnHeader>
                <GridColumnDivider type="pinned" />
                <ColumnHeader numeric>Waterfall</ColumnHeader>
                <ColumnHeader numeric>OPM</ColumnHeader>
                <ColumnHeader numeric>Weighted Value</ColumnHeader>
              </>
            }
          >
            {allocationRowsFor(company, v.valuation, v.capTable.name).map((r, i) => row(`${i}-${r.label}`, r.label, r.type,
              [cell(r.kind, m(r.label, r.values[0]), 'w'),
                cell(r.kind, m(r.label, r.values[1]), 'o'),
                cell(r.type === 'total' ? 'total' : 'calculated', m(r.label, r.values[2]), 'x')], 0, i % 2 === 1))}
          </DataGrid>

          <WeightingPanel company={company} />
        </div>
      )}
    </ValuationsLayout>
  );
}
