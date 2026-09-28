/**
 * Account — Two-Factor Authentication (Figma 12 · Account Settings). The
 * 2FA switch (locked on when the firm's policy requires it) and the one-time
 * backup codes, with Generate new codes / Download / Print.
 */
import { useState } from 'react';
import {
  Accordion, AccordionItem, Button, CodeGrid, ConfirmationDialog, Icon, Switch, Text, glyphs, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { PageHeader } from '../../shell/PageHeader.js';
import { ACCOUNT_TABS } from './tabs.js';

const INITIAL_CODES = [
  'cfzayoya', 'cn4jucjc', 'prjcxh3b', 'tmohpi2j', '4udlogk7',
  'odkddx2o', 'pplbe5m3', 'nlt2pwam', 'sas6e2nm', 'cy7gqw74',
];

const randomCode = () => Array.from({ length: 8 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');

export function TwoFactor(_props: ScreenProps) {
  const [codes, setCodes] = useState(INITIAL_CODES);
  const [confirming, setConfirming] = useState(false);

  const download = () => {
    const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'scalar-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <AppFrame area="settings">
      <PageHeader title="Account" tabs={ACCOUNT_TABS} current="two-factor" />
      <PageBody>
        <Accordion>
          <AccordionItem title="Activate/Deactivate Two Factor Authentication" defaultOpen>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.m, paddingBottom: space.l }}>
              <Text step="s" tone="secondary">
                Your organization requires two-factor authentication. You cannot turn it off while this policy is in effect.
              </Text>
              <Switch checked disabled readOnly>Enable Two Factor Authentication</Switch>
            </div>
          </AccordionItem>
          <AccordionItem title="Two Factor Authentication Backup Codes" defaultOpen>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.xl, alignItems: 'start', paddingBottom: space.l }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
                <Text step="m">Keep these codes safe, but accessible.</Text>
                <Text step="s" tone="secondary">
                  If you lose access to your authentication device, you can use one of these backup codes to sign in to
                  your account. Each code may be used only once. Make a copy of these codes and store it somewhere safe.
                </Text>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: space.m }}>
                <CodeGrid
                  codes={codes}
                  actions={
                    <>
                      <Button variant="tertiary" onClick={download} leadingIcon={<Icon size="s" tone="inherit"><glyphs.Download /></Icon>}>Download codes</Button>
                      <Button variant="tertiary" onClick={() => window.print()}>Print codes</Button>
                    </>
                  }
                />
                <Button
                  variant="secondary"
                  leadingIcon={<Icon size="s" tone="inherit"><glyphs.Refresh /></Icon>}
                  onClick={() => setConfirming(true)}
                >
                  Generate new codes
                </Button>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </PageBody>
      <ConfirmationDialog
        open={confirming}
        title="Generate new backup codes?"
        confirmLabel="Generate new codes"
        onCancel={() => setConfirming(false)}
        onConfirm={() => { setCodes(codes.map(randomCode)); setConfirming(false); }}
      >
        Your current codes stop working as soon as new ones are generated. Download or print the new set before you leave this page.
      </ConfirmationDialog>
    </AppFrame>
  );
}
