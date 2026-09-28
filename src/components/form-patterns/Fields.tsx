import {
  forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type KeyboardEvent,
} from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ChevronDown, ChevronUp, Clock, Copy, Check, Eye, Error as ErrorGlyph } from '../icon/glyphs.js';
import { Chip } from '../chip/Chip.js';
import type { FieldState } from '../input/Input.js';

/* ---------------------------------------------------------------------------
 * Floating Label Field
 * ------------------------------------------------------------------------ */

interface FloatingBase {
  label: string;
  helperText?: ReactNode;
  /** `error` turns the outline and helper negative. Say what is wrong and how to fix it. */
  state?: FieldState;
  className?: string;
}

export type FloatingLabelInputProps = FloatingBase & Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'placeholder'>;

/**
 * Floating Label Field (Type=Input) — outlined field whose label rests inside
 * the box when empty and floats onto the top border once focused or filled.
 * The dominant field style in Firm Settings, Account, Daily NAV and every
 * Create/Add modal. Height = Target/Minimum (44).
 *
 * Use `FormField` + `Input` in dense, in-table forms; use this for page-level
 * and modal forms. The float is pure CSS (`:placeholder-shown`), so it works
 * controlled or uncontrolled.
 */
export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(function FloatingLabelInput(
  { label, helperText, state = 'default', className, id, disabled, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  const hid = helperText ? `${fid}-helper` : undefined;
  return (
    <div className={cx('scalar-floating', `scalar-floating--${state}`, className)}>
      <div className="scalar-floating__box">
        <input
          ref={ref}
          id={fid}
          placeholder=" "
          disabled={disabled || state === 'disabled'}
          aria-invalid={state === 'error' || undefined}
          aria-describedby={hid}
          className="scalar-floating__control"
          {...rest}
        />
        <label htmlFor={fid} className="scalar-floating__label">{label}</label>
        {state === 'error' && <Icon size="s" tone="negative" className="scalar-floating__adornment"><ErrorGlyph /></Icon>}
      </div>
      {helperText && <div id={hid} className="scalar-floating__helper">{helperText}</div>}
    </div>
  );
});

export type FloatingLabelSelectProps = FloatingBase & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & { children?: ReactNode };

/**
 * Floating Label Field (Type=Select). The label is always floated, because a
 * native select always shows a value — include an empty first option for
 * "nothing chosen yet". Above ~8 options use `ComboboxPanel` instead.
 */
export const FloatingLabelSelect = forwardRef<HTMLSelectElement, FloatingLabelSelectProps>(function FloatingLabelSelect(
  { label, helperText, state = 'default', className, id, disabled, children, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  const hid = helperText ? `${fid}-helper` : undefined;
  return (
    <div className={cx('scalar-floating', 'scalar-floating--select', `scalar-floating--${state}`, className)}>
      <div className="scalar-floating__box">
        <select
          ref={ref}
          id={fid}
          disabled={disabled || state === 'disabled'}
          aria-invalid={state === 'error' || undefined}
          aria-describedby={hid}
          className="scalar-floating__control"
          {...rest}
        >
          {children}
        </select>
        <label htmlFor={fid} className="scalar-floating__label">{label}</label>
        <Icon size="s" tone="inherit" className="scalar-floating__adornment"><ChevronDown /></Icon>
      </div>
      {helperText && <div id={hid} className="scalar-floating__helper">{helperText}</div>}
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Number Field / Time Field
 * ------------------------------------------------------------------------ */

export interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value' | 'onChange'> {
  value?: number | '';
  onChange?: (value: number | '') => void;
  /** Unit adornment (%, x, bps). Mutually exclusive with the stepper. */
  suffix?: ReactNode;
  step?: number;
  state?: FieldState;
  /** Name for the increment / decrement buttons ("trading days"). */
  unitLabel?: string;
  /**
   * Floating label on the top border, matching a filled FloatingLabelInput.
   * A number field always shows its value slot, so the label is always
   * floated. Wired to the input with `htmlFor`.
   */
  label?: ReactNode;
}

/**
 * Number Field — numeric entry. With `suffix`: a unit adornment (thresholds %,
 * multiples). Without: an up/down stepper for integer counts (window days,
 * SFTP port). Give it `label` for a floating label that sits with
 * FloatingLabelInputs in a page or modal form, or wrap it in a FormField in a
 * dense form.
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  { value, onChange, suffix, step = 1, min, max, state = 'default', unitLabel = 'value', label, className, disabled, id, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  const off = disabled || state === 'disabled';
  const clamp = (n: number) => Math.min(max != null ? +max : Infinity, Math.max(min != null ? +min : -Infinity, n));
  const bump = (d: number) => onChange?.(clamp((value === '' || value == null ? 0 : value) + d * step));
  return (
    <div className={cx('scalar-number-field', `scalar-number-field--${state}`, label != null && 'scalar-number-field--labelled', className)}>
      {label != null && <label htmlFor={fid} className="scalar-number-field__label">{label}</label>}
      <input
        ref={ref}
        id={fid}
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={off}
        aria-invalid={state === 'error' || undefined}
        onChange={(e) => onChange?.(e.target.value === '' ? '' : Number(e.target.value))}
        className="scalar-number-field__control"
        {...rest}
      />
      {suffix != null ? (
        <span className="scalar-number-field__suffix">{suffix}</span>
      ) : (
        <span className="scalar-number-field__stepper">
          <button type="button" tabIndex={-1} disabled={off} aria-label={`Increase ${unitLabel}`} onClick={() => bump(1)}>
            <Icon size="xs" tone="inherit"><ChevronUp /></Icon>
          </button>
          <button type="button" tabIndex={-1} disabled={off} aria-label={`Decrease ${unitLabel}`} onClick={() => bump(-1)}>
            <Icon size="xs" tone="inherit"><ChevronDown /></Icon>
          </button>
        </span>
      )}
    </div>
  );
});

export interface TimeFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  state?: FieldState;
}

/**
 * Time Field — time-of-day entry (report send time). Native `type="time"`, so
 * the browser provides the picker and locale formatting. Put the firm time
 * zone in the helper text.
 */
export const TimeField = forwardRef<HTMLInputElement, TimeFieldProps>(function TimeField(
  { state = 'default', className, disabled, ...rest },
  ref,
) {
  return (
    <div className={cx('scalar-number-field', 'scalar-time-field', `scalar-number-field--${state}`, className)}>
      <input ref={ref} type="time" step={900} disabled={disabled || state === 'disabled'} className="scalar-number-field__control" {...rest} />
      <Icon size="s" tone="inherit" className="scalar-number-field__suffix"><Clock /></Icon>
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Tag Input
 * ------------------------------------------------------------------------ */

export interface TagInputProps {
  values: readonly string[];
  onChange: (values: string[]) => void;
  /** Rejects a value before it becomes a chip. Return an error string to block it. */
  validate?: (value: string) => string | undefined;
  prefix?: ReactNode;
  placeholder?: string;
  /** Accessible name of the entry field ("Associated email domains"). */
  label: string;
  state?: FieldState;
  className?: string;
}

/**
 * Tag Input — free text that becomes a removable Chip on Enter or comma
 * (email domains, document names to request). Backspace on an empty entry
 * removes the last chip. Helper text should say "Press Enter to add".
 */
export function TagInput({ values, onChange, validate, prefix, placeholder, label, state = 'default', className }: TagInputProps) {
  const [draft, setDraft] = useState('');
  const [err, setErr] = useState<string>();
  const commit = () => {
    const v = draft.trim().replace(/,$/, '');
    if (!v || values.includes(v)) { setDraft(''); return; }
    const e = validate?.(v);
    if (e) { setErr(e); return; }
    onChange([...values, v]); setDraft(''); setErr(undefined);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
    else if (e.key === 'Backspace' && !draft && values.length) onChange(values.slice(0, -1));
  };
  const s = err ? 'error' : state;
  return (
    <div className={cx('scalar-tag-input', `scalar-tag-input--${s}`, className)}>
      {prefix && <span className="scalar-tag-input__prefix">{prefix}</span>}
      {values.map((v) => (
        <Chip key={v} size="s" onRemove={() => onChange(values.filter((x) => x !== v))} removeLabel={`Remove ${v}`}>{v}</Chip>
      ))}
      <input
        value={draft}
        onChange={(e) => { setDraft(e.target.value); setErr(undefined); }}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={values.length ? undefined : placeholder}
        aria-label={label}
        aria-invalid={s === 'error' || undefined}
        title={err}
        disabled={state === 'disabled'}
        className="scalar-tag-input__entry"
      />
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Copy Field
 * ------------------------------------------------------------------------ */

export interface CopyFieldProps {
  value: string;
  /** Masks all but the first `revealPrefix` characters, with a reveal toggle. */
  secret?: boolean;
  revealPrefix?: number;
  /** Accessible name ("SCIM endpoint base URL"). */
  label: string;
  className?: string;
}

/**
 * Copy Field — a read-only value the user copies into another system (SSO
 * metadata / ACS URLs, SCIM base URL, API tokens). Shows "Copied" for 2s.
 * Never editable.
 */
export function CopyField({ value, secret, revealPrefix = 10, label, className }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(false);
  const display = secret && !shown ? value.slice(0, revealPrefix) + '•'.repeat(Math.max(8, value.length - revealPrefix)) : value;
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };
  return (
    <div className={cx('scalar-copy-field', className)}>
      <span className="scalar-copy-field__value" aria-label={label}>{display}</span>
      {secret && (
        <button type="button" className="scalar-copy-field__button" aria-label={shown ? `Hide ${label}` : `Reveal ${label}`} aria-pressed={shown} onClick={() => setShown(!shown)}>
          <Icon size="s" tone="secondary"><Eye /></Icon>
        </button>
      )}
      {copied ? (
        <span className="scalar-copy-field__copied" role="status">
          <Icon size="s" tone="positive"><Check /></Icon>Copied
        </span>
      ) : (
        <button type="button" className="scalar-copy-field__button" aria-label={`Copy ${label}`} onClick={copy}>
          <Icon size="s" tone="brand"><Copy /></Icon>
        </button>
      )}
    </div>
  );
}
