import { Fragment, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Check } from '../icon/glyphs.js';

export type StepState = 'complete' | 'current' | 'upcoming' | 'error';

export interface StepProps {
  /** The step number. Complete steps show a check instead. */
  index: number | string;
  label: ReactNode;
  state?: StepState;
  className?: string;
}

/**
 * Step — one stage in a Stepper.
 *
 * Complete shows a check rather than its number: the number has stopped being
 * useful once the step is done. Error keeps the step reachable — it is a state,
 * not a dead end.
 */
export function Step({ index, label, state = 'upcoming', className }: StepProps) {
  return (
    <div
      className={cx('scalar-step', `scalar-step--${state}`, className)}
      aria-current={state === 'current' ? 'step' : undefined}
    >
      <span className="scalar-step__marker">
        {state === 'complete' ? (
          <Icon size="s" tone="inherit"><Check /></Icon>
        ) : (
          index
        )}
      </span>
      <span className="scalar-step__label">{label}</span>
    </div>
  );
}

export interface StepperProps {
  steps: Array<Omit<StepProps, 'index'> & { index?: number | string }>;
  label?: string;
  className?: string;
}

/**
 * Stepper — progress through a sequence that must be completed in order.
 *
 * Use for a process with a defined beginning and end — onboarding a company,
 * running a valuation to sign-off. Not for navigation between peer views; that
 * is Tabs.
 *
 * Show every step from the start, including the ones not yet reachable: the
 * value of a stepper is that it tells the user how much is left. Never mark a
 * step Complete until it actually is — a stepper that lies about progress is
 * worse than no stepper.
 */
export function Stepper({ steps, label = 'Progress', className }: StepperProps) {
  return (
    <nav aria-label={label} className={cx('scalar-stepper', className)}>
      {steps.map((step, i) => (
        <Fragment key={i}>
          <Step index={step.index ?? i + 1} label={step.label} state={step.state} />
          {i < steps.length - 1 && <span className="scalar-stepper__connector" aria-hidden />}
        </Fragment>
      ))}
    </nav>
  );
}
