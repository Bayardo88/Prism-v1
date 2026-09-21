import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Bell, ChevronDown, Search as SearchGlyph, Sparkle } from '../icon/glyphs.js';

/* --- Badge ---------------------------------------------------------------- */

export interface BadgeProps {
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Badge — a small count or status marker.
 *
 * Raised from 10px to the 12px floor (rule R10). A badge over 99 shows "99+"
 * rather than growing.
 */
export function Badge({ children, icon, className }: BadgeProps) {
  return (
    <span className={cx('scalar-badge', className)}>
      {icon}
      {children}
    </span>
  );
}

/** Formats a count for a Badge, capping at 99+. */
export const badgeCount = (n: number): string => (n > 99 ? '99+' : String(n));

/* --- Company dropdown trigger --------------------------------------------- */

export interface CompanyDropdownProps {
  children?: ReactNode;
  onClick?: () => void;
  expanded?: boolean;
  className?: string;
}

/** Company Dropdown — the company switcher in the primary bar. */
export function CompanyDropdown({ children, onClick, expanded, className }: CompanyDropdownProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-haspopup="menu"
      className={cx('scalar-company-dropdown', className)}
    >
      {children}
      <Icon size="xs" tone="onBrand"><ChevronDown /></Icon>
    </button>
  );
}

/* --- Filter dropdown ------------------------------------------------------- */

export interface FilterDropdownProps {
  /**
   * The value in force, not the filter's name. A filter reading "All periods"
   * tells the user more than one reading "Period".
   */
  children?: ReactNode;
  onClick?: () => void;
  expanded?: boolean;
  className?: string;
}

/** Filter dropdown — a filter control in a toolbar. */
export function FilterDropdown({ children, onClick, expanded, className }: FilterDropdownProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-haspopup="listbox"
      className={cx('scalar-filter-dropdown', className)}
    >
      {children}
      <Icon size="xs" tone="secondary"><ChevronDown /></Icon>
    </button>
  );
}

/* --- Search bar ------------------------------------------------------------ */

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** The keyboard shortcut shown at rest, e.g. "⌘K". */
  shortcut?: string;
  className?: string;
}

/**
 * Search bar — global search in the primary bar.
 *
 * Shows its keyboard shortcut at rest. Filters as you type; it does not submit.
 */
export function SearchBar({ shortcut = '⌘K', className, ...rest }: SearchBarProps) {
  return (
    <div className={cx('scalar-search-bar', className)}>
      <Icon size="s" tone="inherit"><SearchGlyph /></Icon>
      <input type="search" className="scalar-search-bar__input" placeholder="Search" {...rest} />
      {shortcut && <span className="scalar-search-bar__shortcut">{shortcut}</span>}
    </div>
  );
}

/* --- Notification ---------------------------------------------------------- */

export interface NotificationProps {
  /** Unread state. The dot means unread, not urgent, and carries no count. */
  unread?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Notification — the notification bell with an unread mark.
 *
 * Accessibility: the glyph is Icon/Primary, not Icon/On Brand. On
 * Background/Brand Subtle, Icon/On Brand resolves to 1.12:1 in Light and 1.21:1
 * in Dark, because ground and token invert together; Icon/Primary holds 15.91:1
 * and 14.11:1.
 *
 * The dot is decorative, so the unread state is also carried in the accessible
 * name rather than by the red alone.
 */
export function Notification({ unread, onClick, className }: NotificationProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={unread ? 'Notifications, unread' : 'Notifications'}
      className={cx('scalar-notification', className)}
    >
      <span className="scalar-notification__ground">
        <Icon size="m" tone="primary"><Bell /></Icon>
      </span>
      {unread && <span className="scalar-notification__dot" aria-hidden />}
    </button>
  );
}

/* --- Combo tag -------------------------------------------------------------- */

export interface ComboTagProps {
  /** The dimension. */
  label: ReactNode;
  /** The value in force. */
  value: ReactNode;
  className?: string;
}

/**
 * Combo tag — a paired label and value chip.
 *
 * Use it where a filter shows both its dimension and its value.
 */
export function ComboTag({ label, value, className }: ComboTagProps) {
  return (
    <span className={cx('scalar-combo-tag', className)}>
      <span className="scalar-combo-tag__label">{label}</span>
      <span className="scalar-combo-tag__value">{value}</span>
    </span>
  );
}

/* --- Currency selector ------------------------------------------------------ */

export interface CurrencySelectorProps {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Currency Selector — the display-currency switcher.
 *
 * Currency is a display concern. Switching it must never imply a conversion has
 * been recorded against the data.
 */
export function CurrencySelector({ children, onClick, className }: CurrencySelectorProps) {
  return (
    <button type="button" onClick={onClick} className={cx('scalar-currency-selector', className)}>
      {children}
      <Icon size="xs" tone="secondary"><ChevronDown /></Icon>
    </button>
  );
}

/* --- Selector --------------------------------------------------------------- */

export interface SelectorProps {
  /** What is being picked, e.g. "Measurement Date". */
  label?: ReactNode;
  /** The current value. */
  value: ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Selector — a compact inline value picker. */
export function Selector({ label, value, onClick, className }: SelectorProps) {
  return (
    <button type="button" onClick={onClick} className={cx('scalar-selector', className)}>
      {label && <span className="scalar-selector__label">{label}</span>}
      {value}
      <Icon size="xs" tone="secondary"><ChevronDown /></Icon>
    </button>
  );
}

/* --- Information label ------------------------------------------------------ */

export interface InformationLabelProps {
  label: ReactNode;
  value: ReactNode;
  /** A status marker. It reinforces the words; it never replaces them (R8). */
  marker?: ReactNode;
  className?: string;
}

/** Information Label — a label with an inline status marker. */
export function InformationLabel({ label, value, marker, className }: InformationLabelProps) {
  return (
    <span className={cx('scalar-information-label', className)}>
      <span className="scalar-information-label__label">{label}</span>
      <span className="scalar-information-label__value">{value}</span>
      {marker}
    </span>
  );
}

/* --- Tool switch ------------------------------------------------------------ */

export type ToolSwitchValue = 'valuations' | 'workboard';

export interface ToolSwitchProps {
  value: ToolSwitchValue;
  onChange?: (next: ToolSwitchValue) => void;
  className?: string;
}

/**
 * Tool-switch — the paired Valuation / Workboard control.
 *
 * Exactly one side is always selected; there is no unselected state.
 */
export function ToolSwitch({ value, onChange, className }: ToolSwitchProps) {
  const options: Array<{ key: ToolSwitchValue; label: string }> = [
    { key: 'valuations', label: 'Valuations' },
    { key: 'workboard', label: 'Workboard' },
  ];
  return (
    <div className={cx('scalar-tool-switch', className)} role="group" aria-label="Tool">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={value === o.key}
          onClick={() => onChange?.(o.key)}
          className="scalar-tool-switch__option"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* --- AI tool ---------------------------------------------------------------- */

export interface AIToolProps {
  /** `trigger` is the entry point; `input` is the open prompt field. */
  state?: 'trigger' | 'input';
  children?: ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  onClick?: () => void;
  className?: string;
}

/**
 * AI tool — the AI assistant entry point in the chrome.
 *
 * Reserved for genuinely generative actions. The gradient stroke in Figma is
 * the intentional exception and has no Dark-mode counterpart.
 */
export function AITool({ state = 'trigger', children, value, onValueChange, onClick, className }: AIToolProps) {
  if (state === 'input') {
    return (
      <div className={cx('scalar-ai-tool', className)}>
        <Icon size="s" tone="inherit"><Sparkle /></Icon>
        <input
          className="scalar-ai-tool__input"
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          placeholder="Ask anything…"
          aria-label="Ask the assistant"
        />
      </div>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cx('scalar-ai-tool', className)}>
      <Icon size="s" tone="inherit"><Sparkle /></Icon>
      {children ?? 'Ask AI'}
    </button>
  );
}
