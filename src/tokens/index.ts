/**
 * Scalar Design System — token API.
 *
 * Every export here resolves to a CSS custom property reference, never a raw
 * value. That is what makes a component respond to Light/Dark and to the
 * viewport type mode without re-rendering.
 *
 *   import { color, space, radius, size, type } from '@scalar/design-system/tokens';
 *   <div style={{ background: color.bg.surface, padding: space.m }} />
 *
 * Raw values are available from `colorValues` / `scaleValues` / `typeValues`
 * for tooling — contrast checkers, chart libraries that cannot read CSS vars,
 * design-token exports. Do not inline them into component styles.
 */
export * from './generated.js';
import type { ColorToken, ScaleToken, TypeToken } from './generated.js';

/** Wrap a token name in a `var()` reference. */
export const cssVar = (token: ColorToken | ScaleToken | TypeToken): string => `var(${token})`;

const v = (name: string) => `var(${name})`;

/* ---------------------------------------------------------------------------
 * Colour
 * ------------------------------------------------------------------------ */

/** Text colours. On a filled surface always use an `on*` token (rule R3). */
export const text = {
  primary: v('--color-text-primary'),
  secondary: v('--color-text-secondary'),
  tertiary: v('--color-text-tertiary'),
  disabled: v('--color-text-disabled'),
  inverse: v('--color-text-inverse'),
  brand: v('--color-text-brand'),
  brandHover: v('--color-text-brand-hover'),
  brandPressed: v('--color-text-brand-pressed'),
  link: v('--color-text-link'),
  linkHover: v('--color-text-link-hover'),
  linkPressed: v('--color-text-link-pressed'),
  positive: v('--color-text-positive'),
  positiveHover: v('--color-text-positive-hover'),
  positivePressed: v('--color-text-positive-pressed'),
  warning: v('--color-text-warning'),
  warningHover: v('--color-text-warning-hover'),
  warningPressed: v('--color-text-warning-pressed'),
  negative: v('--color-text-negative'),
  negativeHover: v('--color-text-negative-hover'),
  negativePressed: v('--color-text-negative-pressed'),
  ai: v('--color-text-ai'),
  sourced: v('--color-text-sourced'),
  editable: v('--color-text-editable'),
  onBrand: v('--color-text-on-brand'),
  onPositive: v('--color-text-on-positive'),
  onNegative: v('--color-text-on-negative'),
  onWarning: v('--color-text-on-warning'),
  onAi: v('--color-text-on-ai'),
  onDisabled: v('--color-text-on-disabled'),
} as const;

/** Surface and fill colours. */
export const bg = {
  page: v('--color-bg-page'),
  surface: v('--color-bg-surface'),
  surfaceRaised: v('--color-bg-surface-raised'),
  subtle: v('--color-bg-subtle'),
  inverse: v('--color-bg-inverse'),
  disabled: v('--color-bg-disabled'),
  brand: v('--color-bg-brand'),
  brandHover: v('--color-bg-brand-hover'),
  brandPressed: v('--color-bg-brand-pressed'),
  brandSubtle: v('--color-bg-brand-subtle'),
  positive: v('--color-bg-positive'),
  positiveHover: v('--color-bg-positive-hover'),
  positivePressed: v('--color-bg-positive-pressed'),
  positiveSubtle: v('--color-bg-positive-subtle'),
  warning: v('--color-bg-warning'),
  warningHover: v('--color-bg-warning-hover'),
  warningPressed: v('--color-bg-warning-pressed'),
  warningSubtle: v('--color-bg-warning-subtle'),
  negative: v('--color-bg-negative'),
  negativeHover: v('--color-bg-negative-hover'),
  negativePressed: v('--color-bg-negative-pressed'),
  negativeSubtle: v('--color-bg-negative-subtle'),
  ai: v('--color-bg-ai'),
  aiSubtle: v('--color-bg-ai-subtle'),
} as const;

/**
 * Border colours.
 * `default`, `subtle` and `divider` are non-interactive container edges and sit
 * below 3:1 by design (rule R5). Anything clickable, focusable or typable takes
 * `control`, which clears 3:1.
 */
export const stroke = {
  default: v('--color-stroke-default'),
  subtle: v('--color-stroke-subtle'),
  divider: v('--color-stroke-divider'),
  strong: v('--color-stroke-strong'),
  control: v('--color-stroke-control'),
  focus: v('--color-stroke-focus'),
  disabled: v('--color-stroke-disabled'),
  brand: v('--color-stroke-brand'),
  brandHover: v('--color-stroke-brand-hover'),
  brandPressed: v('--color-stroke-brand-pressed'),
  positive: v('--color-stroke-positive'),
  positiveHover: v('--color-stroke-positive-hover'),
  positivePressed: v('--color-stroke-positive-pressed'),
  warning: v('--color-stroke-warning'),
  warningHover: v('--color-stroke-warning-hover'),
  warningPressed: v('--color-stroke-warning-pressed'),
  negative: v('--color-stroke-negative'),
  negativeHover: v('--color-stroke-negative-hover'),
  negativePressed: v('--color-stroke-negative-pressed'),
  ai: v('--color-stroke-ai'),
} as const;

/** Icon colours. Icons carry their own ramp so they can clear 1.4.11 alone. */
export const icon = {
  primary: v('--color-icon-primary'),
  secondary: v('--color-icon-secondary'),
  inverse: v('--color-icon-inverse'),
  disabled: v('--color-icon-disabled'),
  brand: v('--color-icon-brand'),
  brandHover: v('--color-icon-brand-hover'),
  brandPressed: v('--color-icon-brand-pressed'),
  positive: v('--color-icon-positive'),
  positiveHover: v('--color-icon-positive-hover'),
  positivePressed: v('--color-icon-positive-pressed'),
  warning: v('--color-icon-warning'),
  warningHover: v('--color-icon-warning-hover'),
  warningPressed: v('--color-icon-warning-pressed'),
  negative: v('--color-icon-negative'),
  negativeHover: v('--color-icon-negative-hover'),
  negativePressed: v('--color-icon-negative-pressed'),
  ai: v('--color-icon-ai'),
  onBrand: v('--color-icon-on-brand'),
} as const;

/** Scrims and translucent washes. */
export const overlay = {
  subtle: v('--color-overlay-subtle'),
  medium: v('--color-overlay-medium'),
  strong: v('--color-overlay-strong'),
  scrim: v('--color-overlay-scrim'),
} as const;

/** Chart palette. Assign series 1..8 in order and never cycle. */
export const chart = {
  series: [
    v('--color-chart-series-1'), v('--color-chart-series-2'),
    v('--color-chart-series-3'), v('--color-chart-series-4'),
    v('--color-chart-series-5'), v('--color-chart-series-6'),
    v('--color-chart-series-7'), v('--color-chart-series-8'),
  ] as const,
  seriesSubtle: [
    v('--color-chart-series-1-subtle'), v('--color-chart-series-2-subtle'),
    v('--color-chart-series-3-subtle'), v('--color-chart-series-4-subtle'),
    v('--color-chart-series-5-subtle'), v('--color-chart-series-6-subtle'),
    v('--color-chart-series-7-subtle'), v('--color-chart-series-8-subtle'),
  ] as const,
  positive: v('--color-chart-positive'),
  negative: v('--color-chart-negative'),
  total: v('--color-chart-total'),
  grid: v('--color-chart-grid'),
  axis: v('--color-chart-axis'),
} as const;

/**
 * PRISM — semantic colour that says what an item REPRESENTS.
 * Never access, availability or permission (rule R11).
 *
 * `primary` is graphic only — a swatch, dot or glyph.
 * `background` is the tint. `text` is the only member safe for small text.
 */
export const prism = {
  entityFirm: {
    primary: v('--color-entity-firm-primary'),
    background: v('--color-entity-firm-background'),
    text: v('--color-entity-firm-text'),
  },
  entityCompany: {
    primary: v('--color-entity-company-primary'),
    background: v('--color-entity-company-background'),
    text: v('--color-entity-company-text'),
  },
  dataDocument: {
    primary: v('--color-data-document-primary'),
    background: v('--color-data-document-background'),
    text: v('--color-data-document-text'),
  },
  dataVersion: {
    primary: v('--color-data-version-primary'),
    background: v('--color-data-version-background'),
    text: v('--color-data-version-text'),
  },
  dataMeasurementDate: {
    primary: v('--color-data-measurement-date-primary'),
    background: v('--color-data-measurement-date-background'),
    text: v('--color-data-measurement-date-text'),
  },
  destinationPage: {
    primary: v('--color-destination-page-primary'),
    background: v('--color-destination-page-background'),
    text: v('--color-destination-page-text'),
  },
  commandFirmAction: {
    primary: v('--color-command-firm-action-primary'),
    background: v('--color-command-firm-action-background'),
    text: v('--color-command-firm-action-text'),
  },
  commandCompanyAction: {
    primary: v('--color-command-company-action-primary'),
    background: v('--color-command-company-action-background'),
    text: v('--color-command-company-action-text'),
  },
  utilityNeutral: {
    primary: v('--color-utility-neutral-primary'),
    background: v('--color-utility-neutral-background'),
    text: v('--color-utility-neutral-text'),
  },
} as const;

/** The five PRISM concepts that Global Search can scope into. */
export type PrismConcept = keyof typeof prism;

export const color = { text, bg, stroke, icon, overlay, chart, prism } as const;

/* ---------------------------------------------------------------------------
 * Scales
 * ------------------------------------------------------------------------ */

/** Gap and padding only. Never width or height — that is `size` (rule R2). */
export const space = {
  none: v('--space-none'),
  '2xs': v('--space-2xs'),
  xs: v('--space-xs'),
  s: v('--space-s'),
  m: v('--space-m'),
  l: v('--space-l'),
  xl: v('--space-xl'),
  '2xl': v('--space-2xl'),
  '3xl': v('--space-3xl'),
  '4xl': v('--space-4xl'),
} as const;

export const radius = {
  none: v('--radius-none'),
  '2xs': v('--radius-2xs'),
  xs: v('--radius-xs'),
  s: v('--radius-s'),
  m: v('--radius-m'),
  l: v('--radius-l'),
  xl: v('--radius-xl'),
  full: v('--radius-full'),
} as const;

/** Width and height only. Never gap or padding — that is `space` (rule R2). */
export const size = {
  icon: {
    xs: v('--size-icon-xs'), s: v('--size-icon-s'), m: v('--size-icon-m'),
    l: v('--size-icon-l'), xl: v('--size-icon-xl'),
  },
  control: { s: v('--size-control-s'), m: v('--size-control-m'), l: v('--size-control-l') },
  avatar: {
    xs: v('--size-avatar-xs'), s: v('--size-avatar-s'), m: v('--size-avatar-m'),
    l: v('--size-avatar-l'), xl: v('--size-avatar-xl'),
  },
  row: { compact: v('--size-row-compact') },
  target: {
    dense: v('--size-target-dense'),
    minimum: v('--size-target-minimum'),
    comfortable: v('--size-target-comfortable'),
  },
} as const;

export const breakpoint = {
  mobile: 393,
  tabletSmall: 768,
  tablet: 1024,
  desktop: 1440,
  desktopLarge: 1920,
} as const;

/** Elevation is a ladder: raised < overlay < modal (rule R9). */
export const elevation = {
  raised: v('--elevation-raised'),
  overlay: v('--elevation-overlay'),
  modal: v('--elevation-modal'),
} as const;

export const motion = {
  instant: v('--duration-instant'),
  fast: v('--duration-fast'),
  moderate: v('--duration-moderate'),
  standard: v('--easing-standard'),
  decelerate: v('--easing-decelerate'),
} as const;

export const zIndex = {
  sticky: 100, drawer: 200, scrim: 300,
  modal: 400, overlay: 500, toast: 600, tooltip: 700,
} as const;

/* ---------------------------------------------------------------------------
 * Typography
 * ------------------------------------------------------------------------ */

export type TypeRole = 'display' | 'heading' | 'text' | 'label' | 'link' | 'overline';
export type TypeWeight = 'light' | 'regular' | 'semiBold' | 'bold';

export const fontWeight = {
  light: v('--font-weight-light'),
  regular: v('--font-weight-regular'),
  semiBold: v('--font-weight-semi-bold'),
  bold: v('--font-weight-bold'),
} as const;

export const fontFamily = v('--font-family-default');

/**
 * Build the CSS for one step of the type ramp.
 * Weight is orthogonal to size (rule R7) — passing a weight never moves size,
 * line-height or tracking.
 *
 * Never set `letterSpacing` yourself: the Overline role carries the +0.8px
 * tracking and setting it by hand detaches the step (rule R10).
 */
export function typeStyle(
  role: TypeRole,
  step: string,
  weight: TypeWeight = 'regular',
): { fontFamily: string; fontSize: string; lineHeight: string; letterSpacing: string; fontWeight: string } {
  const key = `${role}-${step}`;
  return {
    fontFamily,
    fontSize: v(`--font-size-${key}`),
    lineHeight: v(`--line-height-${key}`),
    letterSpacing: v(`--letter-spacing-${key}`),
    fontWeight: fontWeight[weight],
  };
}

/** The legal steps for each role. The ramp has no step below 12px (rule R10). */
export const typeSteps = {
  display: ['s', 'm', 'l'],
  heading: ['s', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'],
  text: ['s', 'm', 'l', 'xl', '2xl'],
  label: ['s', 'm', 'l'],
  link: ['s', 'm', 'l'],
  overline: ['s', 'm'],
} as const satisfies Record<TypeRole, readonly string[]>;

export const type = { style: typeStyle, steps: typeSteps, weight: fontWeight, family: fontFamily } as const;

export const tokens = {
  color, text, bg, stroke, icon, overlay, chart, prism,
  space, radius, size, breakpoint, elevation, motion, zIndex, type,
} as const;
