/**
 * Account — Settings (Figma 12 · Account Settings: "Account — Settings").
 * The signed-in user's personal data, email preferences, UI zoom, connected
 * apps and profile picture. Reached from the avatar → user menu → Account.
 */
import { useState } from 'react';
import {
  AppFooter, Button, ButtonIcon, Checkbox, Dropzone, FloatingLabelInput, Heading, Icon, ImageCropField, Label, Select, Text,
  color, icons, radius, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { PageHeader } from '../../shell/PageHeader.js';
import { user } from '../../data/fixtures.js';
import { ACCOUNT_TABS } from './tabs.js';

const [firstName = '', ...rest] = user.name.split(' ');
const lastName = rest.join(' ');

export function AccountSettings(_props: ScreenProps) {
  const [dirty, setDirty] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [features, setFeatures] = useState(true);
  const [uploads, setUploads] = useState(true);
  const [zoom, setZoom] = useState('85%');
  const [picture, setPicture] = useState<string | undefined>(undefined);
  const [pictureZoom, setPictureZoom] = useState(1);
  const touch = () => setDirty(true);

  return (
    <AppFrame area="settings">
      <PageHeader
        title="Account"
        tabs={ACCOUNT_TABS}
        current="settings"
        actions={<Button variant="primary" tone="positive" disabled={!dirty} onClick={() => setDirty(false)}>Save</Button>}
      />
      <PageBody>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.xl, alignItems: 'start' }}>
          <section aria-labelledby="personal-data" style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
            <Heading level={2} step="m" id="personal-data">Personal Data</Heading>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.m }}>
              <FloatingLabelInput label="First name" defaultValue={firstName} onChange={touch} />
              <FloatingLabelInput label="Last name" defaultValue={lastName} onChange={touch} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.m }}>
              <FloatingLabelInput label="Email" type="email" defaultValue={user.email} onChange={touch} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.m }}>
              <Button
                variant="secondary"
                leadingIcon={<Icon size="s" tone="inherit"><icons.Mail /></Icon>}
                onClick={() => setResetSent(true)}
              >
                Send password reset email
              </Button>
              {resetSent && (
                <Text step="s" tone="positive" role="status">
                  <Icon size="xs" tone="positive"><icons.CheckCircle /></Icon> Reset link sent to {user.email}
                </Text>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Checkbox checked={features} onChange={(e) => { setFeatures(e.target.checked); touch(); }}>
                Receive email notifications of new features
              </Checkbox>
              <Checkbox checked={uploads} onChange={(e) => { setUploads(e.target.checked); touch(); }}>
                Receive email notifications of all document uploads
              </Checkbox>
            </div>
            <div
              style={{
                display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: space.s,
                padding: `${space.s} ${space.m}`, background: color.bg.surface,
                border: `1px solid ${color.stroke.subtle}`, borderRadius: radius.s,
              }}
            >
              <Label htmlFor="body-zoom" step="s" tone="secondary">Application body zoom:</Label>
              <Select id="body-zoom" value={zoom} onChange={(e) => setZoom(e.target.value)}>
                {['75%', '85%', '100%', '110%', '125%'].map((z) => <option key={z}>{z}</option>)}
              </Select>
              <ButtonIcon
                variant="tertiary"
                label="Fit to screen"
                onClick={() => setZoom('100%')}
                icon={<Icon size="s" tone="inherit"><icons.FitScreen /></Icon>}
              />
            </div>
            <section aria-labelledby="connected-apps" style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
              <Heading level={2} step="m" id="connected-apps">Connected Apps</Heading>
              <Text step="s" tone="secondary">No connected apps. Connect an MCP-compatible application to see it here.</Text>
            </section>
            <AppFooter version="v8.12.4">© Scalar Technologies 2026</AppFooter>
          </section>

          <section aria-labelledby="profile-picture" style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
            <Heading level={2} step="m" id="profile-picture">Profile Picture</Heading>
            <Dropzone
              accept=".jpg,.jpeg"
              hint="15 MB max file size. JPG format file."
              prompt={(browse) => <>Drag &amp; Drop Profile Picture or {browse('Select a file')}</>}
              onFiles={(files) => {
                const f = files[0];
                if (!f) return;
                if (picture) URL.revokeObjectURL(picture);
                setPicture(URL.createObjectURL(f));
                setPictureZoom(1);
                touch();
              }}
            />
            {picture && (
              <ImageCropField
                label="Profile picture"
                src={picture}
                zoom={pictureZoom}
                onZoomChange={(z) => { setPictureZoom(z); touch(); }}
                onRemove={() => { URL.revokeObjectURL(picture); setPicture(undefined); touch(); }}
              />
            )}
          </section>
        </div>
      </PageBody>
    </AppFrame>
  );
}
