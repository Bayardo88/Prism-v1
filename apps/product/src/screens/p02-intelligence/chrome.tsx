/**
 * Chrome shared by the firm-level portfolio pages (Intelligence and
 * Valuations): the page header with the fund filter and section tabs, the
 * saved-view toolbar, the ⋮ page-actions menu and a dismiss hook for the
 * trigger-owned popovers.
 */
import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import {
  ButtonIcon, ContextMenu, MenuDivider, FilterDropdown, Icon, MenuItem,
  TertiaryMenu, TertiaryMenuItem, Text, icons, space, zIndex,
} from '@scalar/design-system';
import { routes } from '../../routes.js';
import { PageHeader } from '../../shell/PageHeader.js';
import { ToolbarAi, ToolbarCurrency, ToolbarTableTools } from '../../shell/Toolbar.js';

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
        size="xs"
        label={label}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        icon={<Icon size="l" tone="primary"><icons.MoreVert /></Icon>}
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
    <PageHeader
      title={title}
      filter={<FilterDropdown>Filter by Fund</FilterDropdown>}
      tabs={tab ? TABS : undefined}
      current={tab}
      trailing={
        <PageActions open={actionsOpen} onOpenChange={onActionsOpen} label={`${title} page actions`}>
          {actions}
        </PageActions>
      }
    />
  );
}

/** Excel / Bulk / PDF — the page actions on Summaries and Valuations. */
export function ExportMenuItems() {
  return (
    <>
      <MenuItem icon={<Icon size="s"><icons.TableView /></Icon>}>Excel Export</MenuItem>
      <MenuItem icon={<Icon size="s"><icons.FactCheck /></Icon>}>Bulk Actions</MenuItem>
      <MenuItem icon={<Icon size="s"><icons.PictureAsPdf /></Icon>}>PDF Export</MenuItem>
    </>
  );
}

/**
 * Saved views: the Tertiary Menu. Each view is an item (the current one shows
 * a ⋮ that opens Edit / Clone / Delete), "+" creates a view, then the toolbar
 * carries Scalar AI, the display currency and the table tools.
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
    <TertiaryMenu
      onAdd={onAdd}
      end={
        <>
          <ToolbarAi />
          <ToolbarCurrency />
          <ToolbarTableTools />
        </>
      }
    >
      <div ref={ref} style={{ position: 'relative', display: 'flex' }}>
        {views.map((v) => (
          <TertiaryMenuItem
            key={v}
            current={v === current}
            onClick={() => (v === current ? onMenuFor(menuFor === v ? undefined : v) : onSelect(v))}
          >
            {v}
          </TertiaryMenuItem>
        ))}
        {menuFor && (
          <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: zIndex.overlay }}>
            <ContextMenu label={`${menuFor} actions`}>
              <MenuItem icon={<Icon size="s"><icons.Edit /></Icon>} onClick={() => { onMenuFor(undefined); onEdit(); }}>Edit Summary</MenuItem>
              <MenuItem icon={<Icon size="s"><icons.ContentCopy /></Icon>} onClick={() => { onMenuFor(undefined); onAdd(); }}>Clone</MenuItem>
              <MenuDivider />
              <MenuItem tone="destructive" icon={<Icon size="s" tone="inherit"><icons.Delete /></Icon>}>Delete</MenuItem>
            </ContextMenu>
          </div>
        )}
      </div>
    </TertiaryMenu>
  );
}

/** "Summary values shown for published valuations" — the grid's footnote. */
export function PublishedNote() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: space.xs }}>
      <Icon size="s" tone="secondary"><icons.Info /></Icon>
      <Text step="s" tone="secondary">Summary values shown for published valuations</Text>
    </div>
  );
}
