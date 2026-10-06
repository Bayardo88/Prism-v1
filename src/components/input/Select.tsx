import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ChevronDown } from '../icon/glyphs.js';
import { mergeDescribedBy, useFormField } from './FormFieldContext.js';
import type { FieldState } from './Input.js';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  state?: FieldState;
  children?: ReactNode;
  /** Lands on the `<select>` itself; `className` lands on the wrapper. */
  controlClassName?: string;
}

/**
 * Select — choose one option from a list that is too long to show inline.
 *
 * Built to the same spec as Input (native `<select>`: keyboard and screen
 * reader behaviour come from the browser). Use Select above roughly seven
 * options; below that, Radio shows every choice at once and costs one fewer
 * interaction. Inside a `FormField` it is labelled and described
 * automatically; standalone, pass `aria-label`. `ref` and native props land on
 * the `<select>`; `className` on the wrapper.
 *
 * Note on icons: glyphs from SDS_Main icons default to Text/On Brand (white)
 * and are invisible on a light surface. Every glyph here is re-tinted to
 * Text/Secondary, and Text/Disabled when the control is off. Any component that
 * imports an icon must do the same.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { state, className, controlClassName, disabled, children, id, required, ...rest },
  ref,
) {
  const field = useFormField();
  const resolved = disabled ? 'disabled' : state ?? field?.state ?? 'default';
  return (
    <div className={cx('scalar-field', className)} data-state={resolved}>
      <select
        ref={ref}
        className={cx('scalar-field__control', controlClassName)}
        {...rest}
        id={id ?? field?.id}
        required={required ?? (field?.required || undefined)}
        disabled={resolved === 'disabled'}
        aria-invalid={resolved === 'error' || undefined}
        aria-describedby={mergeDescribedBy(rest['aria-describedby'], field)}
      >
        {children}
      </select>
      <Icon size="s" tone={resolved === 'disabled' ? 'disabled' : 'secondary'}>
        <ChevronDown />
      </Icon>
    </div>
  );
});
