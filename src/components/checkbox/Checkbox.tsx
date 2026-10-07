import { forwardRef, type ReactNode } from 'react';
import { cx, describedBy, useFieldIds } from '../../utils/index.js';
import { CheckboxItem, type CheckboxItemProps } from './CheckboxItem.js';

/** A visible label, or an explicit accessible name. */
export type CheckboxName =
  | { children: ReactNode }
  | { children?: ReactNode; 'aria-label': string }
  | { children?: ReactNode; 'aria-labelledby': string };

export type CheckboxProps = Omit<CheckboxItemProps, 'children'> &
  CheckboxName & {
    /** Secondary text under the label; wired to the input as its description. */
    description?: ReactNode;
    /** Lands on the wrapping `<label>`; `ref` and every other native prop land on the `<input>`. */
    className?: string;
  };

/**
 * CheckBox — checkbox with its label.
 *
 * The label is part of the target: clicking it toggles the box. The wrapper
 * also carries the 44px minimum target the drawn box cannot reach on its own.
 * `description` is read as the checkbox's description. Controlled or
 * uncontrolled (native). For an invalid state pass `invalid` and an
 * `aria-describedby` pointing at the error text.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { children, description, className, id, 'aria-describedby': describedByProp, ...rest },
  ref,
) {
  const { id: inputId, hintId, labelId } = useFieldIds(id);
  const named = 'aria-label' in rest || 'aria-labelledby' in rest;
  return (
    <label className={cx('scalar-choice-field', className)}>
      <CheckboxItem
        ref={ref}
        id={inputId}
        aria-describedby={describedBy(describedByProp, description ? hintId : undefined)}
        aria-labelledby={description && children && !named ? labelId : undefined}
        {...rest}
      />
      {(children || description) && (
        <span>
          {description ? <span id={labelId}>{children}</span> : children}
          {description && <span id={hintId} className="scalar-choice-field__description">{description}</span>}
        </span>
      )}
    </label>
  );
});
