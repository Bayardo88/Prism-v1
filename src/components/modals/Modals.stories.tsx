import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColumnItem, ColumnTitle, Modal, ModalSearch } from './index.js';
import { Button } from '../button/Button.js';

const meta = {
  title: 'Overlays/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: { open: true, onClose: () => undefined, title: 'Edit company details' },
  argTypes: {
    size: { control: 'inline-radio', options: ['s', 'm', 'l', 'xl'] },
    role: { control: 'inline-radio', options: ['dialog', 'alertdialog'] },
  },
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 420 } } },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

const footer = (close: () => void) => (
  <>
    <Button variant="tertiary" onClick={close}>Cancel</Button>
    <Button onClick={close}>Save changes</Button>
  </>
);

const body = <p>Update the legal name and reporting currency. Changes apply to every valuation that references this company.</p>;

/** Esc closes, Tab is trapped inside, focus returns to the trigger on close. */
export const Default: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 'var(--space-l)' }}>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal {...args} open={open} onClose={() => setOpen(false)} footer={footer(() => setOpen(false))}>{body}</Modal>
      </div>
    );
  },
};

export const Small: Story = { args: { size: 's' }, render: (args) => <Modal {...args} footer={footer(() => undefined)}>{body}</Modal> };
export const Medium: Story = { args: { size: 'm' }, render: (args) => <Modal {...args} footer={footer(() => undefined)}>{body}</Modal> };
export const Large: Story = { args: { size: 'l' }, render: (args) => <Modal {...args} footer={footer(() => undefined)}>{body}</Modal> };
export const ExtraLarge: Story = { args: { size: 'xl' }, render: (args) => <Modal {...args} footer={footer(() => undefined)}>{body}</Modal> };
export const WithoutTitle: Story = { args: { title: undefined, 'aria-label': 'Processing' }, render: (args) => <Modal {...args}>{body}</Modal> };
export const NoScrimDismiss: Story = { args: { dismissOnScrimClick: false }, render: (args) => <Modal {...args} footer={footer(() => undefined)}>{body}</Modal> };

/** The Column Picker composition: search, two lists of selectable items. */
export const ColumnPicker: Story = {
  args: { title: 'Choose columns', size: 'l' },
  render: function Render(args) {
    const [picked, setPicked] = useState<string[]>(['Company', 'Equity value']);
    const all = [['Company', 'Name'], ['Equity value', 'USD'], ['Measurement date', 'Date'], ['Method', 'Valuation approach'], ['Owner', 'Analyst']];
    const toggle = (n: string) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
    return (
      <Modal {...args} footer={footer(() => undefined)}>
        <ModalSearch aria-label="Search columns" placeholder="Search columns…" />
        <ColumnTitle title="Available columns" count={all.length} />
        {all.map(([n, sub]) => (
          <ColumnItem key={n} label={n} subText={sub} selected={picked.includes(n!)} onClick={() => toggle(n!)} />
        ))}
      </Modal>
    );
  },
};
