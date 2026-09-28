import { useState } from 'react';
import {
  Button, ButtonIcon, ContextMenu, EmptyState, Heading, Icon, MenuDivider, MenuItem, Text, icons, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { FinancialsPage } from './FinancialsPage.js';
import { FinancialGrid, fy, range, type GridColumn, type GridRow } from './FinancialGrid.js';
import { periods } from './data.js';

export function Kpis({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const { year } = periods(company);
  const [rowCount, setRowCount] = useState(state === 'default' ? 0 : 1);
  const [menuOpen, setMenuOpen] = useState(state === 'column-menu');
  const addRow = () => setRowCount((n) => n + 1);

  // Four actual years and four projection years; the frame's active column is the second-latest actual.
  const selected = fy(year - 1, 'hist');
  const columns: GridColumn[] = [
    ...range(year - 3, year).map((y) => fy(y, 'hist')),
    ...range(year + 1, year + 4).map((y) => fy(y, 'proj')),
  ].map((c) => (c.key !== selected.key ? c : {
    ...c,
    selected: true,
    groupSlot: (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ButtonIcon
          variant="tertiary"
          size="s"
          label={`${c.label} column actions`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          icon={<Icon size="xs" tone="brand"><icons.KeyboardArrowDown /></Icon>}
        />
      </div>
    ),
  }));

  const menu = menuOpen ? {
    columnKey: selected.key,
    content: (
      <ContextMenu label={`${selected.label} column actions`}>
        <MenuItem icon={<Icon tone="inherit"><icons.ContentCopy /></Icon>} onClick={() => setMenuOpen(false)}>Copy</MenuItem>
        <MenuDivider />
        <MenuItem tone="destructive" icon={<Icon tone="inherit"><icons.Delete /></Icon>} onClick={() => setMenuOpen(false)}>Delete</MenuItem>
      </ContextMenu>
    ),
  } : undefined;

  const rows: GridRow[] = Array.from({ length: rowCount }, (_, i) => ({
    key: `kpi-${i}`,
    label: 'New KPI',
    labelContent: <Text as="span" step="m" weight="semiBold" tone="tertiary">ENTER DATA</Text>,
    values: i === 0 ? [undefined, undefined, { kind: 'editable' as const, focused: true }] : [],
  }));

  const addButton = (
    <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>} onClick={addRow}>
      Add KPI Row
    </Button>
  );

  return (
    <FinancialsPage company={company} tab="kpis">
      {rowCount === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
          <Heading level={2} step="m">KPI Table</Heading>
          <EmptyState
            type="no-data"
            title="No KPIs yet"
            body="Add your first KPI row and it will appear in this table."
            actions={addButton}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.l, alignItems: 'flex-start' }}>
          <div style={{ alignSelf: 'stretch' }}>
            <FinancialGrid title="KPI Table" columns={columns} rows={rows} menu={menu} />
          </div>
          {addButton}
        </div>
      )}
    </FinancialsPage>
  );
}
