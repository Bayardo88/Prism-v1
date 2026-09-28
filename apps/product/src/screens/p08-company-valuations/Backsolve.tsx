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
  Banner, Button, ConfirmationDialog, ContextMenu, GridColumnDivider, GridColumnHeader, GridValueCell,
  Icon, InCellControl, InlineEdit, MenuItem, RowLabelCell, Text, glyphs, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, num } from '../../data/fixtures.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { Anchor, Sheet, SheetRow } from '../p07-company-cap-table/Sheet.js';
import { ValuationsLayout } from './ValuationsLayout.js';
import { ALLOCATION_METHODS, CAP_TABLES, TARGET_SECURITIES } from './data.js';

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

function initial(state: string): Model {
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
        targets: [{ id: uid(), security: 'Series A' }, { id: uid() }],
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
  const [m, setM] = useState<Model>(() => initial(state));
  const [approachMenu, setApproachMenu] = useState(state === 'add-approach-menu');
  const [pending, setPending] = useState<string>(href(routes.company.valuationSummary(company.id)));
  const bottom = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setM(initial(state));
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
  const menuOf = (key: string, label: string, options: readonly string[], value: string | undefined, choose: (v: string) => void, note?: ReactNode) =>
    m.menu === key && (
      <ContextMenu label={label}>
        {note}
        {options.map((o) => <MenuItem key={o} selected={o === value} onClick={() => choose(o)}>{o}</MenuItem>)}
      </ContextMenu>
    );

  const methodCell = (x: Method) => {
    const key = `method:${x.id}`;
    const dup = duplicates.has(x.id);
    const open = m.menu === key;
    const note = dup && (
      <div role="alert" style={{ display: 'flex', gap: space.xs, alignItems: 'center', padding: `${space.xs} ${space.s}` }}>
        <Icon size="s" tone="negative"><glyphs.Error /></Icon>
        <Text as="span" step="s" tone="negative">{UNIQUE}</Text>
      </div>
    );
    return (
      <Anchor key={x.id} menu={menuOf(key, 'Allocation method', ALLOCATION_METHODS, x.method, (v) => setMethod(x.id, { method: v }), note)}>
        {dup && !open ? (
          <button
            type="button"
            aria-label={`Allocation method: ${x.method}. ${UNIQUE}`}
            aria-haspopup="listbox"
            onClick={() => toggleMenu(key)}
            style={{ display: 'flex', flexDirection: 'column', padding: 0, border: 0, background: 'none', font: 'inherit', cursor: 'pointer' }}
          >
            <GridValueCell kind="editable" state="error" errorMessage={UNIQUE}>{x.method}</GridValueCell>
          </button>
        ) : (
          <InCellControl type="select" label="Allocation method" open={open} onClick={() => toggleMenu(key)}>{x.method}</InCellControl>
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

  const methodRow = (label: string, type: 'line-item' | 'subtotal' | 'child', cells: ReactNode[], total: ReactNode) => (
    <SheetRow key={label} label={label}>
      <RowLabelCell type={type}>{label}</RowLabelCell>
      {cells}
      <GridColumnDivider type="pinned" />
      {total}
    </SheetRow>
  );

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
          <Sheet
            label="Backsolve allocation"
            columns={`minmax(0, 2fr) repeat(${n}, minmax(0, 1.2fr)) auto minmax(0, 1.2fr)`}
            width={`${Math.min(100, 24 + 16 * (n + 1))}%`}
          >
            <SheetRow label="Columns">
              <GridColumnHeader>Backsolve</GridColumnHeader>
              {m.methods.map((x) => <GridColumnHeader key={x.id}>{''}</GridColumnHeader>)}
              <GridColumnDivider type="pinned" />
              <GridColumnHeader numeric>Backsolve Total</GridColumnHeader>
            </SheetRow>
            {methodRow('Allocation Method', 'subtotal', m.methods.map(methodCell), <GridValueCell kind="total" />)}
            {methodRow('Cap Table Selection', 'line-item', m.methods.map(capTableCell), <GridValueCell />)}
            {methodRow('Allocation Backsolve Weighting', 'line-item',
              m.methods.map((x) => <GridValueCell key={x.id} kind="editable">{`${x.weight.toFixed(1)}%`}</GridValueCell>),
              <GridValueCell>{`${totalWeight.toFixed(1)}%`}</GridValueCell>)}
            {methodRow('Present Share Values', 'subtotal',
              m.methods.map((x) => <GridValueCell key={x.id} kind="total" />), <GridValueCell kind="total" />)}
            {TARGET_SECURITIES.map((s) => methodRow(s, 'child',
              m.methods.map((x) => <GridValueCell key={x.id}>{$0}</GridValueCell>), <GridValueCell>{$0}</GridValueCell>))}
          </Sheet>
          <Button
            variant="secondary"
            leadingIcon={<Icon size="s" tone="inherit"><glyphs.Plus /></Icon>}
            disabled={n >= MAX_METHODS}
            onClick={addMethod}
          >
            Add allocation method
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: space.l, alignItems: 'flex-start' }}>
          <Sheet label="Target securities" columns="minmax(0, 1.6fr) repeat(3, minmax(0, 1fr))" width="44%">
            <SheetRow label="Columns">
              <GridColumnHeader>Security</GridColumnHeader>
              <GridColumnHeader numeric>Shares</GridColumnHeader>
              <GridColumnHeader numeric>Per Share Value</GridColumnHeader>
              <GridColumnHeader numeric>Total Value</GridColumnHeader>
            </SheetRow>
            {m.targets.map((t) => {
              const key = `sec:${t.id}`;
              const err = needsShares(t);
              return (
                <SheetRow key={t.id} label={t.security ?? 'New target security'}>
                  <Anchor menu={menuOf(key, 'Security', TARGET_SECURITIES, t.security, (v) => setSecurity(t.id, v))}>
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
                </SheetRow>
              );
            })}
            <SheetRow label="Target Value">
              <RowLabelCell type="total">Target Value</RowLabelCell>
              <GridValueCell kind="total">{num.format(m.targets.reduce((a, t) => a + (t.shares ?? 0), 0))}</GridValueCell>
              <GridValueCell kind="total">{$0}</GridValueCell>
              <GridValueCell kind="editable">{$0}</GridValueCell>
            </SheetRow>
          </Sheet>
          <Button
            variant="secondary"
            leadingIcon={<Icon size="s" tone="inherit"><glyphs.Plus /></Icon>}
            disabled={addRowDisabled}
            onClick={() => update((cur) => ({ targets: [...cur.targets, { id: uid() }] }))}
          >
            Add row
          </Button>
        </div>

        <div ref={bottom} style={{ display: 'flex', flexDirection: 'column', gap: space.l, alignItems: 'flex-start', paddingBottom: space.xl }}>
          <Sheet label="Backsolve summary" columns="minmax(0, 1.6fr) minmax(0, 1fr)" width="24%">
            <SheetRow label="Columns">
              <GridColumnHeader>Backsolve Summary</GridColumnHeader>
              <GridColumnHeader>{''}</GridColumnHeader>
            </SheetRow>
            <SheetRow label="Implied Equity Value">
              <RowLabelCell>Implied Equity Value</RowLabelCell>
              <GridValueCell>{$0}</GridValueCell>
            </SheetRow>
            <SheetRow label="Enterprise Value">
              <RowLabelCell>Enterprise Value</RowLabelCell>
              <GridValueCell>{$0}</GridValueCell>
            </SheetRow>
          </Sheet>
          <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><glyphs.Plus /></Icon>} disabled>
            Add market adjustment
          </Button>
        </div>
      </div>
    </ValuationsLayout>
  );
}
