import { useState } from 'react';
import {
  Card, CardItem, Cell, ColumnHeader, DataGrid, EmptyState, LineChart, Link, ModalStatus,
  Row, RowHeader, SegmentedControl, Text, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../../types.js';
import { companyById, num, pct, usd } from '../../../data/fixtures.js';
import { href } from '../../../router.js';
import { routes } from '../../../routes.js';
import { ValuationsLayout } from '../../p08-company-valuations/ValuationsLayout.js';
import { approachRowsFor, conclusionsFor } from '../../p08-company-valuations/data.js';
import { APPROACH_WEIGHTS, moic, moneyToNumber, versionsFor } from './data.js';

/** $ in thousands — the unit the Valuations header is set to. */
const k = (v: number) => usd.format(Math.round(v / 1000));

const StatusBadge = ({ status }: { status: { state: Parameters<typeof ModalStatus>[0]['state']; label?: string } }) => (
  <ModalStatus state={status.state}>{status.label}</ModalStatus>
);

/**
 * Company Valuations Overview (prototype). A landing for the company's
 * Valuations area: headline value, value trend, the version list, the approaches
 * that produced the value and the concluded value per fund. Everything links
 * into the real Summary / Conclusions tabs (page 08) — nothing is redrawn.
 */
export function CompanyValuationsV2({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const versions = versionsFor(company);
  const [selected, setSelected] = useState(versions[0]!.key);
  // The frame company (ABC Co) has no approaches yet, exactly like its p08 Summary and header ($0).
  const empty = state === 'no-approaches' || company.id === 'abc-co';
  const v = versions.find((x) => x.key === selected) ?? versions[0]!;
  const trend = [...versions].reverse();

  const summary = href(routes.company.valuationSummary(company.id));
  const conclusions = href(routes.company.valuationConclusions(company.id));
  const approachRows = approachRowsFor(company).filter((r) => r.type === 'child');
  const funds = conclusionsFor(company).flatMap((c) => c.funds.map((f) => ({ entity: c.entity, ...f })));

  return (
    <ValuationsLayout company={company} tab="overview" overviewHref={href(`/prototypes/company-valuations-v2/${company.id}`)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
        <div style={{ display: 'grid', gap: space.l, gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
          <Card
            title="Current valuation"
            tag={<StatusBadge status={v.status} />}
            action={
              <SegmentedControl
                label="Valuation version"
                value={selected}
                onChange={setSelected}
                options={versions.map((x) => ({ value: x.key, label: x.date }))}
              />
            }
          >
            <CardItem label="Version" value={v.label} />
            <CardItem label="Equity value ($ thousands)" value={empty ? '$0' : k(v.equityValue)} />
            <CardItem label="Unrealized firm total ($ thousands)" value={empty ? '$0' : k(v.fairValue)} />
            <CardItem label="MOIC" value={empty ? '0.00x' : moic(v.fairValue, company.invested)} />
            <CardItem label="Fully diluted ownership" value={pct(company.ownershipPct)} />
          </Card>

          <Card title="Equity value by version" action={<Text as="span" step="s" tone="tertiary">$ thousands</Text>}>
            <LineChart
              key={`${company.id}-${empty}`}
              title={`${company.name} equity value by version`}
              categoryLabel="Version"
              categories={trend.map((x) => x.date)}
              series={[{ label: 'Equity value', values: trend.map((x) => (empty ? 0 : Math.round(x.equityValue / 1000))) }]}
              format={(n) => usd.format(n)}
            />
          </Card>
        </div>

        <Card title="Versions" action={<Link size="s" href={summary}>Open current version</Link>}>
          <DataGrid
            label="Valuation versions"
            head={
              <>
                <ColumnHeader grow={2} tone="subtle">Version</ColumnHeader>
                <ColumnHeader tone="subtle">Measurement date</ColumnHeader>
                <ColumnHeader tone="subtle">Status</ColumnHeader>
                <ColumnHeader numeric tone="subtle">Equity value</ColumnHeader>
                <ColumnHeader numeric tone="subtle">Unrealized value</ColumnHeader>
              </>
            }
          >
            {versions.map((x, i) => (
              <Row key={x.key} zebra={i % 2 === 1}>
                <RowHeader href={summary}>{x.label}</RowHeader>
                <Cell>{x.date}</Cell>
                <Cell><StatusBadge status={x.status} /></Cell>
                <Cell numeric type="data">{i === 0 && empty ? '$0' : k(x.equityValue)}</Cell>
                <Cell numeric type="data">{i === 0 && empty ? '$0' : k(x.fairValue)}</Cell>
              </Row>
            ))}
          </DataGrid>
        </Card>

        <div style={{ display: 'grid', gap: space.l, gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
          <Card title="Approaches" action={<Link size="s" href={summary}>Open Summary</Link>}>
            {empty ? (
              <EmptyState
                type="no-data"
                title="This version has no approaches"
                body="Add an approach to weight it into an enterprise and equity value."
                actions={<Link href={summary}>Go to Summary</Link>}
              />
            ) : (
              <DataGrid
                label="Approaches and weights"
                head={
                  <>
                    <ColumnHeader grow={2} tone="subtle">Approach</ColumnHeader>
                    <ColumnHeader numeric tone="subtle">Weight</ColumnHeader>
                    <ColumnHeader numeric tone="subtle">Enterprise value</ColumnHeader>
                    <ColumnHeader numeric tone="subtle">Equity value</ColumnHeader>
                  </>
                }
              >
                {approachRows.map((r, i) => (
                  <Row key={r.label} zebra={i % 2 === 1}>
                    <Cell>{r.label}</Cell>
                    <Cell numeric type="input">{`${APPROACH_WEIGHTS.find((w) => w.label === r.label)?.weight ?? 0}.0%`}</Cell>
                    <Cell numeric type="data">{usd.format(Math.round(moneyToNumber(r.ev) * v.scale))}</Cell>
                    <Cell numeric type="data">{usd.format(Math.round(moneyToNumber(r.equity) * v.scale))}</Cell>
                  </Row>
                ))}
              </DataGrid>
            )}
          </Card>

          <Card title="Concluded value by fund" action={<Link size="s" href={conclusions}>Open Conclusions</Link>}>
            {empty ? (
              <EmptyState type="no-data" title="Nothing concluded yet" body="Values appear here once an approach concludes." />
            ) : (
              <DataGrid
                label="Concluded value by fund ($ thousands)"
                head={
                  <>
                    <ColumnHeader grow={2} tone="subtle">Fund · entity</ColumnHeader>
                    <ColumnHeader numeric tone="subtle">Shares</ColumnHeader>
                    <ColumnHeader numeric tone="subtle">Value</ColumnHeader>
                    <ColumnHeader numeric tone="subtle">MOIC</ColumnHeader>
                  </>
                }
              >
                {funds.map((f, i) => {
                  const shares = f.positions.reduce((a, p) => a + p.shares, 0);
                  const value = f.positions.reduce((a, p) => a + p.value, 0) * v.scale;
                  const invested = f.positions.reduce((a, p) => a + p.invested, 0);
                  return (
                    <Row key={`${f.entity}-${f.fund}`} zebra={i % 2 === 1}>
                      <Cell>{`${f.fund} · ${f.entity}`}</Cell>
                      <Cell numeric type="data">{num.format(shares)}</Cell>
                      <Cell numeric type="data">{k(value)}</Cell>
                      <Cell numeric type="data">{moic(value, invested)}</Cell>
                    </Row>
                  );
                })}
              </DataGrid>
            )}
          </Card>
        </div>
      </div>
    </ValuationsLayout>
  );
}
