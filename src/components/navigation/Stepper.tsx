import { Fragment, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { Icon } from '../icon/Icon.js';
import { Check } from '../icon/glyphs.js';

export type StepState = 'complete' | 'current' | 'upcoming' | 'error';

export interface StepProps extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
  /** The step number. Complete steps show a check instead. */
  index: number | string;
  label: ReactNode;
  state?: StepState;
}

const STATE_TEXT: Partial<Record<StepState, string>> = { complete: 'Completed', error: 'Error' };

/**
 * Step — one stage in a Stepper. Renders an `li`: place it inside an `ol`
 * (`Stepper` does).
 *
 * Complete shows a check rather than its number: the number has stopped being
 * useful once the step is done. Error keeps the step reachable — it is a state,
 * not a dead end.
 *
 * Accessibility: the current step is `aria-current="step"`; complete and error
 * are also spoken ("Completed", "Error") so state is never colour/icon only.
 */
export const Step = forwardRef<HTMLLIElement, StepProps>(function Step(
  { index, label, state = 'upcoming', className, ...rest },
  ref,
) {
  const stateText = STATE_TEXT[state];
  return (
    <li
      ref={ref}
      className={cx('scalar-step', `scalar-step--${state}`, className)}
      aria-current={state === 'current' ? 'step' : undefined}
      {...rest}
    >
      <span className="scalar-step__marker" aria-hidden={state === 'complete' ? true : undefined}>
        {state === 'complete' ? (
          <Icon size="s" tone="inherit"><Check /></Icon>
        ) : (
          index
        )}
      </span>
      <span className="scalar-step__label">{label}</span>
      {stateText && <VisuallyHidden>{`, ${stateText.toLowerCase()}`}</VisuallyHidden>}
    </li>
  );
});

export interface StepperProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  steps: Array<Omit<StepProps, 'index'> & { index?: number | string }>;
  /** Accessible name of the landmark. Default "Progress". */
  label?: string;
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
 *
 * Accessibility: a labelled `nav` holding an ordered list, so position ("2 of
 * 4") is announced.
 */
export const Stepper = forwardRef<HTMLElement, StepperProps>(function Stepper(
  { steps, label = 'Progress', className, ...rest },
  ref,
) {
  return (
    <nav ref={ref} aria-label={label} className={cx('scalar-stepper', className)} {...rest}>
      <ol className="scalar-stepper__list">
        {steps.map((step, i) => {
          const { index, ...stepProps } = step;
          return (
            <Fragment key={i}>
              <Step {...stepProps} index={index ?? i + 1} />
              {i < steps.length - 1 && <li className="scalar-stepper__connector" aria-hidden />}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
});
