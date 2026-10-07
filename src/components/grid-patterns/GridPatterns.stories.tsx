import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  RowLabelCell, GridValueCell, InCellControl, ColumnGroupHeader, GridColumnHeader, AddColumnHeader,
  CollapsedColumnRail, GridColumnDivider, ChartHoverCard, CellHistoryPopover, TaskPill,
} from './index.js';
import type { SortDirection } from './index.js';
import { DataGrid } from '../table/DataGrid.js';
import { Row } from '../table/Row.js';
import { LineChart } from '../charts/LineChart.js';

/**
 * The grid-pattern cells for financial statements, cap tables and portfolio grids. Each story below
 * shows one cell on its own; the compound stories at the end compose them in a `DataGrid`.
 */
const meta = {
  title: 'Data/GridPatterns',
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 640 }}><Story /></div>],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const inRow = (node: React.ReactNode) => (
  <div role="table" aria-label="Example"><div role="row" style={{ display: 'grid', gridAutoFlow: 'column' }}>{node}</div></div>
);

export const RowLabelTypes: Story = {
  render: () => inRow(
    <>
      <RowLabelCell type="group-header">VIP Fund</RowLabelCell>
      <RowLabelCell type="line-item">Apple Inc.</RowLabelCell>
      <RowLabelCell type="child">Series A Preferred</RowLabelCell>
      <RowLabelCell type="subtotal">Subtotal</RowLabelCell>
      <RowLabelCell type="total">Total</RowLabelCell>
    </>,
  ),
};

/** Tab to the toggle, then Enter / Space expands or collapses the row. */
export const RowLabelExpandable: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <div role="table" aria-label="Holdings">
        <div role="row"><RowLabelCell expanded={open} onToggle={() => setOpen((o) => !o)}>Apple Inc.</RowLabelCell></div>
        {open && <div role="row"><RowLabelCell type="child">Series A Preferred</RowLabelCell></div>}
      </div>
    );
  },
};

export const ValueKinds: Story = {
  render: () => inRow(
    <>
      <GridValueCell kind="calculated">1,250,000</GridValueCell>
      <GridValueCell kind="editable">1,250,000</GridValueCell>
      <GridValueCell kind="sourced">1,250,000</GridValueCell>
      <GridValueCell kind="total">1,250,000</GridValueCell>
    </>,
  ),
};

export const ValueStates: Story = {
  render: () => inRow(
    <>
      <GridValueCell kind="editable" state="focused">1,250,000</GridValueCell>
      <GridValueCell kind="editable" state="error" errorMessage="Exceeds authorised shares">9,900,000</GridValueCell>
      <GridValueCell kind="editable" state="placeholder" />
      <GridValueCell state="not-applicable" />
    </>,
  ),
};

/** The value is a native button: Enter / Space activates it. The corner flag marks a cell note. */
export const ValueClickableWithNote: Story = {
  render: () => inRow(<GridValueCell kind="sourced" hasComment commentLabel="Has note from auditor" onClick={() => {}}>1,250,000</GridValueCell>),
};

export const InCellSelect: Story = {
  render: () => inRow(
    <>
      <InCellControl type="select" label="Security type">Common</InCellControl>
      <InCellControl type="select" label="Security type" />
      <InCellControl type="select" label="Security type" state="error" errorMessage="Choose a security type" />
    </>,
  ),
};
export const InCellDate: Story = { render: () => inRow(<InCellControl type="date" label="Issue date">31 Dec 2025</InCellControl>) };
export const InCellCurrency: Story = { render: () => inRow(<InCellControl type="currency" label="Currency">EUR</InCellControl>) };
export const InCellOpen: Story = { render: () => inRow(<InCellControl type="select" label="Security type" open>Common</InCellControl>) };

export const GroupHeaders: Story = {
  render: () => (
    <div role="table" aria-label="Periods"><div role="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
      <ColumnGroupHeader span={3}>Actuals</ColumnGroupHeader>
      <ColumnGroupHeader span={3} styleVariant="emphasis" periodDivider>Projections</ColumnGroupHeader>
    </div></div>
  ),
};

export const ColumnHeaderPlain: Story = { render: () => inRow(<GridColumnHeader>Revenue</GridColumnHeader>) };
export const ColumnHeaderNumericSelected: Story = { render: () => inRow(<GridColumnHeader numeric selected>FY2025</GridColumnHeader>) };
export const ColumnHeaderEditableDate: Story = { render: () => inRow(<GridColumnHeader editable>31 Dec 2025</GridColumnHeader>) };

/** Press the label to cycle sort; Tab to the grip and use ArrowLeft / ArrowRight to move the column. */
export const ColumnHeaderInteractive: Story = {
  render: function Render() {
    const [sort, setSort] = useState<SortDirection>('none');
    const [moved, setMoved] = useState('');
    const next: Record<SortDirection, SortDirection> = { none: 'ascending', ascending: 'descending', descending: 'none' };
    return (
      <div>
        {inRow(
          <GridColumnHeader sort={sort} onSort={() => setSort(next[sort])} draggable onMove={(d) => setMoved(`Moved ${d}`)} onFilter={() => {}}>
            Revenue
          </GridColumnHeader>,
        )}
        <p aria-live="polite">{moved}</p>
      </div>
    );
  },
};

export const AddColumn: Story = {
  render: function Render() {
    const [sel, setSel] = useState(false);
    return inRow(<AddColumnHeader selected={sel} onClick={() => setSel((s) => !s)} />);
  },
};

export const CollapsedRail: Story = { render: () => <CollapsedColumnRail count={8} onExpand={() => {}} /> };
export const CollapsedRailSingle: Story = { render: () => <CollapsedColumnRail count={1} onExpand={() => {}} /> };

export const ColumnDividers: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-l)', height: 64 }}>
      <GridColumnDivider type="period" />
      <GridColumnDivider type="pinned" />
    </div>
  ),
};

export const HoverCard: Story = {
  render: () => (
    <ChartHoverCard
      heading="Dec 31, 2024"
      rows={[
        { label: 'Revenue', value: '$4.98M', swatch: 'var(--color-chart-series-1)' },
        { label: 'EBITDA', value: '$2.02M', swatch: 'var(--color-chart-series-2)' },
      ]}
    />
  ),
};

/** Escape, or a click outside, closes it; `autoFocus={false}` here keeps the gallery from stealing focus. */
export const HistoryPopover: Story = {
  render: () => (
    // eslint-disable-next-line jsx-a11y/no-autofocus -- false keeps the static gallery from stealing focus
    <CellHistoryPopover title="Revenue FY2025" subtitle="Last 4 quarters" onClose={() => {}} autoFocus={false}>
      <LineChart
        title="Revenue by quarter"
        categories={['Q1', 'Q2', 'Q3', 'Q4']}
        series={[{ label: 'Revenue', values: [1.1, 1.2, 1.35, 1.5] }]}
        height={160}
      />
    </CellHistoryPopover>
  ),
};

export const TaskPillTones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
      <TaskPill tone="negative" count={3} label="3 overdue tasks" />
      <TaskPill tone="warning" count={2} label="2 tasks due soon" />
      <TaskPill tone="brand" label="Open task" />
    </div>
  ),
};
export const TaskPillButton: Story = { render: () => <TaskPill tone="warning" count={2} label="Open 2 pending tasks" onClick={() => {}} /> };

/** A complete statement: group header, expandable row, values, period divider. */
export const StatementInDataGrid: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <DataGrid
        label="Income statement"
        groupHead={<><ColumnGroupHeader span={1}>Line item</ColumnGroupHeader><ColumnGroupHeader span={1}>Actuals</ColumnGroupHeader><ColumnGroupHeader span={1} styleVariant="emphasis" periodDivider>Projections</ColumnGroupHeader></>}
        head={<><GridColumnHeader grow={2}>Line item</GridColumnHeader><GridColumnHeader numeric>FY2024</GridColumnHeader><GridColumnHeader numeric>FY2025E</GridColumnHeader></>}
      >
        <Row><RowLabelCell type="group-header" span={3}>VIP Fund</RowLabelCell></Row>
        <Row><RowLabelCell expanded={open} onToggle={() => setOpen((o) => !o)}>Revenue</RowLabelCell><GridValueCell kind="sourced">4,120,000</GridValueCell><GridValueCell kind="editable">4,980,000</GridValueCell></Row>
        {open && <Row><RowLabelCell type="child">Product</RowLabelCell><GridValueCell kind="sourced">3,000,000</GridValueCell><GridValueCell kind="editable" state="error" errorMessage="Required">{''}</GridValueCell></Row>}
        <Row><RowLabelCell type="total">Total</RowLabelCell><GridValueCell kind="total">4,120,000</GridValueCell><GridValueCell kind="total">4,980,000</GridValueCell></Row>
      </DataGrid>
    );
  },
};
