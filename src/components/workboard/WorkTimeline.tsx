import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { ActionTag, dueUrgency, formatIsoDate, shiftIsoDate, toIsoDate, type DueUrgency, type WorkflowTone } from './Workboard.js';
import { parseIsoDate } from './WorkCalendar.js';

/** One row: an item and the span of its current step. */
export interface WorkTimelineItem {
  id: string;
  /** The row's name (the company). */
  name: ReactNode;
  /** ISO first day of the bar. */
  start: string;
  /** ISO last day of the bar (inclusive), usually the step's due date. */
  end: string;
  /** The step drawn on the bar. */
  label: string;
  tone?: WorkflowTone;
  /** Default: derived from `end` against `today`. */
  urgency?: DueUrgency;
}

export interface WorkTimelineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Accessible name of the table ("Valuation timeline"). */
  label: string;
  /** ISO first day on view. */
  start: string;
  /** Days on view (14 for two weeks, 35 for a month, 91 for a quarter). */
  days: number;
  items: readonly WorkTimelineItem[];
  /** Heading of the name column. Default "Company". */
  nameHeader?: string;
  /** Makes each row's name a button that opens the item. */
  onItemClick?: (item: WorkTimelineItem) => void;
  /** ISO "today": draws the today line when it is on view. Default: the local date. */
  today?: string;
  /** Days between tick labels. Default 7. */
  tickEvery?: number;
  /** Tick and spoken date format. Default `MM/DD/YYYY`. */
  format?: (iso: string) => string;
}

const dayDiff = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / 86_400_000);
/** Narrowest bar, as a share of the lane, so a one-day step still shows its tag. */
const MIN_BAR = 8;

/**
 * Work Timeline — each item's current step as a bar across a date range, with a
 * today line. Read-only: the bars are `ActionTag`s; the only control is the
 * optional row-name button (`onItemClick`). Pair with `PeriodToolbar` for the
 * range (Week | Month | Quarter) and stepping.
 *
 * Accessibility: `role="table"` (cells hold no editable widgets, so not a grid —
 * the component contract): a row header per item and one cell holding the bar.
 * Positions are visual only, so every bar also says its dates ("10/08/2026 to
 * 10/12/2026"), and a bar running off the range says so. Tick labels and the
 * today line are hidden; the lane's column header names the whole range.
 *
 * Tokens: Background/Surface with Background/Row Stripe striping,
 * Stroke/Divider ticks, Stroke/Brand today line, Text/Tertiary tick labels.
 */
export const WorkTimeline = forwardRef<HTMLDivElement, WorkTimelineProps>(function WorkTimeline(
  {
    label, start, days, items, nameHeader = 'Company', onItemClick, today: todayProp, tickEvery = 7,
    format = formatIsoDate, className, ...rest
  },
  ref,
) {
  const today = todayProp ?? toIsoDate(new Date());
  const startDate = parseIsoDate(start) ?? new Date();
  const span = Math.max(1, days);
  const last = shiftIsoDate(start, span - 1);
  const pct = (d: number) => `${(d / span) * 100}%`;
  const todayDate = parseIsoDate(today);
  const todayAt = todayDate ? dayDiff(startDate, todayDate) : -1;
  const showToday = todayAt >= 0 && todayAt < span;
  const ticks = Array.from({ length: Math.ceil(span / tickEvery) }, (_, i) => i * tickEvery);

  return (
    <div ref={ref} role="table" aria-label={label} className={cx('scalar-work-timeline', className)} {...rest}>
      <div role="rowgroup">
        <div role="row" className="scalar-work-timeline__row scalar-work-timeline__row--head">
          <div role="columnheader" className="scalar-work-timeline__name">{nameHeader}</div>
          <div role="columnheader" className="scalar-work-timeline__lane">
            <VisuallyHidden>{`Schedule, ${format(start)} to ${format(last)}`}</VisuallyHidden>
            {ticks.map((d) => (
              <span key={d} className="scalar-work-timeline__tick" style={{ left: pct(d) }} aria-hidden>
                {format(shiftIsoDate(start, d)).slice(0, 5)}
              </span>
            ))}
            {showToday && (
              <span className="scalar-work-timeline__today-label" style={{ left: pct(todayAt + 0.5) }} aria-hidden>Today</span>
            )}
          </div>
        </div>
      </div>
      <div role="rowgroup">
        {items.map((item) => {
          const from = parseIsoDate(item.start);
          const to = parseIsoDate(item.end);
          const a = from ? dayDiff(startDate, from) : 0;
          const b = to ? dayDiff(startDate, to) + 1 : a + 1;
          const left = Math.max(0, a);
          const right = Math.min(span, b);
          const onView = right > 0 && left < span && right > left;
          const width = Math.max(((right - left) / span) * 100, MIN_BAR);
          const clipped = a < 0 || b > span;
          return (
            <div key={item.id} role="row" className="scalar-work-timeline__row">
              <div role="rowheader" className="scalar-work-timeline__name">
                {onItemClick ? (
                  <button type="button" className="scalar-work-timeline__open" onClick={() => onItemClick(item)}>{item.name}</button>
                ) : item.name}
              </div>
              <div role="cell" className="scalar-work-timeline__lane">
                {ticks.map((d) => (
                  <span key={d} className="scalar-work-timeline__gridline" style={{ left: pct(d) }} aria-hidden />
                ))}
                {showToday && <span className="scalar-work-timeline__today" style={{ left: pct(todayAt + 0.5) }} aria-hidden />}
                {onView ? (
                  <span className="scalar-work-timeline__bar" style={{ left: `min(${pct(left)}, ${100 - width}%)`, width: `${width}%` }}>
                    <ActionTag tone={item.tone} urgency={item.urgency ?? dueUrgency(item.end, today)} title={item.label}>{item.label}</ActionTag>
                    <VisuallyHidden>{`, ${format(item.start)} to ${format(item.end)}${clipped ? ', runs past this range' : ''}`}</VisuallyHidden>
                  </span>
                ) : (
                  <VisuallyHidden>{`${item.label}, ${format(item.start)} to ${format(item.end)}, outside this range`}</VisuallyHidden>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
