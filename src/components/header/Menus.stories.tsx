import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuPanel, SubmenuItem, MenuGroup, MenuGroupLabel, CompanyDropdownPanel, SectionSubMenu } from './index.js';
import type { CompanyOption } from './index.js';

/** The dropdown surfaces behind the header controls. */
const meta = {
  title: 'Header/Menus',
  component: MenuPanel,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
} satisfies Meta<typeof MenuPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

const companies: CompanyOption[] = [
  { id: 'acme', name: 'Acme Holdings', pinned: true },
  { id: 'beta', name: 'Beta Corp.', pinned: true },
  { id: 'gamma', name: 'Gamma Ltd.' },
  { id: 'delta', name: 'Delta Industries' },
];

/** Navigation panel: a `<nav>` of links; Tab walks the rows. */
export const Navigation: Story = {
  render: () => (
    <MenuPanel label="Valuations">
      <SubmenuItem href="#all" current>All valuations</SubmenuItem>
      <SubmenuItem href="#drafts">Drafts</SubmenuItem>
      <SubmenuItem hasSubmenu expanded={false}>Reports</SubmenuItem>
    </MenuPanel>
  ),
};

/** Action menu. Up/Down move, Home/End jump, type to jump, Esc or Tab closes. `initialFocus` is omitted so the gallery does not steal focus. */
export const ActionMenu: Story = {
  render: () => (
    <MenuPanel kind="menu" label="Row actions">
      <MenuGroup label="Edit">
        <SubmenuItem>Rename</SubmenuItem>
        <SubmenuItem>Duplicate</SubmenuItem>
      </MenuGroup>
      <MenuGroup label="Share">
        <SubmenuItem state="ai">Summarise with AI</SubmenuItem>
        <SubmenuItem disabled>Export</SubmenuItem>
      </MenuGroup>
    </MenuPanel>
  ),
};

/** Single choice. Up/Down move, Home/End jump, type-ahead, Esc closes; the current row is `aria-selected`. */
export const Listbox: Story = {
  render: function Render() {
    const [cur, setCur] = useState('q2');
    return (
      <MenuPanel kind="listbox" label="Period">
        {['q1', 'q2', 'q3'].map((id) => (
          <SubmenuItem key={id} current={cur === id} onClick={() => setCur(id)}>{`Quarter ${id.slice(1)}`}</SubmenuItem>
        ))}
      </MenuPanel>
    );
  },
};

export const ItemStates: Story = {
  render: () => (
    <MenuPanel kind="menu" label="States">
      <SubmenuItem>Default</SubmenuItem>
      <SubmenuItem current>Current</SubmenuItem>
      <SubmenuItem state="pinned">Pinned</SubmenuItem>
      <SubmenuItem state="ai">AI</SubmenuItem>
      <SubmenuItem hasSubmenu>Has submenu</SubmenuItem>
      <SubmenuItem disabled>Disabled</SubmenuItem>
    </MenuPanel>
  ),
};

export const GroupLabel: Story = {
  render: () => (
    <MenuPanel label="Sections">
      <MenuGroupLabel>Cap table</MenuGroupLabel>
      <SubmenuItem href="#rounds">Rounds</SubmenuItem>
    </MenuPanel>
  ),
};

/** Pinned companies sit in their own group above the list. Keys as for any listbox. */
export const CompanySwitcher: Story = {
  render: function Render() {
    const [id, setId] = useState('acme');
    return <CompanyDropdownPanel companies={companies} currentId={id} onSelect={setId} />;
  },
};
export const CompanySwitcherNoPins: Story = {
  render: function Render() {
    const [id, setId] = useState('gamma');
    return <CompanyDropdownPanel companies={companies.map((c) => ({ ...c, pinned: false }))} currentId={id} onSelect={setId} />;
  },
};

export const SectionMenu: Story = {
  render: function Render() {
    const [id, setId] = useState('rounds');
    return (
      <SectionSubMenu
        label="Cap table"
        currentId={id}
        onSelect={setId}
        items={[
          { id: 'rounds', label: 'Rounds' },
          { id: 'holders', label: 'Shareholders' },
          { id: 'options', label: 'Option plans', hasSubmenu: true },
          { id: 'waterfall', label: 'Waterfall', disabled: true },
        ]}
      />
    );
  },
};
