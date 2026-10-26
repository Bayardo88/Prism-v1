import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, type TableProps } from './Table.js';
import type { Selection, TableCellData } from './tableModel.js';
import type { TableRowDef } from './tableModel.js';
import { cells as sampleCells, columns, footnotes, rows } from './Table.fixtures.js';

const base: TableProps = {
  tableId: 'storybook-valuation',
  title: 'Valuation Summary',
  columns,
  rows,
  cells: sampleCells,
  footnotes,
};

const meta = {
  title: 'Data/Table/Table',
  component: Table,
  tags: ['autodocs'],
  args: base,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 960 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

/** No selection. Hover a cell for the hover fill; the second child row carries the zebra stripe. */
export const Default: Story = {};

/** One cell selected: 1px brand border on all four sides, a 2px marker on its row title and on its column header. */
export const CellSelected: Story = {
  args: { selection: { mode: 'cell', anchor: [1, 1], range: { r0: 1, r1: 1, c0: 1, c1: 1 } } },
};

/** A 2×2 range: every cell takes the selected fill, and ONE overlay draws the perimeter — never a line between cells. */
export const RangeSelected: Story = {
  args: { selection: { mode: 'range', anchor: [0, 0], range: { r0: 0, r1: 1, c0: 0, c1: 1 } } },
};

/** A whole column from its header: 2px left, right and bottom, and the 8px `selected top` marker on the header. */
export const ColumnSelected: Story = { args: { selection: { mode: 'column', col: 1 } } };

/** A whole row from its title: the column pattern rotated, with the 8px `selected left` marker on the title. */
export const RowSelected: Story = { args: { selection: { mode: 'row', row: 1 } } };

/** Error fill wins over the selection fill; the selection border still draws. */
export const ErrorSelected: Story = {
  args: { selection: { mode: 'cell', anchor: [1, 2], range: { r0: 1, r1: 1, c0: 2, c1: 2 } } },
};

/** Letters, row numbers and the fx bar. The bar renders only under the table that holds the selection. */
export const FormulaMode: Story = {
  args: { formulaMode: true, selection: { mode: 'range', anchor: [0, 0], range: { r0: 0, r1: 1, c0: 0, c1: 1 } } },
};

/** Fully interactive: click, drag, Shift+click, arrows, Enter to edit, drag a header edge to resize. */
function InteractiveDemo(args: TableProps) {
  const [selection, setSelection] = useState<Selection>({ mode: 'none' });
  const [cells, setCells] = useState<Record<string, TableCellData>>(sampleCells);
  const [formulaMode, setFormulaMode] = useState(false);
  const [extra, setExtra] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-s)' }}>
      <label style={{ display: 'inline-flex', gap: 'var(--space-xs)', alignItems: 'center', font: 'inherit' }}>
        <input type="checkbox" checked={formulaMode} onChange={(e) => setFormulaMode(e.target.checked)} /> Formula mode
      </label>
      <Table
        {...args}
        cells={cells}
        formulaMode={formulaMode}
        selection={selection}
        onSelectionChange={setSelection}
        onAddColumn={() => setExtra((n) => n + 1)}
        addColumnLabel={extra ? `Add Allocation Scenario (${extra} requested)` : 'Add Allocation Scenario'}
        onCellCommit={(id, text) => {
          setCells((prev) =>
            Object.fromEntries(
              Object.entries(prev).map(([k, c]) => {
                if (c.id !== id) return [k, c];
                const n = Number(text.replace(/[$,%x]/g, ''));
                return [k, { ...c, value: text.trim() !== '' && c.format !== 'text' && Number.isFinite(n) ? n : text }];
              }),
            ),
          );
        }}
      />
    </div>
  );
}

export const Interactive: Story = { render: (args) => <InteractiveDemo {...args} /> };

/** Tables stack with 24px between them and each has its own selection scope and A1 origin. */
function StackedDemo(args: TableProps) {
  const [a, setA] = useState<Selection>({ mode: 'none' });
  const [b, setB] = useState<Selection>({ mode: 'none' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <Table {...args} tableId="stack-a" title="Valuation Summary" formulaMode selection={a} onSelectionChange={setA} />
      <Table {...args} tableId="stack-b" title="Equity Allocation" formulaMode selection={b} onSelectionChange={setB} />
    </div>
  );
}

export const Stacked: Story = { render: (args) => <StackedDemo {...args} /> };

const manyRows: TableRowDef[] = Array.from({ length: 14 }, (_, g) => [
  { id: `s${g}`, label: `Scenario ${g + 1}`, level: 0 as const, kind: 'default' as const, collapsible: true },
  { id: `s${g}-a`, label: 'Common', level: 1 as const, kind: 'default' as const },
  { id: `s${g}-b`, label: 'Preferred', level: 1 as const, kind: 'default' as const, zebra: true },
  { id: `s${g}-t`, label: `Scenario ${g + 1} total`, level: 0 as const, kind: 'total' as const },
]).flat();
const manyCells: Record<string, TableCellData> = Object.fromEntries(
  manyRows.flatMap((r, i) => columns.map((c, j) => [`${r.id}:${c.id}`, { id: `${r.id}.${c.id}`, kind: r.kind === 'total' ? 'total' : 'readable', value: (i + 1) * (j + 3) * 1250, format: 'currency' } as TableCellData])),
);

/**
 * Every Table paginates (R15): 56 rows at 25 a page. A group — its header, child rows and closing total —
 * never splits across pages, so page 1 ends at 24 rows. Row numbers in formula mode keep counting across pages.
 */
export const Paginated: Story = { args: { tableId: 'storybook-paged', title: 'Allocation scenarios', rows: manyRows, cells: manyCells, footnotes: undefined, formulaMode: true } };

