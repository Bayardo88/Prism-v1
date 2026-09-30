import { useState } from 'react';
import { Card, Cell, ColumnHeader, DataGrid, LineChart, Row, SegmentedControl, Text, space } from '@scalar/design-system';
import { COMPS, RANGES, axisFor, sliceRange, type Range } from './data.js';
import { StatTile, fmtDelta, tileGrid } from './StatTile.js';

/**
 * Public Comps — sibling of ZX Index Value (same chrome). The chart is the
 * DS LineChart; its built-in legend supplies the Public Comps / Peer Group chips.
 * The 409A dashboard has no coded chart, so this is the DS chart it would use.
 */
export function PublicCompsCard() {
  const [range, setRange] = useState<Range>('6M');
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const cats = axisFor(range);
  const pub = sliceRange(COMPS.publicComps, range);
  const peer = sliceRange(COMPS.peerGroup, range);
  const s = COMPS.stats;

  return (
    <Card
      title="Public Comps"
      action={
        <div style={{ display: 'flex', gap: space.s, flexWrap: 'wrap' }}>
          <SegmentedControl label="Time range" value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r, label: r }))} />
          <SegmentedControl label="View" value={view} onChange={setView} options={[{ value: 'chart', label: 'Chart' }, { value: 'table', label: 'Table' }]} />
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
        <Text as="span" step="s" tone="tertiary">Public Comps Index ({range}) · rebased to 100</Text>
        {view === 'chart' ? (
          <LineChart
            key={range}
            title={`Public Comps Index, ${range}`}
            categoryLabel="Date"
            categories={cats}
            series={[{ label: 'Public Comps', values: pub }, { label: 'Peer Group', values: peer }]}
            format={(v) => v.toFixed(1)}
          />
        ) : (
          <DataGrid
            label="Public comps index values"
            maxHeight="20rem"
            head={<><ColumnHeader grow={2} tone="subtle">Date</ColumnHeader><ColumnHeader numeric tone="subtle">Public Comps</ColumnHeader><ColumnHeader numeric tone="subtle">Peer Group</ColumnHeader></>}
          >
            {cats.map((c, i) => (
              <Row key={c}>
                <Cell>{c}</Cell>
                <Cell numeric type="data">{pub[i]!.toFixed(1)}</Cell>
                <Cell numeric type="data">{peer[i]!.toFixed(1)}</Cell>
              </Row>
            ))}
          </DataGrid>
        )}
        <div style={tileGrid}>
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
