/**
 * Workspace → Sheets: a scratch spreadsheet beside the analyst's notes
 * (training C14, S13). It is deliberately unconnected: its cells never feed
 * the valuation, and nothing in the valuation reads them (P6, P10). It says so.
 */
import { DataGrid, ColumnHeader, Row, RowLabelCell, Text, space } from '@scalar/design-system';
import { useEditor } from '../domain/useEditor.js';
import { EditCell } from './EditCell.js';
import { ToolbarSave } from './Toolbar.js';

const COLS = ['A', 'B', 'C', 'D'];
const ROWS = 5;

export function SheetsPanel() {
  const ed = useEditor<Record<string, string>>(() => ({}));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.s, padding: space.m }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: space.m }}>
        <Text step="s" tone="secondary">Scratch sheet. Its cells are not connected to the valuation.</Text>
        <ToolbarSave onClick={ed.save} state={ed.saveState}>Save sheet</ToolbarSave>
      </div>
      <DataGrid label="Sheet 1" head={<><ColumnHeader>{''}</ColumnHeader>{COLS.map((c) => <ColumnHeader key={c}>{c}</ColumnHeader>)}</>}>
        {Array.from({ length: ROWS }, (_, r) => (
          <Row key={r} aria-label={`Row ${r + 1}`} zebra={r % 2 === 1}>
            <RowLabelCell>{String(r + 1)}</RowLabelCell>
            {COLS.map((c) => (
              <EditCell
                key={c}
                label={`Cell ${c}${r + 1}`}
                placeholder=""
                value={ed.data[`${c}${r + 1}`] ?? ''}
                onCommit={(t) => ed.update((cur) => ({ ...cur, [`${c}${r + 1}`]: t }))}
              />
            ))}
          </Row>
        ))}
      </DataGrid>
      {ed.guard.dialog}
    </div>
  );
}
