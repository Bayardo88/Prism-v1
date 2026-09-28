import { useState } from 'react';
import {
  Dropzone, FloatingLabelInput, FloatingLabelSelect, Heading, Icon, ImageCropField, icons, size, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { firm } from '../../data/fixtures.js';
import { FirmSettingsFrame, TwoColumn } from './FirmSettingsFrame.js';
import { countries, firmProfile } from './data.js';

/** A logo slot: ImageCropField preview + zoom + remove, with a Dropzone to upload when empty. */
function LogoSlot({ title, shape }: { title: string; shape: 'square' | 'wide' }) {
  const [src, setSrc] = useState<string | undefined>();
  const [zoom, setZoom] = useState(1.2);
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
      <ImageCropField
        label={title}
        shape={shape}
        src={src}
        alt={`${firm.name} ${title.toLowerCase()}`}
        zoom={zoom}
        onZoomChange={setZoom}
        zoomMin={1}
        zoomMax={3}
        zoomStep={0.1}
        onRemove={src ? () => setSrc(undefined) : undefined}
        removeLabel={`Remove ${title.toLowerCase()}`}
        placeholderIcon={<Icon size="l" tone="secondary"><icons.AccountBalance /></Icon>}
      />
      {!src && (
        <Dropzone
          accept=".png,.jpg,.jpeg,.svg"
          hint="PNG, JPG or SVG · 5 MB max"
          onFiles={(files) => { const f = files[0]; if (f) setSrc(URL.createObjectURL(f)); }}
        />
      )}
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
            <LogoSlot title="Firm icon" shape="square" />
            <LogoSlot title="Firm full logo" shape="wide" />
          </>
        }
      />
    </FirmSettingsFrame>
  );
}
