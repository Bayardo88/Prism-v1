import { useState } from 'react';
import { Card, Chip, InformationLabel, LineChart, SegmentedControl, Text, space } from '@scalar/design-system';
import { PROVIDERS, RANGES, ZX, axisFor, sliceRange, type Provider, type Range } from './data.js';
import { StatTile, fmtDelta, tileGrid } from './StatTile.js';

/** ZX Index Value — provider toggle re-drives the chart and the stat tiles from one dataset. */
export function ZxIndexCard() {
  const [provider, setProvider] = useState<Provider>('zanbato');
  const [range, setRange] = useState<Range>('1Y');
  const d = ZX[provider];
  const s = d.stats;
  const label = PROVIDERS.find((p) => p.value === provider)!.label;

  return (
    <Card
      title="ZX Index Value"
      tag={<InformationLabel label="Robustness Score" value={`${d.robustness} / 100`} marker={<Chip size="s" styleVariant={d.robustness >= 70 ? 'positive' : d.robustness >= 55 ? 'default' : 'warning'}>{d.robustness >= 70 ? 'Robust' : d.robustness >= 55 ? 'Moderate' : 'Thin data'}</Chip>} />}
      action={
        <SegmentedControl label="Index provider" value={provider} onChange={setProvider} options={PROVIDERS} />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: space.s, flexWrap: 'wrap' }}>
          <Text as="span" step="s" tone="tertiary">{label} index · rebased to 100 · volume {d.volume}</Text>
          <SegmentedControl label="Time range" value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r, label: r }))} />
        </div>
        <LineChart
          key={`${provider}-${range}`}
          title={`ZX Index Value, ${label}, ${range}`}
          categoryLabel="Date"
          categories={axisFor(range)}
          series={[{ label: `${label} index`, values: sliceRange(d.series, range) }]}
          format={(v) => v.toFixed(1)}
        />
        <div style={tileGrid}>
          <StatTile label="Avg Price" value={`$${s.avgPrice.toFixed(2)}`} />
          <StatTile label="Avg 1-Day Δ" value={fmtDelta(s.avg1d)} deltaPct={s.avg1d} />
          <StatTile label="Median 1-Day Δ" value={fmtDelta(s.median1d)} deltaPct={s.median1d} />
          <StatTile label="Avg 5-Day Δ" value={fmtDelta(s.avg5d)} deltaPct={s.avg5d} />
          <StatTile label="Median 5-Day Δ" value={fmtDelta(s.median5d)} deltaPct={s.median5d} />
          <StatTile label="Avg Since-Last-Val Δ" value={fmtDelta(s.avgSinceVal)} deltaPct={s.avgSinceVal} />
          <StatTile label="Median Since-Last-Val Δ" value={fmtDelta(s.medianSinceVal)} deltaPct={s.medianSinceVal} />
        </div>
      </div>
    </Card>
  );
}
