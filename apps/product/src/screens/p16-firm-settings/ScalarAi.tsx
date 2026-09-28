import { useEffect, useState } from 'react';
import { Checkbox, FloatingLabelSelect, Heading, space } from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { FirmSettingsFrame } from './FirmSettingsFrame.js';
import { OptionMenu } from './OptionMenu.js';
import { effortLevels, premiumEfforts, type Effort } from './data.js';

type Open = 'max' | 'default' | undefined;
const fromState = (s: string): Open => (s === 'max-menu' ? 'max' : s === 'default-menu' ? 'default' : undefined);

export function ScalarAi({ state }: ScreenProps) {
  const [open, setOpen] = useState<Open>(fromState(state));
  const [max, setMax] = useState<Effort>('Fastest');
  const [def, setDef] = useState<Effort>('Fastest');
  useEffect(() => setOpen(fromState(state)), [state]);

  const rank = (e: Effort) => effortLevels.indexOf(e);
  const options = (cap?: Effort) => effortLevels.map((e) => ({
    value: e,
    label: e,
    detail: premiumEfforts.includes(e) ? 'Uses extra AI credits' : undefined,
    // The default effort can never exceed the firm's maximum.
    disabled: cap ? rank(e) > rank(cap) : false,
  }));
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
          {open === 'max' && (
            <OptionMenu
              label="Maximum Allowed Effort"
              options={options()}
              value={max}
              onSelect={(v) => {
                const next = v as Effort;
                setMax(next);
                if (rank(def) > rank(next)) setDef(next);
                setOpen(undefined);
              }}
            />
          )}
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
          {open === 'default' && (
            <OptionMenu
              label="Default Selected Effort"
              options={options(max)}
              value={def}
              onSelect={(v) => { setDef(v as Effort); setOpen(undefined); }}
            />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Checkbox>Enable Document Auto-Classification</Checkbox>
          <Checkbox defaultChecked>Enable MCP (Claude Desktop Integration)</Checkbox>
        </div>
      </section>
    </FirmSettingsFrame>
  );
}
