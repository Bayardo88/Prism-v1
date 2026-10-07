import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../icon/Icon.js';
import { ChevronDown } from '../icon/glyphs.js';
import { AIButton } from './AIButton.js';

const meta = {
  title: 'Core/AIButton',
  component: AIButton,
  tags: ['autodocs'],
  args: { children: 'Generate summary' },
} satisfies Meta<typeof AIButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutIcon: Story = { args: { showIcon: false } };
export const TrailingIcon: Story = { args: { trailingIcon: <Icon size="s" tone="inherit"><ChevronDown /></Icon> } };
export const Loading: Story = { args: { loading: true, children: 'Generating…' } };
export const Disabled: Story = { args: { disabled: true } };
/** `asChild` renders your own element (a router link) with the AI treatment. */
export const AsLink: Story = { render: (args) => <AIButton {...args} asChild><a href="#intelligence">Ask Intelligence</a></AIButton> };
