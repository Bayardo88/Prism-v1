import { forwardRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { CheckboxItem, type CheckboxItemProps } from './CheckboxItem.js';

export interface CheckboxProps extends CheckboxItemProps {
  children?: ReactNode;
  className?: string;
}

/**
 * CheckBox — checkbox with its label.
 *
 * The label is part of the target: clicking it toggles the box. The wrapper
 * also carries the 44px minimum target the drawn box cannot reach on its own.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { children, className, ...rest },
  ref,
) {
  return (
    <label className={cx('scalar-choice-field', className)}>
      <CheckboxItem ref={ref} {...rest} />
      {children && <span>{children}</span>}
    </label>
  );
});
