/**
 * Firm-level page header: title, an optional row of section tabs (Secondary
 * Menu items, e.g. Firm Settings → Profile / SSO / SCIM …) and page actions.
 */
import type { ReactNode } from 'react';
import { Heading, SecondaryMenu, SecondaryMenuItem, color, space } from '@scalar/design-system';
import { href } from '../router.js';

export interface PageTab {
  key: string;
  label: string;
  to: string;
}

export function PageHeader({ title, tabs, current, actions }: {
  title: ReactNode;
  tabs?: PageTab[];
  current?: string;
  actions?: ReactNode;
}) {
  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', gap: space.l,
        padding: `${space.s} ${space.l}`, background: color.bg.surface,
        borderBottom: `1px solid ${color.stroke.divider}`,
      }}
    >
      <Heading level={1} step="l">{title}</Heading>
      {tabs && (
        <SecondaryMenu>
          {tabs.map((t) => (
            <SecondaryMenuItem key={t.key} current={t.key === current} href={href(t.to)}>{t.label}</SecondaryMenuItem>
          ))}
        </SecondaryMenu>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: space.s }}>{actions}</div>
    </header>
  );
}
