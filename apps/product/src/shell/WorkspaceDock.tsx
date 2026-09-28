/**
 * The Workspace dock at the foot of company and waterfall pages. Collapsed it
 * is a bar of tabs (Notes, Sheets, Documents); a tab opens the Workspace Drawer.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { WorkspaceDrawer, WorkspaceDrawerTab, color, space } from '@scalar/design-system';

export interface DockTab {
  key: string;
  label: string;
  count?: number;
  ai?: boolean;
}

export const DEFAULT_DOCK: DockTab[] = [
  { key: 'notes', label: 'Notes', count: 1 },
  { key: 'sheets', label: 'Sheets' },
  { key: 'documents', label: 'Documents' },
];

/**
 * `children` is the body for every tab; `panels` gives a tab its own body
 * (`{ notes: <NotesPanel/>, documents: <Docs/> }`) and wins over `children`.
 */
export function WorkspaceDock({ tabs = DEFAULT_DOCK, open, children, panels }: {
  tabs?: DockTab[];
  open?: string;
  children?: ReactNode;
  panels?: Partial<Record<string, ReactNode>>;
}) {
  const [active, setActive] = useState<string | undefined>(open);
  useEffect(() => setActive(open), [open]);

  const tabEls = tabs.map((t) => (
    <WorkspaceDrawerTab
      key={t.key}
      label={t.label}
      count={t.count}
      ai={t.ai}
      active={t.key === active}
      onClick={() => setActive((cur) => (cur === t.key ? undefined : t.key))}
    />
  ));

  if (active) return <WorkspaceDrawer tabs={tabEls}>{panels?.[active] ?? children}</WorkspaceDrawer>;

  return (
    <div
      role="tablist"
      aria-label="Workspace"
      style={{
        position: 'sticky', bottom: 0, display: 'flex', gap: space.m,
        padding: `${space.xs} ${space.l}`, background: color.bg.surface,
        borderTop: `1px solid ${color.stroke.divider}`,
      }}
    >
      {tabEls}
    </div>
  );
}
