import { useState } from 'react';
import { Card, Cell, ColumnHeader, DataGrid, EmptyState, Row, SegmentedControl, Text, space } from '@scalar/design-system';
import type { ScreenProps } from '../../../types.js';
import { companyById } from '../../../data/fixtures.js';
import { CompanyLayout } from '../../../shell/CompanyLayout.js';
import { ToolbarAi } from '../../../shell/Toolbar.js';
import { CompanyActions, CurrencyUnit, SummarySubNav } from '../../p06-company-summary-financials/CompanyChrome.js';
import { ZxIndexCard } from './ZxIndexCard.js';
import { PublicCompsCard } from './PublicCompsCard.js';
import { BoardPresentationsCard } from './BoardPresentationsCard.js';

/**
 * Company Overview v2 (prototype). Order: Company Information · ZX Index Value ·
 * Public Comps (new) · Board Presentations (new) · Mutual Fund Marks ·
 * Fundraising Rounds · Financial History + News. The last four are out of scope
 * and shown only as placeholders so the page reads in context.
 */
export function CompanyOverviewV2({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [asOf, setAsOf] = useState<'date' | 'latest'>('date');
  const board = state === 'board-short' ? 'short' : state === 'board-long' ? 'long' : 'default';

  return (
    <CompanyLayout
      company={company}
      section="summary"
      date={company.asOf}
      headerEnd={<CompanyActions company={company} />}
      subNav={<SummarySubNav company={company} current="overview" />}
      subNavEnd={<><ToolbarAi /><CurrencyUnit /></>}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: space.s }}>
        <Text as="span" step="s" tone="tertiary">Data as of</Text>
        <SegmentedControl label="Data as of" value={asOf} onChange={setAsOf}
          options={[{ value: 'date', label: company.asOfIso }, { value: 'latest', label: 'Latest' }]} />
      </div>

      <Card title="Company Information">
        <Text step="m" tone="secondary"><em>No business description available.</em></Text>
      </Card>

      <ZxIndexCard />
      <PublicCompsCard />
      <BoardPresentationsCard variant={board} />

      {/* Unchanged in this pass — placeholders for context only. */}
      <Card title="Mutual Fund Marks">
        <EmptyState type="no-data" title="No mutual fund marks" body="Unchanged in this pass." />
      </Card>
      <Card title="Fundraising Rounds">
        <DataGrid label="Fundraising rounds" head={<><ColumnHeader grow={2} tone="subtle">Round</ColumnHeader><ColumnHeader tone="subtle">Date</ColumnHeader><ColumnHeader numeric tone="subtle">Amount</ColumnHeader></>}>
          <Row><Cell>Series B</Cell><Cell>Mar 2024</Cell><Cell numeric type="data">$32,000,000</Cell></Row>
          <Row><Cell>Series A</Cell><Cell>Jan 2022</Cell><Cell numeric type="data">$12,000,000</Cell></Row>
        </DataGrid>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.l }}>
        <Card title="Financial History"><Text step="m" tone="secondary">Unchanged in this pass.</Text></Card>
        <Card title="News & Press Releases"><Text step="m" tone="secondary">Unchanged in this pass.</Text></Card>
      </div>
    </CompanyLayout>
  );
}
