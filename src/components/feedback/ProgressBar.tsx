import { cx } from '../../utils/cx.js';

export interface ProgressBarProps {
  /**
   * Percentage complete, 0–100. Omit it for an indeterminate bar.
   *
   * Use determinate whenever the total is known. A fake determinate bar that
   * stalls at 90% destroys trust faster than an honest indeterminate one.
   */
  value?: number;
  /** Names what is running. A bar alone says something is running, not what. */
  label?: string;
  className?: string;
}

/** Progress Bar — how far along a task is. */
export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const indeterminate = value === undefined;
  const clamped = indeterminate ? 0 : Math.min(100, Math.max(0, value));

  return (
    <div
      className={cx('scalar-progress', indeterminate && 'scalar-progress--indeterminate', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : clamped}
    >
      <div className="scalar-progress__fill" style={indeterminate ? undefined : { width: `${clamped}%` }} />
    </div>
  );
}
