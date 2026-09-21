import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

export interface WorkspaceDrawerTabProps {
  label: ReactNode;
  icon?: ReactNode;
  /** A queue length, not a notification. Hide it when nothing is waiting. */
  count?: number;
  active?: boolean;
  /**
   * Reserved for a tab whose content is model-generated. The one place in the
   * drawer chrome that carries the solid Background/AI, so the purple always
   * means "a model produced this".
   */
  ai?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Workspace Drawer Tab — one tab in the docked workspace drawer. */
export function WorkspaceDrawerTab({
  label, icon, count, active, ai, onClick, className,
}: WorkspaceDrawerTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cx('scalar-workspace-tab', ai && 'scalar-workspace-tab--ai', className)}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && <span className="scalar-workspace-tab__count">{count}</span>}
    </button>
  );
}

export interface WorkspaceDrawerProps {
  /** WorkspaceDrawerTab instances. Exactly one is active. */
  tabs?: ReactNode;
  children?: ReactNode;
  /** Expanded trades page height for drawer height. */
  expanded?: boolean;
  className?: string;
}

/**
 * Workspace Drawer — the docked panel at the foot of a data page, where
 * documents, notes and model output are worked through without leaving the
 * table above.
 *
 * Notes, Sheets and Documents are content slots: swap the children for that
 * tab's own view rather than forking the drawer.
 */
export function WorkspaceDrawer({ tabs, children, expanded, className }: WorkspaceDrawerProps) {
  return (
    <section
      className={cx('scalar-workspace-drawer', className)}
      data-expanded={expanded}
      style={{ height: expanded ? '60vh' : '40vh' }}
    >
      <div className="scalar-workspace-drawer__tabs" role="tablist" aria-label="Workspace">
        {tabs}
      </div>
      <div className="scalar-workspace-drawer__body">{children}</div>
    </section>
  );
}
