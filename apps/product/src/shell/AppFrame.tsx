/**
 * The platform chrome every screen sits in: the navy Primary Menu (product
 * areas, company picker, portfolio date, search, notifications, user) and the
 * page body under it.
 *
 * The global menus are real and clickable on every screen — a Figma frame that
 * shows one open (e.g. "Home — Global Search open") just passes `openMenu`.
 */
import { useEffect, useState, type ReactNode } from 'react';
import {
  Avatar, ButtonIcon, CompanyDropdown, Icon, MainMenuItem,
  Notification, PrimaryMenu, ScalarProvider, SearchBar, Selector, Text, icons,
  ToolSwitch, color, space, type ThemeMode, type ToolSwitchValue,
} from '@scalar/design-system';
import { href } from '../router.js';
import { routes } from '../routes.js';
import { portfolioDate, user, type Company } from '../data/fixtures.js';
import { overlays, type GlobalMenu } from './overlays/index.js';

export type Area = 'home' | 'intelligence' | 'valuations' | 'waterfalls' | 'documents' | 'company' | 'settings';

export interface AppFrameProps {
  /** Which Primary Menu item is current. `company` and `settings` light none. */
  area: Area;
  /** Set on company pages: the picker shows the company instead of "Companies". */
  company?: Company;
  /** The Date selector value. Company pages show the company's as-of date. */
  date?: string;
  /** Open a global menu on first render — used by the Figma states that show one. */
  openMenu?: GlobalMenu;
  /** Screen-level overlay (modal, drawer, popover) drawn above the body. */
  overlay?: ReactNode;
  /**
   * Colour mode for this screen. `system` follows the OS. Pin `light` or
   * `dark` when a screen must stay on one theme.
   */
  mode?: ThemeMode;
  children?: ReactNode;
}

export function AppFrame({ area, company, date, openMenu, overlay, mode = 'system', children }: AppFrameProps) {
  const [open, setOpen] = useState<GlobalMenu | undefined>(openMenu);
  const [tool, setTool] = useState<ToolSwitchValue>('valuations');
  useEffect(() => setOpen(openMenu), [openMenu]);

  const toggle = (m: GlobalMenu) => () => setOpen((cur) => (cur === m ? undefined : m));
  const Overlay = open ? overlays[open] : undefined;

  return (
    <ScalarProvider mode={mode} viewport="auto">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: color.bg.page }}>
        <PrimaryMenu
          logo={
            <a href={href(routes.home)} aria-label="Scalar home" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Text step="l" weight="bold" tone="inherit" as="span">Scalar</Text>
            </a>
          }
          end={
            <>
              <SearchBar
                placeholder="Search"
                readOnly
                onFocus={() => setOpen('search')}
                shortcut="⌘K"
              />
              <Notification unread onClick={toggle('notifications')} />
              <ToolSwitch value={tool} onChange={setTool} />
              <button
                type="button"
                onClick={toggle('user')}
                aria-label="User menu"
                aria-expanded={open === 'user' || open === 'user-firm-settings'}
                style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
              >
                <Avatar size="s" initials={user.initials} alt={user.name} />
              </button>
              <ButtonIcon
                variant="tertiary"
                size="s"
                label="More"
                icon={<Icon tone="onBrand"><icons.MoreVert /></Icon>}
              />
            </>
          }
        >
          <MainMenuItem current={area === 'intelligence'} href={href(routes.intelligence.summaries)}>Intelligence</MainMenuItem>
          <MainMenuItem current={area === 'valuations'} href={href(routes.valuations)}>Valuations</MainMenuItem>
          <MainMenuItem current={area === 'waterfalls'} href={href(routes.waterfalls)}>Waterfalls</MainMenuItem>
          <MainMenuItem current={area === 'documents'} href={href(routes.documents)}>Documents</MainMenuItem>
          <CompanyDropdown expanded={open === 'companies'} onClick={toggle('companies')}>
            {company ? company.name : 'Companies'}
          </CompanyDropdown>
          <Selector
            label="Date"
            value={date ?? (company ? `Most Recent (${company.asOf})` : portfolioDate)}
            expanded={open === 'date'}
            onClick={toggle('date')}
          />
        </PrimaryMenu>

        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
          {Overlay && <Overlay menu={open!} company={company} onClose={() => setOpen(undefined)} />}
          {overlay}
        </div>
      </div>
    </ScalarProvider>
  );
}

/** Standard padded page body for firm-level screens. */
export function PageBody({ children, gap = space.l }: { children?: ReactNode; gap?: string }) {
  return (
    <main style={{ padding: space.l, display: 'flex', flexDirection: 'column', gap, flex: 1 }}>
      {children}
    </main>
  );
}
