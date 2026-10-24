import type { ScreenDef } from '../../../types.js';
import { NotificationsCenter } from './NotificationsCenter.js';

/**
 * Prototype — the Notifications Center from Figma file BbebfOi2JVBIYgQWaSj52G,
 * drawn over the Cap Table. Frames: 131:19540 default, 130:2095 AI processing,
 * 1:5857 inbox, 130:3528 filters; 79:1853 / 131:4940 are the panel alone.
 */
export const screens: ScreenDef[] = [
  {
    id: 'prototype.notifications-center',
    title: 'Notifications Center (prototype)',
    figmaPage: 'Prototype · notifications-center',
    route: '/prototypes/notifications-center/:companyId',
    summary: 'See AI job results and teammates’ changes under the bell, filter them by scope, and jump to the source.',
    component: NotificationsCenter,
    states: [
      { key: 'default', label: 'Notifications — bell with unread (131:19540)', figmaNode: 'proto:notifications-center:1', section: 'Prototype' },
      { key: 'ai-processing', label: 'Notifications — AI processing toast (130:2095)', figmaNode: 'proto:notifications-center:2', section: 'Prototype' },
      { key: 'inbox', label: 'Notifications — panel open (1:5857)', figmaNode: 'proto:notifications-center:3', section: 'Prototype' },
      { key: 'filters', label: 'Notifications — filter settings (130:3528)', figmaNode: 'proto:notifications-center:4', section: 'Prototype' },
      { key: 'empty', label: 'Notifications — all caught up', figmaNode: 'proto:notifications-center:5', section: 'Prototype' },
    ],
  },
];
