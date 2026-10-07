import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon.js';
import { icons } from './index.js';

const meta = {
  title: 'Core/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { children: <icons.Search />, size: 'm' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 's', 'm', 'l', 'xl'] },
    tone: {
      control: 'select',
      options: ['primary', 'secondary', 'inverse', 'disabled', 'brand', 'positive', 'warning', 'negative', 'ai', 'onBrand', 'inherit'],
    },
  },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Labelled: Story = { args: { label: 'Search' } };
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-s)', alignItems: 'center' }}>
      {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => <Icon key={size} {...args} size={size} />)}
    </div>
  ),
};
export const Tones: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-s)', alignItems: 'center' }}>
      {(['primary', 'secondary', 'disabled', 'brand', 'positive', 'warning', 'negative', 'ai'] as const).map((tone) => (
        <Icon key={tone} {...args} tone={tone} />
      ))}
    </div>
  ),
};
/** A sample of the 250+ Material Symbols in the product set. */
export const Glyphs: Story = {
  render: (args) => {
    const sample = Object.entries(icons).filter(([, g]) => typeof g === 'function').slice(0, 40) as [string, () => JSX.Element][];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 120px)', gap: 'var(--space-s)' }}>
        {sample.map(([name, Glyph]) => (
          <div key={name} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--space-2xs)' }}>
            <Icon {...args}><Glyph /></Icon>
            <span>{name}</span>
          </div>
        ))}
      </div>
    );
  },
};
