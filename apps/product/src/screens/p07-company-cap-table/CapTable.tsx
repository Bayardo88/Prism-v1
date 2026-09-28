/**
 * Cap Table — Securities. One column per security (Common, Series A…), a
 * pinned Total, and below it the firm's own holdings in each security.
 *
 * States: default · new-column (a blank security added by "Add security") ·
 * security-type-menu (the Security Type picker open on that new column).
 */
import { useEffect, useState, type ReactNode } from 'react';
import {
  ContextMenu, Fab, GridColumnDivider, GridColumnHeader, GridValueCell, InCellControl, InlineEdit,
  MenuItem, RowLabelCell, space, type RowLabelType, type ValueKind,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, firm, num, usd } from '../../data/fixtures.js';
import { CapTableLayout } from './CapTableLayout.js';
import { Anchor, Sheet, SheetRow, columnsFor, widthFor } from './Sheet.js';
import { SECURITIES, SECURITY_TYPES, newSecurity, type Security } from './data.js';

const pct = (v: number) => `${v.toFixed(1)}%`;
const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

function initial(state: string): Security[] {
  return state === 'default' ? SECURITIES : [newSecurity(), ...SECURITIES];
}

export function CapTable({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [securities, setSecurities] = useState<Security[]>(() => initial(state));
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    const next = initial(state);
    setSecurities(next);
    setMenuFor(state === 'security-type-menu' ? next[0]!.id : null);
  }, [state]);

  const addSecurity = () => {
    if (securities.some((s) => s.id.startsWith('new-') && !s.name && !s.type)) return;
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

  const n = securities.length;
  const columns = columnsFor(n, { pinnedTotal: true });
  const width = widthFor(n + 1, 22, 13);

  /** A body row: label, one cell per security, divider, total. */
  const row = (
    label: string,
    labelType: RowLabelType,
    cell: (s: Security) => ReactNode,
    total: ReactNode,
    opts: { expandable?: boolean } = {},
  ) => (
    <SheetRow key={label} label={label}>
      <RowLabelCell type={labelType} expanded={opts.expandable ? false : undefined}>{label}</RowLabelCell>
      {securities.map((s) => <Anchor key={s.id}>{cell(s)}</Anchor>)}
      <GridColumnDivider type="pinned" />
      {total}
    </SheetRow>
  );
  const v = (kind: ValueKind, value?: ReactNode) => <GridValueCell kind={kind}>{value}</GridValueCell>;
  const totalKind: ValueKind = 'total';

  return (
    <CapTableLayout company={company} page="securities" currency>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.xl, paddingTop: space.l }}>
        <Sheet label="Cap table" columns={columns} width={width}>
          <SheetRow label="Securities">
            <GridColumnHeader>Security Name</GridColumnHeader>
            {securities.map((s) => (
              <GridColumnHeader key={s.id} numeric selected={s.id.startsWith('new-')}>
                {s.id.startsWith('new-')
                  ? <InlineEdit label="Security name" placeholder="Enter name" value={s.name} onCommit={(name) => rename(s.id, name)} />
                  : s.name}
              </GridColumnHeader>
            ))}
            <GridColumnDivider type="pinned" />
            <GridColumnHeader numeric>Total</GridColumnHeader>
          </SheetRow>

          {row('Investment Date', 'line-item',
            (s) => (s.investmentDate
              ? <InCellControl type="date" label={`${s.name} investment date`}>{s.investmentDate}</InCellControl>
              : v('calculated')),
            v('calculated'))}

          <SheetRow label="Security Type">
            <RowLabelCell>Security Type</RowLabelCell>
            {securities.map((s) => (
              <Anchor
                key={s.id}
                menu={menuFor === s.id && (
                  <ContextMenu label="Security type">
                    {SECURITY_TYPES.map((t) => (
                      <MenuItem key={t} selected={t === s.type} onClick={() => setType(s.id, t)}>{t}</MenuItem>
                    ))}
                  </ContextMenu>
                )}
              >
                <InCellControl
                  type="select"
                  label={`${s.name || 'New security'} type`}
                  open={menuFor === s.id}
                  onClick={() => setMenuFor((cur) => (cur === s.id ? null : s.id))}
                >
                  {s.type ?? 'Select security'}
                </InCellControl>
              </Anchor>
            ))}
            <GridColumnDivider type="pinned" />
            {v('calculated')}
          </SheetRow>

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
            (s) => v(totalKind, pct(totalShares ? ((s.sharesOutstanding ?? 0) / totalShares) * 100 : 0)),
            v(totalKind, pct(100)))}
          {row('Fully Diluted Ownership', 'line-item',
            (s) => v('calculated', pct(totalFd ? (fd(s) / totalFd) * 100 : 0)), v('calculated', pct(100)))}
          {row('Strike Price', 'line-item', () => v('calculated'), v('calculated'), { expandable: true })}
          {row('Preferred Terms', 'line-item', () => v('calculated'), v('calculated'), { expandable: true })}
          {row(`Accrued Dividends (as of ${company.asOf})`, 'line-item', () => v('calculated'), v('calculated'))}
          {row('Initial Liquidation Preference', 'total',
            (s) => v(totalKind, lp(s) ? usd.format(lp(s)) : undefined), v(totalKind, usd.format(totalLp)))}
          {row('Total Preference (with Dividends)', 'total',
            (s) => v(totalKind, lp(s) ? usd.format(lp(s)) : undefined), v(totalKind, usd.format(totalLp)))}
        </Sheet>

        <Sheet label={`${firm.name} holdings`} columns={columns} width={width}>
          {row(`${firm.name} Ownership %`, 'line-item', () => v('calculated', pct(0)), v('calculated', pct(0)), { expandable: true })}
          {row(`${firm.name} Shares`, 'line-item',
            (s) => v('calculated', num.format(s.firmShares)), v('calculated', num.format(firmShares)), { expandable: true })}
          {row(`${firm.name} Liquidation Preference`, 'line-item',
            (s) => v('calculated', usd.format(s.firmLiquidationPreference)), v('calculated', usd.format(firmLp)), { expandable: true })}
        </Sheet>
      </div>
      <Fab onClick={addSecurity}>Add Security</Fab>
    </CapTableLayout>
  );
}
