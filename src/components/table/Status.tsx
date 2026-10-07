import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Check } from '../icon/glyphs.js';

/** The workflow state of a valuation record — this tracks the work. */
export type ModalStatusState = 'draft' | 'review' | 'in-process-usa' | 'in-process-arg' | 'final' | 'complete' | 'published';

/** The commercial state of a deal — this tracks the deal. */
export type ValuationStatusState = 'in-service' | 'awaiting-payment' | 'complete-deal' | 'cancelled';

type StatusTone = 'neutral' | 'warning' | 'negative' | 'brand' | 'document' | 'positive' | 'published';

const modalTone: Record<ModalStatusState, StatusTone> = {
  draft: 'neutral',
  review: 'warning',
  'in-process-usa': 'negative',
  'in-process-arg': 'brand',
  final: 'document',
  complete: 'positive',
  published: 'published',
};

const modalLabel: Record<ModalStatusState, string> = {
  draft: 'Draft',
  review: 'Review',
  'in-process-usa': 'In-Process USA',
  'in-process-arg': 'In-Process ARG',
  final: 'Final',
  complete: 'Complete',
  published: 'Published',
};

const valuationTone: Record<ValuationStatusState, StatusTone> = {
  'in-service': 'brand',
  'awaiting-payment': 'warning',
  'complete-deal': 'positive',
  cancelled: 'negative',
};

const valuationLabel: Record<ValuationStatusState, string> = {
  'in-service': 'In Service',
  'awaiting-payment': 'Awaiting Payment',
  'complete-deal': 'Complete Deal',
  cancelled: 'Cancelled',
};

export interface StatusProps extends HTMLAttributes<HTMLSpanElement> {
  /** Overrides the default label for the state. */
  children?: ReactNode;
}

export interface ModalStatusProps extends StatusProps {
  state: ModalStatusState;
}

export interface ValuationStatusProps extends StatusProps {
  state: ValuationStatusState;
}

/**
 * Modal_Status — the workflow state of a valuation record.
 *
 * Accessibility: the label carries the meaning; the colour only reinforces it
 * (rule R8). That is why the label is never hidden.
 *
 * `published` — released to the portfolio (a Debt Only valuation's terminal
 * state). It shares Complete's positive tint and is told apart by a leading
 * check glyph and its label.
 */
export const ModalStatus = forwardRef<HTMLSpanElement, ModalStatusProps>(function ModalStatus({ state, children, className, ...rest }, ref) {
  return (
    <span ref={ref} className={cx('scalar-status', `scalar-status--${modalTone[state]}`, className)} {...rest}>
      {state === 'published' && <Icon size="xs" tone="inherit"><Check /></Icon>}
      {children ?? modalLabel[state]}
    </span>
  );
});

/**
 * Valuation Status — the commercial state of a deal.
 *
 * Distinct from ModalStatus: that one tracks the work, this one tracks the
 * deal. They can disagree, and both may appear on the same record.
 */
export const ValuationStatus = forwardRef<HTMLSpanElement, ValuationStatusProps>(function ValuationStatus({ state, children, className, ...rest }, ref) {
  return (
    <span ref={ref} className={cx('scalar-status', `scalar-status--${valuationTone[state]}`, className)} {...rest}>
      {children ?? valuationLabel[state]}
    </span>
  );
});
