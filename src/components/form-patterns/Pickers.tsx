import {
  createContext, forwardRef, useContext, useEffect, useId, useRef, useState,
  type ButtonHTMLAttributes, type ChangeEvent, type DragEvent, type FocusEvent, type HTMLAttributes,
  type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type Ref,
} from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { describedBy } from '../../utils/useFieldIds.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { Icon } from '../icon/Icon.js';
import { ArrowDown, Check, ChevronDown, Edit, Error as ErrorGlyph, Search, Trash, Upload, ZoomOut } from '../icon/glyphs.js';
import * as m from '../icon/material.js';
import { CheckboxItem } from '../checkbox/CheckboxItem.js';
import { ButtonIcon } from '../button/ButtonIcon.js';

/* ---------------------------------------------------------------------------
 * Combobox
 * ------------------------------------------------------------------------ */

export interface ComboboxOptionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  children: ReactNode;
  /** Secondary line — fund, date, ticker. */
  detail?: ReactNode;
  selected?: boolean;
  /** `multi` draws a leading checkbox; several options can be selected. */
  selection?: 'single' | 'multi';
  /** Keyboard-highlighted option (aria-activedescendant target). */
  active?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

/**
 * Combobox Option — one result row inside a Combobox Panel. Not focusable on
 * its own: the owning input points `aria-activedescendant` at its `id`. Mouse
 * press does not move focus off the input.
 */
export const ComboboxOption = forwardRef<HTMLDivElement, ComboboxOptionProps>(function ComboboxOption(
  { children, detail, selected, selection = 'single', active, disabled, onSelect, className, onClick, onMouseDown, ...rest },
  ref,
) {
  return (
    // Options are never focus targets: the owning input/listbox points aria-activedescendant at them and handles the keys.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
    <div
      ref={ref}
      role="option"
      aria-selected={!!selected}
      aria-disabled={disabled || undefined}
      data-active={active || undefined}
      {...rest}
      onMouseDown={(e) => { onMouseDown?.(e); if (!e.defaultPrevented) e.preventDefault(); }}
      onClick={(e) => { onClick?.(e); if (!disabled && !e.defaultPrevented) onSelect?.(); }}
      className={cx('scalar-combobox-option', className)}
    >
      {selection === 'multi' && <CheckboxItem size="s" checked={!!selected} disabled={disabled} readOnly tabIndex={-1} aria-hidden />}
      <span className="scalar-combobox-option__text">
        <span className="scalar-combobox-option__label">{children}</span>
        {detail && <span className="scalar-combobox-option__detail">{detail}</span>}
      </span>
      {selection === 'single' && selected && <Icon size="s" tone="brand"><Check /></Icon>}
    </div>
  );
});

export interface ShowMoreRowProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children: ReactNode;
}

/** Show More Row — reveals the next page of a truncated list ("Show 24 more companies"). */
export const ShowMoreRow = forwardRef<HTMLButtonElement, ShowMoreRowProps>(function ShowMoreRow(
  { children, className, ...rest },
  ref,
) {
  return (
    <button ref={ref} type="button" {...rest} className={cx('scalar-show-more', className)}>
      {children}
      <Icon size="s" tone="inherit"><ArrowDown /></Icon>
    </button>
  );
});

export interface ComboboxItem {
  value: string;
  label: string;
  detail?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  items: readonly ComboboxItem[];
  /** Selected value(s). An array switches the panel to multi-select (or set `multiple`). */
  value?: string | readonly string[];
  /** Multi-select without passing an array (e.g. nothing selected yet). */
  multiple?: boolean;
  onSelect: (value: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  /** Accessible name of the search field. Default: `label`. */
  searchLabel?: string;
  /** "Show 24 more companies" — omit when everything is showing. */
  showMore?: { label: ReactNode; onClick: () => void };
  /** Footer create action ("+ Add new company", "+ Save as new version"). */
  footer?: ReactNode;
  /** Accessible name of the list ("Companies"). */
  label: string;
  /** Custom option content (replaces the label text; `detail` is still shown). */
  renderOption?: (item: ComboboxItem) => ReactNode;
  /** Focus the search field on mount. Opt-in: a panel rendered statically must not steal focus. */
  autoFocus?: boolean;
  /** Called on Escape (after a non-empty query has been cleared). The trigger usually closes the panel here. */
  onEscape?: () => void;
}

/**
 * Combobox Panel — searchable dropdown: search field, filtered options, an
 * optional Show More Row and create action. Use instead of `Select` whenever
 * the list can exceed ~8 items (companies, measurement dates, versions,
 * folders, people). Filtering is the caller's job — pass the already-filtered
 * `items`.
 *
 * Keyboard (focus stays in the input, `aria-activedescendant` follows):
 * ↑/↓ move (disabled options skipped, active option scrolled into view),
 * Enter selects, Esc clears the query, then calls `onEscape`. Home/End keep
 * their text-caret meaning. `ref` is the search `<input>`; `className` and rest
 * props land on the panel root. The panel is a surface: the trigger owns open
 * state, so `aria-expanded` is always true while it is rendered.
 */
export const ComboboxPanel = forwardRef<HTMLInputElement, ComboboxPanelProps>(function ComboboxPanel(
  {
    items, value, multiple, onSelect, query, onQueryChange, searchPlaceholder = 'Search', searchLabel, showMore, footer, label,
    renderOption, autoFocus, onEscape, className, ...rest
  },
  ref,
) {
  const base = useId();
  const input = useRef<HTMLInputElement>(null);
  const [activeRaw, setActive] = useState(0);
  const multi = multiple ?? Array.isArray(value);
  const selected: readonly string[] = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  const isSel = (v: string) => selected.includes(v);
  // Clamp so a shorter `items` never leaves the highlight pointing at nothing.
  const active = items.length ? Math.min(activeRaw, items.length - 1) : -1;
  const activeId = active >= 0 ? `${base}-${active}` : undefined;

  useEffect(() => { if (autoFocus) input.current?.focus(); }, [autoFocus]);
  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' });
  }, [activeId]);

  const move = (dir: 1 | -1) => {
    let i = active;
    for (let n = 0; n < items.length; n++) {
      i += dir;
      if (i < 0 || i >= items.length) return;
      if (!items[i]!.disabled) { setActive(i); return; }
    }
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (query) { onQueryChange(''); setActive(0); }
      onEscape?.();
      return;
    }
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); const it = items[active]; if (it && !it.disabled) onSelect(it.value); }
  };
  return (
    <div {...rest} className={cx('scalar-combobox-panel', className)}>
      <div className="scalar-combobox-panel__search">
        <Icon size="s" tone="secondary"><Search /></Icon>
        <input
          ref={composeRefs(ref, input)}
          role="combobox"
          aria-label={searchLabel ?? label}
          aria-haspopup="listbox"
          aria-expanded
          aria-autocomplete="list"
          aria-controls={`${base}-list`}
          aria-activedescendant={activeId}
          value={query}
          placeholder={searchPlaceholder}
          onChange={(e) => { onQueryChange(e.target.value); setActive(0); }}
          onKeyDown={onKey}
        />
      </div>
      <div id={`${base}-list`} role="listbox" aria-label={label} aria-multiselectable={multi || undefined} className="scalar-combobox-panel__list">
        {items.map((it, i) => (
          <ComboboxOption
            key={it.value}
            id={`${base}-${i}`}
            detail={it.detail}
            disabled={it.disabled}
            active={i === active}
            selected={isSel(it.value)}
            selection={multi ? 'multi' : 'single'}
            onSelect={() => onSelect(it.value)}
          >
            {renderOption ? renderOption(it) : it.label}
          </ComboboxOption>
        ))}
      </div>
      {!items.length && <div aria-hidden="true" className="scalar-combobox-panel__empty">No matches</div>}
      <VisuallyHidden role="status" aria-live="polite">{items.length ? '' : 'No matches'}</VisuallyHidden>
      {showMore && <ShowMoreRow onClick={showMore.onClick}>{showMore.label}</ShowMoreRow>}
      {footer && <div className="scalar-combobox-panel__footer">{footer}</div>}
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Select Menu
 * ------------------------------------------------------------------------ */

const SelectMenuContext = createContext<{ activeId?: string }>({});

export interface SelectMenuOptionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  children: ReactNode;
  /** Optional second line explaining the choice ("Visible to every analyst"). */
  description?: ReactNode;
  /** Leading glyph, passed through `Icon`. */
  icon?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  /** Keyboard-highlighted option — set it only when you drive `aria-activedescendant` yourself; `SelectMenu` does it otherwise. */
  active?: boolean;
  onSelect?: () => void;
}

/**
 * Select Menu Option — one choice in a Select Menu. The selected option
 * carries a trailing check as well as the tint, so selection is never colour
 * alone (R8). A disabled option stays visible and is skipped. It is not
 * focusable itself — the `SelectMenu` listbox points `aria-activedescendant`
 * at it, and an `id` is generated when you do not pass one.
 */
export const SelectMenuOption = forwardRef<HTMLDivElement, SelectMenuOptionProps>(function SelectMenuOption(
  { children, description, icon, selected, disabled, active, onSelect, id, className, onClick, ...rest },
  ref,
) {
  const auto = useId();
  const oid = id ?? auto;
  const ctx = useContext(SelectMenuContext);
  const isActive = active ?? (ctx.activeId === oid);
  return (
    // Options are never focus targets: the SelectMenu listbox points aria-activedescendant at them and handles the keys.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
    <div
      ref={ref}
      role="option"
      aria-selected={!!selected}
      aria-disabled={disabled || undefined}
      data-active={isActive || undefined}
      {...rest}
      id={oid}
      onClick={(e) => { onClick?.(e); if (!disabled && !e.defaultPrevented) onSelect?.(); }}
      className={cx('scalar-select-menu-option', className)}
    >
      {icon && <span className="scalar-select-menu-option__icon">{icon}</span>}
      <span className="scalar-select-menu-option__text">
        <span className="scalar-select-menu-option__label">{children}</span>
        {description && <span className="scalar-select-menu-option__description">{description}</span>}
      </span>
      <span className="scalar-select-menu-option__check" aria-hidden>
        {selected && <Icon size="s" tone="brand"><Check /></Icon>}
      </span>
    </div>
  );
});

export interface SelectMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  /** SelectMenuOption instances (MenuGroupLabel / MenuDivider between groups are fine). */
  children: ReactNode;
  /** Accessible name of the listbox ("Currency"). */
  label: string;
  /** Optional slot above the list — a search input for a long list. The caller filters. */
  search?: ReactNode;
  /** Optional slot below the list — a create action ("+ Add role"). */
  footer?: ReactNode;
  /** Several options can be selected at once. */
  multiselectable?: boolean;
  /** Called on Escape — the trigger usually closes the menu and returns focus here. */
  onEscape?: () => void;
  /** Lands on the outer wrapper. */
  className?: string;
}

/**
 * Select Menu — the open listbox surface of a select: a raised panel of
 * options with a selected check, disabled options and optional descriptions,
 * plus optional search and footer slots.
 *
 * The listbox owns its keyboard model (focus stays on the listbox,
 * `aria-activedescendant` follows): ↑/↓ move, Home/End jump, typing jumps to the
 * next option starting with those letters, Enter / Space choose the active
 * option, Esc calls `onEscape`. Pass your own `aria-activedescendant` to take
 * over highlighting. The trigger still owns open state, positioning and
 * outside-click dismissal. `ref` and rest props (`id`, `onKeyDown`, `tabIndex`)
 * land on the `role="listbox"` element; `className` on the outer wrapper. For a
 * searchable list that can exceed ~8 items, prefer `ComboboxPanel`.
 */
export const SelectMenu = forwardRef<HTMLDivElement, SelectMenuProps>(function SelectMenu(
  {
    children, label, search, footer, multiselectable, className, onEscape, onKeyDown, onFocus, onBlur, tabIndex = 0,
    'aria-activedescendant': external, ...rest
  },
  ref,
) {
  const list = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>();
  const typed = useRef<{ text: string; timer?: ReturnType<typeof setTimeout> }>({ text: '' });
  useEffect(() => { const t = typed.current; return () => clearTimeout(t.timer); }, []);

  const options = () => Array.from(list.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? []);
  const activate = (el: HTMLElement | undefined) => {
    if (!el) return;
    setActiveId(el.id);
    el.scrollIntoView?.({ block: 'nearest' });
  };
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || external || e.ctrlKey || e.metaKey || e.altKey) return;
    const opts = options();
    const i = opts.findIndex((o) => o.id === activeId);
    let next: HTMLElement | undefined;
    switch (e.key) {
      case 'ArrowDown': next = opts[Math.min(opts.length - 1, i + 1)]; break;
      case 'ArrowUp': next = opts[Math.max(0, i - 1)]; break;
      case 'Home': next = opts[0]; break;
      case 'End': next = opts[opts.length - 1]; break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        opts[i]?.click();
        return;
      case 'Escape': onEscape?.(); return;
      default:
        if (e.key.length === 1) {
          const t = typed.current;
          clearTimeout(t.timer);
          t.text += e.key.toLowerCase();
          t.timer = setTimeout(() => { t.text = ''; }, 500);
          const ordered = [...opts.slice(i + 1), ...opts.slice(0, i + 1)];
          next = ordered.find((o) => (o.textContent ?? '').trim().toLowerCase().startsWith(t.text));
          if (!next) return;
        } else return;
    }
    e.preventDefault();
    activate(next);
  };
  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    onFocus?.(e);
    if (e.target !== e.currentTarget || external) return;
    const opts = options();
    activate(opts.find((o) => o.getAttribute('aria-selected') === 'true') ?? opts[0]);
  };
  return (
    <div className={cx('scalar-select-menu', className)}>
      {search && <div className="scalar-select-menu__search">{search}</div>}
      <SelectMenuContext.Provider value={{ activeId: external ? undefined : activeId }}>
        {/* tabIndex defaults to 0 (destructured above), which the rule cannot see through the variable. */}
        {/* eslint-disable-next-line jsx-a11y/aria-activedescendant-has-tabindex */}
        <div
          role="listbox"
          aria-label={label}
          aria-multiselectable={multiselectable || undefined}
          className="scalar-select-menu__list"
          tabIndex={tabIndex}
          {...rest}
          ref={composeRefs(ref, list)}
          aria-activedescendant={external ?? activeId}
          onKeyDown={handleKey}
          onFocus={handleFocus}
          onBlur={(e) => { onBlur?.(e); if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActiveId(undefined); }}
        >
          {children}
        </div>
      </SelectMenuContext.Provider>
      {footer && <div className="scalar-select-menu__footer">{footer}</div>}
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Repeatable Row
 * ------------------------------------------------------------------------ */

export interface RepeatableRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The field(s) of this row: one input, or input → select for a mapping. */
  children: ReactNode;
  onRemove: () => void;
  /** Keep a required list from reaching zero rows. */
  removeDisabled?: boolean;
  /** Name of the remove button. Make it specific ("Remove recipient ana@firm.com"); default derives from `index`. */
  removeLabel?: string;
  /** Zero-based position, used for the default remove name ("Remove row 2") and the row's group name. */
  index?: number;
}

/**
 * Repeatable Row — one row of a list editor (recipients, domains, group →
 * role mappings). Stack rows and end the list with a tertiary
 * "+ Add <thing>" Button. Pass `index` or a specific `removeLabel` so the
 * remove buttons are distinguishable to a screen reader. `ref` and rest props
 * land on the row.
 */
export const RepeatableRow = forwardRef<HTMLDivElement, RepeatableRowProps>(function RepeatableRow(
  { children, onRemove, removeDisabled, removeLabel, index, className, ...rest },
  ref,
) {
  const num = index != null ? index + 1 : undefined;
  return (
    <div
      ref={ref}
      role="group"
      aria-label={num != null ? `Row ${num}` : undefined}
      {...rest}
      className={cx('scalar-repeatable-row', className)}
    >
      <div className="scalar-repeatable-row__fields">{children}</div>
      <ButtonIcon
        variant="tertiary"
        tone="negative"
        label={removeLabel ?? (num != null ? `Remove row ${num}` : 'Remove row')}
        disabled={removeDisabled}
        onClick={onRemove}
        icon={<Icon size="s" tone="inherit"><Trash /></Icon>}
      />
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Dropzone
 * ------------------------------------------------------------------------ */

export type DropzoneState = 'default' | 'uploading' | 'error';

export interface DropzoneProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'prefix'> {
  onFiles: (files: File[]) => void;
  /** Accepted types, as for `<input accept>` (".csv,.xlsx,.pdf"). */
  accept?: string;
  multiple?: boolean;
  /** Always state accepted types and size: "CSV, XLSX or PDF · 15 MB max". Linked to the browse button. */
  hint: ReactNode;
  state?: DropzoneState;
  /** 0–100 while uploading. Omit for an indeterminate bar. */
  progress?: number;
  /** Uploading label or error reason. */
  message?: ReactNode;
  /** Accessible name of the progress bar. Default "Upload progress". */
  progressLabel?: string;
  /** Ignores drops and disables the browse button. */
  disabled?: boolean;
  /**
   * Replaces the default prompt ("Drag & drop a file or select a file") in
   * the default state. Pass a render function to keep the browse link:
   * `prompt={(browse) => <>Drop a logo or {browse('choose an image')}</>}`.
   */
  prompt?: ReactNode | ((browse: (label: ReactNode) => ReactNode) => ReactNode);
}

/**
 * Dropzone — drag & drop or browse. Report templates, documents, logos.
 * Hover is set while a file is dragged over. The browse button is present in
 * every state (default prompt, "Choose another file" while uploading, "Try
 * again" after an error), so a keyboard user can always pick a file. `ref` and
 * rest props land on the zone (`role="group"`).
 */
export const Dropzone = forwardRef<HTMLDivElement, DropzoneProps>(function Dropzone(
  {
    onFiles, accept, multiple, hint, state = 'default', progress, message, progressLabel = 'Upload progress', disabled, prompt, className,
    onDragOver, onDragEnter, onDragLeave, onDrop, ...rest
  },
  ref,
) {
  const base = useId();
  const promptId = `${base}-prompt`;
  const hintId = `${base}-hint`;
  const [over, setOver] = useState(false);
  const depth = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  // Dropped files skip the native picker's filtering, so apply `accept` and `multiple` here too.
  const accepts = (file: File) => {
    if (!accept) return true;
    return accept.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).some((t) =>
      t.startsWith('.') ? file.name.toLowerCase().endsWith(t) : t.endsWith('/*') ? file.type.startsWith(t.slice(0, -1)) : file.type === t);
  };
  const take = (list: FileList | null) => {
    if (disabled || !list?.length) return;
    const files = Array.from(list).filter(accepts);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };
  const browse = (label: ReactNode) => (
    <button
      type="button"
      className="scalar-dropzone__browse"
      disabled={disabled}
      aria-describedby={hintId}
      onClick={() => input.current?.click()}
    >
      {label}
    </button>
  );
  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={promptId}
      aria-disabled={disabled || undefined}
      {...rest}
      className={cx('scalar-dropzone', `scalar-dropzone--${state}`, over && 'scalar-dropzone--over', className)}
      onDragEnter={(e: DragEvent<HTMLDivElement>) => { onDragEnter?.(e); depth.current += 1; if (!disabled) setOver(true); }}
      onDragOver={(e: DragEvent<HTMLDivElement>) => { onDragOver?.(e); e.preventDefault(); if (!disabled) setOver(true); }}
      onDragLeave={(e: DragEvent<HTMLDivElement>) => { onDragLeave?.(e); depth.current = Math.max(0, depth.current - 1); if (depth.current === 0) setOver(false); }}
      onDrop={(e: DragEvent<HTMLDivElement>) => { onDrop?.(e); e.preventDefault(); depth.current = 0; setOver(false); take(e.dataTransfer.files); }}
    >
      <span className="scalar-dropzone__well" aria-hidden="true">
        <Icon size="m" tone={state === 'error' ? 'negative' : 'brand'}>{state === 'error' ? <ErrorGlyph /> : <Upload />}</Icon>
      </span>
      {state === 'default' ? (
        <span id={promptId} className="scalar-dropzone__prompt">
          {prompt === undefined
            ? <>Drag &amp; drop a file or {browse('select a file')}</>
            : typeof prompt === 'function' ? prompt(browse) : prompt}
        </span>
      ) : (
        <>
          <span id={promptId} className="scalar-dropzone__prompt" role={state === 'error' ? 'alert' : 'status'}>{message}</span>
          <span className="scalar-dropzone__prompt">{browse(state === 'error' ? 'Try again' : 'Choose another file')}</span>
        </>
      )}
      {state === 'uploading' && (
        <span
          className="scalar-dropzone__progress"
          role="progressbar"
          aria-label={progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress ?? 0}%` }} />
        </span>
      )}
      <span id={hintId} className="scalar-dropzone__hint">{hint}</span>
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => { take(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Slider
 * ------------------------------------------------------------------------ */

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Accessible name ("Zoom"). */
  label: string;
  minIcon?: ReactNode;
  maxIcon?: ReactNode;
  /** Visible current value ("1.4×"), shown after the track. Pair it with `aria-valuetext` for the spoken form. */
  readout?: ReactNode;
}

/**
 * Slider — a continuous value in a range (logo cropper zoom). Native range
 * input, so ←/→/↑/↓ (one step), Home/End, PageUp/PageDown (larger step) work,
 * controlled or uncontrolled. Pass `aria-valuetext` when the number needs a
 * unit. Never for financial values — use `NumberField`. `ref` and rest props
 * land on the `<input>`; `className` on the wrapper.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, minIcon, maxIcon, readout, className, ...rest },
  ref,
) {
  return (
    <div className={cx('scalar-slider', className)}>
      {minIcon && <span aria-hidden="true" className="scalar-slider__icon">{minIcon}</span>}
      <input ref={ref} type="range" aria-label={label} className="scalar-slider__input" {...rest} />
      {maxIcon && <span aria-hidden="true" className="scalar-slider__icon">{maxIcon}</span>}
      {readout != null && <span className="scalar-slider__readout">{readout}</span>}
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Inline Edit / Inline Picker
 * ------------------------------------------------------------------------ */

export interface InlineEditProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'defaultValue' | 'children'> {
  /** Controlled value. Omit (and use `defaultValue`) to let the component own it. */
  value?: string;
  defaultValue?: string;
  /** Fires with the new text when an edit is committed (Enter or blur) and it differs. */
  onCommit?: (value: string) => void;
  /** Link-styled prompt shown while empty ("Enter name"). */
  placeholder: string;
  /** Accessible name ("Comp group name"). */
  label: string;
  /** Marks the edit field `aria-invalid`. */
  invalid?: boolean;
  disabled?: boolean;
  /** Shows the value but cannot be edited. */
  readOnly?: boolean;
}

/**
 * Inline Edit — click-to-edit text inside a layout (comp group name, a new
 * security name in a column header). Enter / blur commits, Escape cancels
 * (a cancelled edit is never committed), and focus returns to the trigger
 * after Enter or Escape. The external `value` is read when an edit starts.
 * `ref` points at whichever element is showing (trigger button or input);
 * rest props land on it too.
 */
export const InlineEdit = forwardRef<HTMLElement, InlineEditProps>(function InlineEdit(
  { value, defaultValue, onCommit, placeholder, label, invalid, disabled, readOnly, className, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllableState<string>(value, defaultValue ?? '', onCommit);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(current);
  const field = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const finished = useRef(false);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (editing) { field.current?.focus(); field.current?.select(); }
    else if (restoreFocus.current) { restoreFocus.current = false; trigger.current?.focus(); }
  }, [editing]);

  const finish = (commit: boolean, returnFocus: boolean) => {
    if (finished.current) return;
    finished.current = true;
    restoreFocus.current = returnFocus;
    setEditing(false);
    if (commit && draft !== current) setCurrent(draft);
  };

  if (editing) {
    return (
      <input
        ref={composeRefs(ref as Ref<HTMLInputElement>, field)}
        aria-label={label}
        aria-invalid={invalid || undefined}
        {...rest}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => finish(true, false)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === 'Enter') { e.preventDefault(); finish(true, true); }
          else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false, true); }
        }}
        className={cx('scalar-inline-edit', 'scalar-inline-edit--editing', className)}
      />
    );
  }
  return (
    <button
      ref={composeRefs(ref as Ref<HTMLButtonElement>, trigger)}
      type="button"
      disabled={disabled}
      aria-label={current ? `${label}: ${current}. Edit` : `${label}. ${placeholder}`}
      {...(rest as HTMLAttributes<HTMLButtonElement>)}
      onClick={() => { if (readOnly) return; finished.current = false; setDraft(current); setEditing(true); }}
      className={cx('scalar-inline-edit', !current && 'scalar-inline-edit--placeholder', className)}
    >
      {current || placeholder}
      {current && !readOnly && <Icon size="xs" tone="secondary" className="scalar-inline-edit__pencil"><Edit /></Icon>}
    </button>
  );
});

export interface InlinePickerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children' | 'aria-label'> {
  /** Main value ("09/21/2026"). */
  children: ReactNode;
  /** Optional second value after a separator ("V-2"). */
  secondary?: ReactNode;
  open?: boolean;
  /** Accessible name prefix ("Previous versions"). The visible value is appended, so the name contains the visible text. */
  label: string;
}

/**
 * Inline Picker — link-styled dropdown inside text or a key-value list
 * ("09/21/2026 | V-2 ▾", in-cell "Select option ▾"). Opens a MenuPanel,
 * SelectMenu or Combobox Panel — point `aria-controls` at it. The accessible
 * name is "{label}: {visible value}". In a form, use `Select`. `ref` and rest
 * props (`disabled`, `aria-controls`, …) land on the button.
 */
export const InlinePicker = forwardRef<HTMLButtonElement, InlinePickerProps>(function InlinePicker(
  { children, secondary, open = false, label, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      {...rest}
      className={cx('scalar-inline-picker', open && 'scalar-inline-picker--open', className)}
    >
      <VisuallyHidden>{label}: </VisuallyHidden>
      <span>{children}</span>
      {secondary && <><span className="scalar-inline-picker__sep" aria-hidden>|</span><span>{secondary}</span></>}
      <Icon size="xs" tone="inherit" className={cx(open && 'scalar-rotate-180')}><ChevronDown /></Icon>
    </button>
  );
});

/* ---------------------------------------------------------------------------
 * Image Crop Field
 * ------------------------------------------------------------------------ */

export interface ImageCropFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Visible label and the group's accessible name ("Firm logo"). */
  label: string;
  /** The uploaded image. Omit to show the placeholder well. */
  src?: string;
  /** Alternative text for the preview. Default: the label. */
  alt?: string;
  /** Scale applied to the preview, 1 = fit. */
  zoom: number;
  onZoomChange: (zoom: number) => void;
  zoomMin?: number;
  zoomMax?: number;
  zoomStep?: number;
  /** Removes the image. Omit to hide the delete button. */
  onRemove?: () => void;
  removeLabel?: string;
  /** `square` for an avatar or mark, `wide` for a wordmark logo. Default `square`. */
  shape?: 'square' | 'wide';
  /** Glyph for the empty well. Default Material `image`. */
  placeholderIcon?: ReactNode;
}

/**
 * Image Crop Field — preview and framing for an uploaded logo or avatar: a
 * framed preview well, a zoom Slider between zoom-out / zoom-in glyphs, and a
 * delete ButtonIcon. Pair it with a Dropzone for the upload itself; zoom and
 * disabled-while-empty are the only behaviour it owns. While empty the controls
 * are disabled and a screen-reader hint says why. `ref` and rest props land on
 * the group.
 */
export const ImageCropField = forwardRef<HTMLDivElement, ImageCropFieldProps>(function ImageCropField(
  {
    label, src, alt, zoom, onZoomChange, zoomMin = 1, zoomMax = 3, zoomStep = 0.1, onRemove, removeLabel = 'Remove image',
    shape = 'square', placeholderIcon, className, ...rest
  },
  ref,
) {
  const hintId = useId();
  return (
    <div ref={ref} role="group" aria-label={label} {...rest} className={cx('scalar-image-crop', `scalar-image-crop--${shape}`, className)}>
      <span className="scalar-image-crop__label" aria-hidden>{label}</span>
      <div className="scalar-image-crop__well">
        {src ? (
          <img src={src} alt={alt ?? label} className="scalar-image-crop__image" style={{ transform: `scale(${zoom})` }} />
        ) : (
          <Icon size="xl" tone="secondary">{placeholderIcon ?? <m.Image />}</Icon>
        )}
      </div>
      {!src && <VisuallyHidden id={hintId}>Upload an image to adjust its zoom.</VisuallyHidden>}
      <div className="scalar-image-crop__controls">
        <Slider
          label={`${label} zoom`}
          min={zoomMin}
          max={zoomMax}
          step={zoomStep}
          value={zoom}
          disabled={!src}
          aria-describedby={describedBy(!src && hintId)}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          minIcon={<Icon size="s" tone="inherit"><ZoomOut /></Icon>}
          maxIcon={<Icon size="s" tone="inherit"><m.ZoomIn /></Icon>}
          className="scalar-image-crop__slider"
        />
        {onRemove && (
          <ButtonIcon variant="tertiary" tone="negative" label={removeLabel} disabled={!src} onClick={onRemove} icon={<Icon size="s" tone="inherit"><Trash /></Icon>} />
        )}
      </div>
    </div>
  );
});
