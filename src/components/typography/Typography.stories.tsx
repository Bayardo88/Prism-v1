import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading, Label, Overline, Text, Typography } from './Typography.js';

const meta = {
  title: 'Core/Typography',
  component: Typography,
  tags: ['autodocs'],
  args: { children: 'Fair value as of September 30' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['display', 'heading', 'text', 'label', 'link', 'overline'] },
    weight: { control: 'inline-radio', options: ['light', 'regular', 'semiBold', 'bold'] },
    tone: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'disabled', 'brand', 'link', 'positive', 'warning', 'negative', 'ai', 'inherit'],
    },
  },
} satisfies Meta<typeof Typography>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Truncated: Story = { args: { truncate: true, children: 'A very long company name that cannot possibly fit on one line of this narrow container' }, decorators: [(S) => <div style={{ width: 240 }}><S /></div>] };
export const Headings: Story = {
  render: () => (
    <div>
      {(['5xl', '4xl', '3xl', '2xl', 'xl', 'l', 'm', 's'] as const).map((step) => <Heading key={step} step={step} level={2}>Heading {step}</Heading>)}
    </div>
  ),
};
export const TextSteps: Story = {
  render: () => (<div>{(['2xl', 'xl', 'l', 'm', 's'] as const).map((step) => <Text key={step} step={step}>Body text {step}</Text>)}</div>),
};
export const Tones: Story = {
  render: () => (
    <div>
      {(['primary', 'secondary', 'tertiary', 'disabled', 'brand', 'positive', 'warning', 'negative', 'ai'] as const).map((tone) => <Text key={tone} tone={tone}>{tone}</Text>)}
    </div>
  ),
};
export const LabelAndOverline: Story = {
  render: () => (
    <div>
      <Label htmlFor="story-input">Company name</Label><br />
      <input id="story-input" />
      <Overline>Portfolio summary</Overline>
    </div>
  ),
};
export const Weights: Story = {
  render: () => (<div>{(['light', 'regular', 'semiBold', 'bold'] as const).map((weight) => <Text key={weight} weight={weight}>{weight}</Text>)}</div>),
};
