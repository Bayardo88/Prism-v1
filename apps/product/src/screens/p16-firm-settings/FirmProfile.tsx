import { useState } from 'react';
import {
  Avatar, ButtonIcon, FloatingLabelInput, FloatingLabelSelect, Heading, Icon, Slider, Text,
  color, glyphs, radius, size, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { firm } from '../../data/fixtures.js';
import { FirmSettingsFrame, TwoColumn } from './FirmSettingsFrame.js';
import { countries, firmProfile } from './data.js';

/** A logo slot: preview well, zoom slider, remove. */
function LogoSlot({ title, kind }: { title: string; kind: 'icon' | 'full' }) {
  const [zoom, setZoom] = useState(35);
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
      <Heading level={2} step="l">{title}</Heading>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '16 / 9',
          background: color.bg.subtle, border: `1px solid ${color.stroke.default}`, borderRadius: radius.s,
        }}
      >
        {kind === 'icon' ? (
          <Avatar size="xl" initials={firm.initials} alt={`${firm.name} icon`} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: space.m, padding: space.l, background: color.bg.surface, borderRadius: radius.xs }}>
            <Avatar size="m" initials={firm.initials} alt="" />
            <Text step="xl" weight="semiBold" as="span">{firm.name}</Text>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: space.s }}>
        <div style={{ flex: 1 }}>
          <Slider
            label={`${title} zoom`}
            min={0}
            max={100}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            minIcon={<Icon size="s" tone="brand"><glyphs.ZoomOut /></Icon>}
            maxIcon={<Icon size="s" tone="brand"><glyphs.Expand /></Icon>}
          />
        </div>
        <ButtonIcon variant="tertiary" tone="negative" label={`Remove ${title.toLowerCase()}`} icon={<Icon size="s" tone="inherit"><glyphs.Trash /></Icon>} />
      </div>
    </section>
  );
}

export function FirmProfile(_: ScreenProps) {
  return (
    <FirmSettingsFrame tab="profile">
      <TwoColumn
        ratio="2fr 1fr"
        left={
          <>
            <Heading level={2} step="l">Firm Information</Heading>
            <FloatingLabelInput label="Name" defaultValue={firm.name} />
            <FloatingLabelInput label="Street Address" defaultValue={firmProfile.street} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: space.m }}>
              <FloatingLabelSelect label="Country *" required defaultValue={firmProfile.country}>
                {countries.map((c) => <option key={c}>{c}</option>)}
              </FloatingLabelSelect>
              <FloatingLabelInput label="State" defaultValue={firmProfile.state} />
              <FloatingLabelInput label="Zip Code" defaultValue={firmProfile.zip} inputMode="numeric" />
            </div>
            <div style={{ height: size.control.l }} aria-hidden />
            <Heading level={2} step="l">Contact Information</Heading>
            <FloatingLabelInput label="Phone Number" type="tel" defaultValue={firmProfile.phone} />
            <FloatingLabelInput label="Website" type="url" defaultValue={firm.website} />
          </>
        }
        right={
          <>
            <LogoSlot title="Firm icon" kind="icon" />
            <LogoSlot title="Firm full logo" kind="full" />
          </>
        }
      />
    </FirmSettingsFrame>
  );
}
