import type { TableCellData, TableColumnDef, TableRowDef } from './tableModel.js';

/** Sample data shaped like the Prism "Valuation Summary" table. Shared by the stories and tests. */
export const columns: TableColumnDef[] = [
  { id: 'ev', header: 'Equity Value', group: 'Valuation', tooltip: 'Enterprise value less net debt' },
  { id: 'wf', header: 'Waterfall', group: 'Valuation' },
  { id: 'opm', header: 'OPM', group: 'Valuation', hasDropdown: true },
  { id: 'method', header: 'Allocation Method', group: 'Allocation Scenarios', width: 176 },
  { id: 'weight', header: 'Weighted Value per Share', group: 'Allocation Scenarios' },
];

export const rows: TableRowDef[] = [
  { id: 'rev-a', label: 'Subscription', level: 1, kind: 'default' },
  { id: 'rev-b', label: 'Services', level: 1, kind: 'default', zebra: true },
  { id: 'rev-t', label: 'Total revenue', level: 0, kind: 'total' },
  { id: 'grp', label: 'Share detail', level: 0, kind: 'default', collapsible: true },
  { id: 'sh', label: 'Number of Shares', level: 1, kind: 'default', addable: true },
];

const c = (id: string, extra: Partial<TableCellData> & Pick<TableCellData, 'value' | 'format'>): TableCellData => ({ id, kind: 'readable', ...extra });

export const cells: Record<string, TableCellData> = {
  'rev-a:ev': c('MACOMPS_15711.ENTERPRISE_VALUE', { value: 401139375.22, format: 'currency', kind: 'sourced' }),
  'rev-a:wf': c('WF.A', { value: 56938, format: 'currency' }),
  'rev-a:opm': c('OPM.A', { value: 773.55, format: 'perShare', kind: 'editable', footnote: 1 }),
  'rev-a:method': c('ALLOC.METHOD', { value: 'OPM', format: 'text', kind: 'editable', options: ['OPM', 'PWERM', 'CVM'] }),
  'rev-a:weight': c('W.A', { value: 75, format: 'percent', kind: 'editable' }),
  'rev-b:ev': c('MACOMPS_15712.ENTERPRISE_VALUE', { value: 22344, format: 'currency', kind: 'sourced' }),
  'rev-b:wf': c('WF.B', { value: 4.38, format: 'rate' }),
  'rev-b:opm': c('OPM.B', { value: 4, format: 'multiple', error: 'MOIC exceeds the cap' }),
  'rev-b:method': c('ALLOC.METHOD.B', { value: 'PWERM', format: 'text', kind: 'editable', options: ['OPM', 'PWERM', 'CVM'] }),
  'rev-b:weight': c('W.B', { value: 25, format: 'percent', kind: 'editable' }),
  'rev-t:ev': c('TOTAL.EV', { value: 423483375.22, format: 'currency', kind: 'total' }),
  'rev-t:wf': c('TOTAL.WF', { value: 61318, format: 'currency', kind: 'total' }),
  'rev-t:weight': c('TOTAL.W', { value: 100, format: 'percent', kind: 'total' }),
  'sh:ev': c('SH.EV', { value: 40, format: 'count' }),
  'sh:wf': c('SH.WF', { value: null, format: 'count' }),
  'sh:opm': c('SH.OPM', { value: 'Pending', format: 'text', kind: 'draft' }),
};

export const footnotes = { 1: 'Per-share value after the cap table is applied.' };
