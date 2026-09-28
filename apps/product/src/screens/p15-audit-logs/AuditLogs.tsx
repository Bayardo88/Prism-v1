import { useState } from 'react';
import {
  Button, ButtonIcon, Cell, ColumnHeader, DataGrid, FilterBar, FloatingLabelInput, FloatingLabelSelect, Icon,
  Modal, Row, Select, Text, glyphs, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame } from '../../shell/AppFrame.js';
import { firm } from '../../data/fixtures.js';
import { auditLog, TOTAL_LOGS, type LogEntry } from './data.js';

const col = {
  time: { flex: 1.5 },
  user: { flex: 1.5 },
  feature: { flex: 0.9 },
  company: { flex: 0.9 },
  object: { flex: 1.6 },
  action: { flex: 0.9 },
  details: { flex: 3 },
};

const PAGE = 9;

export function AuditLogs(_: ScreenProps) {
  const [shown, setShown] = useState(PAGE);
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [open, setOpen] = useState<LogEntry | undefined>();
  const rows = auditLog.slice(0, shown);
  const ordered = sort === 'desc' ? rows : [...rows].reverse();

  return (
    <AppFrame
      area="settings"
      overlay={open && (
        <Modal
          open
          onClose={() => setOpen(undefined)}
          title={`${open.object} · ${open.action}`}
          footer={<Button variant="tertiary" onClick={() => setOpen(undefined)}>Close</Button>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
            <Text step="s" tone="secondary">{open.time} · {open.user} · {open.feature} · {open.company}</Text>
            <Text step="m" as="pre" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{open.details}</Text>
          </div>
        </Modal>
      )}
    >
      <main style={{ padding: space.l, display: 'flex', flexDirection: 'column', gap: space.m, flex: 1 }}>
        <FilterBar
          label="Filter By"
          action={
            <Button variant="primary" leadingIcon={<Icon size="s" tone="inherit"><glyphs.Refresh /></Icon>} onClick={() => setShown(PAGE)}>
              Refresh
            </Button>
          }
        >
          <Select aria-label="Business unit" defaultValue="">
            <option value="" disabled>Select a business unit</option>
            <option>{firm.name}</option>
          </Select>
          <FloatingLabelInput label="Start date" type="date" />
          <FloatingLabelInput label="End date" type="date" />
          <FloatingLabelSelect label="Product" defaultValue="Portfolio Valuations">
            <option>Portfolio Valuations</option>
            <option>Intelligence</option>
            <option>Waterfalls</option>
            <option>Documents</option>
          </FloatingLabelSelect>
        </FilterBar>

        <Text step="m" tone="secondary">Viewing {TOTAL_LOGS} logs in total</Text>

        <DataGrid
          label="Audit log"
          head={
            <>
              <ColumnHeader style={col.time} sort={sort} onSortChange={setSort}>Timestamp</ColumnHeader>
              <ColumnHeader style={col.user}>User</ColumnHeader>
              <ColumnHeader style={col.feature}>Feature</ColumnHeader>
              <ColumnHeader style={col.company}>Company</ColumnHeader>
              <ColumnHeader style={col.object}>Object Modified</ColumnHeader>
              <ColumnHeader style={col.action}>Action</ColumnHeader>
              <ColumnHeader style={col.details}>Details</ColumnHeader>
            </>
          }
        >
          {ordered.map((r, i) => (
            <Row key={r.id} zebra={i % 2 === 1}>
              <Cell style={col.time}>{r.time}</Cell>
              <Cell style={col.user}>{r.user}</Cell>
              <Cell style={col.feature}>{r.feature}</Cell>
              <Cell style={col.company}>{r.company}</Cell>
              <Cell style={col.object}>{r.object}</Cell>
              <Cell style={col.action}>{r.action}</Cell>
              <Cell style={{ ...col.details, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: space.xs, minWidth: 0 }}>
                  <ButtonIcon
                    variant="tertiary"
                    size="s"
                    label={`View details of ${r.object}`}
                    icon={<Icon size="s" tone="inherit"><glyphs.Search /></Icon>}
                    onClick={() => setOpen(r)}
                  />
                  <Text step="s" tone="secondary" truncate>{r.details}</Text>
                </div>
              </Cell>
            </Row>
          ))}
        </DataGrid>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="tertiary" disabled={shown >= auditLog.length} onClick={() => setShown((n) => n + PAGE)}>
            Load more
          </Button>
        </div>
      </main>
    </AppFrame>
  );
}
