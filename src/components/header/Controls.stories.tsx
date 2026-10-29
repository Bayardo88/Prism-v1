import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Badge, badgeCount, CompanyDropdown, FilterDropdown, SearchBar, Notification, ComboTag, CurrencySelector,
  Selector, InformationLabel, ToolSwitch, AITool, formatCurrencyDisplayUnit,
} from './index.js';
import type { CurrencyDisplayUnit, ToolSwitchValue } from './index.js';
import { DataGrid } from '../table/DataGrid.js';
import { ColumnHeader } from '../table/ColumnHeader.js';
import { Row } from '../table/Row.js';
import { RowHeader } from '../table/RowHeader.js';
import { Cell } from '../table/Cell.js';
import { Icon } from '../icon/Icon.js';
import { Check } from '../icon/glyphs.js';

/** The controls that live in the header chrome. Triggers only: the screen owns any menu they open. */
const meta = {
  title: 'Header/Controls',
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ display: 'flex', gap: 'var(--space-s)', alignItems: 'center', flexWrap: 'wrap' }}><Story /></div>],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Badges: Story = {
  render: () => (
    <>
      <Badge aria-label="3 unread">3</Badge>
      <Badge aria-label="99 or more unread">{badgeCount(240)}</Badge>
      <Badge icon={<Icon size="xs" tone="inherit"><Check /></Icon>}>Verified</Badge>
    </>
  ),
};

export const CompanyDropdownClosed: Story = { render: () => <CompanyDropdown>Acme Holdings</CompanyDropdown> };
export const CompanyDropdownOpen: Story = { render: () => <CompanyDropdown expanded>Acme Holdings</CompanyDropdown> };

export const FilterDropdowns: Story = {
  render: () => (
    <>
      <FilterDropdown label="Period">All periods</FilterDropdown>
      <FilterDropdown label="Period" expanded>All periods</FilterDropdown>
      <FilterDropdown label="Period" disabled>All periods</FilterDropdown>
    </>
  ),
};

/** Filters as you type; it does not submit. Ctrl+K focus is the screen's job. */
export const Search: Story = {
  render: function Render() {
    const [q, setQ] = useState('');
    return <SearchBar value={q} onChange={(e) => setQ(e.target.value)} shortcut="Ctrl+K" />;
  },
};
export const SearchEmpty: Story = { render: () => <SearchBar /> };

export const NotificationStates: Story = {
  render: () => (
    <>
      <Notification />
      <Notification unread />
    </>
  ),
};

export const ComboTags: Story = {
  render: () => (
    <>
      <ComboTag label="Fund" value="VIP Fund" />
      <ComboTag label="Period" value="FY2025" />
    </>
  ),
};

export const CurrencySelectors: Story = {
  render: () => (
    <>
      <CurrencySelector currency="USD" onClick={() => {}}>($) Thousands</CurrencySelector>
      <CurrencySelector currency="EUR" expanded>(€) Millions</CurrencySelector>
      <CurrencySelector currency="USD">($) Thousands</CurrencySelector>
    </>
  ),
};

const statement = [
  { label: 'Total Revenue', fy: 22118 },
  { label: 'Total Cost of Sales', fy: 3078 },
  { label: 'Gross Profit', fy: 19041 },
  { label: 'Depreciation Expense', fy: -2503 },
];

/**
 * Unit cycle: each click steps Hundreds → Thousands → Millions → Hundreds, and the
 * table under it rescales. Figures are stored in Thousands; the screen rescales
 * them with `formatCurrencyDisplayUnit` — a display change, never a conversion.
 */
export const CurrencyUnitCycle: Story = {
  decorators: [(S) => <div style={{ display: 'grid', gap: 'var(--space-m)', width: 480 }}><S /></div>],
  render: function Render() {
    const [unit, setUnit] = useState<CurrencyDisplayUnit>('Hundreds');
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CurrencySelector currency="USD" unit={unit} onUnitChange={setUnit} />
        </div>
        <DataGrid label={`Income statement, in ${unit}`} head={<><ColumnHeader grow={2}>Income Statement</ColumnHeader><ColumnHeader numeric>FY 2024</ColumnHeader></>}>
          {statement.map((r, i) => (
            <Row key={r.label} zebra={i % 2 === 1}><RowHeader>{r.label}</RowHeader><Cell numeric type="data">{formatCurrencyDisplayUnit(r.fy, 'Thousands', unit)}</Cell></Row>
          ))}
        </DataGrid>
      </>
    );
  },
};

export const Selectors: Story = {
  render: () => (
    <>
      <Selector surface="surface" label="Date" value="Most Recent (06/30/2026)" onClick={() => {}} />
      <Selector surface="surface" label="Date" value="Most Recent (06/30/2026)" expanded />
      <Selector surface="surface" label="Measurement Date" value="03/31/2026" icon="calendar" onClick={() => {}} />
      <Selector surface="surface" label="Version" value="2026/06/01" dropdown={false} />
      <Selector surface="surface" label="Version" value="2026/06/01" disabled />
    </>
  ),
};

export const SelectorOnBrand: Story = {
  decorators: [(Story) => <div style={{ background: 'var(--color-bg-brand)', padding: 'var(--space-s)' }}><Story /></div>],
  render: () => <Selector label="Date" value="Most Recent (06/30/2026)" onClick={() => {}} />,
};

export const InformationLabels: Story = {
  render: () => (
    <>
      <InformationLabel label="EV" value="$34,560,000" />
      <InformationLabel label="Market" value="06/01/2026" tone="brand" dropdown />
      <InformationLabel label="Version" longValue="Valuation Version - 12/31/2026" />
      <InformationLabel label="Status" value="Final" marker={<Icon size="xs" tone="positive"><Check /></Icon>} />
    </>
  ),
};

/** A radio group with one tab stop: Arrow keys and Home/End move and select. */
export const Tools: Story = {
  render: function Render() {
    const [v, setV] = useState<ToolSwitchValue>('valuations');
    return <ToolSwitch value={v} onChange={setV} />;
  },
};

export const AIToolTrigger: Story = { render: () => <AITool /> };
export const AIToolTriggerWithText: Story = { render: () => <AITool>Ask AI</AITool> };
/** Enter submits the prompt. */
export const AIToolInput: Story = {
  render: function Render() {
    const [sent, setSent] = useState('');
    return (
      <div>
        <AITool state="input" onSubmit={setSent} />
        <p aria-live="polite">{sent && `Submitted: ${sent}`}</p>
      </div>
    );
  },
};
