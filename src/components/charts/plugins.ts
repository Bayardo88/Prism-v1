/**
 * Chart.js plugins for the marks the Scalar spec requires and Chart.js has no
 * native equivalent for.
 */
import type { Chart, Plugin } from 'chart.js';
import type { ChartTokens } from './chartTokens.js';

export interface DirectLabelOptions {
  tokens: ChartTokens;
  format: (value: number) => string;
  /** Overrides `format` per mark (e.g. to force a sign on waterfall deltas). */
  formatAt?: (datasetIndex: number, index: number, value: number) => string;
  /** Read the value for a bar. Waterfall labels its delta, not its end point. */
  valueAt?: (datasetIndex: number, index: number, raw: unknown) => number | null;
}

/**
 * Direct labels above every bar.
 *
 * Identity should not rest on colour alone: charts with three or more series
 * carry direct labels as well as a legend (the ramp itself is CVD-validated in
 * CI). A waterfall needs them unconditionally — it is read as arithmetic, not
 * as a shape, so the numbers are not optional.
 */
export function directLabelsPlugin(opts: DirectLabelOptions): Plugin<'bar'> {
  return {
    id: 'scalarDirectLabels',
    afterDatasetsDraw(chart: Chart<'bar'>) {
      const { ctx } = chart;
      const { tokens: t, format, formatAt, valueAt } = opts;
      ctx.save();
      ctx.font = `600 ${t.valueFontSize}px ${t.fontFamily}`;
      ctx.fillStyle = t.valueColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      chart.data.datasets.forEach((dataset, di) => {
        const meta = chart.getDatasetMeta(di);
        if (meta.hidden) return;
        meta.data.forEach((element, i) => {
          const raw = dataset.data[i];
          const value = valueAt ? valueAt(di, i, raw) : typeof raw === 'number' ? raw : null;
          if (value === null || value === undefined) return;
          const { x, y } = element.getProps(['x', 'y'], true);
          ctx.fillText(formatAt ? formatAt(di, i, value) : format(value), x, y - 6);
        });
      });
      ctx.restore();
    },
  };
}

/**
 * Connectors carrying the running total between waterfall steps.
 *
 * Drawn under the labels, in Chart/Grid, so they stay recessive.
 */
export function waterfallConnectorsPlugin(tokens: ChartTokens): Plugin<'bar'> {
  return {
    id: 'scalarWaterfallConnectors',
    beforeDatasetsDraw(chart: Chart<'bar'>) {
      const meta = chart.getDatasetMeta(0);
      if (!meta?.data?.length) return;
      const { ctx } = chart;
      ctx.save();
      ctx.strokeStyle = tokens.grid;
      ctx.lineWidth = 1;

      for (let i = 0; i < meta.data.length - 1; i++) {
        const bar = meta.data[i];
        const next = meta.data[i + 1];
        if (!bar || !next) continue;
        const raw = chart.data.datasets[0]?.data[i] as [number, number] | undefined;
        if (!raw) continue;
        // The running total is the bar's far end on the value axis.
        const endY = chart.scales.y?.getPixelForValue(raw[1]);
        if (endY === undefined) continue;
        const props = bar.getProps(['x', 'width'], true) as { x: number; width: number };
        const nextProps = next.getProps(['x', 'width'], true) as { x: number; width: number };
        ctx.beginPath();
        ctx.moveTo(props.x + props.width / 2, endY);
        ctx.lineTo(nextProps.x - nextProps.width / 2, endY);
        ctx.stroke();
      }
      ctx.restore();
    },
  };
}

export interface DonutCenterOptions {
  tokens: ChartTokens;
  total?: string;
  caption?: string;
}

/** The total held in the middle of a donut. */
export function donutCenterPlugin({ tokens: t, total, caption }: DonutCenterOptions): Plugin<'doughnut'> {
  return {
    id: 'scalarDonutCenter',
    afterDraw(chart: Chart<'doughnut'>) {
      if (!total && !caption) return;
      const meta = chart.getDatasetMeta(0);
      const arc = meta?.data?.[0] as { x: number; y: number } | undefined;
      if (!arc) return;

      const { ctx } = chart;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (total) {
        ctx.font = `600 ${t.fontSize * 1.6}px ${t.fontFamily}`;
        ctx.fillStyle = t.valueColor;
        ctx.fillText(total, arc.x, caption ? arc.y - t.spaceS : arc.y);
      }
      if (caption) {
        ctx.font = `400 ${t.fontSize}px ${t.fontFamily}`;
        ctx.fillStyle = t.labelColor;
        ctx.fillText(caption, arc.x, total ? arc.y + t.spaceM : arc.y);
      }
      ctx.restore();
    },
  };
}
