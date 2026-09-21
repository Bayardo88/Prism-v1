import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';

export interface CalendarDayProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  day: number | string;
  /** The currently chosen date. */
  selected?: boolean;
  /** Today's date. Drawn as an outline, never as a fill. */
  today?: boolean;
  /** A day belonging to the neighbouring month. */
  outside?: boolean;
}

/**
 * Calendar Day — a single day cell inside Date Picker.
 *
 * Today and Selected are never drawn the same way: a user who opens the picker
 * on a date they already chose has to be able to see both facts. Selected fills
 * Background/Brand; Today is an outline in Stroke/Brand with no fill.
 */
export const CalendarDay = forwardRef<HTMLButtonElement, CalendarDayProps>(function CalendarDay(
  { day, selected, today, outside, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-selected={selected}
      aria-current={today ? 'date' : undefined}
      className={cx(
        'scalar-calendar-day',
        selected && 'scalar-calendar-day--selected',
        today && !selected && 'scalar-calendar-day--today',
        outside && 'scalar-calendar-day--outside',
        className,
      )}
      {...rest}
    >
      {day}
    </button>
  );
});
