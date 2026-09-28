/**
 * Valuations — Backsolve. Solve for the equity value implied by a recent
 * transaction: pick one or more allocation methods (each weighted), the
 * security that transacted and its shares, and read the implied equity and
 * enterprise value.
 *
 * The validation is real, not drawn:
 * - Two allocation-method columns with the same method are both flagged
 *   ("The allocation method must be unique"); "Add allocation method" adds a
 *   Waterfall column, so adding a second one without changing it trips this.
 * - Save with errors raises the page Banner listing the approach to fix, and
 *   flags every target security still missing its shares.
 * - Any change marks the page dirty; leaving it by any in-app link while dirty
 *   asks first (ConfirmationDialog).
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Banner, Button, ConfirmationDialog, DataGrid, GridColumnDivider, GridColumnHeader, GridValueCell,
  Icon, InCellControl, InlineEdit, Row, RowLabelCell, SelectMenu, SelectMenuOption, Tooltip, icons, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, num, type Company } from '../../data/fixtures.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { Anchor } from '../p07-company-cap-table/Anchor.js';
import { ValuationsLayout } from './ValuationsLayout.js';
import { ALLOCATION_METHODS, CAP_TABLES, targetSecuritiesFor } from './data.js';

interface Method { id: string; method: string; capTable: string; weight: number }
interface Target { id: string; security?: string; shares?: number }

const APPROACH_NAME = 'Backsolve_416';
const UNIQUE = 'The allocation method must be unique';
const MAX_METHODS = 3;
let seq = 0;
const uid = () => `r${++seq}`;

const one = (): Method[] => [{ id: uid(), method: 'Waterfall', capTable: 'Primary Captable', weight: 100 }];
const three = (): Method[] => [
  { id: uid(), method: 'Waterfall', capTable: 'Primary Captable', weight: 100 },
  { id: uid(), method: 'Waterfall', capTable: 'Primary Captable', weight: 0 },
  { id: uid(), method: 'Waterfall', capTable: 'Primary Captable', weight: 0 },
];

interface Model {
  methods: Method[];
  targets: Target[];
  dirty: boolean;
  showErrors: boolean;
  menu: string | null;
  confirm: boolean;
}

function initial(state: string, company: Company): Model {
  const securities = targetSecuritiesFor(company);
  const base: Model = { methods: one(), targets: [{ id: uid() }], dirty: false, showErrors: false, menu: null, confirm: false };
  switch (state) {
    case 'duplicate-methods':
      return { ...base, methods: three(), dirty: true };
    case 'method-menu': {
      const methods = three();
      return { ...base, methods, dirty: true, menu: `method:${methods[0]!.id}` };
    }
    case 'security-selected':
    case 'unsaved-confirm':
    case 'validation-banner':
      return {
        ...base,
        methods: three(),
        targets: [{ id: uid(), security: securities[securities.length - 1] }, { id: uid() }],
        dirty: true,
        confirm: state === 'unsaved-confirm',
        showErrors: state === 'validation-banner',
      };
    default:
      return base;
  }
}

const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const $0 = money2.format(0);

export function Backsolve({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [m, setM] = useState<Model>(() => initial(state, company));
  const [approachMenu, setApproachMenu] = useState(state === 'add-approach-menu');
  const [pending, setPending] = useState<string>(href(routes.company.valuationSummary(company.id)));
  const bottom = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setM(initial(state, company));
    setApproachMenu(state === 'add-approach-menu');
    if (state === 'scrolled') bottom.current?.scrollIntoView({ block: 'end' });
  }, [state]);

  const update = (patch: Partial<Model> | ((cur: Model) => Partial<Model>)) =>
    setM((cur) => ({ ...cur, ...(typeof patch === 'function' ? patch(cur) : patch) }));

  /* ---- validation ---- */
  const duplicates = useMemo(() => {
    const count = new Map<string, number>();
    for (const x of m.methods) count.set(x.method, (count.get(x.method) ?? 0) + 1);
    return new Set(m.methods.filter((x) => (count.get(x.method) ?? 0) > 1).map((x) => x.id));
  }, [m.methods]);
  const missingShares = m.targets.filter((t) => t.shares === undefined);
  const needsShares = (t: Target) => m.showErrors && t.shares === undefined;
  const hasErrors = duplicates.size > 0 || missingShares.length > 0;

  const save = () => {
    if (hasErrors) {
      update({ showErrors: true, menu: null });
      top.current?.scrollIntoView({ block: 'start' });
    } else {
      update({ dirty: false, showErrors: false });
    }
  };

  /* ---- unsaved-changes guard: any in-app link while dirty asks first ---- */
  useEffect(() => {
    if (!m.dirty) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!a) return;
      const target = a.getAttribute('href')!;
      if (target === window.location.hash) return;
      e.preventDefault();
      e.stopPropagation();
      setPending(target);
      update({ confirm: true });
    };
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    document.addEventListener('click', onClick, true);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [m.dirty]);

  const leave = () => {
    update({ dirty: false, confirm: false });
    window.location.hash = pending.slice(1);
  };

  /* ---- edits ---- */
  const toggleMenu = (key: string) => update((cur) => ({ menu: cur.menu === key ? null : key }));
  const setMethod = (id: string, patch: Partial<Method>) =>
    update((cur) => ({ methods: cur.methods.map((x) => (x.id === id ? { ...x, ...patch } : x)), dirty: true, menu: null }));
  const addMethod = () =>
    update((cur) => ({
      methods: [...cur.methods, { id: uid(), method: 'Waterfall', capTable: 'Primary Captable', weight: 0 }],
      dirty: true,
    }));
  const setSecurity = (id: string, security: string) =>
    update((cur) => {
      const targets = cur.targets.map((t) => (t.id === id ? { ...t, security } : t));
      // Choosing the last row's security opens a fresh row beneath it.
      if (targets[targets.length - 1]?.security) targets.push({ id: uid() });
      return { targets, dirty: true, menu: null };
    });
  const setShares = (id: string, raw: string) => {
    const n = Number(raw.replace(/[^0-9.]/g, ''));
    update((cur) => ({
      targets: cur.targets.map((t) => (t.id === id ? { ...t, shares: raw.trim() && Number.isFinite(n) ? n : undefined } : t)),
      dirty: true,
    }));
  };
  const emptyRows = m.targets.filter((t) => !t.security).length;
  const addRowDisabled = emptyRows > 0 && m.targets.length > 1;

  /* ---- cells ---- */
  const securities = targetSecuritiesFor(company);
  const menuOf = (key: string, label: string, options: readonly string[], value: string | undefined, choose: (v: string) => void) =>
    m.menu === key && (
      <SelectMenu label={label}>
        {options.map((o) => <SelectMenuOption key={o} selected={o === value} onSelect={() => choose(o)}>{o}</SelectMenuOption>)}
      </SelectMenu>
    );

  const methodCell = (x: Method) => {
    const key = `method:${x.id}`;
    const dup = duplicates.has(x.id);
    const open = m.menu === key;
    const control = (
      <InCellControl
        type="select"
        label="Allocation method"
        open={open}
        state={dup && !open ? 'error' : 'default'}
        errorMessage={dup ? UNIQUE : undefined}
        onClick={() => toggleMenu(key)}
      >
        {x.method}
      </InCellControl>
    );
    return (
      <Anchor key={x.id} menu={menuOf(key, 'Allocation method', ALLOCATION_METHODS, x.method, (v) => setMethod(x.id, { method: v }))}>
        {control}
        {/* While a duplicate's menu is open, the rule is spelled out over the cell. The
            Tooltip hangs off a zero-size marker so it doesn't wrap (and shrink) the control. */}
        {dup && open && (
          <div style={{ position: 'absolute', top: `calc(${space.m} * -1)`, left: '50%' }}>
            <Tooltip content={UNIQUE} position="top" open>
              <span aria-hidden />
            </Tooltip>
          </div>
        )}
      </Anchor>
    );
  };

  const capTableCell = (x: Method) => {
    const key = `cap:${x.id}`;
    return (
      <Anchor key={x.id} menu={menuOf(key, 'Cap table', CAP_TABLES, x.capTable, (v) => setMethod(x.id, { capTable: v }))}>
        <InCellControl type="select" label="Cap table selection" open={m.menu === key} onClick={() => toggleMenu(key)}>{x.capTable}</InCellControl>
      </Anchor>
    );
  };

  let stripe = 0;
  const methodRow = (label: string, type: 'line-item' | 'subtotal' | 'child', cells: ReactNode[], total: ReactNode) => {
    stripe += 1;
    return (
      <Row key={label} aria-label={label} zebra={type !== 'subtotal' && stripe % 2 === 0}>
        <RowLabelCell type={type}>{label}</RowLabelCell>
        {cells}
        <GridColumnDivider type="pinned" />
        {total}
      </Row>
    );
  };
  const V = 'minmax(max-content, 1fr)';

  const n = m.methods.length;
  const totalWeight = m.methods.reduce((a, x) => a + x.weight, 0);
  const banner = m.showErrors && hasErrors;

  return (
    <ValuationsLayout
      company={company}
      tab="backsolve"
      approachMenuOpen={approachMenu}
      onApproachMenuChange={setApproachMenu}
      errorTab={banner ? 'backsolve' : undefined}
      onSave={save}
      overlay={
        <ConfirmationDialog
          open={m.confirm}
          destructive
          title="Leave without saving?"
          confirmLabel="Leave anyway"
          cancelLabel="Stay on page"
          onConfirm={leave}
          onCancel={() => update({ confirm: false })}
        >
          Are you sure you want to continue? All changes will be lost if you leave this page without saving.
        </ConfirmationDialog>
      }
    >
      <div ref={top} style={{ display: 'flex', flexDirection: 'column', gap: space.xl }}>
        {banner && (
          <Banner
            tone="negative"
            title="To proceed, please correct the highlighted errors in the table cells or invalid characters in the approach names:"
            issues={[{ label: APPROACH_NAME, onClick: () => top.current?.scrollIntoView({ block: 'start' }) }]}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: space.l, alignItems: 'flex-start' }}>
          <DataGrid
            label="Backsolve allocation"
            columns={['minmax(max-content, 2fr)', ...m.methods.map(() => V), 'auto', V]}
            style={{ width: `${Math.min(100, 24 + 16 * (n + 1))}%`, overflow: 'visible' }}
            head={
              <>
                <GridColumnHeader>Backsolve</GridColumnHeader>
                {m.methods.map((x) => <GridColumnHeader key={x.id}>{''}</GridColumnHeader>)}
                <GridColumnDivider type="pinned" />
                <GridColumnHeader numeric>Backsolve Total</GridColumnHeader>
              </>
            }
          >
            {methodRow('Allocation Method', 'subtotal', m.methods.map(methodCell), <GridValueCell kind="total" />)}
            {methodRow('Cap Table Selection', 'line-item', m.methods.map(capTableCell), <GridValueCell />)}
            {methodRow('Allocation Backsolve Weighting', 'line-item',
              m.methods.map((x) => <GridValueCell key={x.id} kind="editable">{`${x.weight.toFixed(1)}%`}</GridValueCell>),
              <GridValueCell>{`${totalWeight.toFixed(1)}%`}</GridValueCell>)}
            {methodRow('Present Share Values', 'subtotal',
              m.methods.map((x) => <GridValueCell key={x.id} kind="total" />), <GridValueCell kind="total" />)}
            {securities.map((s) => methodRow(s, 'child',
              m.methods.map((x) => <GridValueCell key={x.id}>{$0}</GridValueCell>), <GridValueCell>{$0}</GridValueCell>))}
          </DataGrid>
          <Button
            variant="secondary"
            leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}
            disabled={n >= MAX_METHODS}
            onClick={addMethod}
          >
            Add allocation method
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: space.l, alignItems: 'flex-start' }}>
          <DataGrid
            label="Target securities"
            style={{ width: '46%', overflow: 'visible' }}
            head={
              <>
                <GridColumnHeader grow={1.6}>Security</GridColumnHeader>
                <GridColumnHeader numeric>Shares</GridColumnHeader>
                <GridColumnHeader numeric>Per Share Value</GridColumnHeader>
                <GridColumnHeader numeric>Total Value</GridColumnHeader>
              </>
            }
          >
            {m.targets.map((t, i) => {
              const key = `sec:${t.id}`;
              const err = needsShares(t);
              return (
                <Row key={t.id} aria-label={t.security ?? 'New target security'} zebra={i % 2 === 1}>
                  <Anchor align="left" menu={menuOf(key, 'Security', securities, t.security, (v) => setSecurity(t.id, v))}>
                    <InCellControl type="select" label="Security" open={m.menu === key} onClick={() => toggleMenu(key)}>
                      {t.security ?? 'Select security'}
                    </InCellControl>
                  </Anchor>
                  <GridValueCell kind="editable" state={err ? 'error' : 'default'} errorMessage={err ? 'Enter the shares for this security' : undefined}>
                    <InlineEdit
                      label={`Shares of ${t.security ?? 'target security'}`}
                      placeholder="Enter data"
                      value={t.shares !== undefined ? num.format(t.shares) : ''}
                      onCommit={(v) => setShares(t.id, v)}
                    />
                  </GridValueCell>
                  <GridValueCell>{$0}</GridValueCell>
                  <GridValueCell>{$0}</GridValueCell>
                </Row>
              );
            })}
            <Row type="total" aria-label="Target Value">
              <RowLabelCell type="total">Target Value</RowLabelCell>
              <GridValueCell kind="total">{num.format(m.targets.reduce((a, t) => a + (t.shares ?? 0), 0))}</GridValueCell>
              <GridValueCell kind="total">{$0}</GridValueCell>
              <GridValueCell kind="editable">{$0}</GridValueCell>
            </Row>
          </DataGrid>
          <Button
            variant="secondary"
            leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}
            disabled={addRowDisabled}
            onClick={() => update((cur) => ({ targets: [...cur.targets, { id: uid() }] }))}
          >
            Add row
          </Button>
        </div>

        <div ref={bottom} style={{ display: 'flex', flexDirection: 'column', gap: space.l, alignItems: 'flex-start', paddingBottom: space.xl }}>
          <DataGrid
            label="Backsolve summary"
            style={{ width: '26%' }}
            head={
              <>
                <GridColumnHeader grow={1.6}>Backsolve Summary</GridColumnHeader>
                <GridColumnHeader>{''}</GridColumnHeader>
              </>
            }
          >
            <Row aria-label="Implied Equity Value">
              <RowLabelCell>Implied Equity Value</RowLabelCell>
              <GridValueCell>{$0}</GridValueCell>
            </Row>
            <Row aria-label="Enterprise Value" zebra>
              <RowLabelCell>Enterprise Value</RowLabelCell>
              <GridValueCell>{$0}</GridValueCell>
            </Row>
          </DataGrid>
          <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>} disabled>
            Add market adjustment
          </Button>
        </div>
      </div>
    </ValuationsLayout>
  );
}
