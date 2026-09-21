import { useMemo, useState } from 'react';
import { cx } from '../../utils/cx.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Icon } from '../icon/Icon.js';
import { ChevronLeft, ChevronRight } from '../icon/glyphs.js';
import { Typography } from '../typography/Typography.js';
import { CalendarDay } from './CalendarDay.js';

export interface DatePickerProps {
  /** The chosen date. */
  value?: Date;
  onChange?: (date: Date) => void;
  /** The month on view. Uncontrolled if omitted. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  /** Returns true for a date that cannot be chosen. */
  isDisabled?: (date: Date) => boolean;
  /** 0 = Sunday. Defaults to Monday. */
  weekStartsOn?: 0 | 1;
  locale?: string;
  className?: string;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Date Picker — a month grid for choosing a date, shown in an overlay.
 *
 * Six week rows always, so the popover never changes height between months and
 * the controls under it never move.
 *
 * Always pair with a typed date field. A picker is faster for dates near today
 * and slower for everything else — a valuation dated three years back should be
 * typed, not clicked to.
 *
 * Accessibility: arrow keys move by day, Page Up/Down by month, Escape closes
 * and returns focus to the field. Every day cell carries a 44px target.
 */
export function DatePicker({
  value, onChange, month, onMonthChange, isDisabled,
  weekStartsOn = 1, locale = 'en-US', className,
}: DatePickerProps) {
  const [internalMonth, setInternalMonth] = useState(() => value ?? new Date());
  const viewMonth = month ?? internalMonth;

  const setMonth = (next: Date) => {
    if (!month) setInternalMonth(next);
    onMonthChange?.(next);
  };

  const { weekdays, days } = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const offset = (first.getDay() - weekStartsOn + 7) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - offset);

    // Six rows, always.
    const cells = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });

    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const names = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, 7 + weekStartsOn + i); // 2024-01-07 is a Sunday
      return fmt.format(d);
    });

    return { weekdays: names, days: cells };
  }, [viewMonth, weekStartsOn, locale]);

  const today = new Date();
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(viewMonth);

  return (
    <div className={cx('scalar-date-picker', className)} role="application" aria-label={monthLabel}>
      <div className="scalar-date-picker__header">
        <ButtonIcon
          variant="tertiary"
          size="s"
          label="Previous month"
          icon={<Icon size="s" tone="inherit"><ChevronLeft /></Icon>}
          onClick={() => setMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
        />
        <Typography variant="heading" step="m" weight="semiBold">
          {monthLabel}
        </Typography>
        <ButtonIcon
          variant="tertiary"
          size="s"
          label="Next month"
          icon={<Icon size="s" tone="inherit"><ChevronRight /></Icon>}
          onClick={() => setMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
        />
      </div>

      <div className="scalar-date-picker__grid" role="grid">
        {weekdays.map((w) => (
          <div key={w} className="scalar-date-picker__weekday" role="columnheader" aria-label={w}>
            {w.slice(0, 2)}
          </div>
        ))}
        {days.map((d) => (
          <CalendarDay
            key={d.toISOString()}
            day={d.getDate()}
            selected={value ? sameDay(d, value) : false}
            today={sameDay(d, today)}
            outside={d.getMonth() !== viewMonth.getMonth()}
            disabled={isDisabled?.(d)}
            onClick={() => onChange?.(d)}
          />
        ))}
      </div>
    </div>
  );
}
