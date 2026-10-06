import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataGrid } from './DataGrid.js';
import type { ComponentType, ReactNode } from 'react';
import { ColumnHeader } from './ColumnHeader.js';
import { RowHeader } from './RowHeader.js';
import { Row } from './Row.js';
import { Cell } from './Cell.js';
import { ContentCell, Ledger } from './ContentCell.js';
import { ModalStatus } from './Status.js';
import { Footnote } from './Footnote.js';

type GridArgs = { label: string; head?: ReactNode; groupHead?: ReactNode; children?: ReactNode; columns?: string[]; maxHeight?: string };

const meta = {
  title: 'Data/Table/DataGrid',
  component: DataGrid as unknown as ComponentType<GridArgs>,
  tags: ['autodocs'],
  args: { label: 'Income statement' },
  decorators: [(Story) => <div style={{ width: 640 }}><Story /></div>],
} satisfies Meta<GridArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

const head = (
  <>
    <ColumnHeader grow={2}>Line item</ColumnHeader>
    <ColumnHeader numeric>FY2024</ColumnHeader>
    <ColumnHeader numeric>FY2025</ColumnHeader>
  </>
);

const body = (
  <>
    <Row><RowHeader>Revenue</RowHeader><Cell numeric type="data">4,120,000</Cell><Cell numeric type="data" footnote={<Footnote currency="USD">1</Footnote>}>4,980,000</Cell></Row>
    <Row zebra><RowHeader>Cost of sales</RowHeader><Cell numeric type="data">1,640,000</Cell><Cell numeric type="data">1,910,000</Cell></Row>
    <Row><RowHeader>Operating expenses</RowHeader><Cell numeric type="input">980,000</Cell><Cell numeric type="input" state="draft">1,050,000</Cell></Row>
    <Row type="total"><RowHeader type="total">EBITDA</RowHeader><Cell numeric state="total">1,500,000</Cell><Cell numeric state="total">2,020,000</Cell></Row>
  </>
);

export const Default: Story = { render: (args) => <DataGrid {...args} head={head}>{body}</DataGrid> };

export const SubtleHeader: Story = {
  render: (args) => (
    <DataGrid {...args} head={<><ColumnHeader tone="subtle" grow={2}>Line item</ColumnHeader><ColumnHeader tone="subtle" numeric>FY2025</ColumnHeader></>}>
      <Row><RowHeader>Revenue</RowHeader><Cell numeric>4,980,000</Cell></Row>
      <Row zebra><RowHeader>Cost of sales</RowHeader><Cell numeric>1,910,000</Cell></Row>
    </DataGrid>
  ),
};

export const SelectedRowAndError: Story = {
  render: (args) => (
    <DataGrid {...args} head={head}>
      <Row selected><RowHeader>Revenue</RowHeader><Cell numeric>4,120,000</Cell><Cell numeric>4,980,000</Cell></Row>
      <Row><RowHeader>Cost of sales</RowHeader><Cell numeric>1,640,000</Cell><Cell numeric state="error" errorMessage="Exceeds revenue">-1</Cell></Row>
    </DataGrid>
  ),
};

export const GroupedRows: Story = {
  render: (args) => (
    <DataGrid {...args} head={head}>
      <Row type="divider" />
      <Row group><RowHeader group>Cash</RowHeader><Cell numeric type="group">310,000</Cell><Cell numeric type="group">340,000</Cell></Row>
      <Row group><RowHeader group>Receivables</RowHeader><Cell numeric type="group">220,000</Cell><Cell numeric type="group">260,000</Cell></Row>
    </DataGrid>
  ),
};

/** The body scrolls inside the grid; the scrolling region takes keyboard focus. */
export const BoundedHeight: Story = {
  render: (args) => (
    <DataGrid {...args} head={head} maxHeight="160px">
      {Array.from({ length: 12 }, (_, i) => (
        <Row key={i} zebra={i % 2 === 1}><RowHeader>Line {i + 1}</RowHeader><Cell numeric>{(i + 1) * 12000}</Cell><Cell numeric>{(i + 1) * 13500}</Cell></Row>
      ))}
    </DataGrid>
  ),
};

/** Sort by activating a header's button (Enter / Space / click). */
export const Sortable: Story = {
  render: function Render(args) {
    const [dir, setDir] = useState<'asc' | 'desc'>('asc');
    const rows = [['Apple Inc.', 4980], ['Beta Corp.', 1200], ['Acme Ltd.', 3100]] as const;
    const sorted = [...rows].sort((a, b) => (dir === 'asc' ? a[1] - b[1] : b[1] - a[1]));
    return (
      <DataGrid {...args} head={<><ColumnHeader grow={2}>Company</ColumnHeader><ColumnHeader numeric sort={dir} onSortChange={setDir}>Revenue</ColumnHeader></>}>
        {sorted.map(([n, v]) => <Row key={n}><RowHeader>{n}</RowHeader><Cell numeric>{v.toLocaleString()}</Cell></Row>)}
      </DataGrid>
    );
  },
};

/** ContentCell carries a user, a label, a date or a note; Ledger is a labelled dot. */
export const ContentCells: Story = {
  render: (args) => (
    <DataGrid {...args} label="Valuation requests" head={<><ColumnHeader tone="subtle">Owner</ColumnHeader><ColumnHeader tone="subtle">Tag</ColumnHeader><ColumnHeader tone="subtle">Due</ColumnHeader><ColumnHeader tone="subtle">Status</ColumnHeader><ColumnHeader tone="subtle">Note</ColumnHeader></>}>
      <Row>
        <ContentCell type="user">Maria Lopez</ContentCell>
        <ContentCell type="label">Series B</ContentCell>
        <ContentCell type="date">31 Dec 2025</ContentCell>
        <Cell><ModalStatus state="review" /></Cell>
        <ContentCell type="note" leading={<Ledger label="Reconciled" />}>Awaiting auditor sign-off</ContentCell>
      </Row>
    </DataGrid>
  ),
};
