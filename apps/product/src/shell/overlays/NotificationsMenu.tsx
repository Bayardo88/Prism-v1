/**
 * Notifications — the Notification Center popover under the bell (Figma
 * 01 · Home: "Home — Notifications popover" = inbox, "Home — Notification
 * settings" = settings). The gear toggles between the two views.
 *
 * Delivery switches and per-type subscriptions apply at once (Setting Rows).
 * The company scope defaults to "All companies (all firms)"; unticking it
 * enables the Firm and Company pickers.
 */
import { useState } from 'react';
import {
  Checkbox, FloatingLabelSelect, NotificationCenter, Overline, Select, SettingRow, Text, color, space,
} from '@scalar/design-system';
import { firms } from '../../data/fixtures.js';
import { db } from '../../data/db.js';
import { firmName, notificationTypes } from './data.js';
import { Popover } from './Popover.js';
import type { OverlayProps } from './index.js';

export function NotificationsMenu({ menu, onClose }: OverlayProps) {
  const [view, setView] = useState<'inbox' | 'settings'>(menu === 'notification-settings' ? 'settings' : 'inbox');
  const [desktop, setDesktop] = useState(false);
  const [global, setGlobal] = useState(true);
  const [types, setTypes] = useState<Record<string, boolean>>(
    () => Object.fromEntries(notificationTypes.map((t) => [t, true])),
  );
  const [allCompanies, setAllCompanies] = useState(true);

  return (
    <Popover onClose={onClose} placement={{ right: '10%' }} label="Notifications">
      <NotificationCenter
        scope={firmName}
        view={view}
        onViewChange={setView}
        delivery={
          <>
            <SettingRow label="Desktop notifications" checked={desktop} onChange={setDesktop} />
            <SettingRow label="Global notifications" checked={global} onChange={setGlobal} />
          </>
        }
        settings={
          <>
            {notificationTypes.map((t) => (
              <SettingRow
                key={t}
                label={t}
                checked={!!types[t]}
                onChange={(on) => setTypes((cur) => ({ ...cur, [t]: on }))}
              />
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.s, paddingTop: space.m }}>
              <Overline as="div">Companies</Overline>
              <Checkbox checked={allCompanies} onChange={(e) => setAllCompanies(e.target.checked)}>
                All companies (all firms)
              </Checkbox>
              <FloatingLabelSelect label="Firm" state={allCompanies ? 'disabled' : 'default'} defaultValue={firmName}>
                {firms.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
              </FloatingLabelSelect>
              <Select aria-label="Companies" state={allCompanies ? 'disabled' : 'default'} defaultValue="all">
                <option value="all">All companies (all firms)</option>
                {db.companies.all().map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div style={{ paddingTop: space.m, borderTop: `1px solid ${color.stroke.divider}`, marginTop: space.m }}>
              <Text step="s" tone="secondary">No notifications</Text>
            </div>
          </>
        }
      />
    </Popover>
  );
}
