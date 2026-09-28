/**
 * Fund Ownership — what each fund holds in each security of the company:
 * entity, fund, investment date, capital, shares and the derived preference
 * and proceeds. Filtered by fund and by security. Positions come from the
 * company record (`positionsFor`).
 *
 * States: default · new-column ("Add Fund Ownership" appends a blank position).
 */
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import {
  Chip, ContextMenu, DataGrid, GridColumnDivider, GridColumnHeader, GridValueCell, InCellControl,
  MenuItem, Row, RowLabelCell, SelectMenu, SelectMenuOption, SplitButton, color, space, type ValueKind,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, num, usd, type Company } from '../../data/fixtures.js';
import { CapTableLayout } from './CapTableLayout.js';
import { Anchor, pinnedTracks } from './Anchor.js';
import {
  entitiesFor, fundNameOf, fundsFor, positionSecuritiesFor, positionsFor, securitiesFor, type Position,
} from './data.js';

const blank = (company: Company): Position => ({
  id: `new-${Math.random().toString(36).slice(2, 7)}`, security: '', entity: company.name,
  investedCapital: 0, shares: 0, sharesAsConverted: 0, initialLiquidationPreference: 0,
});
const initial = (state: string, company: Company) =>
  (state === 'new-column' ? [...positionsFor(company), blank(company)] : positionsFor(company));
type Field = 'security' | 'entity' | 'fund';
const num1 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function FilterBand({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex', gap: space.s, flexWrap: 'wrap', padding: space.s,
        background: color.bg.surface, border: `1px solid ${color.stroke.divider}`,
      }}
    >
      {children}
    </div>
  );
}

export function FundOwnership({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [positions, setPositions] = useState<Position[]>(() => initial(state, company));
  const [menu, setMenu] = useState<{ id: string; field: Field } | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  useEffect(() => setPositions(initial(state, company)), [state, company.id]);

  const options: Record<Field, string[]> = {
    security: positionSecuritiesFor(company), entity: entitiesFor(company), fund: fundsFor(company),
  };
  const companyFd = securitiesFor(company).reduce((a, s) => a + (s.sharesOutstanding ?? 0) * (s.conversionRate ?? 1), 0);
  const fdPct = (shares: number) => `${(companyFd ? (shares / companyFd) * 100 : 0).toFixed(1)}%`;

  const add = () => {
    setAddMenuOpen(false);
    if (!positions.some((p) => !p.security)) setPositions((cur) => [...cur, blank(company)]);
  };
  const choose = (id: string, field: Field, value: string) => {
    setPositions((cur) => cur.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    setMenu(null);
  };

  const sum = (f: (p: Position) => number) => positions.reduce((a, p) => a + f(p), 0);
  const v = (kind: ValueKind, value?: ReactNode) => <GridValueCell kind={kind}>{value}</GridValueCell>;

  const picker = (p: Position, field: Field, label: string) => {
    const open = menu?.id === p.id && menu.field === field;
    return (
      <Anchor
        menu={open && (
          <SelectMenu label={label}>
            {options[field].map((o) => (
              <SelectMenuOption key={o} selected={o === p[field]} onSelect={() => choose(p.id, field, o)}>{o}</SelectMenuOption>
            ))}
          </SelectMenu>
        )}
      >
        <InCellControl type="select" label={label} open={open} onClick={() => setMenu(open ? null : { id: p.id, field })}>
          {p[field] || undefined}
        </InCellControl>
      </Anchor>
    );
  };

  let stripe = 0;
  const row = (label: string, cell: (p: Position) => ReactNode, total: ReactNode) => {
    stripe += 1;
    return (
      <Row key={label} zebra={stripe % 2 === 0} aria-label={label}>
        <RowLabelCell>{label}</RowLabelCell>
        {positions.map((p) => <Fragment key={p.id}>{cell(p)}</Fragment>)}
        <GridColumnDivider type="pinned" />
        {total}
      </Row>
    );
  };

  return (
    <CapTableLayout
      company={company}
      page="fund-ownership"
      currency
      footer={
        <SplitButton
          variant="secondary"
          menuLabel="More ways to add fund ownership"
          menuPlacement="top"
          onClick={add}
          menuOpen={addMenuOpen}
          onMenuToggle={() => setAddMenuOpen((o) => !o)}
          menu={addMenuOpen && (
            <ContextMenu label="Add fund ownership">
              <MenuItem onClick={add}>Add fund ownership column</MenuItem>
            </ContextMenu>
          )}
        >
          Add Fund Ownership
        </SplitButton>
      }
    >
      <FilterBand><Chip styleVariant="info" size="l">{fundNameOf(company)}</Chip></FilterBand>
      <FilterBand>
        {options.security.map((s) => <Chip key={s} styleVariant="info" size="l">{s}</Chip>)}
      </FilterBand>

      <DataGrid
        label="Fund ownership"
        columns={pinnedTracks(positions.length)}
        style={{ width: `${Math.min(100, 24 + 13 * (positions.length + 1))}%`, overflow: 'visible' }}
        head={
          <>
            <GridColumnHeader>{''}</GridColumnHeader>
            {positions.map((p) => (p.security
              ? <GridColumnHeader key={p.id} numeric>{p.security}</GridColumnHeader>
              : <Fragment key={p.id}>{picker(p, 'security', 'Security')}</Fragment>))}
            <GridColumnDivider type="pinned" />
            <GridColumnHeader numeric>Total</GridColumnHeader>
          </>
        }
      >
        {row('Security ID', () => v('calculated'), v('calculated'))}
        {row('Entity', (p) => picker(p, 'entity', 'Entity'), v('calculated'))}
        {row('Fund (or Entity)', (p) => picker(p, 'fund', 'Fund or entity'), v('calculated'))}
        {row('Investment Date', (p) => v('editable', p.investmentDate), v('calculated'))}
        {row('Invested Capital', (p) => v('editable', usd.format(p.investedCapital)), v('calculated', usd.format(sum((p) => p.investedCapital))))}
        {row('Loan Value', () => v('calculated', usd.format(0)), v('calculated', usd.format(0)))}
        {row('Shares', (p) => v('editable', num.format(p.shares)), v('calculated', num1.format(sum((p) => p.shares))))}
        {row('Shares (as Converted)', (p) => v('calculated', num.format(p.sharesAsConverted)), v('calculated', num1.format(sum((p) => p.sharesAsConverted))))}
        {row('Fully Diluted Ownership %', (p) => v('calculated', fdPct(p.sharesAsConverted)), v('calculated', fdPct(sum((p) => p.sharesAsConverted))))}
        {row('Initial Liquidation Preference', (p) => v('calculated', usd.format(p.initialLiquidationPreference)), v('calculated', usd.format(sum((p) => p.initialLiquidationPreference))))}
        {row('Liquidation Preference', () => v('calculated', usd.format(0)), v('calculated', usd.format(0)))}
        {row('Cash Distributions', () => v('editable', usd.format(0)), v('calculated', usd.format(0)))}
        {row('Proceeds from Sold Shares', () => v('editable', usd.format(0)), v('calculated', usd.format(0)))}
      </DataGrid>
    </CapTableLayout>
  );
}
