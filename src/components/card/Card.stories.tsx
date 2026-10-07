import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/Button.js';
import { Chip } from '../chip/Chip.js';
import { Card, CardItem } from './Card.js';

const meta = {
  title: 'Core/Card',
  component: Card,
  tags: ['autodocs'],
  args: { title: 'Northwind Capital Fund III' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardItem label="Fair value" value="$42.8M" />
      <CardItem label="MOIC" value="1.8x" />
      <CardItem label="IRR" value="14.2%" />
    </Card>
  ),
};
export const WithTagAndAction: Story = {
  render: (args) => (
    <Card {...args} tag={<Chip styleVariant="positive">Active</Chip>} action={<Button variant="tertiary" size="s">View</Button>}>
      <CardItem label="Fair value" value="$42.8M" trend="up" />
      <CardItem label="Net change" value="-$1.2M" trend="down" />
    </Card>
  ),
};
export const AsArticle: Story = {
  render: (args) => (
    <Card {...args} asChild headingLevel={2}>
      <article><CardItem label="Cost basis" value="$30.0M" /></article>
    </Card>
  ),
};
export const ItemTrends: StoryObj<typeof CardItem> = {
  render: () => (
    <div style={{ width: 280 }}>
      <CardItem label="Up" value="+4.1%" trend="up" />
      <CardItem label="Down" value="-2.3%" trend="down" />
      <CardItem label="Flat" value="0.0%" />
    </div>
  ),
};
