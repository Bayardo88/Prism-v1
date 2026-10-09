import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  PrimaryMenu, MainMenuItem, SecondaryMenu, SecondaryMenuItem, TertiaryMenu, TertiaryMenuItem, CompanyInfo,
  CompanyDropdown, SearchBar, Notification, Badge, ComboTag, CurrencySelector, AITool, FilterDropdown, Selector, InformationLabel,
} from './index.js';
import { Avatar } from '../avatar/Avatar.js';

/** The three navigation tiers and the company info bar. Each tier is a labelled `<nav>` landmark. */
const meta = {
  title: 'Header/Chrome',
  component: PrimaryMenu,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PrimaryMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

const logo = <strong style={{ color: 'inherit' }}>Scalar</strong>;

/** Tab walks the items; the current section carries `aria-current="page"`. Pass `as="div"` if the page already has a banner. */
export const Primary: Story = {
  args: {
    logo,
    children: (
      <>
        <MainMenuItem href="#home">Home</MainMenuItem>
        <MainMenuItem href="#valuations" current>Valuations</MainMenuItem>
        <MainMenuItem href="#documents">Documents</MainMenuItem>
      </>
    ),
    end: (
      <>
        <CompanyDropdown>Acme Holdings</CompanyDropdown>
        <SearchBar shortcut="Ctrl+K" />
        <Notification unread />
        <Avatar size="s" initials="ML" alt="Maria Lopez" />
      </>
    ),
  },
};

export const PrimaryWithDropdownItem: Story = {
  args: {
    ...Primary.args,
    children: (
      <>
        <MainMenuItem href="#home">Home</MainMenuItem>
        <MainMenuItem expanded>Valuations</MainMenuItem>
      </>
    ),
  },
};

export const Secondary: Story = {
  render: () => (
    <SecondaryMenu label="Company">
      <SecondaryMenuItem href="#summary">Summary</SecondaryMenuItem>
      <SecondaryMenuItem href="#financials" current>Financials</SecondaryMenuItem>
      <SecondaryMenuItem href="#cap-table">Cap table</SecondaryMenuItem>
      <SecondaryMenuItem disabled>Waterfall</SecondaryMenuItem>
    </SecondaryMenu>
  ),
};

/** The kebab on the current view is a separate button when `onMenuClick` is passed. */
export const Tertiary: Story = {
  render: function Render() {
    const [views, setViews] = useState(['Income statement', 'Balance sheet']);
    return (
      <TertiaryMenu
        label="Views"
        onAdd={() => setViews((v) => [...v, `View ${v.length + 1}`])}
        end={
          <>
            <AITool />
            <CurrencySelector currency="USD" onClick={() => {}}>($) Thousands</CurrencySelector>
          </>
        }
      >
        {views.map((v, i) => (
          <TertiaryMenuItem key={v} href={`#${i}`} current={i === 0} onMenuClick={i === 0 ? () => {} : undefined} tags={i === 0 ? <ComboTag label="Fund" value="VIP" /> : undefined}>
            {v}
          </TertiaryMenuItem>
        ))}
      </TertiaryMenu>
    );
  },
};

export const CompanyInfoBar: Story = {
  render: () => (
    <CompanyInfo
      avatar={<Avatar size="m" initials="AH" alt="Acme Holdings" />}
      name="Acme Holdings"
      meta="ACME · Software"
      status={<Badge>Draft</Badge>}
      filter={<FilterDropdown label="Fund">All funds</FilterDropdown>}
      end={
        <>
          <Selector surface="surface" label="Date" value="Most Recent (06/30/2026)" onClick={() => {}} />
          <InformationLabel label="EV" value="$34,560,000" />
        </>
      }
    >
      <SecondaryMenu label="Company">
        <SecondaryMenuItem href="#summary" current>Summary</SecondaryMenuItem>
        <SecondaryMenuItem href="#financials">Financials</SecondaryMenuItem>
      </SecondaryMenu>
    </CompanyInfo>
  ),
};

/** A firm-level page: the title is the page heading; use `titleLevel` when another h1 exists. */
export const CompanyInfoFirmPage: Story = {
  render: () => <CompanyInfo name="Portfolio overview" titleLevel={2} />,
};
