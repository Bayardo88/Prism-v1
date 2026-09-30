/**
 * Firm-level page header: the Secondary Menu bar. The page title, an optional
 * filter, an optional row of section tabs (Secondary Menu items, e.g. Firm
 * Settings → Profile / SSO / SCIM …) and the page actions on the right.
 */
import { useState, type ReactNode } from 'react';
import { CompanyInfo, Icon, SecondaryMenu, SecondaryMenuItem, icons } from '@scalar/design-system';
import { href } from '../router.js';

export interface PageTab {
  key: string;
  label: string;
  to: string;
}

export function PageHeader({ title, tabs, current, filter, actions, trailing, pin = true }: {
  title: ReactNode;
  tabs?: PageTab[];
  current?: string;
  /** A FilterDropdown beside the title, e.g. Filter by Fund. */
  filter?: ReactNode;
  actions?: ReactNode;
  /** After the pin, at the far right: the page's ⋮ actions. */
  trailing?: ReactNode;
  /** The pin that keeps this page's bar in place. On by default. */
  pin?: boolean;
}) {
  const [pinned, setPinned] = useState(false);
  return (
    <CompanyInfo
      name={title}
      filter={filter}
      end={
        <>
          {actions}
          {pin && (
            <button type="button" className="scalar-company-info__pin" aria-pressed={pinned} aria-label="Pin this page" onClick={() => setPinned((p) => !p)}>
              <Icon size="s" tone="inherit"><icons.Keep /></Icon>
            </button>
          )}
          {trailing}
        </>
      }
    >
      {tabs && (
        <SecondaryMenu>
          {tabs.map((t) => (
            <SecondaryMenuItem key={t.key} current={t.key === current} href={href(t.to)}>{t.label}</SecondaryMenuItem>
          ))}
        </SecondaryMenu>
      )}
    </CompanyInfo>
  );
}
