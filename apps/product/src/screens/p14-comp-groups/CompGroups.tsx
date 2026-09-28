import { useEffect, useState } from 'react';
import {
  AccordionItem, Button, DataGrid, Fab, GridColumnHeader, GridValueCell, Icon, InlineEdit, InlinePicker, Row,
  RowLabelCell, Scrim, SelectMenu, SelectMenuOption, SpeedDial, SpeedDialItem, Text, color, elevation, icons, radius, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame } from '../../shell/AppFrame.js';
import { PageHeader } from '../../shell/PageHeader.js';
import { initialGroups, versions, type CompGroup } from './data.js';

function VersionPicker() {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState(versions[0]!);
  return (
    <>
      <InlinePicker label="Previous versions" secondary={v.version} open={open} onClick={() => setOpen((o) => !o)}>
        {v.date}
      </InlinePicker>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 20 }}>
          <SelectMenu label="Previous versions">
            {versions.map((x) => (
              <SelectMenuOption key={x.version} selected={x.version === v.version} onSelect={() => { setV(x); setOpen(false); }}>
                {x.date} | {x.version}
              </SelectMenuOption>
            ))}
          </SelectMenu>
        </div>
      )}
    </>
  );
}

function GroupPanel({ group, onChange, onDelete }: {
  group: CompGroup;
  onChange: (g: CompGroup) => void;
  onDelete: () => void;
}) {
  const isPublic = group.kind === 'public';
  const kindLabel = isPublic ? 'Public Comp Group' : 'Transaction Comp Group';
  return (
    <section
      style={{
        background: color.bg.surface, border: `1px solid ${color.stroke.subtle}`, borderRadius: radius.s,
        boxShadow: elevation.raised,
      }}
    >
      <AccordionItem
        defaultOpen
        title={group.name
          ? <><Text as="span" step="m" weight="semiBold">{group.name}</Text><Text as="span" step="m" tone="secondary"> | {kindLabel}</Text></>
          : <Text as="span" step="m" tone="secondary">{kindLabel}</Text>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.xl, padding: `0 ${space.s} ${space.s}` }}>
          <div style={{ width: '35%' }}>
            <DataGrid label={`${kindLabel} details`} columns={['minmax(max-content, 1fr)', 'minmax(max-content, 1fr)']}>
              <Row>
                <RowLabelCell type="subtotal">Name</RowLabelCell>
                <GridValueCell kind="editable">
                  <InlineEdit label="Comp group name" placeholder="Enter name" value={group.name} onCommit={(name) => onChange({ ...group, name })} />
                </GridValueCell>
              </Row>
              {isPublic && group.name && (
                <Row>
                  <RowLabelCell type="subtotal">Previous Versions</RowLabelCell>
                  <GridValueCell><VersionPicker /></GridValueCell>
                </Row>
              )}
            </DataGrid>
          </div>

          {isPublic && group.companies.length > 0 && (
            <div style={{ width: '35%' }}>
              <DataGrid
                label={`${group.name} comparable companies`}
                head={
                  <>
                    <GridColumnHeader grow={2}>Company</GridColumnHeader>
                    <GridColumnHeader numeric>Symbol</GridColumnHeader>
                    <GridColumnHeader numeric>Capital IQ ID</GridColumnHeader>
                  </>
                }
              >
                {group.companies.map((c) => (
                  <Row key={c.ciq}>
                    <RowLabelCell>{c.name}</RowLabelCell>
                    <GridValueCell>{c.symbol}</GridValueCell>
                    <GridValueCell>{c.ciq}</GridValueCell>
                  </Row>
                ))}
              </DataGrid>
            </div>
          )}

          <div style={{ display: 'flex', gap: space.l }}>
            <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}>
              {isPublic ? 'Add comparable company' : 'Add comparable transaction'}
            </Button>
            <Button variant="secondary" tone="negative" leadingIcon={<Icon size="s" tone="inherit"><icons.Remove /></Icon>} onClick={onDelete}>
              Delete group
            </Button>
          </div>
        </div>
      </AccordionItem>
    </section>
  );
}

export function CompGroups({ state }: ScreenProps) {
  const [groups, setGroups] = useState<CompGroup[]>(() => initialGroups(state));
  const [dialOpen, setDialOpen] = useState(state === 'speed-dial');
  useEffect(() => { setGroups(initialGroups(state)); setDialOpen(state === 'speed-dial'); }, [state]);

  const add = (kind: CompGroup['kind']) => {
    setGroups((gs) => [...gs, { id: `new-${Date.now()}`, kind, name: '', companies: [] }]);
    setDialOpen(false);
  };

  const fab = (
    <Fab hasMenu open={dialOpen} fixed={!dialOpen} onClick={() => setDialOpen((o) => !o)}>
      Add comp group
    </Fab>
  );

  return (
    <AppFrame
      area="settings"
      overlay={dialOpen ? (
        <>
          <Scrim onDismiss={() => setDialOpen(false)} />
          <div style={{ position: 'fixed', right: space.xl, bottom: space.xl, zIndex: 'var(--z-overlay)' }}>
            <SpeedDial label="Add comp group" trigger={fab}>
              <SpeedDialItem onClick={() => add('public')}>Add public comp group</SpeedDialItem>
              <SpeedDialItem onClick={() => add('transaction')}>Add transaction comp group</SpeedDialItem>
            </SpeedDial>
          </div>
        </>
      ) : fab}
    >
      <PageHeader title="Comp Groups" actions={<Button variant="primary" tone="positive">Save</Button>} />
      <main style={{ padding: space.l, display: 'flex', flexDirection: 'column', gap: space.xl, flex: 1 }}>
        {groups.map((g) => (
          <GroupPanel
            key={g.id}
            group={g}
            onChange={(next) => setGroups((gs) => gs.map((x) => (x.id === g.id ? next : x)))}
            onDelete={() => setGroups((gs) => gs.filter((x) => x.id !== g.id))}
          />
        ))}
      </main>
    </AppFrame>
  );
}
