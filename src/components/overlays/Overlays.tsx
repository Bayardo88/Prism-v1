import {
  Children, forwardRef, useId, useRef,
  type HTMLAttributes, type ReactNode, type RefObject,
} from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { useOverlay } from '../../utils/useOverlay.js';
import { useRovingFocus } from '../../utils/useRovingFocus.js';
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

export interface ConfirmationDialogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
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
  /** Blocks double-submits while the action runs; Escape is ignored too. */
  busy?: boolean;
}

/**
 * Confirmation Dialog — confirm a consequential action (leave with unsaved
 * changes, delete a group or view, revoke a token, apply to an open NAV day).
 * Built on `Modal`, so it traps focus, closes on Escape and returns focus.
 * The scrim does not dismiss it: the user must choose.
 *
 * Accessibility: `role="alertdialog"` when destructive, described by its
 * message. A destructive dialog opens on Cancel, the safe choice.
 */
export const ConfirmationDialog = forwardRef<HTMLDivElement, ConfirmationDialogProps>(function ConfirmationDialog(
  { open, title, children, confirmLabel, cancelLabel = 'Cancel', onConfirm, onCancel, destructive, detail, busy, className, ...rest },
  ref,
) {
  const messageId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <Modal
      aria-describedby={messageId}
      {...rest}
      ref={ref}
      open={open}
      onClose={() => { if (!busy) onCancel(); }}
      role={destructive ? 'alertdialog' : 'dialog'}
      initialFocus={destructive ? cancelRef : undefined}
      dismissOnScrimClick={false}
      className={cx('scalar-confirm', destructive && 'scalar-confirm--destructive', className)}
      title={
        <span className="scalar-confirm__title">
          {destructive && <Icon size="m" tone="negative"><Warning /></Icon>}
          {title}
        </span>
      }
      footer={
        <>
          <Button ref={cancelRef} variant="tertiary" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
          <Button variant="primary" tone={destructive ? 'negative' : 'main'} onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
        </>
      }
    >
      <div id={messageId} className="scalar-confirm__message">{children}</div>
      {detail && <div className="scalar-confirm__detail">{detail}</div>}
    </Modal>
  );
});

/* ---------------------------------------------------------------------------
 * Setting Row / Notification Center
 * ------------------------------------------------------------------------ */

export interface SettingRowProps {
  label: ReactNode;
  description?: ReactNode;
  /** Controlled value. Omit it (and use `defaultChecked`) to let the row own it. */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Setting Row — label (+ description) with a trailing Switch, for preferences
 * that apply immediately. If the setting needs Save, use CheckboxItem.
 * `ref` points at the switch input.
 */
export const SettingRow = forwardRef<HTMLInputElement, SettingRowProps>(function SettingRow(
  { label, description, checked, defaultChecked = false, onChange, disabled, className },
  ref,
) {
  const id = useId();
  const [value, setValue] = useControllableState(checked, defaultChecked, onChange);
  return (
    <div className={cx('scalar-setting-row', className)}>
      <label htmlFor={id} className="scalar-setting-row__text">
        <span className="scalar-setting-row__label">{label}</span>
        {description && <span className="scalar-setting-row__description">{description}</span>}
      </label>
      <Switch ref={ref} id={id} checked={value} disabled={disabled} onChange={(e) => setValue(e.target.checked)} />
    </div>
  );
});

export type NotificationView = 'inbox' | 'settings';

export interface NotificationCenterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Scope shown under the title ("Spatical Ventures"). */
  scope?: ReactNode;
  /** Controlled view. Omit it (and use `defaultView`) to let the popover own it. */
  view?: NotificationView;
  defaultView?: NotificationView;
  onViewChange?: (view: NotificationView) => void;
  /** Delivery switches (SettingRows) shown in both views. */
  delivery?: ReactNode;
  /** Inbox items; empty renders the "all caught up" state. */
  children?: ReactNode;
  /** Settings view body: per-type SettingRows, company scope filter. */
  settings?: ReactNode;
  /**
   * Makes it a live non-modal popover: focus moves in on mount, Escape and a
   * click outside call `onClose`, and focus returns to the opener. Omit it when
   * the surface is shown statically (galleries) or another container owns
   * dismissal — nothing then takes focus.
   */
  onClose?: () => void;
  /** The bell that opened it, so clicking it is not an "outside" click. */
  triggerRef?: RefObject<HTMLElement | null>;
}

/**
 * Notification Center — popover under the Notification bell. The gear
 * toggles between the inbox and notification settings.
 *
 * Accessibility: a non-modal `dialog` named by its heading. Inbox items are in
 * a polite live region so new arrivals are announced.
 */
export const NotificationCenter = forwardRef<HTMLDivElement, NotificationCenterProps>(function NotificationCenter(
  { scope, view: viewProp, defaultView = 'inbox', onViewChange, delivery, children, settings, onClose, triggerRef, className, ...rest },
  forwardedRef,
) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [view, setView] = useControllableState<NotificationView>(viewProp, defaultView, onViewChange);
  useOverlay({ open: !!onClose, onClose, containerRef: ref, modal: false, triggerRef });
  const empty = Children.toArray(children).length === 0;
  return (
    <div
      aria-labelledby={titleId}
      {...rest}
      ref={composeRefs(ref, forwardedRef)}
      role="dialog"
      className={cx('scalar-notification-center', className)}
    >
      <div className="scalar-notification-center__header">
        <div className="scalar-notification-center__titles">
          <h2 id={titleId} className="scalar-notification-center__title">Notifications</h2>
          {scope && <div className="scalar-notification-center__scope">{scope}</div>}
        </div>
        <ButtonIcon
          variant="tertiary"
          size="s"
          label="Notification settings"
          selected={view === 'settings'}
          onClick={() => setView(view === 'settings' ? 'inbox' : 'settings')}
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
        ) : (
          <div aria-live="polite" className="scalar-notification-center__inbox">
            {empty ? <EmptyState type="no-data" title="No notifications" body="You’re all caught up." /> : children}
          </div>
        )}
      </div>
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Row Action Toolbar
 * ------------------------------------------------------------------------ */

export interface RowAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

export interface RowActionToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  actions: readonly RowAction[];
  /** Shows a Close button; Escape inside the toolbar calls it too. */
  onClose?: () => void;
  /** What the actions apply to ("Row actions for jane@firm.com"). */
  label: string;
}

/**
 * Row Action Toolbar — compact icon toolbar at the right edge of a selected
 * table row. Every button is labelled. Prefer a Context Menu above four
 * actions or when labels matter.
 *
 * Keyboard: one Tab stop; Left/Right move between buttons, Home/End jump,
 * Escape calls `onClose`.
 */
export const RowActionToolbar = forwardRef<HTMLDivElement, RowActionToolbarProps>(function RowActionToolbar(
  { actions, onClose, label, className, onKeyDown, ...rest },
  ref,
) {
  const roving = useRovingFocus({ orientation: 'horizontal', itemSelector: 'button:not([disabled])' });
  return (
    <div
      {...rest}
      ref={ref}
      role="toolbar"
      aria-label={label}
      className={cx('scalar-row-toolbar', className)}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === 'Escape' && onClose) {
          e.stopPropagation();
          onClose();
          return;
        }
        roving.onKeyDown(e);
      }}
    >
      {actions.map((a, i) => (
        <ButtonIcon key={a.label} tabIndex={i === 0 ? 0 : -1} variant="tertiary" size="s" tone={a.destructive ? 'negative' : 'main'} label={a.label} onClick={a.onClick} icon={a.icon} />
      ))}
      {onClose && (
        <>
          <span className="scalar-row-toolbar__sep" aria-hidden />
          <ButtonIcon tabIndex={actions.length === 0 ? 0 : -1} variant="tertiary" size="s" label="Close actions" onClick={onClose} icon={<Icon size="s" tone="inherit"><CloseGlyph /></Icon>} />
        </>
      )}
    </div>
  );
});
