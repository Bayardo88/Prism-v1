import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

export interface TabItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode;
  /** Exactly one tab is active at all times. */
  active?: boolean;
}

/**
 * Tab Item — one tab in a Tabs bar.
 *
 * Keep labels to one or two words and never let them wrap.
 *
 * Accessibility: the drawn control is under 44px, so the target is carried by
 * padding rather than the label box.
 */
export const TabItem = forwardRef<HTMLButtonElement, TabItemProps>(function TabItem(
  { children, active, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      className={cx('scalar-tab-item', className)}
      {...rest}
    >
      {children}
    </button>
  );
});

export interface TabsProps {
  children?: ReactNode;
  /** Names the tab set for assistive technology. */
  label?: string;
  className?: string;
}

/**
 * Tabs — switches the view below between sibling sections of the same object.
 *
 * Use tabs only for peer views of one thing — a company's Overview, Cap table,
 * Waterfall. Not for steps in a process; that is Stepper. Not to page through
 * records; that is Pagination.
 *
 * If the set does not fit, the information architecture is wrong — nest it
 * rather than scrolling the bar.
 */
export function Tabs({ children, label, className }: TabsProps) {
  return (
    <div role="tablist" aria-label={label} className={cx('scalar-tabs', className)}>
      {children}
    </div>
  );
}
