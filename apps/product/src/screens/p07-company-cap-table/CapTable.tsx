/**
 * Cap Table — Securities. One column per security (Common, Series A…), a
 * pinned Total, and below it the firm's own holdings in each security.
 * The securities come from the company record (`securitiesFor`).
 *
 * States: default · new-column (a blank security added by "Add security") ·
 * security-type-menu (the Security Type picker open on that new column).
 */
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import {
  DataGrid, Fab, GridColumnDivider, GridColumnHeader, GridValueCell, InCellControl, InlineEdit,
  Row, RowLabelCell, SelectMenu, SelectMenuOption, space, type RowLabelType, type ValueKind,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, firm, num, usd, type Company } from '../../data/fixtures.js';
import { CapTableLayout } from './CapTableLayout.js';
import { Anchor, pinnedTracks } from './Anchor.js';
import { SECURITY_TYPES, newSecurity, securitiesFor, type Security } from './data.js';

const pct = (v: number) => `${v.toFixed(1)}%`;
const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

function initial(state: string, company: Company): Security[] {
  const base = securitiesFor(company);
  return state === 'default' ? base : [newSecurity(), ...base];
}

export function CapTable({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [securities, setSecurities] = useState<Security[]>(() => initial(state, company));
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    const next = initial(state, company);
    setSecurities(next);
    setMenuFor(state === 'security-type-menu' ? next[0]!.id : null);
  }, [state, company.id]);

  const isNew = (s: Security) => s.id.startsWith('new-');
  const addSecurity = () => {
    if (securities.some((s) => isNew(s) && !s.name && !s.type)) return;
    setSecurities((cur) => [newSecurity(), ...cur]);
  };
  const rename = (id: string, name: string) =>
    setSecurities((cur) => cur.map((s) => (s.id === id ? { ...s, name } : s)));
  const setType = (id: string, type: string) => {
    setSecurities((cur) => cur.map((s) => (s.id === id ? { ...s, type } : s)));
    setMenuFor(null);
  };

  const totalShares = securities.reduce((a, s) => a + (s.sharesOutstanding ?? 0), 0);
  const fd = (s: Security) => (s.sharesOutstanding ?? 0) * (s.conversionRate ?? 1);
  const totalFd = securities.reduce((a, s) => a + fd(s), 0);
  const lp = (s: Security) => (s.type === 'Preferred Stock' ? (s.sharesOutstanding ?? 0) * (s.originalIssuePrice ?? 0) : 0);
  const totalLp = securities.reduce((a, s) => a + lp(s), 0);
  const firmShares = securities.reduce((a, s) => a + s.firmShares, 0);
  const firmLp = securities.reduce((a, s) => a + s.firmLiquidationPreference, 0);
  const share = (x: number) => pct(totalFd ? (x / totalFd) * 100 : 0);

  const columns = pinnedTracks(securities.length);
  const width = `${Math.min(100, 24 + 13 * (securities.length + 1))}%`;
  let stripe = 0;

  /** A body row: label, one cell per security, divider, total. */
  const row = (
    label: string,
    labelType: RowLabelType,
    cell: (s: Security) => ReactNode,
    total: ReactNode,
    opts: { expandable?: boolean } = {},
  ) => {
    stripe += 1;
    return (
      <Row key={label} zebra={stripe % 2 === 0} type={labelType === 'total' ? 'total' : undefined} aria-label={label}>
        <RowLabelCell type={labelType} expanded={opts.expandable ? false : undefined}>{label}</RowLabelCell>
        {securities.map((s) => <Fragment key={s.id}>{cell(s)}</Fragment>)}
        <GridColumnDivider type="pinned" />
        {total}
      </Row>
    );
  };
  const v = (kind: ValueKind, value?: ReactNode) => <GridValueCell kind={kind}>{value}</GridValueCell>;

  const typeMenu = (s: Security) => menuFor === s.id && (
    <SelectMenu label="Security type">
      {SECURITY_TYPES.map((t) => (
        <SelectMenuOption key={t} selected={t === s.type} onSelect={() => setType(s.id, t)}>{t}</SelectMenuOption>
      ))}
    </SelectMenu>
  );

  return (
    <CapTableLayout company={company} page="securities" currency>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.xl, paddingTop: space.l }}>
        <DataGrid
          label="Cap table"
          columns={columns}
          style={{ width, overflow: 'visible' }}
          head={
            <>
              <GridColumnHeader>Security Name</GridColumnHeader>
              {securities.map((s) => (
                <GridColumnHeader key={s.id} numeric selected={isNew(s)}>
                  {isNew(s)
                    ? <InlineEdit label="Security name" placeholder="Enter name" value={s.name} onCommit={(name) => rename(s.id, name)} />
                    : s.name}
                </GridColumnHeader>
              ))}
              <GridColumnDivider type="pinned" />
              <GridColumnHeader numeric>Total</GridColumnHeader>
            </>
          }
        >
          {row('Investment Date', 'line-item',
            (s) => (s.investmentDate
              ? <InCellControl type="date" label={`${s.name} investment date`}>{s.investmentDate}</InCellControl>
              : v('calculated')),
            v('calculated'))}
          {row('Security Type', 'line-item',
            (s) => (
              <Anchor menu={typeMenu(s)}>
                <InCellControl
                  type="select"
                  label={`${s.name || 'New security'} type`}
                  open={menuFor === s.id}
                  onClick={() => setMenuFor((cur) => (cur === s.id ? null : s.id))}
                >
                  {s.type ?? 'Select security'}
                </InCellControl>
              </Anchor>
            ),
            v('calculated'))}
          {row('Original Issue Price', 'line-item',
            (s) => v('editable', s.originalIssuePrice !== undefined ? money2.format(s.originalIssuePrice) : undefined),
            v('calculated'))}
          {row('Shares Outstanding', 'line-item',
            (s) => v('editable', s.sharesOutstanding !== undefined ? num.format(s.sharesOutstanding) : undefined),
            v('calculated', num.format(totalShares)))}
          {row('Conversion Rate', 'child',
            (s) => v('editable', s.conversionRate !== undefined ? `${s.conversionRate.toFixed(2)}x` : undefined),
            v('calculated'))}
          {row('PIK Shares as of Today', 'line-item', () => v('calculated'), v('calculated'))}
          {row('Shares Fully Diluted (as converted)', 'line-item',
            (s) => v('calculated', num.format(fd(s))), v('calculated', num.format(totalFd)))}
          {row('Current Ownership', 'subtotal',
            (s) => v('total', pct(totalShares ? ((s.sharesOutstanding ?? 0) / totalShares) * 100 : 0)),
            v('total', pct(100)))}
          {row('Fully Diluted Ownership', 'line-item', (s) => v('calculated', share(fd(s))), v('calculated', pct(100)))}
          {row('Strike Price', 'line-item', () => v('calculated'), v('calculated'), { expandable: true })}
          {row('Preferred Terms', 'line-item', () => v('calculated'), v('calculated'), { expandable: true })}
          {row(`Accrued Dividends (as of ${company.asOf})`, 'line-item', () => v('calculated'), v('calculated'))}
          {row('Initial Liquidation Preference', 'total',
            (s) => v('total', lp(s) ? usd.format(lp(s)) : undefined), v('total', usd.format(totalLp)))}
          {row('Total Preference (with Dividends)', 'total',
            (s) => v('total', lp(s) ? usd.format(lp(s)) : undefined), v('total', usd.format(totalLp)))}
        </DataGrid>

        <DataGrid label={`${firm.name} holdings`} columns={columns} style={{ width, overflow: 'visible' }}>
          {row(`${firm.name} Ownership %`, 'line-item', (s) => v('calculated', share(s.firmShares)), v('calculated', share(firmShares)), { expandable: true })}
          {row(`${firm.name} Shares`, 'line-item',
            (s) => v('calculated', num.format(s.firmShares)), v('calculated', num.format(firmShares)), { expandable: true })}
          {row(`${firm.name} Liquidation Preference`, 'line-item',
            (s) => v('calculated', usd.format(s.firmLiquidationPreference)), v('calculated', usd.format(firmLp)), { expandable: true })}
        </DataGrid>
      </div>
      <Fab onClick={addSecurity}>Add Security</Fab>
    </CapTableLayout>
  );
}
