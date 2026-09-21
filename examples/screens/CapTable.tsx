/**
 * Cap table — portfolio company.
 *
 * Archetype: data-sheet (screen-recipes.md). Built entirely from
 * @scalar/design-system; this file contains no colour, spacing or type value
 * of its own.
 */
import { useState } from 'react';
import {
  Alert, Avatar, Breadcrumb, Button, Cell, ColumnHeader, CompanyInfo,
  CurrencySelector, DataGrid, DonutChart, Footnote, Heading, Icon,
  InformationLabel, MainMenuItem, Notification, Pagination, PrimaryMenu,
  Row, ScalarProvider, SearchBar, SecondaryMenu, SecondaryMenuItem, Selector,
  Text, TertiaryMenu, TertiaryMenuItem, ValuationStatus,
  glyphs, space,
} from '@scalar/design-system';

interface Security {
  name: string;
  shares: number;
  fullyDiluted: number;
  price: number;
  value: number;
  /** Where the figure came from — drives the cell's text colour. */
  provenance: 'readable' | 'data' | 'input';
  footnote?: string;
}

const SECURITIES: Security[] = [
  { name: 'Series B Preferred', shares: 2_400_000, fullyDiluted: 31.2, price: 4.15, value: 9_960_000, provenance: 'data', footnote: '1' },
  { name: 'Series A Preferred', shares: 1_000_000, fullyDiluted: 13.0, price: 2.00, value: 2_000_000, provenance: 'data' },
  { name: 'Common Stock', shares: 3_100_000, fullyDiluted: 40.3, price: 1.00, value: 3_100_000, provenance: 'readable' },
  { name: 'Option pool (unallocated)', shares: 900_000, fullyDiluted: 11.7, price: 1.00, value: 900_000, provenance: 'input' },
  { name: 'Warrants', shares: 290_000, fullyDiluted: 3.8, price: 1.00, value: 290_000, provenance: 'input' },
];

const num = new Intl.NumberFormat('en-US');
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

// Column widths live here so the header and its body cells cannot drift apart.
const COL = {
  security: { flex: '2 1 0', minWidth: 0 },
  shares: { flex: '1 1 0', minWidth: 0 },
  fd: { flex: '0 0 96px' },
  price: { flex: '1 1 0', minWidth: 0 },
  value: { flex: '1 1 0', minWidth: 0 },
} as const;

export function CapTable() {
  const [page, setPage] = useState(1);

  const totalShares = SECURITIES.reduce((a, s) => a + s.shares, 0);
  const totalValue = SECURITIES.reduce((a, s) => a + s.value, 0);

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
        <MainMenuItem current>Companies</MainMenuItem>
        <MainMenuItem>Valuations</MainMenuItem>
        <MainMenuItem>Reports</MainMenuItem>
      </PrimaryMenu>

      <CompanyInfo
        avatar={<Avatar size="s" initials="AC" alt="Acme Inc." />}
        name="Acme Inc."
        meta="ACME · Software · Series B"
        status={<ValuationStatus state="in-service" />}
        end={
          <>
            <InformationLabel label="Equity value" value={usd.format(totalValue)} />
            <InformationLabel label="Fully diluted" value={`${num.format(totalShares)} sh`} />
          </>
        }
      />

      <SecondaryMenu>
        <SecondaryMenuItem>Overview</SecondaryMenuItem>
        <SecondaryMenuItem current>Cap table</SecondaryMenuItem>
        <SecondaryMenuItem>Waterfall</SecondaryMenuItem>
        <SecondaryMenuItem>Documents</SecondaryMenuItem>
      </SecondaryMenu>

      <TertiaryMenu>
        <TertiaryMenuItem current>Current</TertiaryMenuItem>
        <TertiaryMenuItem>As converted</TertiaryMenuItem>
        <TertiaryMenuItem>By round</TertiaryMenuItem>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: space.s, alignItems: 'center' }}>
          <Selector label="Measurement date" value="31 Dec 2025" />
          <CurrencySelector>USD</CurrencySelector>
        </div>
      </TertiaryMenu>

      <main
        className="scalar-page"
        style={{ padding: space.xl, display: 'flex', flexDirection: 'column', gap: space.l }}
      >
        <Breadcrumb
          items={[
            { label: 'Companies', href: '#' },
            { label: 'Acme Inc.', href: '#' },
            { label: 'Cap table' },
          ]}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: space.m }}>
          <Heading level={1} step="3xl">Cap table</Heading>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: space.s }}>
            <Button variant="secondary">Export</Button>
            <Button leadingIcon={<Icon size="s" tone="inherit"><glyphs.Document /></Icon>}>
              Add security
            </Button>
          </div>
        </div>

        <Alert style="warning" title="Option pool is unallocated">
          900,000 shares sit in an unallocated pool. Confirm the allocation before
          this table is used for a 409A.
        </Alert>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: space.l, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
            <DataGrid
              label="Cap table by security"
              head={
                <>
                  <ColumnHeader style={COL.security}>Security</ColumnHeader>
                  <ColumnHeader numeric style={COL.shares} sort="desc" onSortChange={() => {}}>
                    Shares
                  </ColumnHeader>
                  <ColumnHeader numeric style={COL.fd}>% FD</ColumnHeader>
                  <ColumnHeader numeric style={COL.price}>Price</ColumnHeader>
                  <ColumnHeader numeric style={COL.value}>Value</ColumnHeader>
                </>
              }
            >
              {SECURITIES.map((s, i) => (
                <Row key={s.name} zebra={i % 2 === 1}>
                  <Cell style={COL.security}>{s.name}</Cell>
                  <Cell
                    numeric
                    type={s.provenance}
                    style={COL.shares}
                    footnote={s.footnote ? <Footnote interactive>{s.footnote}</Footnote> : undefined}
                  >
                    {num.format(s.shares)}
                  </Cell>
                  <Cell numeric style={COL.fd}>{s.fullyDiluted.toFixed(1)}%</Cell>
                  <Cell numeric type={s.provenance} style={COL.price}>{usd2.format(s.price)}</Cell>
                  <Cell numeric style={COL.value}>{usd.format(s.value)}</Cell>
                </Row>
              ))}

              <Row type="total">
                <Cell state="total" style={COL.security}>Total</Cell>
                <Cell state="total" numeric style={COL.shares}>{num.format(totalShares)}</Cell>
                <Cell state="total" numeric style={COL.fd}>100.0%</Cell>
                <Cell state="total" numeric style={COL.price}>—</Cell>
                <Cell state="total" numeric style={COL.value}>{usd.format(totalValue)}</Cell>
              </Row>
            </DataGrid>

            <div style={{ display: 'flex', alignItems: 'center', gap: space.m }}>
              <Text step="s" tone="tertiary">
                <Footnote>1</Footnote> Series B shares include the 2025 secondary transfer.
              </Text>
              <div style={{ marginLeft: 'auto' }}>
                <Pagination page={page} pageCount={4} onPageChange={setPage} />
              </div>
            </div>
          </div>

          <DonutChart
            title="Ownership by security, fully diluted"
            total="7.69M"
            caption="Fully diluted"
            slices={SECURITIES.map((s) => ({ label: s.name, value: s.shares }))}
          />
        </div>
      </main>
    </ScalarProvider>
  );
}
