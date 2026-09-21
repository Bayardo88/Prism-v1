import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import type { ChoiceSize } from '../checkbox/CheckboxItem.js';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** M is 40×24, S is 28×16. */
  size?: ChoiceSize;
  /** Label what the switch controls — never repeat its on/off state. */
  children?: ReactNode;
}

/**
 * Switch — turns a setting on or off, taking effect immediately.
 *
 * Use a switch only when the change applies at once. If the setting needs a
 * Save, use a Checkbox: a switch that does not take effect until submitted lies
 * about what it did.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { size = 'm', children, className, ...rest },
  ref,
) {
  return (
    <label className={cx('scalar-switch-field', className)}>
      <input ref={ref} type="checkbox" role="switch" className="scalar-choice-input" {...rest} />
      <span className={cx('scalar-switch', `scalar-switch--${size}`)} aria-hidden>
        <span className="scalar-switch__knob" />
      </span>
      {children && <span>{children}</span>}
    </label>
  );
});
