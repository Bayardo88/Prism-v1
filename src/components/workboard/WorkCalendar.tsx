import {
  forwardRef, useEffect, useMemo, useRef, useState,
  type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type ReactElement, type ReactNode, type Ref,
} from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { Avatar } from '../avatar/Avatar.js';
import { Button } from '../button/Button.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Chip, type ChipStyle } from '../chip/Chip.js';
import { SegmentedControl, type SegmentOption } from '../actions-menus/Actions.js';
import { Icon } from '../icon/Icon.js';
import * as m from '../icon/material.js';
import {
  ActionTag, dueUrgency, formatIsoDate, toIsoDate,
  type DueUrgency, type WorkflowTone,
} from './Workboard.js';

/* ---------------------------------------------------------------------------
 * Dates
 * ------------------------------------------------------------------------ */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `YYYY-MM-DD` → a local `Date`, or `undefined` when it is not a real date. */
export function parseIsoDate(iso: string | undefined): Date | undefined {
  const match = iso ? ISO.exec(iso) : null;
  if (!match) return undefined;
  const [y, mo, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d ? date : undefined;
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/* ---------------------------------------------------------------------------
 * Period Toolbar
 * ------------------------------------------------------------------------ */

export interface PeriodToolbarProps<V extends string = string> extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The period on view ("October 2026", "10/05 – 11/09"). Announced when it changes. */
  title: ReactNode;
  /** The heading level of the title. Default 2. */
  headingLevel?: 2 | 3 | 4;
  onPrevious: () => void;
  onNext: () => void;
  /** Back to the period holding today. Omit to hide the button. */
  onToday?: () => void;
  previousLabel?: string;
  nextLabel?: string;
  todayLabel?: string;
  /** Range switch (Month | Week). Omit to hide it. */
  views?: readonly SegmentOption<V>[];
  view?: V;
  onViewChange?: (view: V) => void;
  /** Accessible name of the range switch. Default "Range". */
  viewLabel?: string;
  /** Trailing actions ("New task"). */
  actions?: ReactNode;
}

function PeriodToolbarImpl<V extends string = string>(
  {
    title, headingLevel = 2, onPrevious, onNext, onToday, previousLabel = 'Previous', nextLabel = 'Next',
    todayLabel = 'Today', views, view, onViewChange, viewLabel = 'Range', actions, className, ...rest
  }: PeriodToolbarProps<V>,
  ref: Ref<HTMLDivElement>,
) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div ref={ref} className={cx('scalar-period-toolbar', className)} {...rest}>
      <div className="scalar-period-toolbar__nav">
        {onToday && <Button variant="secondary" size="s" onClick={onToday}>{todayLabel}</Button>}
        <ButtonIcon variant="tertiary" size="s" label={previousLabel} icon={<Icon size="s" tone="inherit"><m.ChevronLeft /></Icon>} onClick={onPrevious} />
        <ButtonIcon variant="tertiary" size="s" label={nextLabel} icon={<Icon size="s" tone="inherit"><m.ChevronRight /></Icon>} onClick={onNext} />
        <Heading className="scalar-period-toolbar__title" aria-live="polite" aria-atomic="true">{title}</Heading>
      </div>
      <div className="scalar-period-toolbar__end">
        {views && view !== undefined && (
          <SegmentedControl<V> label={viewLabel} options={views} value={view} onChange={onViewChange} />
        )}
        {actions}
      </div>
    </div>
  );
}

/**
 * Period Toolbar — the bar above a calendar or timeline: Today, previous /
 * next, the period's title and the range switch. Composition: `Button`,
 * `ButtonIcon`, `SegmentedControl`. The title is a polite live region, so
 * stepping through periods is announced.
 */
export const PeriodToolbar = forwardRef(PeriodToolbarImpl) as <V extends string = string>(
  props: PeriodToolbarProps<V> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null;

/* ---------------------------------------------------------------------------
 * Work Calendar
 * ------------------------------------------------------------------------ */

/** One dated entry on the calendar. Extend it with your own fields and draw them in `renderEvent`. */
export interface WorkCalendarEvent {
  id: string;
  /** ISO `YYYY-MM-DD`. */
  date: string;
  /** The step's name ("Request financials · Helios Bio"). */
  label: string;
  tone?: WorkflowTone;
  /** Default: derived from `date` against `today`. */
  urgency?: DueUrgency;
}

export type WorkCalendarView = 'month' | 'week';

/**
 * Spread these onto the focusable element `renderEvent` returns. They put it in
 * the calendar's keyboard model (`tabIndex={-1}` + the item marker) and wire
 * `onEventClick`.
 */
export interface WorkCalendarItemProps {
  tabIndex: -1;
  'data-work-calendar-item': '';
  onClick: () => void;
}

export interface WorkCalendarProps<E extends WorkCalendarEvent = WorkCalendarEvent>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Accessible name of the grid ("Valuations due, October 2026"). */
  label: string;
  /** Any ISO date inside the period on view. */
  date: string;
  /** `month` (six week rows, always) or `week` (one tall row). Default `month`. */
  view?: WorkCalendarView;
  events: readonly E[];
  onEventClick?: (event: E) => void;
  /** Draw an event your way (e.g. a `CalendarTaskCard`). Default: an `ActionTag` in a button. */
  renderEvent?: (event: E, itemProps: WorkCalendarItemProps) => ReactNode;
  /** Events shown per day before "+N more". Default 3 in `month`, all in `week`. */
  maxPerDay?: number;
  /** Makes "+N more" a button that receives the day. Without it the count is plain text. */
  onShowMore?: (iso: string) => void;
  /** ISO "today". Default: the local date. Pass it for stable tests and stories. */
  today?: string;
  /** 0 = Sunday (default, as the Workboard), 1 = Monday. */
  weekStartsOn?: 0 | 1;
  locale?: string;
}

const ITEM = '[data-work-calendar-item]';

function WorkCalendarImpl<E extends WorkCalendarEvent = WorkCalendarEvent>(
  {
    label, date, view = 'month', events, onEventClick, renderEvent, maxPerDay, onShowMore, today: todayProp,
    weekStartsOn = 0, locale = 'en-US', className, onKeyDown, ...rest
  }: WorkCalendarProps<E>,
  ref: Ref<HTMLDivElement>,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const today = todayProp ?? toIsoDate(new Date());
  const anchor = parseIsoDate(date) ?? parseIsoDate(today) ?? new Date();

  const { days, weekdays } = useMemo(() => {
    const first = view === 'month' ? new Date(anchor.getFullYear(), anchor.getMonth(), 1) : anchor;
    const start = addDays(first, -((first.getDay() - weekStartsOn + 7) % 7));
    const count = view === 'month' ? 42 : 7;
    const short = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const long = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    return {
      days: Array.from({ length: count }, (_, i) => addDays(start, i)),
      weekdays: Array.from({ length: 7 }, (_, i) => {
        const d = addDays(start, i);
        return { short: short.format(d), long: long.format(d) };
      }),
    };
    // `anchor` is derived from `date`; recompute on the string, not the object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, view, weekStartsOn, locale]);

  const byDay = useMemo(() => {
    const map = new Map<string, E[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);

  const isos = days.map(toIsoDate);
  const inMonth = (d: Date) => view === 'week' || d.getMonth() === anchor.getMonth();
  const fallback = isos.includes(today) ? today : isos[days.findIndex(inMonth)] ?? isos[0] ?? today;
  const [focusIso, setFocusIso] = useState(fallback);
  const tabIso = isos.includes(focusIso) ? focusIso : fallback;
  const pendingFocus = useRef(false);

  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    rootRef.current?.querySelector<HTMLElement>(`[data-date="${tabIso}"]`)?.focus();
  }, [tabIso]);

  const fullDate = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const limit = maxPerDay ?? (view === 'month' ? 3 : Infinity);

  const moveTo = (index: number) => {
    const next = isos[Math.min(isos.length - 1, Math.max(0, index))];
    if (!next) return;
    if (next === tabIso) {
      // Clamped at an edge: no state change, so no effect — refocus the day directly.
      rootRef.current?.querySelector<HTMLElement>(`[data-date="${next}"]`)?.focus();
      return;
    }
    pendingFocus.current = true;
    setFocusIso(next);
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.altKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    const cell = target.closest<HTMLElement>('[role="gridcell"]');
    if (!cell) return;
    const items = Array.from(cell.querySelectorAll<HTMLElement>(ITEM));

    // Inside a cell: Up/Down walk its items, Escape / F2 return to the day.
    const item = target.closest<HTMLElement>(ITEM);
    if (item && item !== cell) {
      const at = items.indexOf(item);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        items[Math.min(items.length - 1, Math.max(0, at + (event.key === 'ArrowDown' ? 1 : -1)))]?.focus();
      } else if (event.key === 'Escape' || event.key === 'F2') {
        event.preventDefault();
        cell.focus();
      }
      return;
    }

    const index = isos.indexOf(cell.dataset.date ?? '');
    const column = index % 7;
    switch (event.key) {
      case 'ArrowLeft': moveTo(index - 1); break;
      case 'ArrowRight': moveTo(index + 1); break;
      case 'ArrowUp': moveTo(index - 7); break;
      case 'ArrowDown': moveTo(index + 7); break;
      case 'Home': moveTo(event.ctrlKey ? 0 : index - column); break;
      case 'End': moveTo(event.ctrlKey ? isos.length - 1 : index - column + 6); break;
      case 'Enter': case 'F2':
        if (!items[0]) return;
        items[0].focus();
        break;
      default: return;
    }
    event.preventDefault();
  };

  const rows = Array.from({ length: days.length / 7 }, (_, w) => days.slice(w * 7, w * 7 + 7));

  return (
    <div
      ref={composeRefs(rootRef, ref)}
      role="grid"
      // Not a tab stop (one day is), but focusable for its role.
      tabIndex={-1}
      aria-label={label}
      className={cx('scalar-work-calendar', `scalar-work-calendar--${view}`, className)}
      onKeyDown={onGridKeyDown}
      {...rest}
    >
      <div role="row" className="scalar-work-calendar__row scalar-work-calendar__row--head">
        {weekdays.map((w) => (
          <div key={w.long} role="columnheader" className="scalar-work-calendar__weekday">
            <span aria-hidden>{w.short}</span>
            <VisuallyHidden>{w.long}</VisuallyHidden>
          </div>
        ))}
      </div>
      {rows.map((week) => (
        <div key={toIsoDate(week[0] as Date)} role="row" className="scalar-work-calendar__row">
          {week.map((day) => {
            const iso = toIsoDate(day);
            const list = byDay.get(iso) ?? [];
            const shown = list.slice(0, limit);
            const hidden = list.length - shown.length;
            const isToday = iso === today;
            return (
              <div
                key={iso}
                role="gridcell"
                tabIndex={iso === tabIso ? 0 : -1}
                data-date={iso}
                aria-current={isToday ? 'date' : undefined}
                className={cx(
                  'scalar-work-calendar__day',
                  !inMonth(day) && 'scalar-work-calendar__day--outside',
                  isToday && 'scalar-work-calendar__day--today',
                )}
                onFocus={(event) => { if (event.target === event.currentTarget) setFocusIso(iso); }}
              >
                <span className="scalar-work-calendar__date" aria-hidden>{day.getDate()}</span>
                <VisuallyHidden>
                  {fullDate.format(day)}{isToday ? ', today' : ''}{list.length ? `, ${list.length} ${list.length === 1 ? 'item' : 'items'}` : ''}
                </VisuallyHidden>
                {list.length > 0 && (
                  <div className="scalar-work-calendar__items">
                    {shown.map((event) => {
                      const itemProps: WorkCalendarItemProps = {
                        tabIndex: -1,
                        'data-work-calendar-item': '',
                        onClick: () => onEventClick?.(event),
                      };
                      if (renderEvent) return <div key={event.id} className="scalar-work-calendar__slot">{renderEvent(event, itemProps)}</div>;
                      return (
                        <button key={event.id} type="button" className="scalar-work-calendar__event" title={event.label} {...itemProps}>
                          <ActionTag tone={event.tone} urgency={event.urgency ?? dueUrgency(event.date, today)}>{event.label}</ActionTag>
                        </button>
                      );
                    })}
                    {hidden > 0 && (onShowMore ? (
                      <button type="button" className="scalar-work-calendar__more" tabIndex={-1} data-work-calendar-item="" onClick={() => onShowMore(iso)}>
                        +{hidden} more
                      </button>
                    ) : (
                      <span className="scalar-work-calendar__more">+{hidden} more</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * Work Calendar — a month (six week rows, always, so the page never jumps) or
 * a week of dated work, each day listing its items. Prop-driven: pass `events`
 * and, for richer cards, `renderEvent` (`CalendarTaskCard`). Pair with
 * `PeriodToolbar` for Today / previous / next / Month | Week.
 *
 * Keyboard (WAI-ARIA grid with widgets in cells): one tab stop, the focused
 * day. Arrows move a day / a week, Home/End to the week's start / end,
 * Ctrl+Home/End to the first / last day on view. Enter or F2 moves into the
 * day's items; there Up/Down walk them, Enter/Space opens one, and Escape or
 * F2 returns to the day. Each day reads its full date, "today" and its item
 * count; today also carries `aria-current="date"` and is drawn with a ring
 * and a filled date, so it never relies on colour alone.
 *
 * Tokens: Background/Surface days, Background/Subtle outside the month,
 * Stroke/Divider grid lines, Background/Brand + Text/On Brand for today's date.
 */
export const WorkCalendar = forwardRef(WorkCalendarImpl) as <E extends WorkCalendarEvent = WorkCalendarEvent>(
  props: WorkCalendarProps<E> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null;

/* ---------------------------------------------------------------------------
 * Calendar Task Card
 * ------------------------------------------------------------------------ */

export interface CalendarTaskPerson {
  name: string;
  initials?: string;
  avatarSrc?: string;
  /** "Preparer", "Reviewer". Spoken with the name. */
  role?: string;
}

export interface CalendarTaskCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  /** The company or item the task is for. */
  title: ReactNode;
  /** The status header: an `ActionTag`, a `ModalStatus`… */
  status?: ReactNode;
  /** Deal types ("409A", "ASC 820") as neutral Chips. */
  tags?: readonly string[];
  /** ISO due date. An unparsable value shows an "Invalid date" chip instead of hiding the problem. */
  due?: string;
  /** ISO "today" for the due chip's urgency. Default: the local date. */
  today?: string;
  /** Comment count. 0 or undefined hides it. */
  comments?: number;
  /** Preparer / reviewer avatars. */
  people?: readonly CalendarTaskPerson[];
  /** A rush deal: RUSH stamp and a Negative outline. */
  rush?: boolean;
  rushLabel?: string;
}

const dueChip: Record<DueUrgency, ChipStyle> = { none: 'default', upcoming: 'default', today: 'warning', overdue: 'negative' };
const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/**
 * Calendar Task Card — one task on a `WorkCalendar` day (Models calendar):
 * status header, company, deal-type tags, the due-date chip, comment count and
 * the preparer / reviewer avatars; rush deals add a RUSH stamp and a Negative
 * outline. The whole card is one button (it opens the task); spread the
 * calendar's `itemProps` onto it.
 *
 * Composition: `Chip` (tags, due date), `Avatar`, `Icon`. Every part is a
 * phrasing element, so the card stays a valid button. Status words, "rush",
 * "overdue" and the comment count are all in the accessible name (R8).
 */
export const CalendarTaskCard = forwardRef<HTMLButtonElement, CalendarTaskCardProps>(function CalendarTaskCard(
  { title, status, tags, due, today, comments, people, rush, rushLabel = 'Rush', className, type = 'button', ...rest },
  ref,
) {
  const dueDate = due !== undefined ? parseIsoDate(due) : undefined;
  const urgency = dueDate ? dueUrgency(due, today) : 'none';
  return (
    <button
      ref={ref}
      type={type}
      className={cx('scalar-task-card', rush && 'scalar-task-card--rush', className)}
      {...rest}
    >
      {(status || rush) && (
        <span className="scalar-task-card__head">
          {status}
          {rush && <span className="scalar-task-card__rush">{rushLabel}</span>}
        </span>
      )}
      <span className="scalar-task-card__title">{title}</span>
      {tags && tags.length > 0 && (
        <span className="scalar-task-card__tags">
          {tags.map((t) => <Chip key={t} styleVariant="default">{t}</Chip>)}
        </span>
      )}
      {(due !== undefined || comments || (people && people.length > 0)) && (
        <span className="scalar-task-card__foot">
          {due !== undefined && (
            <Chip
              styleVariant={dueDate ? dueChip[urgency] : 'negative'}
              leadingIcon={<Icon size="xs" tone="inherit"><m.CalendarToday /></Icon>}
            >
              <VisuallyHidden>Due </VisuallyHidden>
              {dueDate ? formatIsoDate(due) : 'Invalid date'}
              {urgency === 'today' && <VisuallyHidden>, today</VisuallyHidden>}
              {urgency === 'overdue' && <VisuallyHidden>, overdue</VisuallyHidden>}
            </Chip>
          )}
          {comments ? (
            <span className="scalar-task-card__comments">
              <Icon size="xs" tone="inherit"><m.Chat /></Icon>
              {comments}
              <VisuallyHidden>{comments === 1 ? ' comment' : ' comments'}</VisuallyHidden>
            </span>
          ) : null}
          {people && people.length > 0 && (
            <span className="scalar-task-card__people">
              {people.map((p) => (
                <Avatar
                  key={`${p.role ?? ''}${p.name}`}
                  size="xs"
                  src={p.avatarSrc}
                  initials={p.initials ?? initialsOf(p.name)}
                  alt={p.role ? `${p.role}: ${p.name}` : p.name}
                />
              ))}
            </span>
          )}
        </span>
      )}
    </button>
  );
});
