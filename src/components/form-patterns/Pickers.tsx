import {
  useId, useRef, useState, type ChangeEvent, type DragEvent, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type KeyboardEvent,
} from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ArrowDown, Check, ChevronDown, Edit, Error as ErrorGlyph, Search, Trash, Upload, ZoomOut } from '../icon/glyphs.js';
import * as m from '../icon/material.js';
import { CheckboxItem } from '../checkbox/CheckboxItem.js';
import { ButtonIcon } from '../button/ButtonIcon.js';

/* ---------------------------------------------------------------------------
 * Combobox
 * ------------------------------------------------------------------------ */

export interface ComboboxOptionProps {
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
  id?: string;
  className?: string;
}

/** Combobox Option — one result row inside a Combobox Panel. */
export function ComboboxOption({
  children, detail, selected, selection = 'single', active, disabled, onSelect, id, className,
}: ComboboxOptionProps) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={!!selected}
      aria-disabled={disabled || undefined}
      data-active={active || undefined}
      onClick={disabled ? undefined : onSelect}
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
}

export interface ShowMoreRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Show More Row — reveals the next page of a truncated list ("Show 24 more companies"). */
export function ShowMoreRow({ children, onClick, className }: ShowMoreRowProps) {
  return (
    <button type="button" onClick={onClick} className={cx('scalar-show-more', className)}>
      {children}
      <Icon size="s" tone="inherit"><ArrowDown /></Icon>
    </button>
  );
}

export interface ComboboxItem {
  value: string;
  label: string;
  detail?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxPanelProps {
  items: readonly ComboboxItem[];
  /** Selected value(s). An array switches the panel to multi-select. */
  value?: string | readonly string[];
  onSelect: (value: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  /** "Show 24 more companies" — omit when everything is showing. */
  showMore?: { label: ReactNode; onClick: () => void };
  /** Footer create action ("+ Add new company", "+ Save as new version"). */
  footer?: ReactNode;
  /** Accessible name of the list ("Companies"). */
  label: string;
  className?: string;
}

/**
 * Combobox Panel — searchable dropdown: focused search field, filtered
 * options, an optional Show More Row and create action. Use instead of
 * `Select` whenever the list can exceed ~8 items (companies, measurement
 * dates, versions, folders, people). Filtering is the caller's job — pass the
 * already-filtered `items`. ↑/↓ move, Enter selects.
 */
export function ComboboxPanel({
  items, value, onSelect, query, onQueryChange, searchPlaceholder = 'Search', showMore, footer, label, className,
}: ComboboxPanelProps) {
  const base = useId();
  const [active, setActive] = useState(0);
  const multi = Array.isArray(value);
  const isSel = (v: string) => (multi ? (value as readonly string[]).includes(v) : value === v);
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); const it = items[active]; if (it && !it.disabled) onSelect(it.value); }
  };
  return (
    <div className={cx('scalar-combobox-panel', className)}>
      <div className="scalar-combobox-panel__search">
        <Icon size="s" tone="secondary"><Search /></Icon>
        <input
          autoFocus
          role="combobox"
          aria-expanded
          aria-controls={`${base}-list`}
          aria-activedescendant={items[active] ? `${base}-${active}` : undefined}
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
            {it.label}
          </ComboboxOption>
        ))}
        {!items.length && <div className="scalar-combobox-panel__empty">No matches</div>}
      </div>
      {showMore && <ShowMoreRow onClick={showMore.onClick}>{showMore.label}</ShowMoreRow>}
      {footer && <div className="scalar-combobox-panel__footer">{footer}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Select Menu
 * ------------------------------------------------------------------------ */

export interface SelectMenuOptionProps {
  children: ReactNode;
  /** Optional second line explaining the choice ("Visible to every analyst"). */
  description?: ReactNode;
  /** Leading glyph, passed through `Icon`. */
  icon?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  /** Keyboard-highlighted option — the listbox's `aria-activedescendant` target. */
  active?: boolean;
  onSelect?: () => void;
  id?: string;
  className?: string;
}

/**
 * Select Menu Option — one choice in a Select Menu. The selected option
 * carries a trailing check as well as the tint, so selection is never colour
 * alone (R8). A disabled option stays visible and is skipped.
 */
export function SelectMenuOption({
  children, description, icon, selected, disabled, active, onSelect, id, className,
}: SelectMenuOptionProps) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={!!selected}
      aria-disabled={disabled || undefined}
      data-active={active || undefined}
      onClick={disabled ? undefined : onSelect}
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
}

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
  className?: string;
}

/**
 * Select Menu — the open listbox surface of a select: a raised panel of
 * options with a selected check, disabled options and optional descriptions,
 * plus optional search and footer slots.
 *
 * A surface only (same rule as ComboboxPanel): the trigger — a `Selector`,
 * `InlinePicker`, `InCellControl` or `FilterDropdown` — owns open state,
 * positioning and outside-click dismissal. Extra HTML attributes
 * (`id`, `onKeyDown`, `tabIndex`, `aria-activedescendant`) land on the
 * `role="listbox"` element. For a searchable list that can exceed ~8 items,
 * prefer `ComboboxPanel`, which also owns arrow-key movement.
 */
export function SelectMenu({ children, label, search, footer, multiselectable, className, ...rest }: SelectMenuProps) {
  return (
    <div className={cx('scalar-select-menu', className)}>
      {search && <div className="scalar-select-menu__search">{search}</div>}
      <div role="listbox" aria-label={label} aria-multiselectable={multiselectable || undefined} className="scalar-select-menu__list" {...rest}>
        {children}
      </div>
      {footer && <div className="scalar-select-menu__footer">{footer}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Repeatable Row
 * ------------------------------------------------------------------------ */

export interface RepeatableRowProps {
  /** The field(s) of this row: one input, or input → select for a mapping. */
  children: ReactNode;
  onRemove: () => void;
  /** Keep a required list from reaching zero rows. */
  removeDisabled?: boolean;
  removeLabel?: string;
  className?: string;
}

/**
 * Repeatable Row — one row of a list editor (recipients, domains, group →
 * role mappings). Stack rows and end the list with a tertiary
 * "+ Add <thing>" Button.
 */
export function RepeatableRow({ children, onRemove, removeDisabled, removeLabel = 'Remove row', className }: RepeatableRowProps) {
  return (
    <div className={cx('scalar-repeatable-row', className)}>
      <div className="scalar-repeatable-row__fields">{children}</div>
      <ButtonIcon variant="tertiary" tone="negative" label={removeLabel} disabled={removeDisabled} onClick={onRemove} icon={<Icon size="s" tone="inherit"><Trash /></Icon>} />
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Dropzone
 * ------------------------------------------------------------------------ */

export type DropzoneState = 'default' | 'uploading' | 'error';

export interface DropzoneProps {
  onFiles: (files: File[]) => void;
  /** Accepted types, as for `<input accept>` (".csv,.xlsx,.pdf"). */
  accept?: string;
  multiple?: boolean;
  /** Always state accepted types and size: "CSV, XLSX or PDF · 15 MB max". */
  hint: ReactNode;
  state?: DropzoneState;
  /** 0–100 while uploading. */
  progress?: number;
  /** Uploading label or error reason. */
  message?: ReactNode;
  /**
   * Replaces the default prompt ("Drag & drop a file or select a file") in
   * the default state. Pass a render function to keep the browse link:
   * `prompt={(browse) => <>Drop a logo or {browse('choose an image')}</>}`.
   */
  prompt?: ReactNode | ((browse: (label: ReactNode) => ReactNode) => ReactNode);
  className?: string;
}

/**
 * Dropzone — drag & drop or browse. Report templates, documents, logos.
 * Hover is set while a file is dragged over.
 */
export function Dropzone({ onFiles, accept, multiple, hint, state = 'default', progress, message, prompt, className }: DropzoneProps) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const take = (list: FileList | null) => { if (list?.length) onFiles(Array.from(list)); };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); };
  const browse = (label: ReactNode) => (
    <button type="button" className="scalar-dropzone__browse" onClick={() => input.current?.click()}>{label}</button>
  );
  return (
    <div
      className={cx('scalar-dropzone', `scalar-dropzone--${state}`, over && 'scalar-dropzone--over', className)}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <span className="scalar-dropzone__well">
        <Icon size="m" tone={state === 'error' ? 'negative' : 'brand'}>{state === 'error' ? <ErrorGlyph /> : <Upload />}</Icon>
      </span>
      {state === 'default' ? (
        <span className="scalar-dropzone__prompt">
          {prompt === undefined
            ? <>Drag &amp; drop a file or {browse('select a file')}</>
            : typeof prompt === 'function' ? prompt(browse) : prompt}
        </span>
      ) : (
        <span className="scalar-dropzone__prompt" role={state === 'error' ? 'alert' : 'status'}>{message}</span>
      )}
      {state === 'uploading' && (
        <span className="scalar-dropzone__progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <span style={{ width: `${progress ?? 0}%` }} />
        </span>
      )}
      <span className="scalar-dropzone__hint">{hint}</span>
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e: ChangeEvent<HTMLInputElement>) => { take(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Slider
 * ------------------------------------------------------------------------ */

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Accessible name ("Zoom"). */
  label: string;
  minIcon?: ReactNode;
  maxIcon?: ReactNode;
}

/**
 * Slider — a continuous value in a range (logo cropper zoom). Native range
 * input, so ←/→ and Home/End work. Never for financial values — use
 * `NumberField`.
 */
export function Slider({ label, minIcon, maxIcon, className, ...rest }: SliderProps) {
  return (
    <div className={cx('scalar-slider', className)}>
      {minIcon}
      <input type="range" aria-label={label} className="scalar-slider__input" {...rest} />
      {maxIcon}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Inline Edit / Inline Picker
 * ------------------------------------------------------------------------ */

export interface InlineEditProps {
  value: string;
  onCommit: (value: string) => void;
  /** Link-styled prompt shown while empty ("Enter name"). */
  placeholder: string;
  /** Accessible name ("Comp group name"). */
  label: string;
  className?: string;
}

/**
 * Inline Edit — click-to-edit text inside a layout (comp group name, a new
 * security name in a column header). Enter / blur commits, Escape cancels.
 */
export function InlineEdit({ value, onCommit, placeholder, label, className }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  if (editing) {
    return (
      <input
        autoFocus
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); if (draft !== value) onCommit(draft); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        className={cx('scalar-inline-edit', 'scalar-inline-edit--editing', className)}
      />
    );
  }
  return (
    <button
      type="button"
      aria-label={value ? `${label}: ${value}. Edit` : `${label}. ${placeholder}`}
      onClick={() => { setDraft(value); setEditing(true); }}
      className={cx('scalar-inline-edit', !value && 'scalar-inline-edit--placeholder', className)}
    >
      {value || placeholder}
      {value && <Icon size="xs" tone="secondary" className="scalar-inline-edit__pencil"><Edit /></Icon>}
    </button>
  );
}

export interface InlinePickerProps {
  /** Main value ("09/21/2026"). */
  children: ReactNode;
  /** Optional second value after a separator ("V-2"). */
  secondary?: ReactNode;
  open?: boolean;
  onClick?: () => void;
  /** Accessible name ("Previous versions"). */
  label: string;
  className?: string;
}

/**
 * Inline Picker — link-styled dropdown inside text or a key-value list
 * ("09/21/2026 | V-2 ▾", in-cell "Select option ▾"). Opens a MenuPanel or
 * Combobox Panel. In a form, use `Select`.
 */
export function InlinePicker({ children, secondary, open = false, onClick, label, className }: InlinePickerProps) {
  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label={label}
      onClick={onClick}
      className={cx('scalar-inline-picker', open && 'scalar-inline-picker--open', className)}
    >
      <span>{children}</span>
      {secondary && <><span className="scalar-inline-picker__sep" aria-hidden>|</span><span>{secondary}</span></>}
      <Icon size="xs" tone="inherit" className={cx(open && 'scalar-rotate-180')}><ChevronDown /></Icon>
    </button>
  );
}

/* ---------------------------------------------------------------------------
 * Image Crop Field
 * ------------------------------------------------------------------------ */

export interface ImageCropFieldProps {
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
  className?: string;
}

/**
 * Image Crop Field — preview and framing for an uploaded logo or avatar: a
 * framed preview well, a zoom Slider between zoom-out / zoom-in glyphs, and a
 * delete ButtonIcon. Pair it with a Dropzone for the upload itself; zoom and
 * disabled-while-empty are the only behaviour it owns.
 */
export function ImageCropField({
  label, src, alt, zoom, onZoomChange, zoomMin = 1, zoomMax = 3, zoomStep = 0.1, onRemove, removeLabel = 'Remove image',
  shape = 'square', placeholderIcon, className,
}: ImageCropFieldProps) {
  return (
    <div role="group" aria-label={label} className={cx('scalar-image-crop', `scalar-image-crop--${shape}`, className)}>
      <span className="scalar-image-crop__label" aria-hidden>{label}</span>
      <div className="scalar-image-crop__well">
        {src ? (
          <img src={src} alt={alt ?? label} className="scalar-image-crop__image" style={{ transform: `scale(${zoom})` }} />
        ) : (
          <Icon size="xl" tone="secondary">{placeholderIcon ?? <m.Image />}</Icon>
        )}
      </div>
      <div className="scalar-image-crop__controls">
        <Slider
          label={`${label} zoom`}
          min={zoomMin}
          max={zoomMax}
          step={zoomStep}
          value={zoom}
          disabled={!src}
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
}
