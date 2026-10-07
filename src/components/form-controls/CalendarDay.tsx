import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/index.js';

export interface CalendarDayProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** The visible day number. */
  day: number | string;
  /**
   * The full date this cell stands for. Gives the button an accessible name such
   * as "Monday, March 5, 2026" (plus "today") instead of a bare "5", and a
   * `data-date` hook. Without it, supply your own `aria-label`.
   */
  date?: Date;
  /** Locale for the spoken date. Default `en-US`. */
  locale?: string;
  /** Spoken suffix for today's cell. Default "today" — override to localise. */
  todayLabel?: string;
  /** The currently chosen date. */
  selected?: boolean;
  /** Today's date. Drawn as an outline, never as a fill. */
  today?: boolean;
  /** A day belonging to the neighbouring month. */
  outside?: boolean;
  /**
   * Wrap the button in a `role="gridcell"` that carries `aria-selected` (and
   * `aria-disabled`). Set by `DatePicker`; leave off when using the day on its
   * own, where the button exposes `aria-pressed` instead.
   */
  cell?: boolean;
  /** Extra content after the number, e.g. an event marker. Decorative unless labelled. */
  children?: ReactNode;
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function fullDate(date: Date, locale: string): string {
  let fmt = formatters.get(locale);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    formatters.set(locale, fmt);
  }
  return fmt.format(date);
}

const pad = (n: number) => String(n).padStart(2, '0');
/** `YYYY-MM-DD` in local time — the value of the `data-date` hook. */
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Calendar Day — a single day cell inside Date Picker.
 *
 * Today and Selected are never drawn the same way: a user who opens the picker
 * on a date they already chose has to be able to see both facts. Selected fills
 * Background/Brand; Today is an outline in Stroke/Brand with no fill.
 *
 * Accessibility: the accessible name is the full date (from `date`), with
 * "today" appended; selection is `aria-selected` on the gridcell when `cell` is
 * set, otherwise `aria-pressed` on the button. Roving tab stops are managed by
 * `DatePicker` through `tabIndex`.
 */
export const CalendarDay = forwardRef<HTMLButtonElement, CalendarDayProps>(function CalendarDay(
  {
    day, date, locale = 'en-US', todayLabel = 'today', selected, today, outside, cell = false,
    className, type = 'button', children, 'aria-label': ariaLabel, 'aria-disabled': ariaDisabled, ...rest
  },
  ref,
) {
  const label = ariaLabel ?? (date ? `${fullDate(date, locale)}${today ? `, ${todayLabel}` : ''}` : undefined);
  const disabled = Boolean(rest.disabled) || ariaDisabled === true || ariaDisabled === 'true';
  const button = (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      aria-pressed={cell ? undefined : selected}
      aria-current={today ? 'date' : undefined}
      aria-disabled={cell ? undefined : ariaDisabled}
      data-date={date ? dateKey(date) : undefined}
      className={cx(
        'scalar-calendar-day',
        selected && 'scalar-calendar-day--selected',
        today && !selected && 'scalar-calendar-day--today',
        outside && 'scalar-calendar-day--outside',
        disabled && 'scalar-calendar-day--disabled',
        className,
      )}
      {...rest}
    >
      {day}
      {children}
    </button>
  );
  if (!cell) return button;
  return (
    <div role="gridcell" className="scalar-calendar-cell" aria-selected={selected ?? false} aria-disabled={disabled || undefined}>
      {button}
    </div>
  );
});
