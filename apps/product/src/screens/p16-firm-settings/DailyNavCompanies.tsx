import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, Cell, CheckboxItem, Chip, ColumnHeader, DataGrid, FormField, Heading, Icon, Input, Link, Modal,
  Pagination, Row, RowHeader, Text, icons, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { db } from '../../data/fixtures.js';
import { FirmSettingsFrame } from './FirmSettingsFrame.js';

/** Threshold columns: header, and the firm default each empty cell inherits. */
const thresholds = [
  { key: 'ciqShort', label: 'CIQ short', inherit: '1%' },
  { key: 'ciqLong', label: 'CIQ long', inherit: '5%' },
  { key: 'ciqVal', label: 'CIQ since val', inherit: '5%' },
  { key: 'secShort', label: 'Sec short', inherit: '1%' },
  { key: 'secLong', label: 'Sec long', inherit: '5%' },
  { key: 'secVal', label: 'Sec since val', inherit: '5%' },
  { key: 'mark', label: 'vs Mark', inherit: 'Inherit' },
];

/**
 * Column tracks. The threshold columns hold inputs, whose intrinsic width would
 * push the default `minmax(max-content, 1fr)` tracks past 1440, so they share the
 * spare width from zero; the text columns keep their one-line header width.
 */
const columns = [
  'minmax(max-content, 1.6fr)', 'max-content', 'max-content',
  ...thresholds.map(() => 'minmax(0, 1fr)'),
  'max-content',
];

/** The NAV day every enabled company is on (the open NAV day in the frames). */
const NAV_DAY = 'Sep 22, 2026';

function AlexandriaModal({ company, onClose }: { company: string; onClose: () => void }) {
  const [query, setQuery] = useState('');
  return (
    <Modal
      open
      size="m"
      onClose={onClose}
      title={`Alexandria company — ${company}`}
      footer={<Button variant="tertiary" onClick={onClose}>Done</Button>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
        <Text step="m" tone="secondary">Not linked to an external company profile.</Text>
        <FormField helperText="Defaults to this company's name and website. Names are matched literally, so try a legal or alternate name if there is no hit.">
          <Input
            aria-label="Search by company name"
            placeholder="Search by company name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leadingIcon={<Icon size="s" tone="secondary"><icons.Search /></Icon>}
          />
        </FormField>
        <Alert style="info">No match in external company database. Try the company's legal or alternate name.</Alert>
      </div>
    </Modal>
  );
}

export function DailyNavCompanies({ state }: ScreenProps) {
  const [linking, setLinking] = useState<string | undefined>(state === 'alexandria-modal' ? 'ABC Co' : undefined);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  useEffect(() => setLinking(state === 'alexandria-modal' ? 'ABC Co' : undefined), [state]);

  const all = useMemo(() => db.companies.all(), []);
  const { rows, total } = db.companies.page((page - 1) * perPage, perPage, all);
  const pageCount = Math.max(1, Math.ceil(total / perPage));

  return (
    <FirmSettingsFrame
      tab="dailyNavCompanies"
      saveDisabled
      overlay={linking && <AlexandriaModal company={linking} onClose={() => setLinking(undefined)} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
        <Heading level={1} step="l">Daily NAV Companies</Heading>
        <Text step="s" tone="secondary">
          Enable Daily NAV per company, override alert thresholds, and link the Alexandria profile. Empty threshold cells
          inherit the firm default. <Link size="s" href={href(routes.firmSettings.dailyNav)}>Edit firm defaults.</Link>
        </Text>
      </div>
      <DataGrid
        label="Daily NAV companies"
        columns={columns}
        head={
          <>
            <ColumnHeader>Company</ColumnHeader>
            <ColumnHeader>NAV day</ColumnHeader>
            <ColumnHeader>Enabled</ColumnHeader>
            {thresholds.map((t) => <ColumnHeader key={t.key}>{t.label}</ColumnHeader>)}
            <ColumnHeader>Alexandria</ColumnHeader>
          </>
        }
      >
        {rows.map((c, i) => {
          const on = enabled[c.id] ?? c.dailyNav;
          return (
            <Row key={c.id} zebra={i % 2 === 1}>
              <RowHeader href={href(routes.company.dailyNavSettings(c.id))}>{c.name}</RowHeader>
              <Cell>
                {on ? <Chip size="s" styleVariant="positive">{NAV_DAY}</Chip> : <Text as="span" step="s" tone="tertiary">Off</Text>}
              </Cell>
              <Cell>
                <CheckboxItem
                  size="s"
                  checked={on}
                  aria-label={`Daily NAV enabled for ${c.name}`}
                  onChange={(e) => setEnabled((m) => ({ ...m, [c.id]: e.target.checked }))}
                />
              </Cell>
              {thresholds.map((t) => (
                <Cell key={t.key} type="input">
                  <Input aria-label={`${c.name} ${t.label}`} placeholder={t.inherit} inputMode="decimal" disabled={!on} />
                </Cell>
              ))}
              <Cell>
                <Button variant="tertiary" size="s" onClick={() => setLinking(c.name)}>Set</Button>
              </Cell>
            </Row>
          );
        })}
      </DataGrid>
      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        rowsPerPage={perPage}
        onRowsPerPageChange={(n) => { setPerPage(n); setPage(1); }}
      />
    </FirmSettingsFrame>
  );
}
