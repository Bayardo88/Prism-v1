import { useEffect, useState } from 'react';
import {
  Alert, Button, Cell, CheckboxItem, Chip, ColumnHeader, DataGrid, FormField, Heading, Icon, Input, Link, Modal,
  Row, Text, glyphs, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { FirmSettingsFrame } from './FirmSettingsFrame.js';
import { dailyNavCompanies } from './data.js';

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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

const col = {
  company: { flex: 1.6 },
  day: { flex: 1.1 },
  enabled: { flex: 0.7 },
  threshold: { flex: 1.2 },
  alexandria: { flex: 0.8 },
};

function AlexandriaModal({ company, onClose }: { company: string; onClose: () => void }) {
  const [query, setQuery] = useState('');
  return (
    <Modal
      open
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
            leadingIcon={<Icon size="s" tone="secondary"><glyphs.Search /></Icon>}
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
  useEffect(() => setLinking(state === 'alexandria-modal' ? 'ABC Co' : undefined), [state]);

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
        head={
          <>
            <ColumnHeader style={col.company}>Company</ColumnHeader>
            <ColumnHeader style={col.day}>NAV day</ColumnHeader>
            <ColumnHeader style={col.enabled}>Enabled</ColumnHeader>
            {thresholds.map((t) => <ColumnHeader key={t.key} style={col.threshold}>{t.label}</ColumnHeader>)}
            <ColumnHeader style={col.alexandria}>Alexandria</ColumnHeader>
          </>
        }
      >
        {dailyNavCompanies.map((c, i) => {
          const id = c.id ?? slug(c.name);
          const on = enabled[id] ?? true;
          return (
            <Row key={id} zebra={i % 2 === 1}>
              <Cell style={col.company}>
                <Link size="s" href={href(routes.company.dailyNavSettings(id))}>{c.name}</Link>
              </Cell>
              <Cell style={col.day}><Chip size="s" styleVariant="positive">Sep 22, 2026</Chip></Cell>
              <Cell style={col.enabled}>
                <CheckboxItem
                  size="s"
                  checked={on}
                  aria-label={`Daily NAV enabled for ${c.name}`}
                  onChange={(e) => setEnabled((m) => ({ ...m, [id]: e.target.checked }))}
                />
              </Cell>
              {thresholds.map((t) => (
                <Cell key={t.key} type="input" style={col.threshold}>
                  <Input aria-label={`${c.name} ${t.label}`} placeholder={t.inherit} inputMode="decimal" disabled={!on} />
                </Cell>
              ))}
              <Cell style={col.alexandria}>
                <Button variant="tertiary" size="s" onClick={() => setLinking(c.name)}>Set</Button>
              </Cell>
            </Row>
          );
        })}
      </DataGrid>
    </FirmSettingsFrame>
  );
}
