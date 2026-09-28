import { useEffect, useState } from 'react';
import {
  AccordionItem, Button, Cell, Checkbox, ColumnHeader, CopyField, DataGrid, Heading, Icon, Input, Label,
  Overline, Pagination, RepeatableRow, Row, Select, Text, Tooltip, color, glyphs, radius, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { FirmSettingsFrame, SectionRule, SidePanel, TwoColumn } from './FirmSettingsFrame.js';
import { firmRoles, scim } from './data.js';

interface Mapping { id: number; group: string; role: string }

const initial = (added: boolean): Mapping[] => [
  ...scim.mappings.map((m, i) => ({ id: i, ...m })),
  ...(added ? [{ id: 99, group: '', role: 'Analyst' }] : []),
];

export function Scim({ state }: ScreenProps) {
  const [rows, setRows] = useState<Mapping[]>(() => initial(state === 'mapping-added'));
  const [enabled, setEnabled] = useState(true);
  useEffect(() => setRows(initial(state === 'mapping-added')), [state]);

  const update = (id: number, patch: Partial<Mapping>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const cols = { prefix: { flex: 1 }, created: { flex: 1 }, revoked: { flex: 1 } };

  return (
    <FirmSettingsFrame tab="scim">
      <TwoColumn
        left={
          <>
            <Heading level={2} step="l">SCIM Configuration</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
              <Label step="l" weight="semiBold" as="span">SCIM endpoints base</Label>
              <div style={{ alignSelf: 'flex-start' }}>
                <CopyField label="SCIM endpoints base" value={scim.endpoint} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
              <Label step="l" weight="semiBold" as="span">Enable SCIM</Label>
              <Text step="s" tone="secondary">
                Allows you to automate user provisioning and deprovisioning based on your Identity Provider groups.
              </Text>
              <Checkbox checked={enabled} onChange={(e) => setEnabled(e.target.checked)}>Enabled</Checkbox>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
                <Label step="l" weight="semiBold" as="span">Group Mapping</Label>
                <Tooltip content="Each Identity Provider group is provisioned with the Scalar role it maps to.">
                  <button type="button" aria-label="About group mapping" style={{ display: 'inline-flex', background: 'none', border: 0, padding: 0, cursor: 'help' }}>
                    <Icon size="s" tone="secondary"><glyphs.Info /></Icon>
                  </button>
                </Tooltip>
              </div>
              <Text step="s" tone="secondary">Map your Identity Provider groups to our application roles.</Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space['3xl'], paddingRight: space['3xl'] }}>
                <Overline>Group name</Overline>
                <Overline>Internal role</Overline>
              </div>
              {rows.map((r) => (
                <RepeatableRow key={r.id} removeLabel={`Remove ${r.group || 'new'} mapping`} onRemove={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}>
                  <Input aria-label="Group name" placeholder="e.g. Admins" value={r.group} onChange={(e) => update(r.id, { group: e.target.value })} />
                  <span style={{ flex: '0 0 auto', display: 'inline-flex' }} aria-hidden>
                    <Icon size="s" tone="secondary"><glyphs.ArrowRight /></Icon>
                  </span>
                  <Select aria-label={`Internal role for ${r.group || 'new group'}`} value={r.role} onChange={(e) => update(r.id, { role: e.target.value })}>
                    {firmRoles.map((x) => <option key={x}>{x}</option>)}
                  </Select>
                </RepeatableRow>
              ))}
              <SectionRule />
              <div>
                <Button
                  variant="tertiary"
                  leadingIcon={<Icon size="s" tone="inherit"><glyphs.Plus /></Icon>}
                  onClick={() => setRows((rs) => [...rs, { id: Date.now(), group: '', role: 'Analyst' }])}
                >
                  Add mapping
                </Button>
              </div>
            </div>
          </>
        }
        right={
          <SidePanel label="SCIM Token Management">
            <Heading level={2} step="m">SCIM Token Management</Heading>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.m }}>
              <CopyField label="SCIM token" value={scim.token} secret revealPrefix={10} />
              <Button variant="tertiary">Rotate</Button>
              <Button variant="tertiary" tone="negative">Revoke</Button>
            </div>
            <Text step="s" tone="tertiary">Created at: {scim.tokenCreated}</Text>
            <div>
              <Button variant="primary">Generate new token</Button>
            </div>
            <div style={{ border: `1px solid ${color.stroke.subtle}`, borderRadius: radius.s }}>
              <AccordionItem title="Revoked Tokens" defaultOpen>
                <DataGrid
                  label="Revoked tokens"
                  head={
                    <>
                      <ColumnHeader style={cols.prefix}>Token Prefix</ColumnHeader>
                      <ColumnHeader numeric style={cols.created}>Created At</ColumnHeader>
                      <ColumnHeader numeric style={cols.revoked}>Revoked At</ColumnHeader>
                    </>
                  }
                >
                  {scim.revoked.map((t) => (
                    <Row key={t.prefix}>
                      <Cell style={cols.prefix}>{t.prefix}</Cell>
                      <Cell numeric style={cols.created}>{t.created}</Cell>
                      <Cell numeric style={cols.revoked}>{t.revoked}</Cell>
                    </Row>
                  ))}
                </DataGrid>
                <div style={{ display: 'flex', alignItems: 'center', gap: space.l, paddingTop: space.s }}>
                  <Text step="s" tone="secondary">Rows per page: 5</Text>
                  <Text step="s" tone="secondary">1–1 of 1</Text>
                  <div style={{ marginLeft: 'auto' }}>
                    <Pagination page={1} pageCount={1} onPageChange={() => undefined} />
                  </div>
                </div>
              </AccordionItem>
            </div>
          </SidePanel>
        }
      />
    </FirmSettingsFrame>
  );
}
