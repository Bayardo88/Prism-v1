import { useId, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Close as CloseGlyph, Settings, Warning } from '../icon/glyphs.js';
import { Modal } from '../modals/Modal.js';
import { Button } from '../button/Button.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Switch } from '../form-controls/Switch.js';
import { EmptyState } from '../core/EmptyState.js';

/* ---------------------------------------------------------------------------
 * Confirmation Dialog
 * ------------------------------------------------------------------------ */

export interface ConfirmationDialogProps {
  open: boolean;
  /** A question: "Leave without saving?", "Delete this group?". */
  title: string;
  children: ReactNode;
  /** The verb, repeated: "Leave anyway", "Delete group". Never "OK". */
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Destructive: negative confirm button and the warning glyph. */
  destructive?: boolean;
  /** Optional inset context ("3 cells edited · 1 method added"). */
  detail?: ReactNode;
  /** Blocks double-submits while the action runs. */
  busy?: boolean;
}

/**
 * Confirmation Dialog — confirm a consequential action (leave with unsaved
 * changes, delete a group or view, revoke a token, apply to an open NAV day).
 * Built on `Modal`, so it traps focus, closes on Escape and returns focus.
 * The scrim does not dismiss it: the user must choose.
 */
export function ConfirmationDialog({
  open, title, children, confirmLabel, cancelLabel = 'Cancel', onConfirm, onCancel, destructive, detail, busy,
}: ConfirmationDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      dismissOnScrimClick={false}
      className={cx('scalar-confirm', destructive && 'scalar-confirm--destructive')}
      title={
        <span className="scalar-confirm__title">
          {destructive && <Icon size="m" tone="negative"><Warning /></Icon>}
          {title}
        </span>
      }
      footer={
        <>
          <Button variant="tertiary" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
          <Button variant="primary" tone={destructive ? 'negative' : 'main'} onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="scalar-confirm__message">{children}</div>
      {detail && <div className="scalar-confirm__detail">{detail}</div>}
    </Modal>
  );
}

/* ---------------------------------------------------------------------------
 * Setting Row / Notification Center
 * ------------------------------------------------------------------------ */

export interface SettingRowProps {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Setting Row — label (+ description) with a trailing Switch, for preferences
 * that apply immediately. If the setting needs Save, use CheckboxItem.
 */
export function SettingRow({ label, description, checked, onChange, disabled, className }: SettingRowProps) {
  const id = useId();
  return (
    <div className={cx('scalar-setting-row', className)}>
      <label htmlFor={id} className="scalar-setting-row__text">
        <span className="scalar-setting-row__label">{label}</span>
        {description && <span className="scalar-setting-row__description">{description}</span>}
      </label>
      <Switch id={id} checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </div>
  );
}

export interface NotificationCenterProps {
  /** Scope shown under the title ("Spatical Ventures"). */
  scope?: ReactNode;
  view: 'inbox' | 'settings';
  onViewChange: (view: 'inbox' | 'settings') => void;
  /** Delivery switches (SettingRows) shown in both views. */
  delivery?: ReactNode;
  /** Inbox items; empty renders the "all caught up" state. */
  children?: ReactNode;
  /** Settings view body: per-type SettingRows, company scope filter. */
  settings?: ReactNode;
  className?: string;
}

/**
 * Notification Center — popover under the Notification bell. The gear
 * toggles between the inbox and notification settings.
 */
export function NotificationCenter({ scope, view, onViewChange, delivery, children, settings, className }: NotificationCenterProps) {
  const empty = !children || (Array.isArray(children) && children.length === 0);
  return (
    <div role="dialog" aria-label="Notifications" className={cx('scalar-notification-center', className)}>
      <div className="scalar-notification-center__header">
        <div className="scalar-notification-center__titles">
          <div className="scalar-notification-center__title">Notifications</div>
          {scope && <div className="scalar-notification-center__scope">{scope}</div>}
        </div>
        <ButtonIcon
          variant="tertiary"
          size="s"
          label="Notification settings"
          selected={view === 'settings'}
          onClick={() => onViewChange(view === 'settings' ? 'inbox' : 'settings')}
          icon={<Icon size="s" tone="inherit"><Settings /></Icon>}
        />
      </div>
      <div className="scalar-notification-center__body">
        {delivery}
        {view === 'settings' ? (
          <>
            <div className="scalar-notification-center__group">Receive notifications for</div>
            {settings}
          </>
        ) : empty ? (
          <EmptyState type="no-data" title="No notifications" body="You’re all caught up." />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Row Action Toolbar
 * ------------------------------------------------------------------------ */

export interface RowAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

export interface RowActionToolbarProps {
  actions: readonly RowAction[];
  onClose?: () => void;
  /** What the actions apply to ("Row actions for jane@firm.com"). */
  label: string;
  className?: string;
}

/**
 * Row Action Toolbar — compact icon toolbar at the right edge of a selected
 * table row. Every button is labelled. Prefer a Context Menu above four
 * actions or when labels matter.
 */
export function RowActionToolbar({ actions, onClose, label, className }: RowActionToolbarProps) {
  return (
    <div role="toolbar" aria-label={label} className={cx('scalar-row-toolbar', className)}>
      {actions.map((a) => (
        <ButtonIcon key={a.label} variant="tertiary" size="s" tone={a.destructive ? 'negative' : 'main'} label={a.label} onClick={a.onClick} icon={a.icon} />
      ))}
      {onClose && (
        <>
          <span className="scalar-row-toolbar__sep" aria-hidden />
          <ButtonIcon variant="tertiary" size="s" label="Close actions" onClick={onClose} icon={<Icon size="s" tone="inherit"><CloseGlyph /></Icon>} />
        </>
      )}
    </div>
  );
}
