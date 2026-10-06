import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx, describedBy, useFieldIds } from '../../utils/index.js';
import type { ChoiceSize } from '../checkbox/CheckboxItem.js';

export interface SwitchBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'role'> {
  /** M is 40×24, S is 28×16. */
  size?: ChoiceSize;
  /** Draws `aria-invalid` for parity with Checkbox. Point `aria-describedby` at the error text. */
  invalid?: boolean;
  /** Secondary text under the label; wired to the switch as its description. */
  description?: ReactNode;
  /** Lands on the wrapping `<label>`; `ref` and every other native prop land on the `<input>`. */
  className?: string;
}

/**
 * Needs a visible label (`children`) or an `aria-label` / `aria-labelledby`.
 * Not enforced in the type yet: `Overlays.tsx` renders a Switch whose label is
 * attached outside the component.
 */
export type SwitchProps = Omit<SwitchBaseProps, 'children'> & { children?: ReactNode };

/**
 * Switch — turns a setting on or off, taking effect immediately.
 *
 * Use a switch only when the change applies at once. If the setting needs a
 * Save, use a Checkbox: a switch that does not take effect until submitted lies
 * about what it did. Label what the switch controls — never repeat its on/off
 * state.
 *
 * A native `<input type="checkbox" role="switch">`: Space toggles, and the
 * checked state is exposed as the switch's on/off value (no `aria-checked`
 * needed, and none that could drift). Controlled (`checked` + `onChange`) or
 * uncontrolled (`defaultChecked`).
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { size = 'm', invalid, description, children, className, id, 'aria-describedby': describedByProp, ...rest },
  ref,
) {
  const { id: inputId, hintId, labelId } = useFieldIds(id);
  const named = 'aria-label' in rest || 'aria-labelledby' in rest;
  return (
    <label className={cx('scalar-switch-field', className)}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className="scalar-choice-input"
        id={inputId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(describedByProp, description ? hintId : undefined)}
        aria-labelledby={description && children && !named ? labelId : undefined}
        {...rest}
      />
      <span className={cx('scalar-switch', `scalar-switch--${size}`)} aria-hidden>
        <span className="scalar-switch__knob" />
      </span>
      {(children || description) && (
        <span>
          {description ? <span id={labelId}>{children}</span> : children}
          {description && <span id={hintId} className="scalar-choice-field__description">{description}</span>}
        </span>
      )}
    </label>
  );
});
