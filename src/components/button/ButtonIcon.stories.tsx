import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../icon/Icon.js';
import { Close, MoreHorizontal, Plus } from '../icon/glyphs.js';
import { ButtonIcon } from './ButtonIcon.js';

const meta = {
  title: 'Core/ButtonIcon',
  component: ButtonIcon,
  tags: ['autodocs'],
  args: { label: 'Close', icon: <Icon size="s" tone="inherit"><Close /></Icon> },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'tertiary'] },
    tone: { control: 'inline-radio', options: ['main', 'positive', 'warning', 'negative'] },
    size: { control: 'inline-radio', options: ['xs', 's', 'm', 'l'] },
  },
} satisfies Meta<typeof ButtonIcon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Primary: Story = { args: { variant: 'primary', label: 'Add', icon: <Icon size="s" tone="inherit"><Plus /></Icon> } };
export const Secondary: Story = { args: { variant: 'secondary', label: 'More actions', icon: <Icon size="s" tone="inherit"><MoreHorizontal /></Icon> } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };
export const Negative: Story = { args: { tone: 'negative', variant: 'secondary' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-s)', alignItems: 'center' }}>
      {(['xs', 's', 'm', 'l'] as const).map((size) => <ButtonIcon key={size} {...args} size={size} />)}
    </div>
  ),
};
