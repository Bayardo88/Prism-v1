/**
 * Create Summary View — name a saved view, pick its columns from the
 * catalogue (left), reorder the selection (right) and set a sort order.
 */
import { useState } from 'react';
import {
  Button, ButtonIcon, Checkbox, FloatingLabelInput, Icon, Label, Modal, ModalSearch, Overline, Text,
  color, icons, radius, space,
} from '@scalar/design-system';
import { columnCatalogue, defaultSelected } from './data.js';

const FIXED = ['Company (Firm Portfolio Summary)', 'Fund (All Funds)'];

export function CreateSummaryView({ open, onClose, name = 'New View (Copy 2)', title = 'Create Summary View', confirm = 'Create' }: {
  open: boolean;
  onClose: () => void;
  name?: string;
  title?: string;
  confirm?: string;
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [query, setQuery] = useState('');
  const toggle = (c: string) => setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  const q = query.trim().toLowerCase();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="l"
      dismissOnScrimClick={false}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose}>{confirm}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
        <Text step="s" tone="secondary">Name your view, choose which columns to display, and drag to reorder them.</Text>
        <FloatingLabelInput label="Name" defaultValue={name} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
          <Label step="m" weight="semiBold">Columns</Label>
          <div
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              border: `1px solid ${color.stroke.default}`, borderRadius: radius.s,
            }}
          >
            {/* Catalogue */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs, padding: space.s, borderRight: `1px solid ${color.stroke.divider}` }}>
              <ModalSearch placeholder="Search columns…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search columns" />
              {columnCatalogue.map((g) => {
                const items = g.items.filter((i) => i.toLowerCase().includes(q));
                if (!items.length) return null;
                return (
                  <div key={g.group} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ paddingTop: space.s }}><Overline>{g.group}</Overline></div>
                    {items.map((i) => (
                      <Checkbox key={i} size="s" checked={selected.includes(i)} onChange={() => toggle(i)}>{i}</Checkbox>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: space['2xs'], padding: space.s }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: space.s }}>
                <Label step="m" weight="semiBold">Selected ({selected.length + FIXED.length})</Label>
                <div style={{ marginLeft: 'auto' }}>
                  <Button variant="tertiary" size="s" onClick={() => setSelected(defaultSelected)}>Reset to defaults</Button>
                </div>
              </div>
              <Text step="s" tone="tertiary">Drag to reorder. Fixed columns stay in place.</Text>
              {[...FIXED, ...selected].map((c) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: space.xs, padding: `${space['2xs']} 0` }}>
                  <Icon size="s" tone="disabled"><icons.DragIndicator /></Icon>
                  <Text step="s">{c}</Text>
                  <div style={{ marginLeft: 'auto' }}>
                    {FIXED.includes(c) ? (
                      <Overline>Fixed</Overline>
                    ) : (
                      <ButtonIcon variant="tertiary" size="s" label={`Remove ${c}`} onClick={() => toggle(c)} icon={<Icon size="s" tone="inherit"><icons.Close /></Icon>} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs, alignItems: 'flex-start' }}>
          <Label step="m" weight="semiBold">Sort order</Label>
          <Text step="s" tone="secondary">Sorting uses the company's total values across all funds, not individual fund-level values.</Text>
          <Button variant="secondary" size="m" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}>Add Sort Key</Button>
        </div>
      </div>
    </Modal>
  );
}
