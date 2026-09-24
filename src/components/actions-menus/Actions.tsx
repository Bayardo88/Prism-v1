import { type ReactNode, type KeyboardEvent, useRef } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ChevronDown, Close, MoreVertical, Plus } from '../icon/glyphs.js';
import { ButtonIcon } from '../button/ButtonIcon.js';

/* ---------------------------------------------------------------------------
 * Split Button
 * ------------------------------------------------------------------------ */

export type SplitButtonVariant = 'primary' | 'secondary';
export type SplitButtonTone = 'main' | 'positive';

export interface SplitButtonProps {
  children: ReactNode;
  variant?: SplitButtonVariant;
  /** `positive` is the green Save used on edit screens. */
  tone?: SplitButtonTone;
  leadingIcon?: ReactNode;
  /** The main action. */
  onClick?: () => void;
  /** Opens / closes the menu of alternative actions. */
  onMenuToggle?: () => void;
  /** Whether that menu is showing. Flips the caret. */
  menuOpen?: boolean;
  /** Accessible name of the caret half ("More save options"). */
  menuLabel: string;
  disabled?: boolean;
  /** Render the Context Menu here; it is positioned under the caret. */
  menu?: ReactNode;
  className?: string;
}

/**
 * Split Button — primary action plus a caret that opens alternatives
 * ("+ Add projection year ▾" → Add historical year; "Report ▾" → Validate,
 * Preview, Finalize, Send). The two halves are separate hit targets.
 *
 * Figma: `Split Button` (Style × Tone × State, 16 variants). Hover and Open
 * map to CSS and `menuOpen`.
 */
export function SplitButton({
  children, variant = 'primary', tone = 'main', leadingIcon, onClick, onMenuToggle, menuOpen = false,
  menuLabel, disabled, menu, className,
}: SplitButtonProps) {
  return (
    <span className={cx('scalar-split-button', `scalar-split-button--${variant}`, `scalar-split-button--${tone}`, className)}>
      <button type="button" className="scalar-split-button__action" onClick={onClick} disabled={disabled}>
        {leadingIcon}
        {children}
      </button>
      <span className="scalar-split-button__separator" aria-hidden />
      <button
        type="button"
        className="scalar-split-button__menu"
        onClick={onMenuToggle}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={menuLabel}
      >
        <Icon size="s" tone="inherit" className={cx(menuOpen && 'scalar-rotate-180')}>
          <ChevronDown />
        </Icon>
      </button>
      {menuOpen && menu && <span className="scalar-split-button__popover">{menu}</span>}
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * FAB + Speed Dial
 * ------------------------------------------------------------------------ */

export interface FabProps {
  children: ReactNode;
  icon?: ReactNode;
  /** Shows a caret; the FAB then opens a Speed Dial. */
  hasMenu?: boolean;
  /** Speed Dial is showing — the icon becomes a close glyph. */
  open?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  /** Fixes the button to the bottom-right of the viewport. Default true. */
  fixed?: boolean;
  className?: string;
}

/**
 * FAB — the page's single floating "add" action, bottom-right, above the
 * Workspace Drawer. Never destructive. With `hasMenu` it opens a Speed Dial.
 */
export function Fab({ children, icon, hasMenu, open = false, onClick, disabled, fixed = true, className }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-haspopup={hasMenu ? 'menu' : undefined}
      aria-expanded={hasMenu ? open : undefined}
      className={cx('scalar-fab', fixed && 'scalar-fab--fixed', open && 'scalar-fab--open', className)}
    >
      <Icon size="s" tone="inherit">{open ? <Close /> : (icon ?? <Plus />)}</Icon>
      {children}
      {hasMenu && (
        <Icon size="s" tone="inherit" className={cx(open && 'scalar-rotate-180')}>
          <ChevronDown />
        </Icon>
      )}
    </button>
  );
}

export interface SpeedDialItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/** One option in a Speed Dial stack. Disabled when the option is not available yet. */
export function SpeedDialItem({ children, onClick, disabled, className }: SpeedDialItemProps) {
  return (
    <button type="button" role="menuitem" onClick={onClick} disabled={disabled} className={cx('scalar-speed-dial-item', className)}>
      {children}
    </button>
  );
}

export interface SpeedDialProps {
  /** SpeedDialItem children, nearest-first = most used. */
  children: ReactNode;
  /** The FAB that opened it (rendered `open`). */
  trigger: ReactNode;
  label: string;
  className?: string;
}

/**
 * Speed Dial — the FAB expanded into its actions. Render over a `Scrim`;
 * clicking the scrim or the FAB closes it.
 */
export function SpeedDial({ children, trigger, label, className }: SpeedDialProps) {
  return (
    <div className={cx('scalar-speed-dial', className)}>
      <div role="menu" aria-label={label} className="scalar-speed-dial__items">{children}</div>
      {trigger}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Segmented Control
 * ------------------------------------------------------------------------ */

export interface SegmentOption<V extends string = string> {
  value: V;
  /** Text label, or the accessible name when `icon` is given. */
  label: string;
  /** Icon-only segment (list / calendar). `label` becomes its accessible name. */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<V extends string = string> {
  options: readonly SegmentOption<V>[];
  value: V;
  onChange: (value: V) => void;
  /** Accessible name of the group ("View"). */
  label: string;
  className?: string;
}

/**
 * Segmented Control — mutually exclusive view toggle: Chart | Table,
 * Client | Internal, a date snapshot | Latest, and the icon-only list |
 * calendar switch. Exactly one segment is selected.
 *
 * Generalises `ToolSwitch`, which stays for the Valuations | Workboard switch.
 * Arrow keys move the selection (radiogroup pattern).
 */
export function SegmentedControl<V extends string = string>({ options, value, onChange, label, className }: SegmentedControlProps<V>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    for (let n = 1; n <= options.length; n++) {
      const j = (i + dir * n + options.length) % options.length;
      const o = options[j];
      if (o && !o.disabled) { onChange(o.value); refs.current[j]?.focus(); return; }
    }
  };
  return (
    <div role="radiogroup" aria-label={label} className={cx('scalar-segmented', className)}>
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={o.icon ? o.label : undefined}
            tabIndex={on ? 0 : -1}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx('scalar-segment', o.icon != null && 'scalar-segment--icon')}
          >
            {o.icon ?? o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * View Tab + View Tab Bar
 * ------------------------------------------------------------------------ */

export interface ViewTabProps {
  children: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  /** Shows the kebab; open a Context Menu (Rename, Clone, Delete) from it. */
  onMenu?: () => void;
  /** Shows a close button for a temporary tab. */
  onClose?: () => void;
  className?: string;
}

/**
 * View Tab — a saved view, scenario or note tab (Firm summary ⋮, Current,
 * Note 1 ⋮, Backsolve ⋮, a closable company filter).
 */
export function ViewTab({ children, selected, onSelect, onMenu, onClose, className }: ViewTabProps) {
  const name = typeof children === 'string' ? children : 'view';
  return (
    <span className={cx('scalar-view-tab', selected && 'scalar-view-tab--selected', className)}>
      <button type="button" role="tab" aria-selected={!!selected} className="scalar-view-tab__label" onClick={onSelect}>
        {children}
      </button>
      {onMenu && (
        <button type="button" className="scalar-view-tab__action" aria-label={`${name} options`} aria-haspopup="menu" onClick={onMenu}>
          <Icon size="s" tone="inherit"><MoreVertical /></Icon>
        </button>
      )}
      {onClose && (
        <button type="button" className="scalar-view-tab__action" aria-label={`Close ${name}`} onClick={onClose}>
          <Icon size="s" tone="inherit"><Close /></Icon>
        </button>
      )}
    </span>
  );
}

export interface ViewTabBarProps {
  children: ReactNode;
  /** Creates a new view. Omit to hide the add button. */
  onAdd?: () => void;
  addLabel?: string;
  label: string;
  className?: string;
}

/** Row of View Tabs with a trailing "+" that creates a new view. */
export function ViewTabBar({ children, onAdd, addLabel = 'Add view', label, className }: ViewTabBarProps) {
  return (
    <div className={cx('scalar-view-tab-bar', className)}>
      <div role="tablist" aria-label={label} className="scalar-view-tab-bar__tabs">{children}</div>
      {onAdd && (
        <ButtonIcon variant="tertiary" size="s" label={addLabel} onClick={onAdd} icon={<Icon size="s" tone="inherit"><Plus /></Icon>} />
      )}
    </div>
  );
}
