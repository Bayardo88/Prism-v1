import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

/** The workflow state of a valuation record — this tracks the work. */
export type ModalStatusState = 'draft' | 'review' | 'in-process-usa' | 'in-process-arg' | 'final' | 'complete';

/** The commercial state of a deal — this tracks the deal. */
export type ValuationStatusState = 'in-service' | 'awaiting-payment' | 'complete-deal' | 'cancelled';

const modalTone: Record<ModalStatusState, string> = {
  draft: 'neutral',
  review: 'warning',
  'in-process-usa': 'negative',
  'in-process-arg': 'brand',
  final: 'document',
  complete: 'positive',
};

const modalLabel: Record<ModalStatusState, string> = {
  draft: 'Draft',
  review: 'Review',
  'in-process-usa': 'In-Process USA',
  'in-process-arg': 'In-Process ARG',
  final: 'Final',
  complete: 'Complete',
};

const valuationTone: Record<ValuationStatusState, string> = {
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

export interface StatusProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Modal_Status — the workflow state of a valuation record.
 *
 * Accessibility: the label carries the meaning; the colour only reinforces it
 * (rule R8). That is why the label is never hidden.
 */
export function ModalStatus({ state, children, className }: StatusProps & { state: ModalStatusState }) {
  return (
    <span className={cx('scalar-status', `scalar-status--${modalTone[state]}`, className)}>
      {children ?? modalLabel[state]}
    </span>
  );
}

/**
 * Valuation Status — the commercial state of a deal.
 *
 * Distinct from ModalStatus: that one tracks the work, this one tracks the
 * deal. They can disagree, and both may appear on the same record.
 */
export function ValuationStatus({ state, children, className }: StatusProps & { state: ValuationStatusState }) {
  return (
    <span className={cx('scalar-status', `scalar-status--${valuationTone[state]}`, className)}>
      {children ?? valuationLabel[state]}
    </span>
  );
}
