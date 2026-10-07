import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfirmationDialog, NotificationCenter, RowActionToolbar, SettingRow } from './index.js';
import { Button } from '../button/Button.js';
import { Icon } from '../icon/Icon.js';
import { Copy, Edit, Trash } from '../icon/glyphs.js';

const meta = {
  title: 'Overlays/ConfirmationDialog',
  component: ConfirmationDialog,
  tags: ['autodocs'],
  args: {
    open: true, title: 'Publish valuation?', confirmLabel: 'Publish', onConfirm: () => undefined, onCancel: () => undefined,
    children: 'Publishing makes this valuation visible to everyone with access to the company.',
  },
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 360 } } },
} satisfies Meta<typeof ConfirmationDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** Destructive confirmations are an `alertdialog` and focus opens on Cancel. */
export const Destructive: Story = {
  args: { destructive: true, title: 'Delete this group?', confirmLabel: 'Delete group', children: 'This permanently removes the comp group and its 14 members.' },
};
export const WithDetail: Story = { args: { detail: 'Last edited by Alex Rivera, 2 hours ago.' } };
export const Busy: Story = { args: { busy: true } };
export const Interactive: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 'var(--space-l)' }}>
        <Button tone="negative" onClick={() => setOpen(true)}>Delete group</Button>
        <ConfirmationDialog {...args} destructive title="Delete this group?" confirmLabel="Delete group" open={open} onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)}>
          This permanently removes the comp group.
        </ConfirmationDialog>
      </div>
    );
  },
};

export const Setting: StoryObj<typeof SettingRow> = {
  name: 'SettingRow',
  render: () => (
    <div style={{ width: 360 }}>
      <SettingRow label="Valuation published" description="When a valuation is finalised" defaultChecked />
      <SettingRow label="Document processed" description="When extraction finishes" />
      <SettingRow label="Weekly digest" description="Managed by your firm" disabled />
    </div>
  ),
};

const sampleItem = (title: string, when: string) => (
  <div key={title} style={{ padding: 'var(--space-s) var(--space-m)' }}>
    <strong>{title}</strong>
    <div>{when}</div>
  </div>
);

/** Esc closes (when `onClose` is set); the settings button toggles the settings view. */
export const NotificationCenterInbox: StoryObj<typeof NotificationCenter> = {
  name: 'NotificationCenter',
  render: () => (
    <div style={{ width: 400 }}>
      <NotificationCenter scope="Acme Holdings">
        {sampleItem('Q3 valuation published', '10 min ago')}
        {sampleItem('Cap table updated', 'Yesterday')}
      </NotificationCenter>
    </div>
  ),
};
export const NotificationCenterEmpty: StoryObj<typeof NotificationCenter> = {
  name: 'NotificationCenter (empty)',
  render: () => <div style={{ width: 400 }}><NotificationCenter /></div>,
};
export const NotificationCenterSettings: StoryObj<typeof NotificationCenter> = {
  name: 'NotificationCenter (settings)',
  render: () => (
    <div style={{ width: 400 }}>
      <NotificationCenter
        defaultView="settings"
        settings={<><SettingRow label="Valuation published" defaultChecked /><SettingRow label="Document processed" /></>}
      />
    </div>
  ),
};

/** Left/Right and Home/End move between actions; Esc calls `onClose`. */
export const RowActions: StoryObj<typeof RowActionToolbar> = {
  name: 'RowActionToolbar',
  render: function Render() {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <RowActionToolbar
        ref={ref}
        label="Row actions for Acme Holdings"
        onClose={() => undefined}
        actions={[
          { label: 'Edit', icon: <Icon size="s" tone="inherit"><Edit /></Icon>, onClick: () => undefined },
          { label: 'Duplicate', icon: <Icon size="s" tone="inherit"><Copy /></Icon>, onClick: () => undefined },
          { label: 'Delete', icon: <Icon size="s" tone="inherit"><Trash /></Icon>, onClick: () => undefined, destructive: true },
        ]}
      />
    );
  },
};
