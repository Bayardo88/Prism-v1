import { useEffect, useState, type ReactNode } from 'react';
import {
  AccordionItem, Button, ContextMenu, Fab, GridColumnHeader, GridValueCell, Icon, InlineEdit, InlinePicker, MenuItem,
  RowLabelCell, Scrim, SpeedDial, SpeedDialItem, Text, color, elevation, glyphs, radius, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame } from '../../shell/AppFrame.js';
import { PageHeader } from '../../shell/PageHeader.js';
import { initialGroups, versions, type CompGroup } from './data.js';

/** A label/value pair in the group's key-value block. */
function KeyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="row" style={{ display: 'contents' }}>
      <RowLabelCell type="subtotal">{label}</RowLabelCell>
      <div role="gridcell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }}>{children}</div>
    </div>
  );
}

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
          <ContextMenu label="Previous versions">
            {versions.map((x) => (
              <MenuItem key={x.version} selected={x.version === v.version} onClick={() => { setV(x); setOpen(false); }}>
                {x.date} | {x.version}
              </MenuItem>
            ))}
          </ContextMenu>
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
          <div role="grid" aria-label={`${kindLabel} details`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '35%' }}>
            <KeyRow label="Name">
              <InlineEdit label="Comp group name" placeholder="Enter name" value={group.name} onCommit={(name) => onChange({ ...group, name })} />
            </KeyRow>
            {isPublic && group.name && (
              <KeyRow label="Previous Versions"><VersionPicker /></KeyRow>
            )}
          </div>

          {isPublic && group.companies.length > 0 && (
            <div role="grid" aria-label={`${group.name} comparable companies`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', width: '35%' }}>
              <div role="row" style={{ display: 'contents' }}>
                <GridColumnHeader>Company</GridColumnHeader>
                <GridColumnHeader numeric>Symbol</GridColumnHeader>
                <GridColumnHeader numeric>Capital IQ ID</GridColumnHeader>
              </div>
              {group.companies.map((c) => (
                <div role="row" key={c.ciq} style={{ display: 'contents' }}>
                  <RowLabelCell>{c.name}</RowLabelCell>
                  <GridValueCell>{c.symbol}</GridValueCell>
                  <GridValueCell>{c.ciq}</GridValueCell>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: space.l }}>
            <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><glyphs.Plus /></Icon>}>
              {isPublic ? 'Add comparable company' : 'Add comparable transaction'}
            </Button>
            <Button variant="secondary" tone="negative" leadingIcon={<Icon size="s" tone="inherit"><glyphs.Minus /></Icon>} onClick={onDelete}>
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
