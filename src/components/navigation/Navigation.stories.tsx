import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb, Pagination, Stepper, TabItem, TabPanel, Tabs, TabsGroup } from './index.js';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: { label: 'Company sections' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Left/Right move between tabs and activate them; Home/End jump to the first and last. */
export const Default: Story = {
  render: function Render(args) {
    const [tab, setTab] = useState('summary');
    const names: Array<[string, string]> = [['summary', 'Summary'], ['financials', 'Financials'], ['captable', 'Cap table'], ['documents', 'Documents']];
    return (
      <TabsGroup>
        <Tabs {...args}>
          {names.map(([v, l]) => <TabItem key={v} value={v} active={tab === v} onClick={() => setTab(v)}>{l}</TabItem>)}
        </Tabs>
        {names.map(([v, l]) => tab === v && <TabPanel key={v} value={v}>{l} content for Acme Holdings.</TabPanel>)}
      </TabsGroup>
    );
  },
};

export const WithDisabledTab: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabItem active>Summary</TabItem>
      <TabItem>Financials</TabItem>
      <TabItem disabled>Waterfall</TabItem>
    </Tabs>
  ),
};

export const BreadcrumbTrail: StoryObj<typeof Breadcrumb> = {
  name: 'Breadcrumb',
  render: () => (
    <Breadcrumb items={[{ label: 'Companies', href: '#companies' }, { label: 'Acme Holdings', href: '#acme' }, { label: 'Valuations' }]} />
  ),
};

export const BreadcrumbWithHandlers: StoryObj<typeof Breadcrumb> = {
  name: 'Breadcrumb (button items)',
  render: () => <Breadcrumb items={[{ label: 'Home', onClick: () => undefined }, { label: 'Documents' }]} />,
};

export const PaginationStory: StoryObj<typeof Pagination> = {
  name: 'Pagination',
  render: () => <Pagination pageCount={5} defaultPage={2} />,
};

export const PaginationManyPages: StoryObj<typeof Pagination> = {
  name: 'Pagination (many pages)',
  render: () => <Pagination pageCount={42} defaultPage={20} />,
};

export const PaginationWithRows: StoryObj<typeof Pagination> = {
  name: 'Pagination (rows per page)',
  render: function Render() {
    const [rows, setRows] = useState(25);
    return <Pagination pageCount={12} defaultPage={1} rowsPerPage={rows} onRowsPerPageChange={setRows} />;
  },
};

export const StepperStory: StoryObj<typeof Stepper> = {
  name: 'Stepper',
  render: () => (
    <Stepper
      label="Valuation setup"
      steps={[
        { label: 'Company', state: 'complete' },
        { label: 'Financials', state: 'complete' },
        { label: 'Method', state: 'current' },
        { label: 'Review', state: 'upcoming' },
      ]}
    />
  ),
};

export const StepperWithError: StoryObj<typeof Stepper> = {
  name: 'Stepper (error)',
  render: () => (
    <Stepper
      label="Import progress"
      steps={[{ label: 'Upload', state: 'complete' }, { label: 'Map columns', state: 'error' }, { label: 'Confirm' }]}
    />
  ),
};
