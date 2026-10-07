import { createElement, forwardRef, type ElementType, type HTMLAttributes, type ReactElement, type ReactNode, type Ref } from 'react';
import { cx } from '../../utils/cx.js';
import type { TypeRole, TypeWeight, typeSteps } from '../../tokens/index.js';

/** The legal steps for a role, e.g. `TypeStep<'overline'>` is `'s' | 'm'`. */
export type TypeStep<V extends TypeRole = TypeRole> = (typeof typeSteps)[V][number];

export type TextTone =
  | 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse'
  | 'brand' | 'link' | 'positive' | 'warning' | 'negative' | 'ai'
  | 'sourced' | 'editable'
  | 'onBrand' | 'onPositive' | 'onNegative' | 'onWarning' | 'onAi' | 'onDisabled'
  | 'inherit';

export interface TypographyProps<V extends TypeRole = TypeRole> extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  children?: ReactNode;
  /**
   * The type role. Each role exists so its metrics track its job.
   * Named `variant` rather than `role` so the DOM `role` attribute stays free.
   */
  variant?: V;
  /**
   * The step within the role, checked against the role (`overline` has only `s`
   * and `m`). The ramp has no step below 12px except `heading.xs` (10px,
   * data-grid chrome only — rule R10).
   */
  step?: TypeStep<V>;
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
const TypographyImpl = forwardRef<HTMLElement, TypographyProps>(function Typography(
  { children, variant = 'text', step = 'm' as TypeStep, weight = 'regular', tone = 'primary', as, truncate, className, ...rest },
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

/** Typography — generic over `variant` so `step` is checked against the role. */
export const Typography = TypographyImpl as unknown as <V extends TypeRole = 'text'>(
  props: TypographyProps<V> & { ref?: Ref<HTMLElement> },
) => ReactElement | null;
(Typography as { displayName?: string }).displayName = 'Typography';

export interface HeadingProps extends Omit<TypographyProps<'heading'>, 'variant'> {
  /** Sets the default element (`h1`–`h6`). Document structure, not size. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}
export type TextProps = Omit<TypographyProps<'text'>, 'variant'>;
export type LabelProps = Omit<TypographyProps<'label'>, 'variant'>;
export type OverlineProps = Omit<TypographyProps<'overline'>, 'variant'>;

/** Heading — the heading role; renders `<h{level}>` (no `role` attribute needed). */
export const Heading = forwardRef<HTMLElement, HeadingProps>(function Heading(
  { level = 2, step = 'xl', weight = 'semiBold', as, ...rest },
  ref,
) {
  return <TypographyImpl ref={ref} variant="heading" step={step} weight={weight} as={as ?? `h${level}`} {...rest} />;
});

/** Text — the body role. */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(props, ref) {
  return <TypographyImpl ref={ref} variant="text" {...props} />;
});

/**
 * Label — compact UI furniture and form labels.
 *
 * Renders a `<label>` when `htmlFor` is given (so the association works) and a
 * `<span>` otherwise; an orphan `<label>` labels nothing. Pass `as` to override.
 */
export const Label = forwardRef<HTMLElement, LabelProps>(function Label(
  { as, htmlFor, weight = 'semiBold', step = 's', ...rest },
  ref,
) {
  return (
    <TypographyImpl
      ref={ref}
      variant="label"
      as={as ?? (htmlFor ? 'label' : 'span')}
      htmlFor={htmlFor}
      weight={weight}
      step={step}
      {...rest}
    />
  );
});

/** Overline — the uppercase role. It owns its tracking; never add your own. */
export const Overline = forwardRef<HTMLElement, OverlineProps>(function Overline(
  { step = 's', weight = 'semiBold', tone = 'tertiary', ...rest },
  ref,
) {
  return <TypographyImpl ref={ref} variant="overline" step={step} weight={weight} tone={tone} {...rest} />;
});
