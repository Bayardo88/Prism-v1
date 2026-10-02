import { Icon, Text, color, icons, radius, space, Heading } from '@scalar/design-system';

/** A % delta beyond ±5% is flagged. Applies to every tile that carries a delta. */
export const isFlagged = (deltaPct: number) => deltaPct > 5 || deltaPct < -5;
export const fmtDelta = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;

export interface StatTileProps {
  label: string;
  value: string;
  /** Set for % deltas; drives the amber highlight. Omit for plain figures (price, deck numbers). */
  deltaPct?: number;
}

/**
 * Stat tile — label over value. Neutral on `bg.subtle`; when `deltaPct` is
 * beyond ±5% it takes the warning tint AND spells the flag in words (R8).
 * Screen-local (reuse-ladder rung 6): promote to src/components/ if a
 * second product screen needs it.
 */
export function StatTile({ label, value, deltaPct }: StatTileProps) {
  const flagged = deltaPct !== undefined && isFlagged(deltaPct);
  return (
    <div
      role="group"
      aria-label={`${label}: ${value}${flagged ? ', outside ±5%' : ''}`}
      style={{
        display: 'flex', flexDirection: 'column', gap: space.xs,
        padding: space.m, borderRadius: radius.s, minWidth: 0,
        background: flagged ? color.bg.warningSubtle : color.bg.subtle,
        border: `1px solid ${flagged ? color.stroke.warning : color.stroke.subtle}`,
      }}
    >
      <Text as="span" step="s" tone={flagged ? 'warning' : 'tertiary'}>{label}</Text>
      <Heading level={4} step="m">{value}</Heading>
      {flagged && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: space.xs }}>
          <Icon size="xs" tone="warning"><icons.Warning /></Icon>
          <Text as="span" step="s" tone="warning">Beyond ±5%</Text>
        </span>
      )}
    </div>
  );
}

export const tileGrid = {
  display: 'grid', gap: space.s, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
} as const;
