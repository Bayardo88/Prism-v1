/**
 * Global menus opened from the Primary Menu. They are platform-wide: any
 * screen can open one via `AppFrame openMenu`, and every screen's chrome opens
 * them on click.
 */
import type { ComponentType } from 'react';
import type { Company } from '../../data/fixtures.js';
import { CompaniesMenu } from './CompaniesMenu.js';
import { DateMenu } from './DateMenu.js';
import { SearchOverlay } from './SearchOverlay.js';
import { NotificationsMenu } from './NotificationsMenu.js';
import { UserMenuOverlay } from './UserMenuOverlay.js';

export type GlobalMenu =
  | 'companies'
  | 'companies-add'
  | 'date'
  | 'search'
  | 'notifications'
  | 'notification-settings'
  | 'user'
  | 'user-firm-settings';

export interface OverlayProps {
  menu: GlobalMenu;
  company?: Company;
  onClose: () => void;
}

export const overlays: Record<GlobalMenu, ComponentType<OverlayProps>> = {
  companies: CompaniesMenu,
  'companies-add': CompaniesMenu,
  date: DateMenu,
  search: SearchOverlay,
  notifications: NotificationsMenu,
  'notification-settings': NotificationsMenu,
  user: UserMenuOverlay,
  'user-firm-settings': UserMenuOverlay,
};
