/**
 * Firm Valuations · preview drawer (prototype). The real Firm Valuations grid
 * (page 03), where clicking a company opens its latest valuation in a
 * non-modal Drawer instead of leaving the list: status, measurement and market
 * dates, headline values, open tasks and earlier measurements, with a way into the
 * full valuation. Another row swaps the preview; the grid keeps its scroll.
 *
 * States: default (closed) · open (Cohesity, published) · open-unpublished (ABC Co).
 */
import { useCallback, useState } from 'react';
import { Button, Card, CardItem, Drawer, Link, Text, currencySymbol, space } from '@scalar/design-system';
import type { ScreenProps } from '../../../types.js';
import { companyById, usd, type Company } from '../../../data/fixtures.js';
import { href, navigate } from '../../../router.js';
import { routes } from '../../../routes.js';
import { FirmValuations, Tasks } from '../../p03-valuations/FirmValuations.js';
import { valuationValues } from '../../p03-valuations/data.js';
import { StatusCell } from '../../p02-intelligence/cells.js';
import { PublishedNote } from '../../p02-intelligence/chrome.js';
import { versionsFor } from '../company-valuations-v2/data.js';
import { useValuationContext } from '../../../domain/context.js';
import { usFromIso } from '../../../domain/model.js';
import { ABSENCE_LABEL } from '../../../domain/display.js';
import { useMoney } from '../../../shell/displayUnit.js';

const INITIAL: Record<string, string | undefined> = { open: 'cohesity', 'open-unpublished': 'abc-co' };

function ValuationPreviewDrawer({ company, onClose }: { company: Company; onClose: () => void }) {
  // P1: dates and version come from the company's valuation context, never from the row.
  const ctx = useValuationContext(company);
  const money = useMoney();
  const v = valuationValues(company);
  // Headline values are withheld until the valuation is published, as in the grid.
  const published = v.eqv !== undefined;
  const summary = href(routes.company.valuationSummary(company.id));
  const unitCaption = `${currencySymbol(money.currency)} ${money.unit.toLowerCase()}`;
  const previous = versionsFor(company).slice(1);
  const change = v.chg ? Number(v.chg.replace('%', '')) : 0;

  return (
    <Drawer
      open
      modal={false}
      onClose={onClose}
      title={company.name}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>Close</Button>
          <Button onClick={() => navigate(routes.company.valuationSummary(company.id))}>Open valuation</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.s }}>
          <StatusCell company={company} />
          <Text step="s" tone="secondary">{ctx.valuation?.name ?? ABSENCE_LABEL['not-entered']}</Text>
        </div>

        <Card title="Valuation">
          <CardItem label="Measurement date" value={usFromIso(ctx.measurement.date)} />
          {/* P2: the market date is its own axis, not the measurement date. */}
          <CardItem label="Market date" value={usFromIso(ctx.measurement.marketDate)} />
          <CardItem label="Approaches" value={v.approaches || ABSENCE_LABEL['not-entered']} />
          <CardItem label="Allocation method" value={v.alloc || ABSENCE_LABEL['not-entered']} />
        </Card>

        <Card title="Headline values" action={<Text as="span" step="s" tone="tertiary">{unitCaption}</Text>}>
          {published ? (
            <>
              <CardItem label="Enterprise value" value={money.amount(v.ev!)} />
              <CardItem label="Equity value" value={money.amount(v.eqv!)} />
              <CardItem label="Breakeven exit equity" value={money.amount(v.breakeven!)} />
              <CardItem label="Current fund value" value={money.amount(v.cfv!)} />
              <CardItem label="Change from previous" value={v.chg} trend={change < 0 ? 'down' : change > 0 ? 'up' : undefined} />
            </>
          ) : (
            <PublishedNote />
          )}
        </Card>

        <Card title="Open tasks">
          <Tasks company={company} />
        </Card>

        {/* Earlier quarter-end measurements, each with its published equity value (synthetic history, as in company-valuations-v2). */}
        <Card title="Earlier measurements" action={<Link size="s" href={summary}>Open Summary</Link>}>
          {previous.map((p) => (
            <CardItem key={p.key} label={`${p.date} · equity value`} value={money.amount(usd.format(p.equityValue))} />
          ))}
        </Card>
      </div>
    </Drawer>
  );
}

export function FirmValuationsPreview({ state, params }: ScreenProps) {
  const [openId, setOpenId] = useState(INITIAL[state]);
  const onOpenRow = useCallback((c: Company) => setOpenId(c.id), []);
  const close = useCallback(() => setOpenId(undefined), []);
  return (
    <FirmValuations
      state="default"
      params={params}
      onOpenRow={onOpenRow}
      openRowId={openId}
      drawer={openId && <ValuationPreviewDrawer key={openId} company={companyById(openId)} onClose={close} />}
    />
  );
}
