import { useEffect, useState } from 'react';
import { Checkbox, FloatingLabelSelect, Heading, Icon, SelectMenu, SelectMenuOption, icons, space } from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { FirmSettingsFrame, MenuAnchor } from './FirmSettingsFrame.js';
import { effortLevels, premiumEfforts, type Effort } from './data.js';

type Open = 'max' | 'default' | undefined;
const fromState = (s: string): Open => (s === 'max-menu' ? 'max' : s === 'default-menu' ? 'default' : undefined);

export function ScalarAi({ state }: ScreenProps) {
  const [open, setOpen] = useState<Open>(fromState(state));
  const [max, setMax] = useState<Effort>('Fastest');
  const [def, setDef] = useState<Effort>('Fastest');
  useEffect(() => setOpen(fromState(state)), [state]);

  const rank = (e: Effort) => effortLevels.indexOf(e);
  /** The effort list. With a cap, options above it are disabled — the default can never exceed the maximum. */
  const menu = (label: string, value: Effort, onPick: (e: Effort) => void, cap?: Effort) => (
    <MenuAnchor>
      <SelectMenu label={label}>
        {effortLevels.map((e) => (
          <SelectMenuOption
            key={e}
            selected={e === value}
            active={e === value}
            disabled={cap ? rank(e) > rank(cap) : false}
            onSelect={() => onPick(e)}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: space.xs }}>
              {e}
              {premiumEfforts.includes(e) && (
                <Icon size="s" tone="brand" label="Uses extra AI credits"><icons.Paid /></Icon>
              )}
            </span>
          </SelectMenuOption>
        ))}
      </SelectMenu>
    </MenuAnchor>
  );
  const toggle = (which: Exclude<Open, undefined>) => (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setOpen((o) => (o === which ? undefined : which));
  };

  return (
    <FirmSettingsFrame tab="scalarAi">
      <section style={{ display: 'flex', flexDirection: 'column', gap: space.l, width: '30%', minWidth: '0' }}>
        <Heading level={1} step="l">Scalar AI</Heading>
        <div style={{ position: 'relative' }}>
          <FloatingLabelSelect
            label="Maximum Allowed Effort"
            value={max}
            onMouseDown={toggle('max')}
            onChange={(e) => setMax(e.target.value as Effort)}
            aria-expanded={open === 'max'}
          >
            {effortLevels.map((e) => <option key={e}>{e}</option>)}
          </FloatingLabelSelect>
          {open === 'max' && menu('Maximum Allowed Effort', max, (next) => {
            setMax(next);
            if (rank(def) > rank(next)) setDef(next);
            setOpen(undefined);
          })}
        </div>
        <div style={{ position: 'relative' }}>
          <FloatingLabelSelect
            label="Default Selected Effort"
            value={def}
            onMouseDown={toggle('default')}
            onChange={(e) => setDef(e.target.value as Effort)}
            aria-expanded={open === 'default'}
            helperText={open === 'default' ? `Capped at the maximum allowed effort (${max}).` : undefined}
          >
            {effortLevels.map((e) => <option key={e} disabled={rank(e) > rank(max)}>{e}</option>)}
          </FloatingLabelSelect>
          {open === 'default' && menu('Default Selected Effort', def, (next) => { setDef(next); setOpen(undefined); }, max)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Checkbox>Enable Document Auto-Classification</Checkbox>
          <Checkbox defaultChecked>Enable MCP (Claude Desktop Integration)</Checkbox>
        </div>
      </section>
    </FirmSettingsFrame>
  );
}
