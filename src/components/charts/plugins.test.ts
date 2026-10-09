import { describe, it, expect, vi } from 'vitest';
import type { Chart } from 'chart.js';
import { directLabelsPlugin, waterfallConnectorsPlugin, donutCenterPlugin } from './plugins.js';
import type { ChartTokens } from './chartTokens.js';

const tokens: ChartTokens = {
  series: [], seriesSubtle: [], positive: 'g', negative: 'r', total: 't',
  grid: 'GRID', axis: 'a', labelColor: 'LABEL', valueColor: 'VALUE', surface: 's',
  fontFamily: 'Inter', fontSize: 12, valueFontSize: 13, spaceS: 8, spaceM: 12,
};

const makeCtx = () => ({
  save: vi.fn(), restore: vi.fn(), fillText: vi.fn(), beginPath: vi.fn(),
  moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(),
  font: '', fillStyle: '', strokeStyle: '', lineWidth: 0, textAlign: '', textBaseline: '',
});

const el = (props: Record<string, number>) => ({ getProps: vi.fn(() => props) });

describe('directLabelsPlugin', () => {
  const run = (opts: Parameters<typeof directLabelsPlugin>[0], datasets: Array<{ data: unknown[] }>, metas: Array<{ hidden?: boolean; data: unknown[] }>) => {
    const ctx = makeCtx();
    const chart = { ctx, data: { datasets }, getDatasetMeta: (i: number) => metas[i] };
    const plugin = directLabelsPlugin(opts);
    (plugin.afterDatasetsDraw as (c: unknown) => void)(chart);
    return ctx;
  };

  it('draws formatted labels 6px above each bar and restores the context', () => {
    const ctx = run(
      { tokens, format: (v) => `$${v}` },
      [{ data: [1, 2] }],
      [{ data: [el({ x: 10, y: 50 }), el({ x: 20, y: 30 })] }],
    );
    expect(ctx.font).toBe('600 13px Inter');
    expect(ctx.fillStyle).toBe('VALUE');
    expect(ctx.textAlign).toBe('center');
    expect(ctx.textBaseline).toBe('bottom');
    expect(ctx.fillText.mock.calls).toEqual([['$1', 10, 44], ['$2', 20, 24]]);
    expect(ctx.save).toHaveBeenCalledTimes(1);
    expect(ctx.restore).toHaveBeenCalledTimes(1);
  });

  it('skips hidden datasets', () => {
    const ctx = run(
      { tokens, format: String },
      [{ data: [1] }, { data: [2] }],
      [{ hidden: true, data: [el({ x: 1, y: 10 })] }, { data: [el({ x: 2, y: 10 })] }],
    );
    expect(ctx.fillText.mock.calls).toEqual([['2', 2, 4]]);
  });

  it('skips non-numeric raw values by default', () => {
    const ctx = run(
      { tokens, format: String },
      [{ data: [null, 'x', 5] }],
      [{ data: [el({ x: 0, y: 10 }), el({ x: 0, y: 10 }), el({ x: 0, y: 10 })] }],
    );
    expect(ctx.fillText).toHaveBeenCalledTimes(1);
    expect(ctx.fillText.mock.calls[0]![0]).toBe('5');
  });

  it('uses valueAt to pick the value and skips null/undefined', () => {
    const valueAt = vi.fn((di: number, i: number, raw: unknown) => (i === 0 ? null : i === 1 ? undefined : (raw as number[])[1]! - (raw as number[])[0]!)) as never;
    const ctx = run(
      { tokens, format: (v) => `v${v}`, valueAt },
      [{ data: [[0, 1], [0, 2], [3, 10]] }],
      [{ data: [el({ x: 0, y: 10 }), el({ x: 0, y: 10 }), el({ x: 7, y: 20 })] }],
    );
    expect(ctx.fillText.mock.calls).toEqual([['v7', 7, 14]]);
  });

  it('lets formatAt override format and receives dataset, index and value', () => {
    const formatAt = vi.fn((di: number, i: number, v: number) => `${di}:${i}:${v}`);
    const ctx = run(
      { tokens, format: () => 'WRONG', formatAt },
      [{ data: [4] }],
      [{ data: [el({ x: 1, y: 8 })] }],
    );
    expect(formatAt).toHaveBeenCalledWith(0, 0, 4);
    expect(ctx.fillText.mock.calls).toEqual([['0:0:4', 1, 2]]);
  });
});

describe('waterfallConnectorsPlugin', () => {
  const run = (meta: unknown, datasets: Array<{ data: unknown[] }>, scales: unknown) => {
    const ctx = makeCtx();
    const chart = { ctx, data: { datasets }, scales, getDatasetMeta: () => meta };
    (waterfallConnectorsPlugin(tokens).beforeDatasetsDraw as (c: unknown) => void)(chart);
    return ctx;
  };
  const scales = { y: { getPixelForValue: (v: number) => 100 - v } };

  it('draws a connector at the running total between neighbouring bars', () => {
    const ctx = run(
      { data: [el({ x: 10, width: 8 }), el({ x: 30, width: 8 }), el({ x: 50, width: 8 })] },
      [{ data: [[0, 10], [10, 15], [15, 12]] }],
      scales,
    );
    expect(ctx.strokeStyle).toBe('GRID');
    expect(ctx.lineWidth).toBe(1);
    expect(ctx.moveTo.mock.calls).toEqual([[14, 90], [34, 85]]);
    expect(ctx.lineTo.mock.calls).toEqual([[26, 90], [46, 85]]);
    expect(ctx.stroke).toHaveBeenCalledTimes(2);
    expect(ctx.save).toHaveBeenCalledTimes(1);
    expect(ctx.restore).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the dataset has no bars', () => {
    const ctx = run({ data: [] }, [{ data: [] }], scales);
    expect(ctx.save).not.toHaveBeenCalled();
    const ctx2 = run(undefined, [], scales);
    expect(ctx2.save).not.toHaveBeenCalled();
  });

  it('skips points with no raw value or no y scale', () => {
    const meta = { data: [el({ x: 0, width: 2 }), el({ x: 10, width: 2 })] };
    expect(run(meta, [{ data: [undefined, [0, 1]] }], scales).stroke).not.toHaveBeenCalled();
    expect(run(meta, [{ data: [[0, 1], [1, 2]] }], {}).stroke).not.toHaveBeenCalled();
  });

  it('skips a missing neighbour', () => {
    const meta = { data: [el({ x: 0, width: 2 }), undefined] };
    expect(run(meta, [{ data: [[0, 1], [1, 2]] }], scales).stroke).not.toHaveBeenCalled();
  });
});

describe('donutCenterPlugin', () => {
  const run = (opts: Parameters<typeof donutCenterPlugin>[0], arc: unknown = { x: 50, y: 60 }) => {
    const ctx = makeCtx();
    const chart = { ctx, getDatasetMeta: () => ({ data: [arc] }) } as unknown as Chart<'doughnut'>;
    (donutCenterPlugin(opts).afterDraw as (c: unknown) => void)(chart);
    return ctx;
  };

  it('draws nothing without total or caption', () => {
    expect(run({ tokens }).save).not.toHaveBeenCalled();
  });

  it('draws nothing without an arc', () => {
    expect(run({ tokens, total: '10' }, null).save).not.toHaveBeenCalled();
  });

  it('centres a lone total on the arc', () => {
    const ctx = run({ tokens, total: '$10' });
    expect(ctx.fillText.mock.calls).toEqual([['$10', 50, 60]]);
    expect(ctx.font).toBe(`600 ${12 * 1.6}px Inter`);
    expect(ctx.fillStyle).toBe('VALUE');
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('centres a lone caption on the arc in the label colour', () => {
    const ctx = run({ tokens, caption: 'Total' });
    expect(ctx.fillText.mock.calls).toEqual([['Total', 50, 60]]);
    expect(ctx.fillStyle).toBe('LABEL');
    expect(ctx.font).toBe('400 12px Inter');
  });

  it('stacks total above and caption below when both are given', () => {
    const ctx = run({ tokens, total: '$10', caption: 'Total' });
    expect(ctx.fillText.mock.calls).toEqual([['$10', 50, 52], ['Total', 50, 72]]);
  });
});
