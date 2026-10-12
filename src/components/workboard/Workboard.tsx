import {
  forwardRef, useEffect, useId, useRef, useState,
  type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactNode,
} from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { Icon } from '../icon/Icon.js';
import * as m from '../icon/material.js';
import { useMenuKeys } from '../actions-menus/useMenuKeys.js';
import type { MenuBehaviourProps } from '../actions-menus/Menu.js';

/* ---------------------------------------------------------------------------
 * Shared vocabulary
 * ------------------------------------------------------------------------ */

/**
 * The colour a workflow step wears. `brand`, `ai`, `warning` and `positive` are
 * the v1.1 status families; `blue`, `pink`, `cyan` and `orange` are the
 * Workflow tone family (`color.workflow.*`, known gap 13). A tone identifies
 * the step, never its status — urgency is `DueUrgency`.
 */
export type WorkflowTone = 'brand' | 'ai' | 'warning' | 'positive' | 'blue' | 'pink' | 'cyan' | 'orange';

/** Where a due date sits relative to today. `none` = no date set. */
export type DueUrgency = 'none' | 'upcoming' | 'today' | 'overdue';

/** `m` for a form or modal header field, `s` for a grid cell. */
export type WorkflowSize = 's' | 'm';

const pad = (n: number) => String(n).padStart(2, '0');

/** A local `Date` → `YYYY-MM-DD`. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Urgency of an ISO due date. ISO dates are zero-padded, so they order as strings. */
export function dueUrgency(iso: string | undefined, today: string = toIsoDate(new Date())): DueUrgency {
  if (!iso) return 'none';
  if (iso === today) return 'today';
  return iso < today ? 'overdue' : 'upcoming';
}

/** Moves an ISO date by whole days. An empty date starts from `today`. */
export function shiftIsoDate(iso: string, days: number, today: string = toIsoDate(new Date())): string {
  const [y, mo, d] = (iso || today).split('-').map(Number);
  const date = new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** `YYYY-MM-DD` → `MM/DD/YYYY`, the product's grid date format. */
export function formatIsoDate(iso: string): string {
  const [y, mo, d] = iso.split('-');
  return y && mo && d ? `${mo}/${d}/${y}` : '';
}

const urgencyWords: Record<DueUrgency, string | undefined> = {
  none: undefined,
  upcoming: undefined,
  today: 'due today',
  overdue: 'overdue',
};

const glyphSize = { s: 'xs', m: 's' } as const;

/* ---------------------------------------------------------------------------
 * Action Tag
 * ------------------------------------------------------------------------ */

export interface ActionTagProps extends HTMLAttributes<HTMLSpanElement> {
  /** The step's name. */
  children: ReactNode;
  tone?: WorkflowTone;
  /** Upcoming is a tinted outline, Today is the solid tone, Overdue is solid red. Default `upcoming`. */
  urgency?: DueUrgency;
  /** Default `s` (grid). */
  size?: WorkflowSize;
}

/**
 * Action Tag — the read-only face of a workflow step: an open circle and the
 * step's name in the step's tone. Use it where the step is shown but cannot be
 * acted on (calendar cards, timeline bars, history). The acting version is
 * `ActionPill`.
 *
 * Figma: workboard-v2 `Action Tag` (tones × 3 urgencies).
 *
 * Accessibility: Today and Overdue append visually hidden words, so the urgency
 * never rests on colour alone (R8).
 */
export const ActionTag = forwardRef<HTMLSpanElement, ActionTagProps>(function ActionTag(
  { children, tone = 'brand', urgency = 'upcoming', size = 's', className, ...rest },
  ref,
) {
  const words = urgencyWords[urgency];
  return (
    <span
      ref={ref}
      className={cx('scalar-action', 'scalar-action-tag', `scalar-wf--${tone}`, `scalar-action--${urgency}`, `scalar-action--${size}`, className)}
      {...rest}
    >
      <Icon size={glyphSize[size]} tone="inherit"><m.RadioButtonUnchecked /></Icon>
      <span className="scalar-action__label">{children}</span>
      {words && <VisuallyHidden>, {words}</VisuallyHidden>}
    </span>
  );
});

/* ---------------------------------------------------------------------------
 * Action Pill
 * ------------------------------------------------------------------------ */

/** Long enough to read the strike-through, short enough not to be a wait. */
const SETTLE_MS = 520;
const ARRIVE_MS = 260;

export interface ActionPillProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The step the item is on next. Also builds the default accessible names. */
  label: string;
  tone?: WorkflowTone;
  /** Urgency of the step's due date. Default `upcoming`. */
  urgency?: DueUrgency;
  /** `m` for a modal header field (default), `s` for a grid cell. */
  size?: WorkflowSize;
  /** Stretch to the container, so every pill in a grid column is the same width. */
  fullWidth?: boolean;
  /**
   * Ticks the step off. The circle closes to a check and the label is struck
   * through for a beat before this runs, so the user sees what they closed.
   * Omit to make the pill a menu trigger only.
   */
  onComplete?: () => void;
  /**
   * The step is a fork with no single next task: ticking opens the menu
   * (`onMenuToggle`) instead of completing it.
   */
  completeOpensMenu?: boolean;
  /** Accessible name of the tick. Default "Mark {label} complete". */
  completeLabel?: string;
  /** Opens or closes the step list. Receives the pill, to anchor the menu to. */
  onMenuToggle?: (anchor: HTMLDivElement) => void;
  /** Whether the step list is showing. Drives `aria-expanded` on the caret. */
  menuOpen?: boolean;
  /** Accessible name of the caret. Default "Show all steps". */
  menuLabel?: string;
  /** The process is on hold: the circle becomes a pause mark and ticking is off. */
  paused?: boolean;
  /** Every step is complete: a check, nothing left to tick. */
  done?: boolean;
  /** A chase is standing in for the step (waiting on the client): draws a currentColor ring. */
  followUp?: boolean;
  /**
   * The last action is inside its undo window: a tint drains across the pill
   * over this many milliseconds.
   */
  pendingMs?: number;
}

/**
 * Action Pill — the step an item is on next, as a control: the circle and label
 * tick the step off in one click, and the trailing caret opens the full step
 * list (`StepMenu`). The same component at two sizes serves the grid's Actions
 * column (`s`) and the detail modal's header field (`m`), so both read a row
 * the same way.
 *
 * Tokens: per tone, Background/{Tone} Subtle + Text/{Tone} + Stroke/{Tone}
 * (upcoming), Background/{Tone} + Text/On {Tone} (today), Background/Negative +
 * Text/On Negative (overdue). Blue / Pink / Cyan / Orange take Workflow/{Tone}
 * Background · Text · Stroke · Solid · On Solid.
 *
 * Accessibility: a `group` named by the step and its urgency, holding two
 * buttons: the tick and the caret (`aria-haspopup="menu"`, `aria-expanded`).
 * Clicks inside never bubble, so the pill can sit in a clickable grid row.
 */
export const ActionPill = forwardRef<HTMLDivElement, ActionPillProps>(function ActionPill(
  {
    label, tone = 'brand', urgency = 'upcoming', size = 'm', fullWidth, onComplete, completeOpensMenu, completeLabel,
    onMenuToggle, menuOpen, menuLabel = 'Show all steps', paused, done, followUp, pendingMs, className, ...rest
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  // "settling" plays the tick over the step being closed; "arriving" fades its replacement in.
  const [settling, setSettling] = useState(false);
  const [arriving, setArriving] = useState(false);

  // A timer outliving the pill would complete a step nobody is looking at.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const canComplete = Boolean(onComplete || (completeOpensMenu && onMenuToggle)) && !done && !paused && !settling;
  // The name always starts with the visible label (WCAG 2.5.3 Label in Name); the state follows it.
  const tickLabel = done ? `${label}, every step completed` : paused ? `${label}, process paused` : completeLabel ?? `Mark ${label} complete`;
  const words = urgencyWords[urgency];

  const complete = (event: MouseEvent) => {
    event.stopPropagation();
    if (!canComplete) return;
    if (completeOpensMenu) {
      if (rootRef.current) onMenuToggle?.(rootRef.current);
      return;
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      onComplete?.();
      return;
    }
    setSettling(true);
    timers.current.push(
      window.setTimeout(() => {
        onComplete?.();
        setSettling(false);
        setArriving(true);
        timers.current.push(window.setTimeout(() => setArriving(false), ARRIVE_MS));
      }, SETTLE_MS),
    );
  };

  const mark = paused ? <m.PauseCircle /> : done || settling ? <m.Check /> : <m.RadioButtonUnchecked />;

  return (
    <div
      role="group"
      aria-label={[label, words, paused && 'paused'].filter(Boolean).join(', ')}
      {...rest}
      ref={composeRefs(rootRef, ref)}
      className={cx(
        'scalar-action', 'scalar-action-pill', `scalar-wf--${tone}`, `scalar-action--${urgency}`, `scalar-action--${size}`,
        fullWidth && 'scalar-action-pill--full',
        followUp && 'scalar-action-pill--follow-up',
        className,
      )}
    >
      {pendingMs != null && pendingMs > 0 && (
        <span className="scalar-action-pill__sweep" style={{ animationDuration: `${pendingMs}ms` }} aria-hidden />
      )}
      <button
        type="button"
        className={cx('scalar-action-pill__complete', settling && 'scalar-action-pill__complete--settling')}
        disabled={!canComplete}
        aria-label={tickLabel}
        title={tickLabel}
        onClick={complete}
      >
        <Icon size={size === 's' ? 's' : 'm'} tone="inherit" className="scalar-action-pill__mark">{mark}</Icon>
        <span
          key={label}
          className={cx('scalar-action__label', arriving && 'scalar-action__label--arriving')}
        >
          {label}
        </span>
      </button>
      {onMenuToggle && (
        <button
          type="button"
          className="scalar-action-pill__caret"
          aria-haspopup="menu"
          aria-expanded={Boolean(menuOpen)}
          aria-label={menuLabel}
          title={menuLabel}
          onClick={(event) => {
            event.stopPropagation();
            if (rootRef.current) onMenuToggle(rootRef.current);
          }}
        >
          <Icon size={size === 's' ? 's' : 'l'} tone="inherit"><m.ArrowDropDown /></Icon>
        </button>
      )}
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Due Date Pill
 * ------------------------------------------------------------------------ */

export interface DueDatePillProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onChange'> {
  /** ISO `YYYY-MM-DD`, or `''` when no date is set. */
  value: string;
  onChange: (iso: string) => void;
  /** `m` for a modal header field (default), `s` for a grid cell. */
  size?: WorkflowSize;
  /**
   * Puts a native date picker behind the date and a calendar button on the
   * trailing edge. Leave off in a grid where a click on the cell opens the item.
   */
  withPicker?: boolean;
  /** ISO "today" for the urgency colour. Default: the local date. Pass it for stable tests and stories. */
  today?: string;
  /** Date display. Default `MM/DD/YYYY`. */
  format?: (iso: string) => string;
  /** Shown when `value` is empty. Default "Due date". */
  placeholder?: string;
}

/**
 * Due Date Pill — the due date of an item's next step, flanked by one-day
 * nudges. Quiet while the date is ahead, Background/Warning on the day,
 * Background/Negative once it has passed. One control for the grid's Due Date
 * column (`s`) and the modal header (`m`), so a date can never read two ways.
 *
 * Accessibility: the nudges are labelled buttons; Today and Overdue add hidden
 * words (R8). Clicks never bubble, so the pill can sit in a clickable row. In a
 * grid the `s` nudges stay faint until the row is hovered or focused.
 */
export const DueDatePill = forwardRef<HTMLSpanElement, DueDatePillProps>(function DueDatePill(
  { value, onChange, size = 'm', withPicker, today, format = formatIsoDate, placeholder = 'Due date', className, title, ...rest },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const urgency = dueUrgency(value, today);
  const words = urgencyWords[urgency];
  const glyph = size === 's' ? 'xs' : 's';

  const nudge = (days: number) => (event: MouseEvent) => {
    event.stopPropagation();
    onChange(shiftIsoDate(value, days, today));
  };

  // The input is only as wide as the date text, so the calendar button opens the
  // native picker directly. `showPicker` needs the click this handler already has.
  const openPicker = (event: MouseEvent) => {
    event.stopPropagation();
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.showPicker?.();
  };

  return (
    <span
      ref={ref}
      title={title ?? (value ? `Due ${format(value)}` : 'Set a due date')}
      className={cx('scalar-due-pill', `scalar-due-pill--${size}`, `scalar-due-pill--${urgency}`, className)}
      {...rest}
    >
      <button type="button" className="scalar-due-pill__btn scalar-due-pill__nudge" aria-label="One day earlier" title="One day earlier" onClick={nudge(-1)}>
        <Icon size={glyph} tone="inherit"><m.Remove /></Icon>
      </button>
      <span className="scalar-due-pill__date">
        <span>{value ? format(value) : placeholder}</span>
        {words && <VisuallyHidden>, {words}</VisuallyHidden>}
        {withPicker && (
          <input
            ref={inputRef}
            type="date"
            value={value}
            aria-label={placeholder}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
      </span>
      <button type="button" className="scalar-due-pill__btn scalar-due-pill__nudge" aria-label="One day later" title="One day later" onClick={nudge(1)}>
        <Icon size={glyph} tone="inherit"><m.Add /></Icon>
      </button>
      {/* The calendar keeps the trailing edge, away from the nudges, so reaching for a
          distant date is never a mis-click on +1 day. */}
      {withPicker && (
        <button type="button" className="scalar-due-pill__btn scalar-due-pill__calendar" aria-label="Pick a due date" title="Pick a due date" onClick={openPicker}>
          <Icon size={glyph} tone="inherit"><m.CalendarMonth /></Icon>
        </button>
      )}
    </span>
  );
});

/* ---------------------------------------------------------------------------
 * Step Menu
 * ------------------------------------------------------------------------ */

/** `done` settled · `next` the one the item is on · `pending` not reached · `skipped` the branch not taken at a fork. */
export type WorkflowStepState = 'done' | 'next' | 'pending' | 'skipped';

export interface StepMenuStep {
  id: string;
  label: string;
  tone?: WorkflowTone;
  state: WorkflowStepState;
  /** Override reachability. By default `pending` steps are disabled and the rest can be picked (rewinds to it). */
  disabled?: boolean;
}

export interface StepMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'>, MenuBehaviourProps {
  /** Accessible name of the menu ("Valuation status"). */
  label: string;
  steps: StepMenuStep[];
  /** A step was picked. Picking a settled step rewinds the process to it. */
  onSelectStep?: (id: string) => void;
  /** The process is on hold: every step is locked. */
  locked?: boolean;
  /** Progress track. Default: `done` steps over every step that is not `skipped`. */
  progress?: { value: number; max: number };
  /** Group headings. Default "Completed" / "Remaining". */
  completedLabel?: string;
  remainingLabel?: string;
  /** Extra sections after the steps: `StepMenuSection` holding `StepMenuLink` / `StepMenuToggle` / `StepMenuAction`. */
  children?: ReactNode;
}

const stepWords: Record<WorkflowStepState, string> = { done: 'completed', next: 'current step', pending: 'not started', skipped: 'skipped' };

/**
 * Step Menu — the whole workflow behind an `ActionPill` caret: settled steps,
 * then the remaining ones, each wearing its tone on a leading bar, plus any
 * sections of tools, toggles and actions. The menu surface only: positioning
 * and open state belong to the trigger.
 *
 * Tokens: Background/Surface Raised + Elevation/Overlay; progress Background/Brand
 * on Background/Subtle; the current step takes Background/{Tone} Subtle.
 *
 * Keyboard: the APG menu model (`useMenuKeys`): Up/Down, Home/End, type-ahead,
 * Esc and Tab call `onClose`. Steps are `menuitem`s; the current one carries
 * `aria-current="step"` and every step says its state in hidden text (R8). The
 * progress count ("2 of 6 steps completed") is the menu's description.
 */
export const StepMenu = forwardRef<HTMLDivElement, StepMenuProps>(function StepMenu(
  {
    label, steps, onSelectStep, locked, progress, completedLabel = 'Completed', remainingLabel = 'Remaining',
    children, onClose, autoFocus, onKeyDown, className, ...rest
  },
  ref,
) {
  const menu = useMenuKeys({ onClose, autoFocus, forwardedRef: ref as React.Ref<HTMLElement> });
  const settled = steps.filter((s) => s.state === 'done' || s.state === 'skipped');
  const remaining = steps.filter((s) => s.state === 'next' || s.state === 'pending');
  const value = progress?.value ?? steps.filter((s) => s.state === 'done').length;
  const max = progress?.max ?? steps.filter((s) => s.state !== 'skipped').length;
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const progressId = useId();

  const renderStep = (step: StepMenuStep) => (
    <button
      key={step.id}
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={locked || (step.disabled ?? step.state === 'pending')}
      aria-current={step.state === 'next' ? 'step' : undefined}
      className={cx('scalar-step-menu__step', `scalar-step-menu__step--${step.state}`, `scalar-wf--${step.tone ?? 'brand'}`)}
      onClick={() => onSelectStep?.(step.id)}
    >
      <Icon size="s" tone="inherit" className="scalar-step-menu__mark">
        {step.state === 'done' ? <m.Check /> : <m.RadioButtonUnchecked />}
      </Icon>
      <span className="scalar-step-menu__label">{step.label}</span>
      <VisuallyHidden>, {stepWords[step.state]}</VisuallyHidden>
    </button>
  );

  return (
    <div
      {...rest}
      ref={menu.ref as React.Ref<HTMLDivElement>}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      aria-describedby={progressId}
      className={cx('scalar-step-menu', className)}
      onKeyDown={(e) => { onKeyDown?.(e); if (!e.defaultPrevented) menu.onKeyDown(e); }}
    >
      <div role="presentation" className="scalar-step-menu__heading">
        <span>{settled.length > 0 ? completedLabel : remainingLabel}</span>
        {/* A menu may only own menu items, so the track is drawn and the count is the menu's description. */}
        <span className="scalar-step-menu__progress" aria-hidden>
          <span className="scalar-step-menu__progress-fill" style={{ width: `${pct}%` }} />
        </span>
        <VisuallyHidden id={progressId}>{`${value} of ${max} steps completed`}</VisuallyHidden>
      </div>
      {settled.map(renderStep)}
      {settled.length > 0 && remaining.length > 0 && (
        <div role="presentation" className="scalar-step-menu__heading">{remainingLabel}</div>
      )}
      {remaining.map(renderStep)}
      {children}
    </div>
  );
});

export interface StepMenuSectionProps extends HTMLAttributes<HTMLDivElement> {
  /** Overline heading ("Recurrent actions", "Other"). */
  heading: ReactNode;
  children?: ReactNode;
}

/** A headed run of items inside a `StepMenu`. Presentational: the items stay direct menu items for the keyboard model. */
export const StepMenuSection = forwardRef<HTMLDivElement, StepMenuSectionProps>(function StepMenuSection(
  { heading, children, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="presentation" className={cx('scalar-step-menu__section', className)} {...rest}>
      <div role="presentation" className="scalar-step-menu__heading">{heading}</div>
      {children}
    </div>
  );
});

type LinkOrButton =
  | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)
  | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>);

export type StepMenuLinkProps = LinkOrButton & {
  children: ReactNode;
  /** Drafted by the model for the user: the AI mark and Text/AI. */
  ai?: boolean;
};

/** A tool the step list opens (a form, a draft, another page). Trailing open-in-new glyph; `href` renders an anchor. */
export const StepMenuLink = forwardRef<HTMLElement, StepMenuLinkProps>(function StepMenuLink(
  { children, ai, className, ...rest },
  ref,
) {
  const cls = cx('scalar-step-menu__item', ai && 'scalar-step-menu__item--ai', className);
  const body = (
    <>
      {ai && <Icon size="s" tone="ai"><m.StarShine /></Icon>}
      <span className="scalar-step-menu__label">{children}</span>
      <Icon size="s" tone="inherit"><m.OpenInNew /></Icon>
    </>
  );
  if (rest.href !== undefined) {
    const { href, ...anchor } = rest;
    return <a ref={ref as React.Ref<HTMLAnchorElement>} role="menuitem" tabIndex={-1} href={href} className={cls} {...anchor}>{body}</a>;
  }
  const { href: _omit, ...button } = rest;
  return <button ref={ref as React.Ref<HTMLButtonElement>} type="button" role="menuitem" tabIndex={-1} className={cls} {...button}>{body}</button>;
});

export interface StepMenuToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  children: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/** A setting that applies at once (Rush, Waiting, Pause). A `menuitemcheckbox` drawn as a small switch. */
export const StepMenuToggle = forwardRef<HTMLButtonElement, StepMenuToggleProps>(function StepMenuToggle(
  { children, checked, onCheckedChange, onClick, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="menuitemcheckbox"
      tabIndex={-1}
      aria-checked={checked}
      className={cx('scalar-step-menu__item', 'scalar-step-menu__item--toggle', className)}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) onCheckedChange(!checked); }}
      {...rest}
    >
      <span className="scalar-step-menu__label">{children}</span>
      <span className="scalar-switch scalar-switch--s" aria-hidden><span className="scalar-switch__knob" /></span>
    </button>
  );
});

export type StepMenuActionTone = 'default' | 'destructive';

export interface StepMenuActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** What the row is about ("Final invoice"). */
  children: ReactNode;
  /** The verb on the trailing chip ("Send", "Cancel"). */
  action: string;
  /** `destructive` for an irreversible action. Put it last. */
  tone?: StepMenuActionTone;
}

/** A one-off command from the step list (send an invoice, cancel the engagement). The whole row is the target. */
export const StepMenuAction = forwardRef<HTMLButtonElement, StepMenuActionProps>(function StepMenuAction(
  { children, action, tone = 'default', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={cx('scalar-step-menu__item', tone === 'destructive' && 'scalar-step-menu__item--destructive', className)}
      {...rest}
    >
      <span className="scalar-step-menu__label">{children}</span>
      <span className="scalar-step-menu__action" aria-hidden>{action}</span>
      <VisuallyHidden>: {action}</VisuallyHidden>
    </button>
  );
});
