import {
  forwardRef, useId,
  type ButtonHTMLAttributes, type FormEvent, type HTMLAttributes, type InputHTMLAttributes, type ReactNode,
} from 'react';
import { cx } from '../../utils/cx.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { useRovingFocus } from '../../utils/useRovingFocus.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { Icon } from '../icon/Icon.js';
import { AiMark, Bell, Search as SearchGlyph } from '../icon/glyphs.js';
import { ArrowDropDown, CalendarMonth, Store, ViewSidebar } from '../icon/material.js';

/* --- Badge ---------------------------------------------------------------- */

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  icon?: ReactNode;
}

/**
 * Badge — a small count or status marker.
 *
 * Raised from 10px to the 12px floor (rule R10). A badge over 99 shows "99+"
 * rather than growing. A bare count reads as a number: give it context with
 * `aria-label` (e.g. "3 unread") or place it inside a labelled control.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, icon, className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx('scalar-badge', className)} {...rest}>
      {icon}
      {children}
    </span>
  );
});

/** Formats a count for a Badge, capping at 99+. */
export const badgeCount = (n: number): string => (n > 99 ? '99+' : String(n));

/* --- Company dropdown trigger --------------------------------------------- */

export interface CompanyDropdownProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  /** The switcher's panel is open (`aria-expanded`). Default false. */
  expanded?: boolean;
}

/**
 * Company Dropdown — the company switcher in the primary bar.
 *
 * The trigger only; the screen owns the panel (see CompanyDropdownPanel, a
 * listbox). It announces `aria-haspopup="listbox"`; name the panel with
 * `aria-controls`.
 */
export const CompanyDropdown = forwardRef<HTMLButtonElement, CompanyDropdownProps>(function CompanyDropdown(
  { children, expanded = false, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={expanded}
      aria-haspopup="listbox"
      className={cx('scalar-company-dropdown', className)}
      {...rest}
    >
      <Icon size="s" tone="inherit"><Store /></Icon>
      {children}
      <Icon size="s" tone="inherit"><ArrowDropDown /></Icon>
    </button>
  );
});

/* --- Filter dropdown ------------------------------------------------------- */

export interface FilterDropdownProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The value in force, not the filter's name. A filter reading "All periods"
   * tells the user more than one reading "Period".
   */
  children?: ReactNode;
  /** The filter's name, read out before the value ("Period: All periods") but not shown. */
  label?: string;
  /** Its listbox is open (`aria-expanded`). Default false. */
  expanded?: boolean;
}

/** Filter dropdown — a filter control in a toolbar. The trigger only; the screen owns the listbox. */
export const FilterDropdown = forwardRef<HTMLButtonElement, FilterDropdownProps>(function FilterDropdown(
  { children, label, expanded = false, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={expanded}
      aria-haspopup="listbox"
      className={cx('scalar-filter-dropdown', className)}
      {...rest}
    >
      {label && <><VisuallyHidden>{label}:</VisuallyHidden>{' '}</>}
      {children}
      <Icon size="s" tone="secondary"><ArrowDropDown /></Icon>
    </button>
  );
});

/* --- Search bar ------------------------------------------------------------ */

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** An optional keyboard-shortcut hint shown at the right edge. */
  shortcut?: string;
  /** Class for the styled wrapper (`className` is applied there too — it is the visual root). */
  inputClassName?: string;
}

/**
 * Search bar — global search in the primary bar.
 *
 * Its placeholder names the shortcut ("Search (Ctrl+K on Windows)"). Filters as
 * you type; it does not submit.
 *
 * The ref, `className`'s siblings and every other prop (`aria-*`,
 * `data-testid`, `value`…) go to the `<input>` so the Ctrl+K handler can focus
 * it; `className` styles the wrapper, which is a `role="search"` landmark.
 * The input is named "Search" by default (override with `aria-label` /
 * `aria-labelledby`); a placeholder is not a name.
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { shortcut, className, inputClassName, ...rest },
  ref,
) {
  return (
    <div className={cx('scalar-search-bar', className)} role="search">
      <Icon size="s" tone="inherit"><SearchGlyph /></Icon>
      <input
        ref={ref}
        type="search"
        className={cx('scalar-search-bar__input', inputClassName)}
        placeholder="Search (Ctrl+K on Windows)"
        aria-label="Search"
        autoComplete="off"
        {...rest}
      />
      {shortcut && <span className="scalar-search-bar__shortcut" aria-hidden>{shortcut}</span>}
    </div>
  );
});

/* --- Notification ---------------------------------------------------------- */

export interface NotificationProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Unread state. The dot means unread, not urgent, and carries no count. */
  unread?: boolean;
  /** Accessible name when everything is read. Default "Notifications". */
  label?: string;
  /** Accessible name when unread. Default "Notifications, unread". */
  unreadLabel?: string;
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
 * name rather than by the red alone. Announce *new* arrivals from the screen
 * with its own live region; this control is static.
 */
export const Notification = forwardRef<HTMLButtonElement, NotificationProps>(function Notification(
  { unread, label = 'Notifications', unreadLabel = 'Notifications, unread', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={unread ? unreadLabel : label}
      className={cx('scalar-notification', className)}
      {...rest}
    >
      <Icon size="s" tone="inherit"><Bell /></Icon>
      {unread && <span className="scalar-notification__dot" aria-hidden />}
    </button>
  );
});

/* --- Combo tag -------------------------------------------------------------- */

export interface ComboTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The dimension. */
  label: ReactNode;
  /** The value in force. */
  value: ReactNode;
}

/**
 * Combo tag — a paired label and value chip.
 *
 * Use it where a filter shows both its dimension and its value.
 */
export const ComboTag = forwardRef<HTMLSpanElement, ComboTagProps>(function ComboTag(
  { label, value, className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx('scalar-combo-tag', className)} {...rest}>
      <span className="scalar-combo-tag__label">{label}</span>
      <VisuallyHidden>: </VisuallyHidden>
      <span className="scalar-combo-tag__value">{value}</span>
    </span>
  );
});

/* --- Currency selector ------------------------------------------------------ */

export interface CurrencySelectorProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The display unit, e.g. "($) Thousands". */
  children?: ReactNode;
  /** The currency code, shown in the first part of the chip, e.g. "USD". */
  currency?: ReactNode;
  /** Its picker is open (`aria-expanded`). Omit for a read-only display. */
  expanded?: boolean;
}

/**
 * Currency Selector — the display-currency switcher.
 *
 * Currency is a display concern. Switching it must never imply a conversion has
 * been recorded against the data.
 *
 * It announces `aria-haspopup="menu"` only when it can open something (an
 * `onClick` or `expanded` is supplied); the screen owns the picker.
 */
export const CurrencySelector = forwardRef<HTMLButtonElement, CurrencySelectorProps>(function CurrencySelector(
  { children, currency, expanded, onClick, className, ...rest },
  ref,
) {
  const interactive = !!onClick || expanded !== undefined;
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-haspopup={interactive ? 'menu' : undefined}
      aria-expanded={expanded}
      className={cx('scalar-currency-selector', className)}
      {...rest}
    >
      {currency && <span className="scalar-currency-selector__currency">{currency}</span>}
      <span className="scalar-currency-selector__unit">{children}</span>
    </button>
  );
});

/* --- Selector --------------------------------------------------------------- */

export type SelectorSurface = 'brand' | 'surface';
export type SelectorIcon = 'caret' | 'calendar';

export interface SelectorProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** What is being picked, e.g. "Measurement Date". */
  label?: ReactNode;
  /** The current value. */
  value: ReactNode;
  /**
   * `brand` (default) sits on the navy Primary Menu bar; `surface` sits on a
   * light page or company header (Financials Date, Financials Version).
   */
  surface?: SelectorSurface;
  /** Its menu is open: sets `aria-expanded` and flips the chevron. */
  expanded?: boolean;
  /** The trailing glyph: a dropdown caret (default) or a calendar for date pickers. */
  icon?: SelectorIcon;
  /** Figma `Drop-Down`: show the trailing glyph. Default true; false for a read-only value. */
  dropdown?: boolean;
}

/**
 * Selector — a compact labelled value picker ("Date  Most Recent (06/30/2026) ▾").
 * The trigger only: the screen owns the menu it opens. `aria-haspopup="menu"`
 * is set only when there is a dropdown and something to open (`onClick` or
 * `expanded`).
 */
export const Selector = forwardRef<HTMLButtonElement, SelectorProps>(function Selector(
  { label, value, surface = 'brand', expanded, disabled, icon = 'caret', dropdown = true, onClick, className, ...rest },
  ref,
) {
  const opens = dropdown && (!!onClick || expanded !== undefined);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-haspopup={opens ? 'menu' : undefined}
      aria-expanded={opens ? expanded ?? false : undefined}
      className={cx('scalar-selector', `scalar-selector--${surface}`, className)}
      {...rest}
    >
      {label && <span className="scalar-selector__label">{label}</span>}
      <span className="scalar-selector__value">{value}</span>
      {dropdown && (
        <Icon size="s" tone="inherit" className={cx('scalar-selector__chevron', expanded && icon === 'caret' && 'scalar-rotate-180')}>
          {icon === 'calendar' ? <CalendarMonth /> : <ArrowDropDown />}
        </Icon>
      )}
    </button>
  );
});

/* --- Information label ------------------------------------------------------ */

export type InformationLabelTone = 'positive' | 'brand';

export interface InformationLabelProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Figma `L1` / `Label`. Omit to hide it. */
  label?: ReactNode;
  /** Figma `L2` / `Amount`. Omit to hide it. */
  value?: ReactNode;
  /** Figma `L3` / `Long Value`: a longer third text, e.g. "Valuation Version - 12/31/2026". Omit to hide it. */
  longValue?: ReactNode;
  /** Figma `Has drop down`: a trailing caret, for a value the user can change. The screen owns the menu. */
  dropdown?: boolean;
  /** A status marker. It reinforces the words; it never replaces them (R8). */
  marker?: ReactNode;
  /** `positive` (default) for amounts; `brand` for a value the user can pick. */
  tone?: InformationLabelTone;
}

/**
 * Information Label — a bordered label and value with an inline status marker.
 * A screen-reader-only ": " separates label from value so they read as a pair.
 */
export const InformationLabel = forwardRef<HTMLSpanElement, InformationLabelProps>(function InformationLabel(
  { label, value, longValue, dropdown, marker, tone = 'positive', className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx('scalar-information-label', className)} {...rest}>
      {label != null && <span className="scalar-information-label__label">{label}</span>}
      {label != null && value != null && <VisuallyHidden>: </VisuallyHidden>}
      {value != null && (
        <span className={cx('scalar-information-label__value', tone === 'brand' && 'scalar-information-label__value--brand')}>{value}</span>
      )}
      {longValue != null && <span className="scalar-information-label__long">{longValue}</span>}
      {marker}
      {dropdown && (
        <Icon size="s" tone="inherit" className="scalar-information-label__caret">
          <ArrowDropDown />
        </Icon>
      )}
    </span>
  );
});

/* --- Tool switch ------------------------------------------------------------ */

export type ToolSwitchValue = 'valuations' | 'workboard';

export interface ToolSwitchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: ToolSwitchValue;
  onChange?: (next: ToolSwitchValue) => void;
}

const TOOL_OPTIONS: Array<{ key: ToolSwitchValue; label: string; glyph: ReactNode }> = [
  { key: 'valuations', label: 'Valuations', glyph: <ViewSidebar /> },
  { key: 'workboard', label: 'Workboard', glyph: <CalendarMonth /> },
];

/**
 * Tool-switch — the paired Valuation / Workboard control.
 *
 * Exactly one side is always selected; there is no unselected state.
 *
 * Accessibility: a `radiogroup` of two `radio`s (`aria-checked`) with one tab
 * stop. Left/Right/Up/Down and Home/End move to and select the neighbour
 * (selection follows focus), per the APG radio-group pattern.
 */
export const ToolSwitch = forwardRef<HTMLDivElement, ToolSwitchProps>(function ToolSwitch(
  { value, onChange, className, ...rest },
  ref,
) {
  const roving = useRovingFocus({
    orientation: 'both',
    itemSelector: '[role="radio"]',
    onFocusItem: (el) => onChange?.(el.dataset.value as ToolSwitchValue),
  });
  return (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus -- keys bubble from the focusable radios; the group itself is not a tab stop (APG radio group)
    <div
      ref={ref}
      className={cx('scalar-tool-switch', className)}
      role="radiogroup"
      aria-label="Tool"
      onKeyDown={roving.onKeyDown}
      {...rest}
    >
      {TOOL_OPTIONS.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          tabIndex={value === o.key ? 0 : -1}
          data-value={o.key}
          onClick={() => onChange?.(o.key)}
          aria-label={o.label}
          title={o.label}
          className="scalar-tool-switch__option"
        >
          <Icon size="s" tone="inherit">{o.glyph}</Icon>
        </button>
      ))}
    </div>
  );
});

/* --- AI tool ---------------------------------------------------------------- */

export type AIToolState = 'trigger' | 'input';

export interface AIToolProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onSubmit'> {
  /** `trigger` is the entry point; `input` is the open prompt field. */
  state?: AIToolState;
  children?: ReactNode;
  /** Prompt text (input state). Omit to let the field own it. */
  value?: string;
  /** Initial prompt text when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Input state: called with the prompt when the user presses Enter. */
  onSubmit?: (value: string) => void;
  /** Input state: placeholder. Default "Ask anything…". */
  placeholder?: string;
  /** Input state: accessible name. Default "Ask the assistant". */
  inputLabel?: string;
  /** Trigger state: accessible name when there is no visible text. Default "Ask AI". */
  label?: string;
}

/**
 * AI tool — the AI assistant entry point in the chrome.
 *
 * Reserved for genuinely generative actions. The gradient stroke in Figma is
 * the intentional exception and has no Dark-mode counterpart.
 *
 * The ref and the remaining native props go to the interactive element — the
 * `<button>` in `trigger`, the `<input>` in `input` (where `className` styles
 * the wrapping `<form>`). Enter submits.
 */
export const AITool = forwardRef<HTMLButtonElement & HTMLInputElement, AIToolProps>(function AITool(
  {
    state = 'trigger', children, value, defaultValue = '', onValueChange, onSubmit, placeholder = 'Ask anything…',
    inputLabel = 'Ask the assistant', label = 'Ask AI', className, ...rest
  },
  ref,
) {
  const [text, setText] = useControllableState<string>(value, defaultValue, onValueChange);
  const inputId = useId();
  if (state === 'input') {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit?.(text);
    };
    return (
      <form className={cx('scalar-ai-tool', className)} onSubmit={handleSubmit}>
        <Icon size="s" tone="inherit"><AiMark /></Icon>
        <input
          id={inputId}
          ref={ref}
          className="scalar-ai-tool__input"
          name="prompt"
          autoComplete="off"
          placeholder={placeholder}
          aria-label={inputLabel}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </form>
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      aria-label={children ? undefined : label}
      className={cx('scalar-ai-tool', className)}
      {...rest}
    >
      <Icon size="s" tone="inherit"><AiMark /></Icon>
      {children}
    </button>
  );
});
