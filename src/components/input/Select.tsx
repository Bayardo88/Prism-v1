import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ChevronDown } from '../icon/glyphs.js';
import type { FieldState } from './Input.js';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  state?: FieldState;
  children?: ReactNode;
}

/**
 * Select — choose one option from a list that is too long to show inline.
 *
 * Built to the same spec as Input. Use Select above roughly seven options;
 * below that, Radio shows every choice at once and costs one fewer interaction.
 *
 * Note on icons: glyphs from SDS_Main icons default to Text/On Brand (white)
 * and are invisible on a light surface. Every glyph here is re-tinted to
 * Text/Secondary, and Text/Disabled when the control is off. Any component that
 * imports an icon must do the same.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { state = 'default', className, disabled, children, ...rest },
  ref,
) {
  const resolved = disabled ? 'disabled' : state;
  return (
    <div className={cx('scalar-field', className)} data-state={resolved}>
      <select
        ref={ref}
        className="scalar-field__control"
        disabled={resolved === 'disabled'}
        aria-invalid={resolved === 'error' || undefined}
        {...rest}
      >
        {children}
      </select>
      <Icon size="s" tone={resolved === 'disabled' ? 'disabled' : 'secondary'}>
        <ChevronDown />
      </Icon>
    </div>
  );
});
