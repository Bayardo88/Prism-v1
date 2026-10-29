/**
 * Company-header furniture shared by the Summary, Financials, Company Overview
 * and Daily NAV Settings pages: the ⋮ company actions menu, the Financials
 * Date / Version selectors, the Workspace Notes panel and the sub-navigation
 * sets for Summary and Financials.
 */
import { useState, type ReactNode } from 'react';
import {
  Button, ButtonIcon, ContextMenu, SaveState, CurrencySelector, Icon, MenuItem, RichTextToolbar, WORLD_CURRENCIES,
  SegmentedControl, Selector, TertiaryMenuItem, Textarea, ViewTab, ViewTabBar, icons, space, zIndex,
  type RichTextFormat,
} from '@scalar/design-system';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import type { Company } from '../../data/fixtures.js';
import { useValuationContext } from '../../domain/context.js';
import { usFromIso } from '../../domain/model.js';
import { VersionPicker } from '../../shell/VersionPicker.js';
import { setDisplayCurrency, setDisplayUnit, useDisplayCurrency, useDisplayUnit } from '../../shell/displayUnit.js';
import { useEditor } from '../../domain/useEditor.js';
import { openExport } from '../prototypes/export/state.js';
import { openRollover } from '../prototypes/rollover/state.js';

/** A trigger with an anchored popover. The trigger owns open state (AI-GUIDE §7). */
function Anchored({ children, popover, open }: { children: ReactNode; popover: ReactNode; open: boolean }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      {open && (
        <span style={{ position: 'absolute', top: '100%', right: 0, marginTop: space.xs, zIndex: zIndex.overlay }}>{popover}</span>
      )}
    </span>
  );
}

/** ⋮ company actions: Edit Company → Company Overview, Edit Common Profile → Daily NAV Settings. */
export function CompanyActions({ company, initialOpen = false }: { company: Company; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <Anchored
      open={open}
      popover={
        <ContextMenu label={`${company.name} actions`}>
          <MenuItem icon={<Icon tone="inherit"><icons.Edit /></Icon>} href={href(routes.company.overview(company.id))}>Edit Company</MenuItem>
          <MenuItem icon={<Icon tone="inherit"><icons.TableView /></Icon>} onClick={() => { setOpen(false); openExport(company.id); }}>Excel Export</MenuItem>
          <MenuItem icon={<Icon tone="inherit"><icons.PictureAsPdf /></Icon>} onClick={() => setOpen(false)}>PDF Export</MenuItem>
          <MenuItem icon={<Icon tone="inherit"><icons.Person /></Icon>} href={href(routes.company.dailyNavSettings(company.id))}>Edit Common Profile</MenuItem>
          <MenuItem icon={<Icon tone="inherit"><icons.Event /></Icon>} onClick={() => { setOpen(false); openRollover(company.id); }}>Roll over to a new date…</MenuItem>
        </ContextMenu>
      }
    >
      <ButtonIcon
        variant="tertiary"
        size="xs"
        label="Company actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        icon={<Icon size="l" tone="primary"><icons.MoreVert /></Icon>}
      />
    </Anchored>
  );
}

/**
 * Financials Date + Financials Version selectors. The date is the measurement in
 * the company's valuation context; the version picker switches the context (P1, P4).
 */
export function FinancialsSelectors({ company, initialVersionOpen = false }: { company: Company; initialVersionOpen?: boolean }) {
  const { measurement } = useValuationContext(company);
  return (
    <>
      <Selector surface="surface" icon="calendar" label="Financials Date" value={usFromIso(measurement.date)} />
      <VersionPicker company={company} kind="financial" initialOpen={initialVersionOpen} />
    </>
  );
}

export type FinancialsTab = 'income-statement' | 'balance-sheet' | 'kpis';

export function FinancialsSubNav({ company, current }: { company: Company; current: FinancialsTab }) {
  return (
    <>
      <TertiaryMenuItem current={current === 'income-statement'} href={href(routes.company.incomeStatement(company.id))}>Income Statement</TertiaryMenuItem>
      <TertiaryMenuItem current={current === 'balance-sheet'} href={href(routes.company.balanceSheet(company.id))}>Balance Sheet</TertiaryMenuItem>
      <TertiaryMenuItem current={current === 'kpis'} href={href(routes.company.kpis(company.id))}>KPIs</TertiaryMenuItem>
    </>
  );
}

export type SummaryTab = 'holdings' | 'overview' | 'daily-nav';

/** Summary's sub-pages. Company Overview and Daily NAV Settings live here in the live app. */
export function SummarySubNav({ company, current }: { company: Company; current: SummaryTab }) {
  return (
    <>
      <TertiaryMenuItem current={current === 'holdings'} href={href(routes.company.summary(company.id))}>Summary Holdings</TertiaryMenuItem>
      <TertiaryMenuItem current={current === 'overview'} href={href(routes.company.overview(company.id))}>Company Overview</TertiaryMenuItem>
      <TertiaryMenuItem current={current === 'daily-nav'} href={href(routes.company.dailyNavSettings(company.id))}>Daily NAV Settings</TertiaryMenuItem>
    </>
  );
}

/**
 * Display currency and unit. A display concern only — never a recorded conversion.
 * With `cycle`, a click on the unit steps Hundreds → Thousands → Millions →
 * Hundreds, and the currency code opens a list of world currencies; the tables
 * that read `useDisplayUnit()` / `useDisplayCurrency()` (the Financials grids)
 * re-express their figures. Rates are illustrative (P1 open question); the list's
 * footer says so.
 */
export function CurrencyUnit({ unit = '($) Thousands', cycle = false }: { unit?: string; cycle?: boolean }) {
  const shown = useDisplayUnit();
  const code = useDisplayCurrency();
  if (cycle) {
    return (
      <CurrencySelector
        currencies={WORLD_CURRENCIES}
        currency={code}
        onCurrencyChange={setDisplayCurrency}
        unit={shown}
        onUnitChange={setDisplayUnit}
        currencyNote="Illustrative rates, not market data. Display only — nothing is converted or recorded."
      />
    );
  }
  return <CurrencySelector currency="USD">{unit}</CurrencySelector>;
}

/**
 * Workspace → Notes: one note tab, Client / Internal audience, rich-text body.
 * The note shows whether it is saved, with its own Save beside the body — a
 * note was once lost because Save was not discoverable (UX-02, P9).
 */
export function NotesPanel() {
  const [audience, setAudience] = useState<'client' | 'internal'>('client');
  const [active, setActive] = useState<RichTextFormat[]>([]);
  const ed = useEditor(() => 'jkhgkhjgkhj');
  const toggle = (f: RichTextFormat) => setActive((a) => (a.includes(f) ? a.filter((x) => x !== f) : [...a, f]));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.s, padding: space.m }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space.m }}>
        <ViewTabBar label="Notes" onAdd={() => undefined} addLabel="Add note">
          <ViewTab selected onMenu={() => undefined}>Note 1</ViewTab>
        </ViewTabBar>
        <SegmentedControl
          label="Note audience"
          value={audience}
          onChange={setAudience}
          options={[{ value: 'client', label: 'Client' }, { value: 'internal', label: 'Internal' }]}
        />
      </div>
      <RichTextToolbar active={active} onToggle={toggle} />
      <Textarea aria-label="Note 1" value={ed.data} onChange={(e) => { const t = e.currentTarget.value; ed.update(() => t); }} rows={6} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: space.s }}>
        <SaveState state={ed.saveState} />
        <Button size="s" variant="secondary" onClick={ed.save} disabled={!ed.dirty}>Save note</Button>
      </div>
      {ed.guard.dialog}
    </div>
  );
}
