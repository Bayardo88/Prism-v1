import {
  createContext, forwardRef, useContext, type ChangeEvent, type HTMLAttributes, type InputHTMLAttributes, type ReactNode,
} from 'react';
import { cx, describedBy, useControllableState, useFieldIds } from '../../utils/index.js';
import type { ChoiceSize } from '../checkbox/CheckboxItem.js';
import { Typography } from '../typography/Typography.js';

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  size?: ChoiceSize;
  invalid?: boolean;
  disabled?: boolean;
}
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Shared `name` of the radios. Generated when omitted. */
  name?: string;
  /** Selected value (controlled). */
  value?: string;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Visible group label (the question). Without it, pass `aria-label`/`aria-labelledby`. */
  label?: ReactNode;
  /** Helper text under the group; read as its description. */
  hint?: ReactNode;
  /** Error text; sets `aria-invalid` on the group and draws each radio's error edge. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  size?: ChoiceSize;
  children?: ReactNode;
}

/**
 * RadioGroup — a labelled set of mutually exclusive `Radio`s.
 *
 * Renders `role="radiogroup"` named by `label`, with `hint` / `error` as its
 * description, a shared `name`, and controlled (`value`) or uncontrolled
 * (`defaultValue`) selection. Arrow keys move and select between radios and Tab
 * enters/leaves the group — that is native radio behaviour, since every radio
 * shares one `name`.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    name, value, defaultValue, onValueChange, label, hint, error, required, disabled, size,
    className, children, id, ...rest
  },
  ref,
) {
  const { id: groupId, labelId, hintId, errorId } = useFieldIds(id);
  const [current, setCurrent] = useControllableState<string | undefined>(value, defaultValue, onValueChange as ((v: string | undefined) => void) | undefined);
  const ctx: RadioGroupContextValue = {
    name: name ?? groupId,
    value: current,
    onChange: (next) => setCurrent(next),
    size,
    invalid: Boolean(error),
    disabled,
  };
  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        ref={ref}
        id={groupId}
        role="radiogroup"
        className={cx('scalar-radio-group', className)}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy(!!hint && !error && hintId, !!error && errorId)}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {label && (
          <Typography id={labelId} variant="label" step="l" weight="semiBold" as="span">
            {label}
          </Typography>
        )}
        {children}
        {hint && !error && <Typography id={hintId} variant="heading" step="s" tone="tertiary">{hint}</Typography>}
        {error && <Typography id={errorId} variant="heading" step="s" tone="negative" role="alert">{error}</Typography>}
      </div>
    </RadioGroupContext.Provider>
  );
});

export interface RadioBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: ChoiceSize;
  /** Draws the error edge. `radio` has no `aria-invalid`; put the error on `RadioGroup` (`error`), which exposes it. */
  invalid?: boolean;
  /** Lands on the wrapping `<label>`; `ref` and every other native prop land on the `<input>`. */
  className?: string;
}

/** A visible label, or an explicit accessible name. */
export type RadioProps = Omit<RadioBaseProps, 'children'> &
  (
    | { children: ReactNode }
    | { children?: ReactNode; 'aria-label': string }
    | { children?: ReactNode; 'aria-labelledby': string }
  );

/**
 * Radio — one choice from a set of mutually exclusive options.
 *
 * Radios are never used alone: a single radio that cannot be unselected is a
 * checkbox. Always two or more, always with one preselected unless the question
 * genuinely has no default. Wrap them in `RadioGroup` for the group name,
 * shared `name`, selection state and error; the keyboard model (arrows move
 * and select, Tab enters once) is the native one for same-`name` radios.
 *
 * Mirrors the Checkbox variant model minus Indeterminate, which has no meaning
 * for an exclusive choice.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { size, invalid, children, className, name, value, checked, onChange, disabled, ...rest },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const grouped = group && value !== undefined;
  return (
    <label className={cx('scalar-choice-field', className)}>
      <input
        ref={ref}
        type="radio"
        className="scalar-choice-input"
        data-tone={invalid || group?.invalid ? 'negative' : undefined}
        name={name ?? group?.name}
        value={value}
        disabled={disabled ?? group?.disabled}
        {...(grouped
          ? {
              checked: checked ?? group.value === String(value),
              onChange: (event: ChangeEvent<HTMLInputElement>) => {
                onChange?.(event);
                group.onChange(String(value));
              },
            }
          : { checked, onChange })}
        {...rest}
      />
      <span className={cx('scalar-choice', 'scalar-radio-box', `scalar-choice--${size ?? group?.size ?? 'm'}`)} aria-hidden>
        <span className="scalar-radio-box__dot" />
      </span>
      {children && <span>{children}</span>}
    </label>
  );
});
