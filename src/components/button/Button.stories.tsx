import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button.js';

const meta = {
  title: 'Core/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Save changes' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'tertiary'] },
    tone: { control: 'inline-radio', options: ['main', 'positive', 'warning', 'negative'] },
    size: { control: 'inline-radio', options: ['xs', 's', 'm', 'l'] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Destructive: Story = { args: { tone: 'negative', children: 'Delete' } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
/** `asChild` renders your own element (a router link) with the button's classes. */
export const AsLink: Story = { render: (args) => <Button {...args} asChild><a href="#valuations">Valuations</a></Button> };
