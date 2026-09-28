/**
 * Intelligence → Schedule of Investments: every security the firm holds,
 * grouped by company, each company in its own cap-table currency.
 */
import { CurrencySelector, Heading, Link, space } from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { useState } from 'react';
import { PortfolioGrid } from './PortfolioGrid.js';
import { ExportMenuItems, PortfolioHeader } from './chrome.js';
import { fixtureId, slug, soiColumns, soiCompanies } from './data.js';

export function ScheduleOfInvestments(_props: ScreenProps) {
  const [actions, setActions] = useState(false);
  return (
    <AppFrame area="intelligence">
      <PortfolioHeader title="Intelligence" tab="soi" actionsOpen={actions} onActionsOpen={setActions} actions={<ExportMenuItems />} />
      <PageBody gap={space.xl}>
        <Heading level={2} step="m">Schedule of Investments</Heading>
        {soiCompanies.map((c) => {
          const id = fixtureId(c.name);
          return (
            <section key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
              <Heading level={3} step="s">
                {id ? <Link href={href(routes.company.capTable(id))}>{c.name}</Link> : c.name}
              </Heading>
              <div><CurrencySelector>{c.currency} ({c.symbol})</CurrencySelector></div>
              <PortfolioGrid
                label={`${c.name} investments`}
                firstColumn="Type of Security"
                columns={soiColumns}
                rows={c.securities.map((s) => ({ id: slug(s.name), label: s.name, sortText: s.name, values: s.v }))}
                total={c.total}
              />
            </section>
          );
        })}
      </PageBody>
    </AppFrame>
  );
}
