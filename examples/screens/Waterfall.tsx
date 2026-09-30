/**
 * Exit waterfall — portfolio company.
 *
 * Archetype: data-sheet (screen-recipes.md). Built entirely from
 * @scalar/design-system; this file contains no colour, spacing or type value
 * of its own.
 *
 * The scenario tabs are live: changing the scenario re-solves the waterfall,
 * the distribution grid and the chart from one set of assumptions, so the
 * figures cannot drift apart the way a static mockup's would.
 */
import { useMemo, useState } from 'react';
import {
  Alert, Avatar, Breadcrumb, Button, Cell, Chip, ColumnHeader, CompanyInfo,
  CurrencySelector, DataGrid, Footnote, Heading, InformationLabel,
  MainMenuItem, Notification, PrimaryMenu, Row, ScalarProvider, SearchBar,
  SecondaryMenu, SecondaryMenuItem, Selector, Text, TertiaryMenu,
  TertiaryMenuItem, ValuationStatus, WaterfallChart, WorkspaceDrawer,
  WorkspaceDrawerTab, space,
} from '@scalar/design-system';

/* --- the assumptions ----------------------------------------------------- */

type ScenarioKey = 'base' | 'upside' | 'downside';

interface Scenario {
  label: string;
  /** Exit enterprise value. */
  enterpriseValue: number;
  exitDate: string;
}

const SCENARIOS: Record<ScenarioKey, Scenario> = {
  base: { label: 'Base case', enterpriseValue: 176_260_000, exitDate: '31 Dec 2028' },
  upside: { label: 'Upside', enterpriseValue: 235_000_000, exitDate: '30 Jun 2029' },
  downside: { label: 'Downside', enterpriseValue: 92_500_000, exitDate: '31 Dec 2027' },
};

const CASH = 8_400_000;
const DEBT = 21_000_000;

interface Security {
  name: string;
  shares: number;
  /** Fully diluted share of the residual, as a percentage. */
  fullyDiluted: number;
  /** 1× liquidation preference, senior to the residual split. */
  preference: number;
  /** Cost basis, for MOIC. */
  invested: number;
  /** True when the firm holds it — drives the firm's own proceeds figure. */
  firmHeld?: boolean;
  footnote?: string;
}

const SECURITIES: Security[] = [
  { name: 'Series B Preferred', shares: 2_400_000, fullyDiluted: 31.2, preference: 9_960_000, invested: 9_960_000, firmHeld: true, footnote: '1' },
  { name: 'Series A Preferred', shares: 1_000_000, fullyDiluted: 13.0, preference: 2_000_000, invested: 2_000_000, firmHeld: true },
  { name: 'Common Stock', shares: 3_100_000, fullyDiluted: 40.3, preference: 0, invested: 3_100_000 },
  { name: 'Option pool (unallocated)', shares: 900_000, fullyDiluted: 11.7, preference: 0, invested: 900_000 },
  { name: 'Warrants', shares: 290_000, fullyDiluted: 3.8, preference: 0, invested: 290_000 },
];

/* --- the arithmetic ------------------------------------------------------ */

interface Distribution extends Security {
  residual: number;
  proceeds: number;
  shareOfExit: number;
  moic: number;
}

function solve(enterpriseValue: number) {
  const exitEquity = enterpriseValue + CASH - DEBT;
  const preference = SECURITIES.reduce((a, s) => a + s.preference, 0);
  const residualPool = Math.max(exitEquity - preference, 0);

  const rows: Distribution[] = SECURITIES.map((s) => {
    const residual = residualPool * (s.fullyDiluted / 100);
    const proceeds = s.preference + residual;
    return {
      ...s,
      residual,
      proceeds,
      shareOfExit: exitEquity > 0 ? (proceeds / exitEquity) * 100 : 0,
      moic: proceeds / s.invested,
    };
  });

  return {
    exitEquity,
    preference,
    residualPool,
    rows,
    firmProceeds: rows.filter((r) => r.firmHeld).reduce((a, r) => a + r.proceeds, 0),
    totalProceeds: rows.reduce((a, r) => a + r.proceeds, 0),
    totalInvested: rows.reduce((a, r) => a + r.invested, 0),
  };
}

/* --- formatting ---------------------------------------------------------- */

const num = new Intl.NumberFormat('en-US');
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1,
});

// Column widths live here so the header and its body cells cannot drift apart.
const COL = {
  security: { flex: '2 1 0', minWidth: 0 },
  shares: { flex: '1 1 0', minWidth: 0 },
  preference: { flex: '1 1 0', minWidth: 0 },
  residual: { flex: '1 1 0', minWidth: 0 },
  proceeds: { flex: '1 1 0', minWidth: 0 },
  share: { flex: '1 1 0', minWidth: 0 },
  moic: { flex: '1 1 0', minWidth: 0 },
} as const;

const ASSUMPTION = {
  label: { flex: '2 1 0', minWidth: 0 },
  value: { flex: '1 1 0', minWidth: 0 },
} as const;

/* --- the screen ---------------------------------------------------------- */

export function Waterfall() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('base');
  const scenario = SCENARIOS[scenarioKey];
  const solved = useMemo(() => solve(scenario.enterpriseValue), [scenario.enterpriseValue]);
  const overridden = scenarioKey !== 'base';

  const steps = [
    { label: 'Exit enterprise value', value: scenario.enterpriseValue, total: true },
    { label: 'Plus cash', value: CASH },
    { label: 'Less debt', value: -DEBT },
    { label: 'Exit equity value', value: solved.exitEquity, total: true },
    { label: 'Less liquidation preference', value: -solved.preference },
    { label: 'Residual to shareholders', value: solved.residualPool, total: true },
  ];

  return (
    <ScalarProvider mode="system" viewport="auto">
      <PrimaryMenu
        logo={<Text step="l" weight="bold" tone="inherit" as="span">Scalar</Text>}
        end={
          <>
            <SearchBar />
            <Notification unread />
            <Avatar size="s" initials="BV" alt="Bayardo V" />
          </>
        }
      >
        <MainMenuItem>Companies</MainMenuItem>
        <MainMenuItem>Valuations</MainMenuItem>
        <MainMenuItem current>Waterfalls</MainMenuItem>
        <MainMenuItem>Reports</MainMenuItem>
      </PrimaryMenu>

      <CompanyInfo
        avatar={<Avatar size="s" initials="AC" alt="Acme Inc." />}
        name="Acme Inc."
        meta="ACME · Software · Series B"
        status={<ValuationStatus state="in-service" />}
        end={
          <>
            <InformationLabel label="Exit equity value" value={usd.format(solved.exitEquity)} />
            <InformationLabel label="Firm total exit proceeds" value={usd.format(solved.firmProceeds)} />
          </>
        }
      />

      <SecondaryMenu>
        <SecondaryMenuItem>Overview</SecondaryMenuItem>
        <SecondaryMenuItem>Cap table</SecondaryMenuItem>
        <SecondaryMenuItem current>Waterfall</SecondaryMenuItem>
        <SecondaryMenuItem>Documents</SecondaryMenuItem>
      </SecondaryMenu>

      <TertiaryMenu>
        {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => (
          <TertiaryMenuItem
            key={key}
            current={key === scenarioKey}
            onClick={() => setScenarioKey(key)}
          >
            {SCENARIOS[key].label}
          </TertiaryMenuItem>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: space.s, alignItems: 'center' }}>
          <Selector label="Exit date" value={scenario.exitDate} />
          <CurrencySelector>USD</CurrencySelector>
        </div>
      </TertiaryMenu>

      <main
        className="scalar-page"
        style={{ padding: space.xl, display: 'flex', flexDirection: 'column', gap: space.l }}
      >
        <Breadcrumb
          items={[
            { label: 'Waterfalls', href: '#' },
            { label: 'Acme Inc.', href: '#' },
            { label: 'Exit waterfall' },
          ]}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: space.m }}>
          <Heading level={1} step="3xl">Exit waterfall</Heading>
          <Chip styleVariant={overridden ? 'warning' : 'default'}>{scenario.label}</Chip>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: space.s }}>
            <Button variant="secondary">Export</Button>
            {/* No leading glyph: the product icon set ships from SDS_Main icons,
                which is not in this package (known-gaps §4). The structural
                glyphs here are not a substitute. */}
            <Button>Add allocation scenario</Button>
          </div>
        </div>

        {overridden && (
          <Alert
            style="warning"
            title="Scenario mode active"
            actions={
              <Button variant="secondary" tone="warning" onClick={() => setScenarioKey('base')}>
                Reset scenario
              </Button>
            }
          >
            Enterprise value has been overridden to {usd.format(scenario.enterpriseValue)} to
            simulate returns. These figures are not saved to the valuation.
          </Alert>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.l, alignItems: 'start' }}>
          <DataGrid
            label="Exit assumptions"
            head={
              <>
                <ColumnHeader style={ASSUMPTION.label}>Exit assumptions</ColumnHeader>
                <ColumnHeader numeric style={ASSUMPTION.value}>{scenario.label}</ColumnHeader>
              </>
            }
          >
            <Row>
              <Cell style={ASSUMPTION.label}>Exit date</Cell>
              <Cell numeric type="input" style={ASSUMPTION.value}>{scenario.exitDate}</Cell>
            </Row>
            <Row zebra>
              <Cell style={ASSUMPTION.label}>Exit enterprise value</Cell>
              <Cell numeric type="input" style={ASSUMPTION.value}>
                {usd.format(scenario.enterpriseValue)}
              </Cell>
            </Row>
            <Row>
              <Cell style={ASSUMPTION.label}>Plus cash</Cell>
              <Cell numeric type="data" style={ASSUMPTION.value}>{usd.format(CASH)}</Cell>
            </Row>
            <Row zebra>
              <Cell style={ASSUMPTION.label}>Less debt</Cell>
              <Cell numeric type="data" style={ASSUMPTION.value}>({usd.format(DEBT)})</Cell>
            </Row>
            <Row type="total">
              <Cell state="total" style={ASSUMPTION.label}>Exit equity value</Cell>
              <Cell state="total" numeric style={ASSUMPTION.value}>{usd.format(solved.exitEquity)}</Cell>
            </Row>
            <Row type="total">
              <Cell state="total" style={ASSUMPTION.label}>Firm total exit proceeds</Cell>
              <Cell state="total" numeric style={ASSUMPTION.value}>{usd.format(solved.firmProceeds)}</Cell>
            </Row>
          </DataGrid>

          {/* `key` forces a remount when the scenario changes. ChartCanvas's
              draw effect depends only on the resolved token object, so a chart
              whose *data* changes never redraws — without this the bars keep
              the base-case figures while the grid beside them updates. Screen-
              level work-around; the fix belongs in ChartCanvas. */}
          <WaterfallChart
            key={scenarioKey}
            title="How enterprise value becomes proceeds to shareholders"
            steps={steps}
            format={(v) => usdCompact.format(v)}
          />
        </div>

        <DataGrid
          label="Distribution by security"
          head={
            <>
              <ColumnHeader style={COL.security}>Security</ColumnHeader>
              <ColumnHeader numeric style={COL.shares}>Shares</ColumnHeader>
              <ColumnHeader numeric style={COL.preference}>Preference</ColumnHeader>
              <ColumnHeader numeric style={COL.residual}>Residual</ColumnHeader>
              <ColumnHeader numeric style={COL.proceeds} sort="desc" onSortChange={() => {}}>
                Proceeds
              </ColumnHeader>
              <ColumnHeader numeric style={COL.share}>% of exit</ColumnHeader>
              <ColumnHeader numeric style={COL.moic}>MOIC</ColumnHeader>
            </>
          }
        >
          {solved.rows.map((r, i) => (
            <Row key={r.name} zebra={i % 2 === 1}>
              <Cell style={COL.security}>{r.name}</Cell>
              <Cell numeric type="data" style={COL.shares}>{num.format(r.shares)}</Cell>
              <Cell
                numeric
                type="data"
                style={COL.preference}
                footnote={r.footnote ? <Footnote interactive>{r.footnote}</Footnote> : undefined}
              >
                {r.preference ? usd.format(r.preference) : '—'}
              </Cell>
              <Cell numeric style={COL.residual}>{usd.format(r.residual)}</Cell>
              <Cell numeric style={COL.proceeds}>{usd.format(r.proceeds)}</Cell>
              <Cell numeric style={COL.share}>{r.shareOfExit.toFixed(1)}%</Cell>
              <Cell numeric style={COL.moic}>{r.moic.toFixed(2)}×</Cell>
            </Row>
          ))}

          <Row type="total">
            <Cell state="total" style={COL.security}>Total</Cell>
            <Cell state="total" numeric style={COL.shares}>
              {num.format(SECURITIES.reduce((a, s) => a + s.shares, 0))}
            </Cell>
            <Cell state="total" numeric style={COL.preference}>{usd.format(solved.preference)}</Cell>
            <Cell state="total" numeric style={COL.residual}>{usd.format(solved.residualPool)}</Cell>
            <Cell state="total" numeric style={COL.proceeds}>{usd.format(solved.totalProceeds)}</Cell>
            <Cell state="total" numeric style={COL.share}>100.0%</Cell>
            <Cell state="total" numeric style={COL.moic}>
              {(solved.totalProceeds / solved.totalInvested).toFixed(2)}×
            </Cell>
          </Row>
        </DataGrid>

        <Text step="s" tone="tertiary">
          <Footnote>1</Footnote> Series B carries a 1× non-participating preference; it is
          shown participating here because the as-converted value exceeds it in every
          scenario above.
        </Text>
      </main>

      <WorkspaceDrawer
        tabs={
          <>
            <WorkspaceDrawerTab label="Data review" count={6} ai active />
            <WorkspaceDrawerTab label="Notes" />
            <WorkspaceDrawerTab label="Sheets" />
            <WorkspaceDrawerTab label="Documents" count={3} />
          </>
        }
      />
    </ScalarProvider>
  );
}
