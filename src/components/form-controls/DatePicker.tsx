import { forwardRef, useEffect, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent } from 'react';
import { composeRefs, cx, useControllableState, useFieldIds, useLatestRef } from '../../utils/index.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Icon } from '../icon/Icon.js';
import { ChevronLeft, ChevronRight } from '../icon/glyphs.js';
import { Typography } from '../typography/Typography.js';
import { CalendarDay, dateKey } from './CalendarDay.js';

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The chosen date (controlled). */
  value?: Date;
  /** The initially chosen date (uncontrolled). */
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  /** The month on view. Uncontrolled if omitted. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  /** Returns true for a date that cannot be chosen. Disabled days stay focusable (`aria-disabled`) but cannot be picked. */
  isDisabled?: (date: Date) => boolean;
  /** 0 = Sunday. Defaults to Monday. */
  weekStartsOn?: 0 | 1;
  locale?: string;
  /**
   * "Today" for the highlight and the initial month. Pass it from the server or
   * a test to avoid a hydration mismatch around midnight; defaults to `new Date()`.
   */
  today?: Date;
  /** Called when Escape is pressed inside the picker. The host owns open state: close the overlay and return focus to the field here. */
  onEscape?: () => void;
  /**
   * Move focus to the selected (or today's) day on mount. Off by default so a
   * picker rendered inline or in a gallery never steals focus; turn it on when
   * the picker opens in an overlay.
   */
  autoFocus?: boolean;
  className?: string;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Adds months, clamping the day (31 Jan + 1 month = 28/29 Feb). */
function addMonths(d: Date, n: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last));
}

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
 * Accessibility (WAI-ARIA date-picker grid): `role="grid"` > `row` > `gridcell`
 * > `button`, named by the month heading, which is a polite live region so
 * month changes are announced. Each day's name is its full date. The grid is a
 * single tab stop (roving tabindex); inside it: Left/Right move a day,
 * Up/Down a week, Home/End to the start/end of the week, Page Up/Down a month,
 * Shift+Page Up/Down a year, Enter/Space choose. Escape calls `onEscape`.
 * Controlled (`value`) or uncontrolled (`defaultValue`).
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  {
    value, defaultValue, onChange, month, onMonthChange, isDisabled, weekStartsOn = 1, locale = 'en-US',
    today: todayProp, onEscape, autoFocus = false, className, id, ...rest
  },
  ref,
) {
  const { id: baseId } = useFieldIds(id);
  const rootRef = useRef<HTMLDivElement>(null);
  const setRefs = useMemo(() => composeRefs<HTMLDivElement>(rootRef, ref), [ref]);

  const [today] = useState(() => todayProp ?? new Date());
  const todayDate = todayProp ?? today;
  const [selected, setSelected] = useControllableState<Date | undefined>(
    value, defaultValue, onChange as ((d: Date | undefined) => void) | undefined,
  );
  const [internalMonth, setInternalMonth] = useState(() => selected ?? todayDate);
  const viewMonth = month ?? internalMonth;
  const [focused, setFocused] = useState<Date>(() => selected ?? todayDate);
  const pendingFocus = useRef(autoFocus);

  const setMonth = (next: Date) => {
    if (!month) setInternalMonth(next);
    onMonthChange?.(next);
  };

  const { weekdays, weekdayNames, weeks } = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const offset = (first.getDay() - weekStartsOn + 7) % 7;
    const start = addDays(first, -offset);
    // Six rows, always.
    const rows = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)));
    const short = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const long = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    const base = (i: number) => new Date(2024, 0, 7 + weekStartsOn + i); // 2024-01-07 is a Sunday
    return {
      weekdays: Array.from({ length: 7 }, (_, i) => short.format(base(i))),
      weekdayNames: Array.from({ length: 7 }, (_, i) => long.format(base(i))),
      weeks: rows,
    };
  }, [viewMonth, weekStartsOn, locale]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(viewMonth),
    [viewMonth, locale],
  );

  // Exactly one day is a tab stop: the focused date if it is on view, else the 1st of the viewed month.
  const flat = weeks.flat();
  const tabDate = flat.find((d) => sameDay(d, focused)) ?? new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);

  // Escape from anywhere inside (day, month buttons): the host owns open state.
  const onEscapeRef = useLatestRef(onEscape);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const handler = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) onEscapeRef.current?.();
    };
    root.addEventListener('keydown', handler);
    return () => root.removeEventListener('keydown', handler);
  }, [onEscapeRef]);

  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    rootRef.current?.querySelector<HTMLElement>(`[data-date="${dateKey(focused)}"]`)?.focus();
  }, [focused, viewMonth]);

  const moveTo = (target: Date) => {
    setFocused(target);
    if (target.getMonth() !== viewMonth.getMonth() || target.getFullYear() !== viewMonth.getFullYear()) {
      setMonth(new Date(target.getFullYear(), target.getMonth(), 1));
    }
    pendingFocus.current = true;
  };

  const pick = (date: Date) => {
    if (isDisabled?.(date)) return;
    setFocused(date);
    setSelected(date);
    if (date.getMonth() !== viewMonth.getMonth() || date.getFullYear() !== viewMonth.getFullYear()) {
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const column = (focused.getDay() - weekStartsOn + 7) % 7;
    let next: Date | undefined;
    switch (event.key) {
      case 'ArrowLeft': next = addDays(focused, -1); break;
      case 'ArrowRight': next = addDays(focused, 1); break;
      case 'ArrowUp': next = addDays(focused, -7); break;
      case 'ArrowDown': next = addDays(focused, 7); break;
      case 'Home': next = addDays(focused, -column); break;
      case 'End': next = addDays(focused, 6 - column); break;
      case 'PageUp': next = addMonths(focused, event.shiftKey ? -12 : -1); break;
      case 'PageDown': next = addMonths(focused, event.shiftKey ? 12 : 1); break;
      default: return;
    }
    event.preventDefault();
    moveTo(next);
  };

  const step = (delta: number) => {
    const next = addMonths(viewMonth, delta);
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    setFocused(addMonths(focused, delta));
  };

  return (
    <div
      ref={setRefs}
      id={id}
      role="group"
      aria-label={monthLabel}
      className={cx('scalar-date-picker', className)}
      {...rest}
    >
      <div className="scalar-date-picker__header">
        <ButtonIcon
          variant="tertiary"
          size="s"
          label="Previous month"
          icon={<Icon size="s" tone="inherit"><ChevronLeft /></Icon>}
          onClick={() => step(-1)}
        />
        <Typography variant="heading" step="m" weight="semiBold" id={`${baseId}-month`} aria-live="polite" aria-atomic="true">
          {monthLabel}
        </Typography>
        <ButtonIcon
          variant="tertiary"
          size="s"
          label="Next month"
          icon={<Icon size="s" tone="inherit"><ChevronRight /></Icon>}
          onClick={() => step(1)}
        />
      </div>

      {/* tabIndex -1: the grid is not a tab stop (one day is), but it must be focusable for its role. */}
      <div className="scalar-date-picker__grid" role="grid" tabIndex={-1} aria-labelledby={`${baseId}-month`} onKeyDown={onGridKeyDown}>
        <div className="scalar-date-picker__row" role="row">
          {weekdays.map((w, i) => (
            <div key={weekdayNames[i]} className="scalar-date-picker__weekday" role="columnheader" aria-label={weekdayNames[i]}>
              {w.slice(0, 2)}
            </div>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={dateKey(week[0]!)} className="scalar-date-picker__row" role="row">
            {week.map((d) => {
              const disabled = isDisabled?.(d) ?? false;
              return (
                <CalendarDay
                  key={dateKey(d)}
                  cell
                  day={d.getDate()}
                  date={d}
                  locale={locale}
                  selected={selected ? sameDay(d, selected) : false}
                  today={sameDay(d, todayDate)}
                  outside={d.getMonth() !== viewMonth.getMonth()}
                  aria-disabled={disabled || undefined}
                  tabIndex={sameDay(d, tabDate) ? 0 : -1}
                  onClick={() => pick(d)}
                  onFocus={() => setFocused(d)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});
