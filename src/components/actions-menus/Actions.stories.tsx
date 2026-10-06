import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Fab, MenuDivider, MenuItem, ContextMenu, SegmentedControl, SpeedDial, SpeedDialItem, SplitButton, ViewTab, ViewTabBar,
} from './index.js';
import { Icon } from '../icon/Icon.js';
import { Calendar, List } from '../icon/glyphs.js';

const meta = {
  title: 'Menus/Actions',
  component: SplitButton,
  tags: ['autodocs'],
  args: { children: 'Add projection year', menuLabel: 'More add options' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary'] },
    tone: { control: 'inline-radio', options: ['main', 'positive'] },
    menuPlacement: { control: 'inline-radio', options: ['bottom', 'top'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SplitButton>;
export default meta;
type Story = StoryObj<typeof meta>;

const menu = (
  <ContextMenu label="Add options">
    <MenuItem>Add historical year</MenuItem>
    <MenuItem>Add projection year</MenuItem>
    <MenuDivider />
    <MenuItem>Import from file</MenuItem>
  </ContextMenu>
);

/** Caret: ArrowDown opens the menu. Inside it, Arrow keys move, Esc and Tab close and return focus to the caret. */
export const SplitPrimary: Story = { args: { menu } };
export const SplitSecondary: Story = { args: { menu, variant: 'secondary' } };
export const SplitPositiveSave: Story = { args: { menu, tone: 'positive', children: 'Save', menuLabel: 'More save options' } };
export const SplitDisabled: Story = { args: { menu, disabled: true } };
export const SplitOpen: Story = { args: { menu, defaultMenuOpen: true }, parameters: { layout: 'padded' }, decorators: [(S) => <div style={{ minHeight: 220 }}><S /></div>] };

export const FabStory: StoryObj<typeof Fab> = {
  name: 'FAB',
  render: () => <Fab fixed={false}>New valuation</Fab>,
};

export const FabWithMenu: StoryObj<typeof Fab> = {
  name: 'FAB with menu',
  render: () => <Fab fixed={false} hasMenu>Add</Fab>,
};

/** Arrow Up/Down, Home/End and type-ahead move between items; Esc closes and returns focus to the FAB. */
export const SpeedDialStory: StoryObj<typeof SpeedDial> = {
  name: 'Speed dial',
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ minHeight: 260, display: 'flex', alignItems: 'flex-end' }}>
        <SpeedDial
          label="Add actions"
          onClose={() => setOpen(false)}
          trigger={<Fab fixed={false} hasMenu open={open} onOpenChange={setOpen}>Add</Fab>}
        >
          {open && (
            <>
              <SpeedDialItem>Add company</SpeedDialItem>
              <SpeedDialItem>Upload document</SpeedDialItem>
              <SpeedDialItem disabled>New waterfall</SpeedDialItem>
            </>
          )}
        </SpeedDial>
      </div>
    );
  },
};

/** Radiogroup: one tab stop, arrow keys move focus and selection, Home/End jump. */
export const Segmented: StoryObj<typeof SegmentedControl> = {
  render: () => (
    <SegmentedControl label="View" defaultValue="chart" options={[{ value: 'chart', label: 'Chart' }, { value: 'table', label: 'Table' }]} />
  ),
};

export const SegmentedIconOnly: StoryObj<typeof SegmentedControl> = {
  name: 'Segmented (icon only)',
  render: () => (
    <SegmentedControl
      label="Layout"
      defaultValue="list"
      options={[
        { value: 'list', label: 'List', icon: <Icon size="s" tone="inherit"><List /></Icon> },
        { value: 'calendar', label: 'Calendar', icon: <Icon size="s" tone="inherit"><Calendar /></Icon> },
      ]}
    />
  ),
};

export const SegmentedDisabledOption: StoryObj<typeof SegmentedControl> = {
  name: 'Segmented (disabled option)',
  render: () => (
    <SegmentedControl
      label="Audience"
      options={[{ value: 'client', label: 'Client' }, { value: 'internal', label: 'Internal' }, { value: 'public', label: 'Public', disabled: true }]}
    />
  ),
};

/** Left/Right and Home/End move focus; Enter or Space selects; Shift+F10 or the Menu key opens a tab's menu; Delete closes a temporary tab. */
export const ViewTabs: StoryObj<typeof ViewTabBar> = {
  name: 'View tabs',
  render: function Render() {
    const [tabs, setTabs] = useState(['Firm summary', 'Q3 review', 'Backsolve']);
    const [current, setCurrent] = useState('Firm summary');
    return (
      <ViewTabBar label="Saved views" addLabel="Add view" onAdd={() => setTabs([...tabs, `View ${tabs.length + 1}`])}>
        {tabs.map((t, i) => (
          <ViewTab
            key={t}
            selected={current === t}
            onSelect={() => setCurrent(t)}
            onMenu={i === 0 ? undefined : () => undefined}
            onClose={i > 1 ? () => setTabs(tabs.filter((x) => x !== t)) : undefined}
          >
            {t}
          </ViewTab>
        ))}
      </ViewTabBar>
    );
  },
};

export const ViewTabPlain: StoryObj<typeof ViewTab> = {
  name: 'View tab (single)',
  render: () => (
    <ViewTabBar label="Views"><ViewTab selected onMenu={() => undefined}>Current</ViewTab></ViewTabBar>
  ),
};
