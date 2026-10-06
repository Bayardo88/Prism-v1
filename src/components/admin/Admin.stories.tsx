import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  KeyValueRow, KeyValueList, VersionHistoryItem, VersionHistoryList, PermissionMatrix, PermissionMatrixRow, RoleSelector, ProfileHeader,
  FilterBar, DirectoryGroup, ProductTile, FirmSwitcherTile, PageTaskHeader, CodeGrid, RichTextToolbar, AppFooter,
} from './index.js';
import type { RichTextFormat } from './index.js';
import { Button } from '../button/Button.js';
import { FilterDropdown } from '../header/Controls.js';
import { MenuPanel, SubmenuItem } from '../header/Menus.js';
import { Icon } from '../icon/Icon.js';
import { Analytics, Apps, Description, Gavel } from '../icon/material.js';

/** Building blocks for settings, user management and account pages. */
const meta = {
  title: 'Admin/Admin',
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 560 }}><Story /></div>],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/* `role` here is the user's firm role (a prop name), not an ARIA role. */
const ANALYST = 'Analyst';
const ADMIN = 'Admin';

export const KeyValueInline: Story = {
  render: () => (
    <KeyValueList>
      <KeyValueRow label="Comp group">Mid-market SaaS</KeyValueRow>
      <KeyValueRow label="Previous versions"><a href="#versions">3 versions</a></KeyValueRow>
      <KeyValueRow label="Owner">Maria Lopez</KeyValueRow>
    </KeyValueList>
  ),
};
export const KeyValueStacked: Story = {
  render: () => (
    <KeyValueList>
      <KeyValueRow layout="stacked" label="Legal name">Acme Holdings, Inc.</KeyValueRow>
      <KeyValueRow layout="stacked" label="Fiscal year end">December 31</KeyValueRow>
    </KeyValueList>
  ),
};

export const VersionHistory: Story = {
  render: () => (
    <VersionHistoryList aria-label="Template versions">
      <VersionHistoryItem current range="Aug 24, 2026 5:01 PM — Present" meta="Changed by Analyst · Firm template change" currentLabel="Current · In use by 3 companies" />
      <VersionHistoryItem range="Mar 2, 2026 9:12 AM — Aug 24, 2026 5:01 PM" meta="Changed by Admin · Initial setup" action={<Button variant="tertiary" size="s">Restore</Button>} />
    </VersionHistoryList>
  ),
};

/** Edit implies View: ticking Edit ticks and locks View. Each checkbox is a Tab stop; Space toggles. */
export const Permissions: Story = {
  render: () => (
    <PermissionMatrix aria-label="Fund permissions">
      <PermissionMatrixRow type="group" label="Funds" />
      <PermissionMatrixRow label="VIP Fund" defaultView />
      <PermissionMatrixRow label="Growth Fund" defaultEdit defaultView />
      <PermissionMatrixRow label="Legacy Fund" />
    </PermissionMatrix>
  ),
};

export const RoleSelectorClosed: Story = { render: () => <RoleSelector role={ANALYST} /> };
/** Pair with a `menu` MenuPanel and pass its id as `aria-controls`. */
export const RoleSelectorWithMenu: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    const [role, setRole] = useState('Analyst');
    return (
      <div>
        <RoleSelector role={role} open={open} aria-controls="role-menu" onClick={() => setOpen((o) => !o)} />
        {open && (
          <MenuPanel id="role-menu" kind="menu" label="Role" onClose={() => setOpen(false)}>
            {['Admin', 'Analyst', 'Viewer'].map((r) => <SubmenuItem key={r} current={r === role} onClick={() => { setRole(r); setOpen(false); }}>{r}</SubmenuItem>)}
          </MenuPanel>
        )}
      </div>
    );
  },
};

export const Profile: Story = {
  render: () => (
    <ProfileHeader name="Maria Lopez" email="maria.lopez@acme.com" lastLogin="Last login Oct 6, 2026 8:40 AM" initials="ML" role={<RoleSelector role={ADMIN} />} />
  ),
};
export const ProfileMinimal: Story = { render: () => <ProfileHeader name="Pending invite" email="new.user@acme.com" initials="NU" headingLevel={3} /> };

export const Filters: Story = {
  render: () => (
    <FilterBar label="Filter by" action={<Button size="s">Apply</Button>}>
      <FilterDropdown label="User">All users</FilterDropdown>
      <FilterDropdown label="Action">All actions</FilterDropdown>
      <FilterDropdown label="Date">Last 30 days</FilterDropdown>
    </FilterBar>
  ),
};

export const Directory: Story = {
  render: () => (
    <DirectoryGroup
      letter="A"
      entries={[
        { label: 'Acme Holdings', href: '#acme' },
        { label: 'Alpha Systems', href: '#alpha' },
        { label: 'Atlas Robotics', onClick: () => {} },
      ]}
    />
  ),
};

export const ProductTiles: Story = {
  decorators: [(Story) => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-s)' }}><Story /></div>],
  render: () => (
    <>
      <ProductTile product="intelligence" href="#intelligence" title="Intelligence" description="Portfolio analytics" icon={<Icon size="m" tone="inherit"><Analytics /></Icon>} />
      <ProductTile product="valuations" href="#valuations" title="Valuations" description="Fair value reporting" icon={<Icon size="m" tone="inherit"><Apps /></Icon>} />
      <ProductTile product="waterfalls" title="Waterfalls" description="Distribution modelling" icon={<Icon size="m" tone="inherit"><Gavel /></Icon>} />
      <ProductTile product="documents" href="#documents" title="Documents" description="Files and requests" icon={<Icon size="m" tone="inherit"><Description /></Icon>} />
    </>
  ),
};

/** The current firm carries `aria-current`. */
export const FirmSwitcher: Story = {
  render: function Render() {
    const [cur, setCur] = useState('VIP Capital');
    return (
      <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
        {[['VIP Capital', 'VC'], ['Northwind Partners', 'NP'], ['Harbor Equity', 'HE']].map(([n, i]) => (
          <FirmSwitcherTile key={n} name={n!} initials={i} selected={cur === n} onClick={() => setCur(n!)} />
        ))}
      </div>
    );
  },
};

export const TaskHeader: Story = {
  render: () => (
    <PageTaskHeader
      title="Information request"
      subtitle="Acme Holdings · Due Nov 15, 2026"
      backLabel="Back to requests"
      onBack={() => {}}
      actions={<><Button variant="secondary">Save draft</Button><Button>Send request</Button></>}
    />
  ),
};

export const BackupCodes: Story = {
  render: () => <CodeGrid codes={['4F7A-92KD', 'B81Q-33ZM', 'T0PX-7WE1', 'K9LC-AA42']} actions={<><Button variant="secondary" size="s">Download</Button><Button variant="secondary" size="s">Print</Button></>} />,
};
export const BackupCodesMasked: Story = { render: () => <CodeGrid masked codes={['4F7A-92KD', 'B81Q-33ZM', 'T0PX-7WE1', 'K9LC-AA42']} /> };

/** A toolbar with one tab stop: Left/Right move between buttons (wrapping), Home/End jump to the ends. */
export const RichText: Story = {
  render: function Render() {
    const [active, setActive] = useState<RichTextFormat[]>(['bold']);
    const toggle = (f: RichTextFormat) => setActive((a) => (a.includes(f) ? a.filter((x) => x !== f) : [...a, f]));
    return <RichTextToolbar active={active} onToggle={toggle} />;
  },
};

export const Footer: Story = { render: () => <AppFooter year={2026} version="v4.12.0" /> };
export const FooterCustom: Story = { render: () => <AppFooter version="v4.12.0">Scalar Technologies · All rights reserved</AppFooter> };
