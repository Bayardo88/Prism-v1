import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContextMenu, MenuDivider, MenuItem, MenuSubItems, UserMenu } from './index.js';
import { Icon } from '../icon/Icon.js';
import { Copy, Download, Edit, Settings, Trash, User } from '../icon/glyphs.js';

const meta = {
  title: 'Menus/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  args: { label: 'Firm summary actions' },
} satisfies Meta<typeof ContextMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

const ico = (g: React.ReactNode) => <Icon size="s" tone="inherit">{g}</Icon>;

/** Arrow Up/Down move, Home/End jump, type-ahead matches labels, Esc and Tab call `onClose`. */
export const Default: Story = {
  render: (args) => (
    <ContextMenu {...args}>
      <MenuItem icon={ico(<Edit />)}>Rename</MenuItem>
      <MenuItem icon={ico(<Copy />)}>Clone</MenuItem>
      <MenuItem icon={ico(<Download />)}>Export to Excel</MenuItem>
      <MenuDivider />
      <MenuItem icon={ico(<Trash />)} tone="destructive">Delete view</MenuItem>
    </ContextMenu>
  ),
};

export const WithHeading: Story = {
  args: { heading: 'Saved view' },
  render: Default.render,
};

export const DisabledItem: Story = {
  render: (args) => (
    <ContextMenu {...args}>
      <MenuItem>Rename</MenuItem>
      <MenuItem disabled>Share (requires Admin)</MenuItem>
      <MenuItem href="#history">View history</MenuItem>
    </ContextMenu>
  ),
};

/** Selected items are exposed as `menuitemradio`; use it for a single-choice list such as sort order. */
export const SelectableItems: Story = {
  args: { label: 'Sort by' },
  render: function Render(args) {
    const [sort, setSort] = useState('name');
    return (
      <ContextMenu {...args} heading="Sort by">
        {[['name', 'Company name'], ['date', 'Measurement date'], ['value', 'Equity value']].map(([v, l]) => (
          <MenuItem key={v} selected={sort === v} onClick={() => setSort(v!)}>{l}</MenuItem>
        ))}
      </ContextMenu>
    );
  },
};

/** Right/Left arrows expand and collapse an inline submenu. */
export const InlineSubmenu: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(true);
    return (
      <ContextMenu {...args} label="Firm settings">
        <MenuItem icon={ico(<Settings />)} hasSubmenu expanded={open} onClick={() => setOpen(!open)}>Firm settings</MenuItem>
        {open && (
          <MenuSubItems label="Firm settings">
            <MenuItem>Firm profile</MenuItem>
            <MenuItem>Single sign-on</MenuItem>
            <MenuItem>Audit logs</MenuItem>
          </MenuSubItems>
        )}
        <MenuItem icon={ico(<User />)}>Users</MenuItem>
      </ContextMenu>
    );
  },
};

export const UserMenuStory: StoryObj<typeof UserMenu> = {
  name: 'User menu',
  render: () => (
    <UserMenu name="Northbridge Capital" detail="alex.rivera@northbridge.com" initials="NC" label="Account">
      <MenuItem icon={ico(<User />)}>My account</MenuItem>
      <MenuItem icon={ico(<Settings />)}>Firm settings</MenuItem>
      <MenuDivider />
      <MenuItem tone="destructive">Sign out</MenuItem>
    </UserMenu>
  ),
};
