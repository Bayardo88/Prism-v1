export { ChartCanvas } from './ChartCanvas.js';
export type { ChartCanvasProps, ChartDataTable } from './ChartCanvas.js';
export { ChartLegend, ChartLegendItem } from './ChartLegend.js';
export type { ChartLegendProps, ChartLegendItemProps } from './ChartLegend.js';
export { BarChart } from './BarChart.js';
export type { BarChartProps } from './BarChart.js';
export { LineChart } from './LineChart.js';
export type { LineChartProps } from './LineChart.js';
export { WaterfallChart } from './WaterfallChart.js';
export type { WaterfallChartProps, WaterfallStep } from './WaterfallChart.js';
export { DonutChart } from './DonutChart.js';
export type { DonutChartProps, DonutSlice } from './DonutChart.js';

// The scaffold and token bridge, for teams building a chart this package
// does not ship. Use these rather than reading CSS variables by hand.
export { registerScalarCharts, chartScaffold, baseChartOptions } from './chartSetup.js';
export type { ChartGrid } from './chartSetup.js';
export { resolveChartTokens, prefersReducedMotion } from './chartTokens.js';
export type { ChartTokens } from './chartTokens.js';
export { useChartTokens } from './useChartTokens.js';
export { directLabelsPlugin, waterfallConnectorsPlugin, donutCenterPlugin } from './plugins.js';
export { seriesColor, seriesSubtleColor, seriesAccessibilityWarning, SERIES_COUNT } from './series.js';
