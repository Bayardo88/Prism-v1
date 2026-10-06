import type { Meta, StoryObj } from '@storybook/react-vite';
import { BodySlot, PageTemplate } from './index.js';

const meta = {
  title: 'Core/PageTemplate',
  component: PageTemplate,
  tags: ['autodocs'],
  args: { fullHeight: false },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PageTemplate>;
export default meta;
type Story = StoryObj<typeof meta>;

const bar = (text: string) => <div style={{ padding: 'var(--space-m)' }}>{text}</div>;

/** The empty template shows the BODY-SLOT placeholder. */
export const Empty: Story = {};
export const WithChrome: Story = {
  args: {
    navigation: bar('Primary navigation'),
    companyInfo: bar('Acme Holdings'),
    subNavigation: bar('Summary · Financials · Cap table'),
    children: <div style={{ padding: 'var(--space-l)' }}>Page content</div>,
  },
};
export const WithDrawer: Story = { args: { ...WithChrome.args, drawer: bar('Workspace drawer') } };
export const Placeholder: StoryObj<typeof BodySlot> = { render: () => <BodySlot label="CHART-SLOT" /> };
