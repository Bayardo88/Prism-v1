import { useState } from 'react';
import {
  Banner, Button, Card, Chip, EmptyState, Icon, KeyValueRow, Link, SegmentedControl, TabItem, Tabs, Text, icons, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, type Company } from '../../data/fixtures.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import { ToolbarAi } from '../../shell/Toolbar.js';
import { CompanyActions, CurrencyUnit, SummarySubNav } from '../p06-company-summary-financials/CompanyChrome.js';

/** Record status → the chip the frame shows ("Operating" for an active company). Words carry it, not colour. */
const STATUS: Record<Company['status'], { label: string; tone: 'positive' | 'default' | 'negative' }> = {
  active: { label: 'Operating', tone: 'positive' },
  exited: { label: 'Exited', tone: 'default' },
  'written-off': { label: 'Written off', tone: 'negative' },
};

export function CompanyOverview({ params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [asOf, setAsOf] = useState<'date' | 'latest'>('date');
  const [source, setSource] = useState<'edgar' | 'zanbato'>('edgar');
  const [view, setView] = useState<'chart' | 'table'>('chart');

  return (
    <CompanyLayout
      company={company}
      section="summary"
      date={company.asOf}
      headerEnd={<CompanyActions company={company} />}
      subNav={<SummarySubNav company={company} current="overview" />}
      subNavEnd={<><ToolbarAi /><CurrencyUnit /></>}
    >
      <Banner
        tone="warning"
        title="Common profile pending confirmation"
        action={
          <Link href={href(routes.company.dailyNavSettings(company.id))}>Edit Common Profile</Link>
        }
      >
        This company's common profile match is pending confirmation. Review and confirm it in the Edit Common Profile dialog.
      </Banner>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: space.s }}>
        <Text as="span" step="s" tone="tertiary">Data as of</Text>
        <SegmentedControl
          label="Data as of"
          value={asOf}
          onChange={setAsOf}
          options={[{ value: 'date', label: company.asOfIso }, { value: 'latest', label: 'Latest' }]}
        />
      </div>

      <Card title="Company Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: space.l, alignItems: 'start' }}>
          <dl style={{ margin: 0 }}>
            <KeyValueRow label="Status" layout="stacked"><Chip size="s" styleVariant={STATUS[company.status].tone}>{STATUS[company.status].label}</Chip></KeyValueRow>
          </dl>
          <Text step="m" tone="secondary"><em>No business description available.</em></Text>
          <Text step="m" tone="secondary"><em>No Capital IQ data available.</em></Text>
        </div>
      </Card>

      <Card title="Mutual Fund Marks">
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
          <Tabs label="Mutual fund mark source">
            <TabItem active={source === 'edgar'} onClick={() => setSource('edgar')}>EDGAR</TabItem>
            <TabItem active={source === 'zanbato'} onClick={() => setSource('zanbato')}>Zanbato</TabItem>
          </Tabs>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: space.s }}>
            <SegmentedControl
              label="Mutual fund marks view"
              value={view}
              onChange={setView}
              options={[{ value: 'chart', label: 'Chart' }, { value: 'table', label: 'Table' }]}
            />
            <Button variant="secondary" tone="warning" trailingIcon={<Icon size="s" tone="inherit"><icons.OpenInNew /></Icon>}>SEC Filing</Button>
          </div>
          <EmptyState
            type="no-data"
            title="No mutual fund marks"
            body={`No mutual fund marks available for this company from ${source === 'edgar' ? 'EDGAR' : 'Zanbato'}.`}
          />
        </div>
      </Card>
    </CompanyLayout>
  );
}
