import { createElement, forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import type { TypeRole, TypeWeight } from '../../tokens/index.js';

export type TextTone =
  | 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse'
  | 'brand' | 'link' | 'positive' | 'warning' | 'negative' | 'ai'
  | 'sourced' | 'editable'
  | 'onBrand' | 'onPositive' | 'onNegative' | 'onWarning' | 'onAi' | 'onDisabled'
  | 'inherit';

export interface TypographyProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  children?: ReactNode;
  /**
   * The type role. Each role exists so its metrics track its job.
   * Named `variant` rather than `role` so the DOM `role` attribute stays free.
   */
  variant?: TypeRole;
  /** The step within the role. The ramp has no step below 12px (rule R10). */
  step?: string;
  /** Orthogonal to size: changing it never moves size or line-height (rule R7). */
  weight?: TypeWeight;
  tone?: TextTone;
  /** The rendered element. Pick it for document structure, not for size. */
  as?: ElementType;
  /** Truncate to a single line with an ellipsis. */
  truncate?: boolean;
  /** Valid when `as="label"`, which is how `Label` and `FormField` use it. */
  htmlFor?: string;
}

/**
 * Typography — every piece of text in the system.
 *
 * Size comes from `role` + `step`, colour from `tone`, and the HTML element
 * from `as`. Keeping those three independent is what stops an `<h2>` being
 * chosen because it happened to be the right size.
 *
 * Never add `letterSpacing` on top of this: the Overline role carries the
 * +0.8px tracking, and setting it by hand detaches the step (rule R10).
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography(
  { children, variant = 'text', step = 'm', weight = 'regular', tone = 'primary', as, truncate, className, ...rest },
  ref,
) {
  const weightClass = weight === 'semiBold' ? 'semi-bold' : weight;
  return createElement(
    as ?? 'p',
    {
      ref,
      className: cx(
        `scalar-type-${variant}-${step}`,
        `scalar-weight-${weightClass}`,
        `scalar-tone-${tone}`,
        truncate && 'scalar-truncate',
        className,
      ),
      ...rest,
    },
    children,
  );
});

/** Heading — Typography with `role="heading"` and a matching element default. */
export const Heading = forwardRef<HTMLElement, Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }>(
  function Heading({ level = 2, step = 'xl', weight = 'semiBold', as, ...rest }, ref) {
    return <Typography ref={ref} variant="heading" step={step} weight={weight} as={as ?? `h${level}`} {...rest} />;
  },
);

/** Text — the body role. */
export const Text = forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>(function Text(props, ref) {
  return <Typography ref={ref} variant="text" {...props} />;
});

/** Label — for form labels and compact UI furniture. */
export const Label = forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>(function Label(
  { as = 'label', weight = 'semiBold', step = 's', ...rest },
  ref,
) {
  return <Typography ref={ref} variant="label" as={as} weight={weight} step={step} {...rest} />;
});

/** Overline — the uppercase role. It owns its tracking; never add your own. */
export const Overline = forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>(function Overline(
  { step = 's', weight = 'semiBold', tone = 'tertiary', ...rest },
  ref,
) {
  return <Typography ref={ref} variant="overline" step={step} weight={weight} tone={tone} {...rest} />;
});
