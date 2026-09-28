/**
 * Shared chrome for every Firm Settings tab: the Primary Menu (no area lit),
 * the "Firm Settings" page header with its seven section tabs, and the page
 * Save action. Each tab screen passes its body and, when a Figma state shows
 * one, a screen-level overlay.
 */
import type { ReactNode } from 'react';
import { Button, color, elevation, radius, space } from '@scalar/design-system';
import { AppFrame } from '../../shell/AppFrame.js';
import { PageHeader, type PageTab } from '../../shell/PageHeader.js';
import { routes } from '../../routes.js';

export type FirmSettingsTab = 'profile' | 'sso' | 'scim' | 'dailyNav' | 'dailyNavCompanies' | 'scalarAi' | 'settings';

export const firmSettingsTabs: PageTab[] = [
  { key: 'profile', label: 'Firm Profile', to: routes.firmSettings.profile },
  { key: 'sso', label: 'Single Sign-On', to: routes.firmSettings.sso },
  { key: 'scim', label: 'SCIM', to: routes.firmSettings.scim },
  { key: 'dailyNav', label: 'Daily NAV Settings', to: routes.firmSettings.dailyNav },
  { key: 'dailyNavCompanies', label: 'Daily NAV Companies', to: routes.firmSettings.dailyNavCompanies },
  { key: 'scalarAi', label: 'Scalar AI', to: routes.firmSettings.scalarAi },
  { key: 'settings', label: 'Settings', to: routes.firmSettings.settings },
];

export function FirmSettingsFrame({ tab, children, overlay, saveDisabled }: {
  tab: FirmSettingsTab;
  children?: ReactNode;
  overlay?: ReactNode;
  /** Daily NAV tabs disable Save until something changes ("No changes to save"). */
  saveDisabled?: boolean;
}) {
  return (
    <AppFrame area="settings" overlay={overlay}>
      <PageHeader
        title="Firm Settings"
        tabs={firmSettingsTabs}
        current={tab}
        actions={<Button variant="primary" tone="positive" size="m" disabled={saveDisabled}>Save</Button>}
      />
      <main style={{ padding: space.l, display: 'flex', flexDirection: 'column', gap: space.xl, flex: 1 }}>
        {children}
      </main>
    </AppFrame>
  );
}

/** A raised side panel (Service Provider Metadata, SCIM tokens, Version History). */
export function SidePanel({ children, label }: { children?: ReactNode; label: string }) {
  return (
    <section
      aria-label={label}
      style={{
        display: 'flex', flexDirection: 'column', gap: space.m, padding: space.xl,
        background: color.bg.surface, border: `1px solid ${color.stroke.subtle}`,
        borderRadius: radius.s, boxShadow: elevation.raised,
      }}
    >
      {children}
    </section>
  );
}

/** Two-column settings layout: a form column and a side panel column. */
export function TwoColumn({ left, right, ratio = '1fr 1fr' }: { left: ReactNode; right?: ReactNode; ratio?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: ratio, gap: space['3xl'], alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.l, minWidth: 0 }}>{left}</div>
      {right && <div style={{ display: 'flex', flexDirection: 'column', gap: space.l, minWidth: 0 }}>{right}</div>}
    </div>
  );
}

/** A horizontal rule between form sections. */
export function SectionRule() {
  return <hr style={{ border: 0, borderTop: `1px solid ${color.stroke.divider}`, margin: 0, width: '100%' }} />;
}
