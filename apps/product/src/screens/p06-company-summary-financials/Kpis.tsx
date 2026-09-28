import { useState } from 'react';
import {
  Button, ButtonIcon, ContextMenu, EmptyState, Heading, Icon, MenuDivider, MenuItem, Text, color, glyphs, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { FinancialsPage } from './FinancialsPage.js';
import { FinancialGrid, fy, type GridColumn, type GridRow } from './FinancialGrid.js';

const YEARS = { hist: [2021, 2022, 2023, 2024], proj: [2025, 2026, 2027, 2028] };

export function Kpis({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [rowCount, setRowCount] = useState(state === 'default' ? 0 : 1);
  const [menuOpen, setMenuOpen] = useState(state === 'column-menu');
  const addRow = () => setRowCount((n) => n + 1);

  const selectedKey = 'fy2023';
  const columns: GridColumn[] = [
    ...YEARS.hist.map((y) => fy(y, 'hist')),
    ...YEARS.proj.map((y) => fy(y, 'proj')),
  ].map((c) => (c.key !== selectedKey ? c : {
    ...c,
    selected: true,
    groupSlot: (
      <div style={{ display: 'flex', justifyContent: 'center', background: color.bg.surface }}>
        <ButtonIcon
          variant="tertiary"
          size="s"
          label={`${c.label} column actions`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          icon={<Icon size="xs" tone="brand"><glyphs.ChevronDown /></Icon>}
        />
      </div>
    ),
    headerMenu: menuOpen && (
      <ContextMenu label={`${c.label} column actions`}>
        <MenuItem icon={<Icon tone="inherit"><glyphs.Copy /></Icon>} onClick={() => setMenuOpen(false)}>Copy</MenuItem>
        <MenuDivider />
        <MenuItem tone="destructive" icon={<Icon tone="inherit"><glyphs.Trash /></Icon>} onClick={() => setMenuOpen(false)}>Delete</MenuItem>
      </ContextMenu>
    ),
  }));

  const rows: GridRow[] = Array.from({ length: rowCount }, (_, i) => ({
    key: `kpi-${i}`,
    label: 'New KPI',
    labelContent: <Text as="span" step="m" weight="semiBold" tone="tertiary">ENTER DATA</Text>,
    values: i === 0 ? [, , { kind: 'editable' as const, focused: true }] : [],
  }));

  const addButton = (
    <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><glyphs.Plus /></Icon>} onClick={addRow}>
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
            <FinancialGrid title="KPI Table" columns={columns} rows={rows} />
          </div>
          {addButton}
        </div>
      )}
    </FinancialsPage>
  );
}
