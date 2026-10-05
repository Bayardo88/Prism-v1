/**
 * Intelligence → Schedule of Investments: every security the firm holds,
 * grouped by company (from the database, the frame's four first), each in
 * the company's cap-table currency, with "Show N more companies".
 */
import { useState } from 'react';
import { CurrencySelector, Heading, RowHeader, ShowMoreRow, space } from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { PortfolioGrid } from './PortfolioGrid.js';
import { ExportMenuItems, PortfolioHeader } from './chrome.js';
import { SOI_FRAME, SOI_STEP, inFrameOrder, soiColumns, soiFor } from './data.js';

const ORDER = inFrameOrder(SOI_FRAME);

export function ScheduleOfInvestments(_props: ScreenProps) {
  const [actions, setActions] = useState(false);
  const [shown, setShown] = useState(SOI_FRAME.length);
  const more = Math.min(SOI_STEP, ORDER.length - shown);

  return (
    <AppFrame area="intelligence">
      <PortfolioHeader title="Intelligence" tab="soi" actionsOpen={actions} onActionsOpen={setActions} actions={<ExportMenuItems />} />
      <PageBody gap={space.xl}>
        <Heading level={2} step="m">Schedule of Investments</Heading>
        {ORDER.slice(0, shown).map((c) => {
          const s = soiFor(c);
          return (
            <section key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
              <RowHeader type="divider" role="heading" aria-level={3} href={href(routes.company.capTable(c.id))}>{c.name}</RowHeader>
              <div><CurrencySelector>{s.currency.code} ({s.currency.symbol})</CurrencySelector></div>
              <PortfolioGrid
                label={`${c.name} investments`}
                firstColumn="Type of Security"
                columns={soiColumns}
                rows={s.securities.map((sec, i) => ({ id: `${c.id}-${i}`, label: sec.name, sortText: sec.name, values: sec.v }))}
                total={s.total}
              />
            </section>
          );
        })}
        {more > 0 && (
          <ShowMoreRow onClick={() => setShown((n) => n + more)}>
            Show {more} more companies · {ORDER.length - shown} not shown
          </ShowMoreRow>
        )}
      </PageBody>
    </AppFrame>
  );
}
