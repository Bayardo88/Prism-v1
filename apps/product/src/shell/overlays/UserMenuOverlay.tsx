/**
 * The global User Menu, opened from the avatar at the far right of the
 * Primary Menu on every screen: the firm, account settings, firm switching,
 * firm administration (users, comp groups, audit logs), the Firm Settings
 * group — which expands in place — guided tours and sign out.
 *
 * `menu === 'user-firm-settings'` opens with Firm Settings expanded.
 */
import { useEffect, useRef, useState, type ReactElement } from 'react';
import {
  Icon, MenuDivider, MenuItem, MenuSubItems, UserMenu, glyphs, space, zIndex,
} from '@scalar/design-system';
import type { OverlayProps } from './index.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { firm, user } from '../../data/fixtures.js';

const FIRM_SETTINGS: Array<{ label: string; to: string; icon: ReactElement }> = [
  { label: 'Firm profile', to: routes.firmSettings.profile, icon: <glyphs.Folder /> },
  { label: 'Single sign-on', to: routes.firmSettings.sso, icon: <glyphs.Link /> },
  { label: 'SCIM', to: routes.firmSettings.scim, icon: <glyphs.Refresh /> },
  { label: 'Daily NAV settings', to: routes.firmSettings.dailyNav, icon: <glyphs.Trend /> },
  { label: 'Scalar AI', to: routes.firmSettings.scalarAi, icon: <glyphs.Sparkle /> },
  { label: 'Settings', to: routes.firmSettings.settings, icon: <glyphs.Settings /> },
];

const ic = (g: ReactElement) => <Icon size="s" tone="inherit">{g}</Icon>;

export function UserMenuOverlay({ menu, onClose }: OverlayProps) {
  const [firmOpen, setFirmOpen] = useState(menu === 'user-firm-settings');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setFirmOpen(menu === 'user-firm-settings'), [menu]);

  // Outside click and Escape close the menu. The avatar trigger toggles it
  // itself, so a press on it is not treated as "outside".
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Element;
      if (ref.current?.contains(t) || t.closest?.('[aria-label="User menu"]')) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div ref={ref} style={{ position: 'absolute', top: space.xs, right: space.l, zIndex: zIndex.overlay }}>
      <UserMenu name={firm.name} detail={user.email} initials={user.initials}>
        <MenuItem icon={ic(<glyphs.User />)} href={href(routes.account.settings)}>Account settings</MenuItem>
        <MenuItem icon={ic(<glyphs.ArrowRight />)} hasSubmenu href={href(routes.home)}>Switch firm</MenuItem>
        <MenuItem icon={ic(<glyphs.User />)} href={href(routes.admin.users)}>User management</MenuItem>
        <MenuItem icon={ic(<glyphs.List />)} href={href(routes.admin.compGroups)}>Comp groups</MenuItem>
        <MenuDivider />
        <MenuItem icon={ic(<glyphs.Clock />)} href={href(routes.admin.auditLogs)}>Audit logs</MenuItem>
        <MenuItem
          icon={ic(<glyphs.Settings />)}
          hasSubmenu
          expanded={firmOpen}
          selected={firmOpen}
          onClick={() => setFirmOpen((o) => !o)}
        >
          Firm settings
        </MenuItem>
        {firmOpen && (
          <MenuSubItems>
            {FIRM_SETTINGS.map((s) => (
              <MenuItem key={s.to} icon={ic(s.icon)} href={href(s.to)}>{s.label}</MenuItem>
            ))}
          </MenuSubItems>
        )}
        <MenuDivider />
        <MenuItem icon={ic(<glyphs.Info />)} hasSubmenu>Guided tours</MenuItem>
        <MenuItem icon={ic(<glyphs.ArrowLeft />)} onClick={onClose}>Sign out</MenuItem>
      </UserMenu>
    </div>
  );
}
