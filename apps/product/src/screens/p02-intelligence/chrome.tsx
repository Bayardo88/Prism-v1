/**
 * Chrome shared by the firm-level portfolio pages (Intelligence and
 * Valuations): the page header with the fund filter and section tabs, the
 * saved-view toolbar, the ⋮ page-actions menu and a dismiss hook for the
 * trigger-owned popovers.
 */
import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import {
  ButtonIcon, ContextMenu, MenuDivider, CurrencySelector, FilterDropdown, Heading, Icon, MenuItem,
  SecondaryMenu, SecondaryMenuItem, Text, ViewTab, ViewTabBar, color, glyphs, space, zIndex,
} from '@scalar/design-system';
import { href } from '../../router.js';
import { routes } from '../../routes.js';

/** Outside-click and Escape dismissal for a popover the trigger owns. */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, close: () => void): void {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, close]);
}

export type IntelligenceTab = 'summaries' | 'soi' | 'daily-nav';

const TABS: Array<{ key: IntelligenceTab; label: string; to: string }> = [
  { key: 'summaries', label: 'Summaries', to: routes.intelligence.summaries },
  { key: 'soi', label: 'Schedule of Investments', to: routes.intelligence.scheduleOfInvestments },
  { key: 'daily-nav', label: 'Daily NAV', to: routes.intelligence.dailyNav },
];

/** A ⋮ trigger with its Context Menu anchored under the right edge. */
export function PageActions({ open, onOpenChange, label, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => onOpenChange(false));
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <ButtonIcon
        variant="tertiary"
        size="s"
        label={label}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        icon={<Icon><glyphs.MoreVertical /></Icon>}
      />
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: zIndex.overlay }}>
          <ContextMenu label={label}>{children}</ContextMenu>
        </div>
      )}
    </div>
  );
}

/**
 * Firm portfolio page header: title, "Filter by Fund", the section tabs (only
 * on Intelligence) and the ⋮ page-actions menu.
 */
export function PortfolioHeader({ title, tab, actionsOpen, onActionsOpen, actions }: {
  title: string;
  tab?: IntelligenceTab;
  actionsOpen: boolean;
  onActionsOpen: (open: boolean) => void;
  actions: ReactNode;
}) {
  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', gap: space.m,
        padding: `${space.xs} ${space.l}`, background: color.bg.surface,
        borderBottom: `1px solid ${color.stroke.divider}`,
      }}
    >
      <Heading level={1} step="l">{title}</Heading>
      <FilterDropdown>Filter by Fund</FilterDropdown>
      {tab && (
        <SecondaryMenu>
          {TABS.map((t) => (
            <SecondaryMenuItem key={t.key} current={t.key === tab} href={href(t.to)}>{t.label}</SecondaryMenuItem>
          ))}
        </SecondaryMenu>
      )}
      <div style={{ marginLeft: 'auto' }}>
        <PageActions open={actionsOpen} onOpenChange={onActionsOpen} label={`${title} page actions`}>
          {actions}
        </PageActions>
      </div>
    </header>
  );
}

/** Excel / Bulk / PDF — the page actions on Summaries and Valuations. */
export function ExportMenuItems() {
  return (
    <>
      <MenuItem icon={<Icon size="s"><glyphs.Download /></Icon>}>Excel Export</MenuItem>
      <MenuItem icon={<Icon size="s"><glyphs.List /></Icon>}>Bulk Actions</MenuItem>
      <MenuItem icon={<Icon size="s"><glyphs.Document /></Icon>}>PDF Export</MenuItem>
    </>
  );
}

/**
 * Saved views row: View Tab Bar (each tab has a ⋮ with Edit / Clone /
 * Delete), "+" to create a view, then Scalar AI and the display currency.
 */
export function SavedViewsBar({ views, current, onSelect, menuFor, onMenuFor, onAdd, onEdit }: {
  views: string[];
  current: string;
  onSelect: (view: string) => void;
  /** The view whose ⋮ menu is open. */
  menuFor?: string;
  onMenuFor: (view?: string) => void;
  onAdd: () => void;
  onEdit: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, !!menuFor, () => onMenuFor(undefined));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space.s }}>
      <div ref={ref} style={{ position: 'relative' }}>
        <ViewTabBar label="Saved views" onAdd={onAdd} addLabel="Create summary view">
          {views.map((v) => (
            <ViewTab key={v} selected={v === current} onSelect={() => onSelect(v)} onMenu={() => onMenuFor(menuFor === v ? undefined : v)}>
              {v}
            </ViewTab>
          ))}
        </ViewTabBar>
        {menuFor && (
          <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: zIndex.overlay }}>
            <ContextMenu label={`${menuFor} actions`}>
              <MenuItem icon={<Icon size="s"><glyphs.Edit /></Icon>} onClick={() => { onMenuFor(undefined); onEdit(); }}>Edit Summary</MenuItem>
              <MenuItem icon={<Icon size="s"><glyphs.Copy /></Icon>} onClick={() => { onMenuFor(undefined); onAdd(); }}>Clone</MenuItem>
              <MenuDivider />
              <MenuItem tone="destructive" icon={<Icon size="s" tone="inherit"><glyphs.Trash /></Icon>}>Delete</MenuItem>
            </ContextMenu>
          </div>
        )}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: space.s }}>
        <ButtonIcon variant="tertiary" size="s" label="Ask Scalar AI" icon={<Icon tone="ai"><glyphs.Sparkle /></Icon>} />
        <CurrencySelector>USD ($) Thousands</CurrencySelector>
      </div>
    </div>
  );
}

/** "Summary values shown for published valuations" — the grid's footnote. */
export function PublishedNote() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: space.xs }}>
      <Icon size="s" tone="secondary"><glyphs.Info /></Icon>
      <Text step="s" tone="secondary">Summary values shown for published valuations</Text>
    </div>
  );
}
