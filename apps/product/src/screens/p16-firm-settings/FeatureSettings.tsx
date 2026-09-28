import {
  Checkbox, Heading, Icon, Tooltip, icons, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { FirmSettingsFrame } from './FirmSettingsFrame.js';

const features = [
  { label: 'Require 2FA for all Users', on: false, help: 'Every user must set up two-factor authentication before their next sign-in.' },
  { label: 'Show Process Management Columns', on: true, help: 'Adds status, owner and due-date columns to the Valuations list.' },
  { label: 'Enable Daily NAV', on: true, help: 'Turns on Daily NAV monitoring and its settings tabs for this firm.' },
  { label: 'Enter values using number format selected', on: false, help: 'Typed figures follow the page number format (thousands, millions) instead of whole units.' },
];

export function FeatureSettings(_: ScreenProps) {
  return (
    <FirmSettingsFrame tab="settings">
      <section style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
        <Heading level={1} step="l">Feature Settings</Heading>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {features.map((f) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: space.xs }}>
              <Checkbox defaultChecked={f.on}>{f.label}</Checkbox>
              <Tooltip content={f.help} position="right">
                <button type="button" aria-label={`About: ${f.label}`} style={{ display: 'inline-flex', background: 'none', border: 0, padding: 0, cursor: 'help' }}>
                  <Icon size="s" tone="secondary"><icons.Help /></Icon>
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      </section>
    </FirmSettingsFrame>
  );
}
