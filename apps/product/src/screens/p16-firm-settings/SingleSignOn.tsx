import { useEffect, useState } from 'react';
import {
  Checkbox, CopyField, FloatingLabelInput, FormField, Heading, Label, Select, SelectMenu, SelectMenuOption, TagInput, Text, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { FirmSettingsFrame, MenuAnchor, SidePanel, TwoColumn } from './FirmSettingsFrame.js';
import { firmRoles, sso } from './data.js';

export function SingleSignOn({ state }: ScreenProps) {
  const [roleOpen, setRoleOpen] = useState(state === 'role-menu');
  const [role, setRole] = useState('Analyst');
  const [domains, setDomains] = useState<string[]>([]);
  useEffect(() => setRoleOpen(state === 'role-menu'), [state]);

  return (
    <FirmSettingsFrame tab="sso">
      <TwoColumn
        left={
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
              <Heading level={2} step="l">Single Sign-On Settings</Heading>
              <Text step="m" tone="secondary">Enter your Identity Provider metadata URL to configure single sign-on.</Text>
            </div>
            <FloatingLabelInput label="Metadata URL *" type="url" required />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Checkbox>Enforced SSO</Checkbox>
              <Checkbox>Just In Time (JIT) Provisioning</Checkbox>
            </div>
            <div style={{ position: 'relative' }}>
              <FormField label="Default firm role" helperText="Firm role provisioned for new users">
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onMouseDown={(e) => { e.preventDefault(); setRoleOpen((o) => !o); }}
                  aria-expanded={roleOpen}
                >
                  {firmRoles.map((r) => <option key={r}>{r}</option>)}
                </Select>
              </FormField>
              {roleOpen && (
                <MenuAnchor>
                  <SelectMenu label="Default firm role">
                    {firmRoles.map((r) => (
                      <SelectMenuOption key={r} selected={r === role} active={r === role} onSelect={() => { setRole(r); setRoleOpen(false); }}>
                        {r}
                      </SelectMenuOption>
                    ))}
                  </SelectMenu>
                </MenuAnchor>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
              <Label step="l" weight="semiBold" as="span">Associated email domains</Label>
              <TagInput
                label="Associated email domains"
                prefix="@"
                placeholder="Add a domain"
                values={domains}
                onChange={setDomains}
                validate={(v) => (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(v) ? undefined : 'Enter a domain such as spatical.com')}
              />
              <Text step="s" tone="tertiary">Press Enter to add domain</Text>
            </div>
          </>
        }
        right={
          <SidePanel label="Service Provider Metadata">
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
              <Heading level={2} step="m">Service Provider Metadata</Heading>
              <Text step="s" tone="secondary">
                Use this information to configure your identity provider to enable Single Sign-On (SSO) for your firm.
              </Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
              <Label step="l" weight="semiBold" as="span">Assertion Consumer Service (ACS) URL</Label>
              <CopyField label="Assertion Consumer Service (ACS) URL" value={sso.acsUrl} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
              <Label step="l" weight="semiBold" as="span">Service Provider Entity ID</Label>
              <CopyField label="Service Provider Entity ID" value={sso.entityId} />
            </div>
          </SidePanel>
        }
      />
    </FirmSettingsFrame>
  );
}
