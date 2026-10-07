import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar.js';

const meta = {
  title: 'Core/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { initials: 'AR', alt: 'Ana Rivera' },
  argTypes: { size: { control: 'inline-radio', options: ['xs', 's', 'm', 'l', 'xl'] } },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-s)', alignItems: 'center' }}>
      {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => <Avatar key={size} {...args} size={size} />)}
    </div>
  ),
};
/** A broken image URL falls back to the initials. */
export const ImageFallsBack: Story = { args: { src: 'data:image/png;base64,broken', size: 'l' } };
export const Decorative: Story = { args: { alt: undefined, initials: undefined, children: '?' } };
