import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, AccordionItem, DataReviewCard, Drawer, WorkspaceDrawer, WorkspaceDrawerTab } from './index.js';
import { Button } from '../button/Button.js';
import { Icon } from '../icon/Icon.js';
import { Document, Sparkle } from '../icon/glyphs.js';

const meta = {
  title: 'Overlays/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: { type: 'multiple' },
  argTypes: { type: { control: 'inline-radio', options: ['single', 'multiple'] } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

const items = (
  <>
    <AccordionItem value="income" title="Income approach">Discounted cash flow using a 12.5% discount rate.</AccordionItem>
    <AccordionItem value="market" title="Market approach">Guideline public companies, median EV/Revenue of 4.2x.</AccordionItem>
    <AccordionItem value="cost" title="Cost approach" disabled>Not applicable for this company.</AccordionItem>
  </>
);

/** Up/Down move between headers, Home/End jump, Enter or Space toggles. */
export const Multiple: Story = { args: { defaultValue: ['income'] }, render: (args) => <div style={{ width: 480 }}><Accordion {...args}>{items}</Accordion></div> };
export const Single: Story = { args: { type: 'single', defaultValue: ['market'] }, render: (args) => <div style={{ width: 480 }}><Accordion {...args}>{items}</Accordion></div> };
export const Standalone: Story = {
  render: () => <div style={{ width: 480 }}><AccordionItem title="Methodology notes" defaultOpen>Notes captured by the analyst.</AccordionItem></div>,
};

export const DrawerStory: StoryObj<typeof Drawer> = {
  name: 'Drawer',
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 420 } } },
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ padding: 'var(--space-l)' }}>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Document details"
          footer={<><Button variant="tertiary" onClick={() => setOpen(false)}>Close</Button><Button>Download</Button></>}
        >
          <p>Q3 2026 financials.xlsx, uploaded by Alex Rivera.</p>
        </Drawer>
      </div>
    );
  },
};

export const DrawerLeft: StoryObj<typeof Drawer> = {
  name: 'Drawer (left)',
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 420 } } },
  render: () => <Drawer open onClose={() => undefined} side="left" title="Filters"><p>Filter options.</p></Drawer>,
};

export const DrawerBottom: StoryObj<typeof Drawer> = {
  name: 'Drawer (bottom)',
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 420 } } },
  render: () => <Drawer open onClose={() => undefined} side="bottom" title="Activity"><p>Recent activity.</p></Drawer>,
};

export const DrawerNonModal: StoryObj<typeof Drawer> = {
  name: 'Drawer (non-modal)',
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 420 } } },
  render: () => <Drawer open modal={false} onClose={() => undefined} title="Comments"><p>No scrim; the page stays interactive.</p></Drawer>,
};

/** Left/Right and Home/End move between tabs. */
export const Workspace: StoryObj<typeof WorkspaceDrawer> = {
  name: 'WorkspaceDrawer',
  parameters: { layout: 'padded' },
  render: function Render() {
    const [tab, setTab] = useState('docs');
    return (
      <div style={{ width: 640 }}>
        <WorkspaceDrawer
          expanded
          tabs={
            <>
              <WorkspaceDrawerTab label="Documents" count={4} icon={<Icon size="s" tone="inherit"><Document /></Icon>} active={tab === 'docs'} onClick={() => setTab('docs')} />
              <WorkspaceDrawerTab label="Ask Scalar" ai icon={<Icon size="s" tone="inherit"><Sparkle /></Icon>} active={tab === 'ai'} onClick={() => setTab('ai')} />
            </>
          }
        >
          {tab === 'docs' ? 'Four documents attached.' : 'Ask a question about this company.'}
        </WorkspaceDrawer>
      </div>
    );
  },
};

export const WorkspaceDocked: StoryObj<typeof WorkspaceDrawer> = {
  name: 'WorkspaceDrawer (docked)',
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ width: 640 }}>
      <WorkspaceDrawer docked tabs={<><WorkspaceDrawerTab label="Documents" count={4} /><WorkspaceDrawerTab label="Ask Scalar" ai /></>} />
    </div>
  ),
};

export const ReviewCard: StoryObj<typeof DataReviewCard> = {
  name: 'DataReviewCard',
  parameters: { layout: 'padded' },
  render: function Render() {
    const [selected, setSelected] = useState(false);
    return (
      <div style={{ width: 480 }}>
        <DataReviewCard
          title="Revenue FY2025"
          sourceFile="Q4-financials.pdf"
          quote="Total net revenue for the year was $42.3 million."
          rationale="Matches the income statement on page 4."
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onAccept={() => undefined}
          onReject={() => undefined}
        />
      </div>
    );
  },
};

export const ReviewCardReadOnly: StoryObj<typeof DataReviewCard> = {
  name: 'DataReviewCard (read only)',
  parameters: { layout: 'padded' },
  render: () => <div style={{ width: 480 }}><DataReviewCard title="EBITDA FY2025" quote="Adjusted EBITDA was $8.1 million." /></div>,
};
