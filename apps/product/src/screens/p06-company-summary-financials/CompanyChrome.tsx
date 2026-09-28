/**
 * Company-header furniture shared by the Summary, Financials, Company Overview
 * and Daily NAV Settings pages: the ⋮ company actions menu, the Financials
 * Date / Version selectors, the Workspace Notes panel and the sub-navigation
 * sets for Summary and Financials.
 */
import { useState, type ReactNode } from 'react';
import {
  Button, ButtonIcon, ComboboxPanel, ContextMenu, CurrencySelector, Icon, MenuItem, RichTextToolbar,
  InformationLabel, SegmentedControl, TertiaryMenuItem, Textarea, ViewTab, ViewTabBar, glyphs, space, zIndex,
  type RichTextFormat,
} from '@scalar/design-system';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import type { Company } from '../../data/fixtures.js';
import { financialsDate, financialsVersion, versions } from './data.js';

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
          <MenuItem icon={<Icon tone="inherit"><glyphs.Edit /></Icon>} href={href(routes.company.overview(company.id))}>Edit Company</MenuItem>
          <MenuItem icon={<Icon tone="inherit"><glyphs.Download /></Icon>} onClick={() => setOpen(false)}>Excel Export</MenuItem>
          <MenuItem icon={<Icon tone="inherit"><glyphs.Document /></Icon>} onClick={() => setOpen(false)}>PDF Export</MenuItem>
          <MenuItem icon={<Icon tone="inherit"><glyphs.User /></Icon>} href={href(routes.company.dailyNavSettings(company.id))}>Edit Common Profile</MenuItem>
        </ContextMenu>
      }
    >
      <ButtonIcon
        variant="tertiary"
        label="Company actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        icon={<Icon tone="inherit"><glyphs.MoreVertical /></Icon>}
      />
    </Anchored>
  );
}

/** Financials Date + Financials Version selectors; the version selector opens a searchable panel. */
export function FinancialsSelectors({ initialVersionOpen = false }: { initialVersionOpen?: boolean }) {
  const [open, setOpen] = useState(initialVersionOpen);
  const [query, setQuery] = useState('');
  const items = versions.filter((v) => v.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <InformationLabel label="Financials Date" value={financialsDate} />
      <Anchored
        open={open}
        popover={
          <ComboboxPanel
            label="Financials versions"
            items={items}
            value="primary"
            query={query}
            onQueryChange={setQuery}
            searchPlaceholder="Find a Version"
            onSelect={() => setOpen(false)}
            footer={
              <Button variant="secondary" leadingIcon={<Icon size="xs" tone="inherit"><glyphs.Plus /></Icon>} onClick={() => setOpen(false)}>
                Save as New Version
              </Button>
            }
          />
        }
      >
        <Button
          variant="tertiary"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          trailingIcon={<Icon size="xs" tone="inherit"><glyphs.ChevronDown /></Icon>}
        >
          <InformationLabel label="Financials Version" value={financialsVersion} />
        </Button>
      </Anchored>
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

/** Display currency and unit. A display concern only — never a recorded conversion. */
export function CurrencyUnit({ unit = '($) Thousands' }: { unit?: string }) {
  return <CurrencySelector>USD {unit}</CurrencySelector>;
}

/** Workspace → Notes: one note tab, Client / Internal audience, rich-text body. */
export function NotesPanel() {
  const [audience, setAudience] = useState<'client' | 'internal'>('client');
  const [active, setActive] = useState<RichTextFormat[]>([]);
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
      <Textarea aria-label="Note 1" defaultValue="jkhgkhjgkhj" rows={6} />
    </div>
  );
}
