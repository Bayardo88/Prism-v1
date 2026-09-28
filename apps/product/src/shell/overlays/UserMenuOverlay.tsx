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
  Icon, MenuDivider, MenuItem, MenuSubItems, UserMenu, icons, space, zIndex,
} from '@scalar/design-system';
import type { OverlayProps } from './index.js';
import { navigate } from '../../router.js';
import { routes } from '../../routes.js';
import { firm, user } from '../../data/fixtures.js';

const FIRM_SETTINGS: Array<{ label: string; to: string; icon: ReactElement }> = [
  { label: 'Firm profile', to: routes.firmSettings.profile, icon: <icons.CorporateFare /> },
  { label: 'Single sign-on', to: routes.firmSettings.sso, icon: <icons.Lock /> },
  { label: 'SCIM', to: routes.firmSettings.scim, icon: <icons.Sync /> },
  { label: 'Daily NAV settings', to: routes.firmSettings.dailyNav, icon: <icons.ShowChart /> },
  { label: 'Scalar AI', to: routes.firmSettings.scalarAi, icon: <icons.StarShine /> },
  { label: 'Settings', to: routes.firmSettings.settings, icon: <icons.Settings /> },
];

const ic = (g: ReactElement) => <Icon size="s" tone="inherit">{g}</Icon>;

export function UserMenuOverlay({ menu, onClose }: OverlayProps) {
  // Items navigate by click rather than `href`: an <a> MenuItem is content-box
  // (width 100% + padding) and pushed the page 39px wider than the viewport.
  // Back to `href` once `.scalar-menu-item` is border-box in the DS.
  const go = (to: string) => () => { onClose(); navigate(to); };
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
        <MenuItem icon={ic(<icons.AccountCircle />)} onClick={go(routes.account.settings)}>Account settings</MenuItem>
        <MenuItem icon={ic(<icons.SwapHoriz />)} hasSubmenu onClick={go(routes.home)}>Switch firm</MenuItem>
        <MenuItem icon={ic(<icons.ManageAccounts />)} onClick={go(routes.admin.users)}>User management</MenuItem>
        <MenuItem icon={ic(<icons.Groups />)} onClick={go(routes.admin.compGroups)}>Comp groups</MenuItem>
        <MenuDivider />
        <MenuItem icon={ic(<icons.History />)} onClick={go(routes.admin.auditLogs)}>Audit logs</MenuItem>
        <MenuItem
          icon={ic(<icons.Settings />)}
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
              <MenuItem key={s.to} icon={ic(s.icon)} onClick={go(s.to)}>{s.label}</MenuItem>
            ))}
          </MenuSubItems>
        )}
        <MenuDivider />
        <MenuItem icon={ic(<icons.Help />)} hasSubmenu>Guided tours</MenuItem>
        <MenuItem icon={ic(<icons.Logout />)} onClick={onClose}>Sign out</MenuItem>
      </UserMenu>
    </div>
  );
}
