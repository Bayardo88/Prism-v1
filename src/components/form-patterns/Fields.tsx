import {
  forwardRef, useCallback, useEffect, useRef, useState,
  type ClipboardEvent, type HTMLAttributes, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes,
} from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { useFieldIds, describedBy } from '../../utils/useFieldIds.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { Icon } from '../icon/Icon.js';
import { ChevronDown, ChevronUp, Clock, Copy, Check, Eye, Error as ErrorGlyph } from '../icon/glyphs.js';
import { Chip } from '../chip/Chip.js';
import type { FieldState } from '../input/Input.js';

/* ---------------------------------------------------------------------------
 * Floating Label Field
 * ------------------------------------------------------------------------ */

interface FloatingBase {
  label: string;
  /** Helper text under the field. In `state="error"` it is announced (`role="alert"`). */
  helperText?: ReactNode;
  /** `error` turns the outline and helper negative. Say what is wrong and how to fix it. */
  state?: FieldState;
  /** Lands on the outer wrapper, not on the control. */
  className?: string;
}

export type FloatingLabelInputProps = FloatingBase & Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'placeholder' | 'className'>;

/**
 * Floating Label Field (Type=Input) — outlined field whose label rests inside
 * the box when empty and floats onto the top border once focused or filled.
 * The dominant field style in Firm Settings, Account, Daily NAV and every
 * Create/Add modal. Height = Target/Minimum (44).
 *
 * Use `FormField` + `Input` in dense, in-table forms; use this for page-level
 * and modal forms. The float is pure CSS (`:placeholder-shown`), so it works
 * controlled or uncontrolled. `ref` and rest props land on the `<input>`;
 * `className` on the wrapper. A consumer `aria-describedby` is merged with the
 * helper text id. `required` adds a visual asterisk to the label.
 */
export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(function FloatingLabelInput(
  { label, helperText, state = 'default', className, id, disabled, required, 'aria-describedby': describedByProp, ...rest },
  ref,
) {
  const { id: fid, hintId } = useFieldIds(id);
  const hid = helperText ? hintId : undefined;
  return (
    <div className={cx('scalar-floating', `scalar-floating--${state}`, className)}>
      <div className="scalar-floating__box">
        <input
          ref={ref}
          placeholder=" "
          aria-invalid={state === 'error' || undefined}
          className="scalar-floating__control"
          {...rest}
          id={fid}
          required={required}
          disabled={disabled || state === 'disabled'}
          aria-describedby={describedBy(describedByProp, hid)}
        />
        <label htmlFor={fid} className="scalar-floating__label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        {state === 'error' && <Icon size="s" tone="negative" className="scalar-floating__adornment"><ErrorGlyph /></Icon>}
      </div>
      {helperText && <div id={hid} role={state === 'error' ? 'alert' : undefined} className="scalar-floating__helper">{helperText}</div>}
    </div>
  );
});

export type FloatingLabelSelectProps = FloatingBase & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'className'> & { children?: ReactNode };

/**
 * Floating Label Field (Type=Select). The label is always floated, because a
 * native select always shows a value — include an empty first option for
 * "nothing chosen yet". Above ~8 options use `ComboboxPanel` instead.
 * `ref` and rest props land on the `<select>`; `className` on the wrapper.
 */
export const FloatingLabelSelect = forwardRef<HTMLSelectElement, FloatingLabelSelectProps>(function FloatingLabelSelect(
  { label, helperText, state = 'default', className, id, disabled, required, children, 'aria-describedby': describedByProp, ...rest },
  ref,
) {
  const { id: fid, hintId } = useFieldIds(id);
  const hid = helperText ? hintId : undefined;
  return (
    <div className={cx('scalar-floating', 'scalar-floating--select', `scalar-floating--${state}`, className)}>
      <div className="scalar-floating__box">
        <select
          ref={ref}
          aria-invalid={state === 'error' || undefined}
          className="scalar-floating__control"
          {...rest}
          id={fid}
          required={required}
          disabled={disabled || state === 'disabled'}
          aria-describedby={describedBy(describedByProp, hid)}
        >
          {children}
        </select>
        <label htmlFor={fid} className="scalar-floating__label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <Icon size="s" tone="inherit" className="scalar-floating__adornment"><ChevronDown /></Icon>
      </div>
      {helperText && <div id={hid} role={state === 'error' ? 'alert' : undefined} className="scalar-floating__helper">{helperText}</div>}
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Number Field / Time Field
 * ------------------------------------------------------------------------ */

export interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'> {
  /** Controlled value. `''` is an empty field. Omit it (and use `defaultValue`) for uncontrolled use. */
  value?: number | '';
  /** Initial value when uncontrolled. */
  defaultValue?: number | '';
  onChange?: (value: number | '') => void;
  /** Unit adornment (%, x, bps). Mutually exclusive with the stepper; announced as part of the field description. */
  suffix?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  state?: FieldState;
  /** Name for the increment / decrement buttons ("trading days"). */
  unitLabel?: string;
  /**
   * Floating label on the top border, matching a filled FloatingLabelInput.
   * A number field always shows its value slot, so the label is always
   * floated. Wired to the input with `htmlFor`. Without it, give the field an
   * `aria-label` or wrap it in a `FormField`.
   */
  label?: ReactNode;
}

/**
 * Number Field — numeric entry. With `suffix`: a unit adornment (thresholds %,
 * multiples). Without: an up/down stepper for integer counts (window days,
 * SFTP port). Give it `label` for a floating label that sits with
 * FloatingLabelInputs in a page or modal form, or wrap it in a FormField in a
 * dense form (or pass `aria-label`). Controlled (`value`) or uncontrolled
 * (`defaultValue`). `ref` and rest props land on the `<input>`; `className` on
 * the wrapper. The stepper buttons are outside the tab order — ↑/↓ on the
 * input are the keyboard path.
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  {
    value, defaultValue, onChange, suffix, step = 1, min, max, state = 'default', unitLabel = 'value', label, className, disabled, id,
    'aria-describedby': describedByProp, ...rest
  },
  ref,
) {
  const { id: fid } = useFieldIds(id);
  const suffixId = `${fid}-suffix`;
  const [current, setCurrent] = useControllableState<number | ''>(value, defaultValue ?? '', onChange);
  const off = disabled || state === 'disabled';
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const bump = (d: number) => setCurrent(clamp((current === '' ? 0 : current) + d * step));
  return (
    <div className={cx('scalar-number-field', `scalar-number-field--${state}`, label != null && 'scalar-number-field--labelled', className)}>
      {label != null && <label htmlFor={fid} className="scalar-number-field__label">{label}</label>}
      <input
        ref={ref}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        aria-invalid={state === 'error' || undefined}
        className="scalar-number-field__control"
        {...rest}
        id={fid}
        value={current}
        disabled={off}
        aria-describedby={describedBy(describedByProp, suffix != null && suffixId)}
        onChange={(e) => setCurrent(e.target.value === '' ? '' : Number(e.target.value))}
      />
      {suffix != null ? (
        <span id={suffixId} className="scalar-number-field__suffix">{suffix}</span>
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
  /** Floating label, as on `NumberField`. Without it, give the field an `aria-label` or wrap it in a `FormField`. */
  label?: ReactNode;
  /** Replaces the clock glyph. */
  icon?: ReactNode;
}

/**
 * Time Field — time-of-day entry (report send time). Native `type="time"`, so
 * the browser provides the picker and locale formatting. Put the firm time
 * zone in the helper text. Controlled or uncontrolled (native). `ref` and rest
 * props land on the `<input>`; `className` on the wrapper.
 */
export const TimeField = forwardRef<HTMLInputElement, TimeFieldProps>(function TimeField(
  { state = 'default', label, icon, className, disabled, id, ...rest },
  ref,
) {
  const { id: fid } = useFieldIds(id);
  return (
    <div className={cx('scalar-number-field', 'scalar-time-field', `scalar-number-field--${state}`, label != null && 'scalar-number-field--labelled', className)}>
      {label != null && <label htmlFor={fid} className="scalar-number-field__label">{label}</label>}
      <input
        ref={ref}
        type="time"
        step={900}
        aria-invalid={state === 'error' || undefined}
        className="scalar-number-field__control"
        {...rest}
        id={fid}
        disabled={disabled || state === 'disabled'}
      />
      <Icon size="s" tone="inherit" className="scalar-number-field__suffix">{icon ?? <Clock />}</Icon>
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Tag Input
 * ------------------------------------------------------------------------ */

export interface TagInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'prefix' | 'defaultValue'> {
  /** Controlled tags. Omit (and use `defaultValues`) for uncontrolled use. */
  values?: readonly string[];
  defaultValues?: readonly string[];
  onChange?: (values: string[]) => void;
  /** Rejects a value before it becomes a chip. Return an error string to block it. */
  validate?: (value: string) => string | undefined;
  prefix?: ReactNode;
  placeholder?: string;
  /** Accessible name of the group and the entry field ("Associated email domains"). */
  label: string;
  /** Visible hint below the field ("Press Enter to add"). Linked to the entry with `aria-describedby`. */
  helperText?: ReactNode;
  state?: FieldState;
  required?: boolean;
  /** Id of the entry `<input>` (for an external `<label htmlFor>`). */
  id?: string;
  /** Disables the entry and the chips' remove buttons. */
  disabled?: boolean;
}

/**
 * Tag Input — free text that becomes a removable Chip on Enter, comma or paste
 * (email domains, document names to request). Backspace on an empty entry
 * removes the last chip. A rejected value shows its reason as visible text under
 * the field (`role="alert"`), and additions and removals are announced through a
 * live region. `ref` is the entry `<input>`; `className` and rest props land on
 * the bordered group. Controlled (`values`) or uncontrolled (`defaultValues`).
 */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(function TagInput(
  {
    values, defaultValues, onChange, validate, prefix, placeholder, label, helperText, state = 'default', required, id,
    disabled, className, ...rest
  },
  ref,
) {
  const { id: fid, hintId, errorId } = useFieldIds(id);
  const [tags, setTags] = useControllableState<readonly string[]>(
    values, defaultValues ?? [], onChange as ((v: readonly string[]) => void) | undefined,
  );
  const [draft, setDraft] = useState('');
  const [err, setErr] = useState<string>();
  const [announce, setAnnounce] = useState('');
  const entry = useRef<HTMLInputElement>(null);
  const off = disabled || state === 'disabled';

  /** Tries to add one raw value to `list`; returns the new list and the error that blocked it, if any. */
  const add = (raw: string, list: readonly string[]): { list: readonly string[]; error?: string } => {
    const v = raw.trim().replace(/,$/, '').trim();
    if (!v) return { list };
    if (list.includes(v)) return { list, error: `${v} is already added` };
    const e = validate?.(v);
    if (e) return { list, error: e };
    return { list: [...list, v] };
  };
  const commit = () => {
    if (!draft.trim()) { setDraft(''); return; }
    const r = add(draft, tags);
    if (r.error) { setErr(r.error); return; }
    if (r.list !== tags) { setTags(r.list); setAnnounce(`${draft.trim().replace(/,$/, '')} added`); }
    setDraft(''); setErr(undefined);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
    else if (e.key === 'Backspace' && !draft && tags.length) {
      const last = tags[tags.length - 1]!;
      setTags(tags.slice(0, -1));
      setAnnounce(`${last} removed`);
    }
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (!/[,\n\r]/.test(text)) return;
    e.preventDefault();
    let list: readonly string[] = tags;
    let error: string | undefined;
    for (const part of text.split(/[,\n\r]+/)) {
      const r = add(part, list);
      if (r.error) error = r.error; else list = r.list;
    }
    if (list !== tags) setTags(list);
    setErr(error);
    setDraft('');
  };
  const remove = (v: string) => {
    setTags(tags.filter((x) => x !== v));
    setAnnounce(`${v} removed`);
    entry.current?.focus();
  };
  const s = err ? 'error' : state;
  return (
    <>
      <div
        role="group"
        aria-label={label}
        aria-disabled={off || undefined}
        {...rest}
        className={cx('scalar-tag-input', `scalar-tag-input--${s}`, className)}
      >
        {prefix && <span className="scalar-tag-input__prefix">{prefix}</span>}
        {tags.map((v) => (
          <Chip key={v} size="s" onRemove={off ? undefined : () => remove(v)} removeLabel={`Remove ${v}`}>{v}</Chip>
        ))}
        <input
          ref={composeRefs(ref, entry)}
          id={fid}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setErr(undefined); }}
          onKeyDown={onKey}
          onPaste={onPaste}
          onBlur={commit}
          placeholder={tags.length ? undefined : placeholder}
          aria-label={label}
          aria-invalid={s === 'error' || undefined}
          aria-describedby={describedBy(helperText ? hintId : undefined, err ? errorId : undefined)}
          required={required && tags.length === 0}
          disabled={off}
          className="scalar-tag-input__entry"
        />
        <VisuallyHidden role="status" aria-live="polite">{announce}</VisuallyHidden>
      </div>
      {err && <div id={errorId} role="alert" className="scalar-tag-input__error">{err}</div>}
      {helperText && <div id={hintId} className="scalar-tag-input__helper">{helperText}</div>}
    </>
  );
});

/* ---------------------------------------------------------------------------
 * Copy Field
 * ------------------------------------------------------------------------ */

export interface CopyFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: string;
  /** Masks all but the first `revealPrefix` characters, with a reveal toggle. */
  secret?: boolean;
  revealPrefix?: number;
  /** Accessible name ("SCIM endpoint base URL"). */
  label: string;
}

/**
 * Copy Field — a read-only value the user copies into another system (SSO
 * metadata / ACS URLs, SCIM base URL, API tokens). The value is a read-only
 * `<input>` named by `label`; the copy button stays mounted (focus is kept) and
 * the result ("Copied" / "Couldn't copy") is announced through a persistent live
 * region and shown for 2s. Never editable. `ref` is the value `<input>`;
 * `className` and rest props land on the wrapper.
 */
export const CopyField = forwardRef<HTMLInputElement, CopyFieldProps>(function CopyField(
  { value, secret, revealPrefix = 10, label, className, ...rest },
  ref,
) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const display = secret && !shown ? value.slice(0, revealPrefix) + '•'.repeat(Math.max(8, value.length - revealPrefix)) : value;
  const copy = useCallback(async () => {
    let next: 'copied' | 'failed' = 'copied';
    try { await navigator.clipboard.writeText(value); } catch { next = 'failed'; }
    clearTimeout(timer.current);
    setStatus(next);
    timer.current = setTimeout(() => setStatus('idle'), 2000);
  }, [value]);
  const message = status === 'copied' ? 'Copied' : status === 'failed' ? "Couldn't copy" : '';
  return (
    <div {...rest} className={cx('scalar-copy-field', className)}>
      <input ref={ref} type="text" readOnly value={display} aria-label={label} className="scalar-copy-field__value" />
      {secret && (
        <button type="button" className="scalar-copy-field__button" aria-label={`Reveal ${label}`} aria-pressed={shown} onClick={() => setShown(!shown)}>
          <Icon size="s" tone="secondary"><Eye /></Icon>
        </button>
      )}
      {status !== 'idle' && (
        <span aria-hidden="true" className="scalar-copy-field__copied">
          {status === 'copied' && <Icon size="s" tone="positive"><Check /></Icon>}{message}
        </span>
      )}
      <button type="button" className="scalar-copy-field__button" aria-label={`Copy ${label}`} onClick={copy}>
        <Icon size="s" tone="brand"><Copy /></Icon>
      </button>
      <VisuallyHidden role="status" aria-live="polite">{message}</VisuallyHidden>
    </div>
  );
});
