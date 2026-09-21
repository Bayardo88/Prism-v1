import { cx } from '../../utils/cx.js';
import { ChartFrame, PLOT } from './ChartFrame.js';

export interface WaterfallStep {
  label: string;
  /** Positive or negative delta. Ignored when `total` is true. */
  value: number;
  /** An anchored total bar rather than a floating delta. */
  total?: boolean;
}

export interface WaterfallChartProps {
  steps: WaterfallStep[];
  title?: string;
  format?: (value: number) => string;
  className?: string;
}

/**
 * Waterfall Chart — how a starting figure becomes an ending figure, step by
 * step.
 *
 * Totals are anchored to the baseline and rounded on top only, because they
 * touch it. Deltas float and are rounded on all four corners, because they do
 * not. Totals take Chart/Total; deltas take Chart/Positive or Chart/Negative.
 *
 * Every bar is directly labelled with its value — a waterfall is read as
 * arithmetic, not as a shape, so the numbers are not optional. Connectors carry
 * the running total between steps.
 */
export function WaterfallChart({ steps, title, format = String, className }: WaterfallChartProps) {
  const { x, y, width, height } = PLOT;
  const band = width / Math.max(steps.length, 1);
  const barWidth = band * 0.6;

  // Walk the steps to find each bar's start and end on the value axis.
  let running = 0;
  const bars = steps.map((step) => {
    if (step.total) {
      const bar = { from: 0, to: step.value, step };
      running = step.value;
      return bar;
    }
    const from = running;
    running += step.value;
    return { from, to: running, step };
  });

  // Every bar is directly labelled above its top edge, so the axis carries 12%
  // headroom. Ticks are generated from the same axis maximum, which keeps the
  // gridlines and the bars on one scale.
  const max = Math.max(...bars.flatMap((b) => [b.from, b.to]), 0);
  const axisMax = max > 0 ? max * 1.12 : 1;
  const scale = height / axisMax;
  const toY = (v: number) => y + height - v * scale;
  const ticks = Array.from({ length: 5 }, (_, i) => format((axisMax / 4) * (4 - i)));

  return (
    <ChartFrame
      ticks={ticks}
      categories={steps.map((s) => s.label)}
      grid="horizontal"
      title={title}
      className={cx(className)}
    >
      {bars.map((bar, i) => {
        const bx = x + band * i + (band - barWidth) / 2;
        const top = toY(Math.max(bar.from, bar.to));
        const barHeight = Math.abs(toY(bar.from) - toY(bar.to));
        const isTotal = Boolean(bar.step.total);
        const positive = bar.to >= bar.from;

        return (
          <g key={`${bar.step.label}-${i}`}>
            {/* Connector to the next bar carries the running total. */}
            {i < bars.length - 1 && (
              <line
                className="scalar-chart__grid"
                x1={bx + barWidth}
                y1={toY(bar.to)}
                x2={x + band * (i + 1) + (band - barWidth) / 2}
                y2={toY(bar.to)}
              />
            )}
            <rect
              x={bx}
              y={top}
              width={barWidth}
              height={Math.max(barHeight, 1)}
              rx={isTotal ? 4 : 4}
              fill={
                isTotal
                  ? 'var(--color-chart-total)'
                  : positive
                    ? 'var(--color-chart-positive)'
                    : 'var(--color-chart-negative)'
              }
            />
            <text className="scalar-chart__value" x={bx + barWidth / 2} y={top - 6} textAnchor="middle">
              {format(isTotal ? bar.to : bar.step.value)}
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}
