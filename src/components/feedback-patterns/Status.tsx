import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import {
  ArrowRight, Bell, Check, Clock, Close, Error as ErrorGlyph, Info, Refresh, Success, Warning,
  Spinner as SpinnerGlyph,
} from '../icon/glyphs.js';
import { ButtonIcon } from '../button/ButtonIcon.js';

/* ---------------------------------------------------------------------------
 * Banner
 * ------------------------------------------------------------------------ */

export type BannerTone = 'info' | 'warning' | 'negative' | 'positive' | 'neutral';

export interface BannerIssue {
  label: ReactNode;
  /** Jumps to the offending cell/field. */
  onClick?: () => void;
}

export interface BannerProps {
  tone?: BannerTone;
  title: ReactNode;
  children?: ReactNode;
  /** A single action button ("Edit common profile"). */
  action?: ReactNode;
  /** Error summary: each issue links to where it is. */
  issues?: readonly BannerIssue[];
  onDismiss?: () => void;
  className?: string;
}

const BANNER_ICON: Record<BannerTone, ReactNode> = {
  info: <Info />, warning: <Warning />, negative: <ErrorGlyph />, positive: <Success />, neutral: <Bell />,
};
const BANNER_TONE = { info: 'brand', warning: 'warning', negative: 'negative', positive: 'positive', neutral: 'secondary' } as const;

/**
 * Banner — page-level, full-width message under the page header. Unlike
 * `Alert` (boxed inside a section) it spans the page, can carry an issue list
 * that links to each problem, and one action. One Banner per page. The tone
 * is carried by an icon and a 4px left rule, never colour alone (R8).
 */
export function Banner({ tone = 'info', title, children, action, issues, onDismiss, className }: BannerProps) {
  return (
    <div role={tone === 'negative' || tone === 'warning' ? 'alert' : 'status'} className={cx('scalar-banner', `scalar-banner--${tone}`, className)}>
      <div className="scalar-banner__content">
        <Icon size="m" tone={BANNER_TONE[tone]}>{BANNER_ICON[tone]}</Icon>
        <div className="scalar-banner__text">
          <div className="scalar-banner__title">{title}</div>
          {children && <div className="scalar-banner__message">{children}</div>}
        </div>
        {action}
        {onDismiss && <ButtonIcon variant="tertiary" size="s" label="Dismiss" onClick={onDismiss} icon={<Icon size="s" tone="inherit"><Close /></Icon>} />}
      </div>
      {issues && issues.length > 0 && (
        <ul className="scalar-banner__issues">
          {issues.map((it, i) => (
            <li key={i}>
              <Icon size="xs" tone={BANNER_TONE[tone]}><ArrowRight /></Icon>
              <button type="button" onClick={it.onClick} className="scalar-banner__issue">{it.label}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Spinner / Progress Ring
 * ------------------------------------------------------------------------ */

export interface SpinnerProps {
  size?: 's' | 'm' | 'l';
  /** Short visible label ("Preparing preview…"). Also the accessible name. */
  label?: string;
  className?: string;
}

/**
 * Spinner — indeterminate loading for work with no known duration (preparing
 * a PDF preview, refreshing market data). For layout-shaped loading use
 * `Skeleton`; for known progress `ProgressBar` or `ProgressRing`. Pulses
 * instead of spinning under prefers-reduced-motion.
 */
export function Spinner({ size = 'm', label, className }: SpinnerProps) {
  const icon = size === 's' ? 's' : size === 'm' ? 'l' : 'xl';
  return (
    <span role="status" aria-label={label ?? 'Loading'} className={cx('scalar-spinner', className)}>
      <Icon size={icon} tone="brand" className="scalar-spinner__glyph"><SpinnerGlyph /></Icon>
      {label && <span className="scalar-spinner__label">{label}</span>}
    </span>
  );
}

export interface ProgressRingProps {
  /** Completed count. */
  value: number;
  /** Total. `0` renders "0/0" and an empty ring. */
  max: number;
  /** What is being counted ("information requests answered"). */
  label: string;
  /** Centre text: `count` ("3/5") or `percent` ("60%"). */
  display?: 'count' | 'percent';
  className?: string;
}

/**
 * Progress Ring — circular completion for a count-based goal next to a page
 * title (requests sent / answered). Diameter = Sizing/Progress Ring/M.
 * Turns positive at 100%.
 */
export function ProgressRing({ value, max, label, display = 'count', className }: ProgressRingProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const r = 20, c = 2 * Math.PI * r;
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cx('scalar-progress-ring', pct === 100 && 'scalar-progress-ring--complete', className)}
    >
      <svg viewBox="0 0 48 48" aria-hidden>
        <circle className="scalar-progress-ring__track" cx="24" cy="24" r={r} fill="none" strokeWidth={4} />
        <circle
          className="scalar-progress-ring__value" cx="24" cy="24" r={r} fill="none" strokeWidth={4}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 24 24)" strokeLinecap="round"
        />
      </svg>
      <span className="scalar-progress-ring__label">{display === 'percent' ? `${Math.round(pct)}%` : `${value}/${max}`}</span>
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * Data Freshness / Save State
 * ------------------------------------------------------------------------ */

export interface DataFreshnessProps {
  /** "Market data as of Sep 22, 2026, 2:00 PM CST". */
  children: ReactNode;
  state?: 'current' | 'refreshing' | 'stale';
  onRefresh?: () => void;
  className?: string;
}

/**
 * Data Freshness — how current externally sourced data is (Daily NAV market
 * data, Capital IQ), with a refresh action. Always include the time zone.
 */
export function DataFreshness({ children, state = 'current', onRefresh, className }: DataFreshnessProps) {
  return (
    <span className={cx('scalar-freshness', `scalar-freshness--${state}`, className)} aria-live="polite">
      <Icon size="xs" tone={state === 'stale' ? 'warning' : state === 'refreshing' ? 'brand' : 'secondary'}>
        {state === 'stale' ? <Warning /> : state === 'refreshing' ? <Refresh /> : <Clock />}
      </Icon>
      <span className="scalar-freshness__text">{children}</span>
      {onRefresh && state !== 'refreshing' && (
        <ButtonIcon variant="tertiary" size="s" label="Refresh data" onClick={onRefresh} icon={<Icon size="s" tone="inherit"><Refresh /></Icon>} />
      )}
    </span>
  );
}

export type SaveStateValue = 'saved' | 'unsaved' | 'saving' | 'no-changes' | 'error';

const SAVE_COPY: Record<SaveStateValue, string> = {
  saved: 'All changes saved', unsaved: 'Unsaved changes', saving: 'Saving…', 'no-changes': 'No changes to save', error: 'Could not save — retry',
};

export interface SaveStateProps {
  state: SaveStateValue;
  /** Overrides the default copy. */
  children?: ReactNode;
  className?: string;
}

/** Save State — inline status next to Save so the user knows whether edits are persisted. */
export function SaveState({ state, children, className }: SaveStateProps) {
  const icon = { saved: <Check />, unsaved: <Warning />, saving: <Refresh />, 'no-changes': <Check />, error: <ErrorGlyph /> }[state];
  const tone = ({ saved: 'positive', unsaved: 'warning', saving: 'brand', 'no-changes': 'disabled', error: 'negative' } as const)[state];
  return (
    <span role="status" className={cx('scalar-save-state', `scalar-save-state--${state}`, className)}>
      <Icon size="xs" tone={tone}>{icon}</Icon>
      {children ?? SAVE_COPY[state]}
    </span>
  );
}
