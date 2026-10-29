/**
 * Cap Table — Securities. One column per security (Common, Series A…), a
 * pinned Total, and below it the firm's own holdings in each security.
 * The securities come from the company record (`securitiesFor`).
 *
 * States: default · new-column (a blank security added by "Add Security" in the Tertiary Menu) ·
 * security-type-menu (the Security Type picker open on that new column).
 */
import { Fragment, useState, type ReactNode } from 'react';
import {
  ContextMenu, DataGrid, GridColumnDivider, ColumnHeader, GridValueCell, Icon, InCellControl, InlineEdit, MenuItem,
  Row, RowLabelCell, SelectMenu, SelectMenuOption, SplitButton, icons, space, type RowLabelType, type ValueKind,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, firm, num, usd, type Company } from '../../data/fixtures.js';
import { CapTableLayout } from './CapTableLayout.js';
import { Anchor, pinnedTracks } from './Anchor.js';
import { SECURITY_TYPES, newSecurity, securitiesFor, type Security } from './data.js';
import { useValuationContext } from '../../domain/context.js';
import { useEditor } from '../../domain/useEditor.js';
import type { CapTableScenario } from '../../domain/model.js';
import { fullyDiluted, liquidationPreference, sum } from '../../domain/illustrative-calcs.js';
import { useMoney } from '../../shell/displayUnit.js';

const pct = (v: number) => `${v.toFixed(1)}%`;
const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

function initial(state: string, company: Company, scenario: CapTableScenario): Security[] {
  const base = securitiesFor(company, scenario);
  return state === 'default' ? base : [newSecurity(), ...base];
}

// Prototype data: there is nothing to expand, but the row keeps the expandable affordance.
const noop = () => {};

export function CapTable({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const { capTable, readOnly } = useValuationContext(company);
  // P9: edits are tracked, guarded and saved through the shared editor cycle.
  const ed = useEditor(() => initial(state, company, capTable.scenario), { readOnly });
  const securities = ed.data;
  const setSecurities = ed.update;
  const [menuFor, setMenuFor] = useState<string | null>(state === 'security-type-menu' ? securities[0]!.id : null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const isNew = (s: Security) => s.id.startsWith('new-');
  const addSecurity = (type?: string) => {
    setAddMenuOpen(false);
    // A blank new column is reused rather than stacked; picking a type from the menu fills it in.
    const blank = securities.find((s) => isNew(s) && !s.name && !s.type);
    if (blank) {
      if (type) setSecurities((cur) => cur.map((s) => (s.id === blank.id ? { ...s, type } : s)));
      return;
    }
    setSecurities((cur) => [{ ...newSecurity(), type }, ...cur]);
  };
  const rename = (id: string, name: string) =>
    setSecurities((cur) => cur.map((s) => (s.id === id ? { ...s, name } : s)));
  const setType = (id: string, type: string) => {
    setSecurities((cur) => cur.map((s) => (s.id === id ? { ...s, type } : s)));
    setMenuFor(null);
  };

  // Illustrative prototype maths only (P6) — see domain/illustrative-calcs.ts.
  const fd = fullyDiluted;
  const lp = liquidationPreference;
  const totalShares = sum(securities, (s) => s.sharesOutstanding ?? 0);
  const totalFd = sum(securities, fd);
  const totalLp = sum(securities, lp);
  const firmShares = sum(securities, (s) => s.firmShares);
  const firmLp = sum(securities, (s) => s.firmLiquidationPreference);
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
        {opts.expandable ? (
          <RowLabelCell type={labelType} expanded={false} onToggle={noop}>{label}</RowLabelCell>
        ) : (
          <RowLabelCell type={labelType}>{label}</RowLabelCell>
        )}
        {securities.map((s) => <Fragment key={s.id}>{cell(s)}</Fragment>)}
        <GridColumnDivider type="pinned" />
        {total}
      </Row>
    );
  };
  const v = (kind: ValueKind, value?: ReactNode) => <GridValueCell kind={kind}>{value}</GridValueCell>;
  // Money follows the Currency Selector: amounts rescale and convert, the issue price converts only.
  const money = useMoney();
  const amt = (n: number) => money.amount(usd.format(n));
  const px = (n: number) => money.price(money2.format(n));

  const typeMenu = (s: Security) => menuFor === s.id && (
    <SelectMenu label="Security type">
      {SECURITY_TYPES.map((t) => (
        <SelectMenuOption key={t} selected={t === s.type} onSelect={() => setType(s.id, t)}>{t}</SelectMenuOption>
      ))}
    </SelectMenu>
  );

  return (
    <CapTableLayout
      company={company}
      page="securities"
      currency
      onSave={ed.save}
      saveState={ed.saveState}
      overlay={ed.guard.dialog}
      action={
        // "+ Add Security ▾": the main button adds a blank column, the menu adds one of a given type.
        // Sits in the Tertiary Menu, so the menu opens downward.
        <SplitButton
          variant="secondary"
          size="xs"
          leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}
          onClick={() => addSecurity()}
          menuOpen={addMenuOpen}
          onMenuToggle={() => setAddMenuOpen((o) => !o)}
          menuLabel="Add a security of a type"
          menu={
            <ContextMenu label="Add security">
              {SECURITY_TYPES.map((t) => (
                <MenuItem key={t} onClick={() => addSecurity(t)}>{`Add ${t}`}</MenuItem>
              ))}
            </ContextMenu>
          }
        >
          Add Security
        </SplitButton>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.xl, paddingTop: space.l }}>
        <DataGrid
          label="Cap table"
          columns={columns}
          style={{ width, overflow: 'visible' }}
          head={
            <>
              <ColumnHeader>Security Name</ColumnHeader>
              {securities.map((s) => (
                <ColumnHeader key={s.id} numeric selected={isNew(s)}>
                  {isNew(s)
                    ? <InlineEdit label="Security name" placeholder="Enter name" value={s.name} onCommit={(name) => rename(s.id, name)} />
                    : s.name}
                </ColumnHeader>
              ))}
              <GridColumnDivider type="pinned" />
              <ColumnHeader numeric>Total</ColumnHeader>
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
            (s) => v('editable', s.originalIssuePrice !== undefined ? px(s.originalIssuePrice) : undefined),
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
            (s) => v('total', lp(s) ? amt(lp(s)) : undefined), v('total', amt(totalLp)))}
          {row('Total Preference (with Dividends)', 'total',
            (s) => v('total', lp(s) ? amt(lp(s)) : undefined), v('total', amt(totalLp)))}
        </DataGrid>

        <DataGrid label={`${firm.name} holdings`} columns={columns} style={{ width, overflow: 'visible' }}>
          {row(`${firm.name} Ownership %`, 'line-item', (s) => v('calculated', share(s.firmShares)), v('calculated', share(firmShares)), { expandable: true })}
          {row(`${firm.name} Shares`, 'line-item',
            (s) => v('calculated', num.format(s.firmShares)), v('calculated', num.format(firmShares)), { expandable: true })}
          {row(`${firm.name} Liquidation Preference`, 'line-item',
            (s) => v('calculated', amt(s.firmLiquidationPreference)), v('calculated', amt(firmLp)), { expandable: true })}
        </DataGrid>
      </div>
    </CapTableLayout>
  );
}
