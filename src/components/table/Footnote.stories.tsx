import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footnote } from './Footnote.js';

const meta = {
  title: 'Data/Table/Footnote',
  component: Footnote,
  tags: ['autodocs'],
  args: { children: '1' },
  decorators: [(Story) => <span>1,250,000<Story /></span>],
} satisfies Meta<typeof Footnote>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {};
export const Currency: Story = { args: { currency: 'USD' } };
export const AiGenerated: Story = { args: { ai: true, children: 'AI' } };
/** Enter / Space on the marker reveals its source. Point `aria-describedby` at the note. */
export const Interactive: Story = { args: { interactive: true, 'aria-label': 'Source of this figure', children: '2' } };
