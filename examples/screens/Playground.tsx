/**
 * Playground — every token and every component in code, on one page.
 *
 * Tokens are read from src/tokens/tokens.json and drawn live against the
 * current theme and type ramp; components are the real package exports. Use the
 * bar to flip Light / Dark and the Desktop / Desktop Large / Mobile type ramp.
 * Built entirely from @scalar/design-system; no colour, spacing or type value of
 * its own (playground.css only lays the page out, with tokens).
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Accordion, AccordionItem, AIButton, AITool, Alert, Avatar, Badge, BarChart, Breadcrumb, Button, ButtonIcon,
  CalendarDay, Card, CardItem, Cell, ChartLegend, Checkbox, CheckboxItem, Chip, ColumnHeader, ColumnItem,
  ColumnTitle, ComboTag, CompanyDropdown, CompanyInfo, ContentCell, CurrencySelector, DataGrid, DataReviewCard,
  DatePicker, Divider, DonutChart, Drawer, EmptyState, FilterDropdown, FormField, Footnote, Icon, Input,
  InformationLabel, KeyHint, Ledger, LineChart, Link, MainMenuItem, MenuGroupLabel, MenuPanel, Modal, ModalSearch,
  ModalStatus, Notification, Overline, PageItem, Pagination, PrimaryMenu, ProgressBar, Radio, Row, ScalarProvider,
  SearchBar, SearchResultRow, SearchScopeChip, SearchSectionHeader, SecondaryMenu, SecondaryMenuItem, Select,
  Selector, Skeleton, Step, Stepper, SubmenuItem, Switch, TabItem, Tabs, TertiaryMenu, TertiaryMenuItem, Text,
  Textarea, Heading, Label, Toast, Typography, Tooltip, ToolSwitch, ValuationInfo, ValuationStatus, WaterfallChart,
  WorkspaceDrawer, WorkspaceDrawerTab, glyphs, icons,
  type ThemeMode, type ViewportMode, type ToolSwitchValue,
} from '@scalar/design-system';
import { Gallery } from './Gallery.js';

/* ------------------------------------------------------------------ tokens */

interface TokenData {
  color: Record<string, { light: string; dark: string }>;
  scales: Record<string, string | number | null>;
  type: Record<'desktop' | 'desktop-large' | 'mobile', Record<string, string>>;
  primitives: Record<string, string>;
}

function useTokens(): TokenData | null {
  const [data, setData] = useState<TokenData | null>(null);
  useEffect(() => {
    fetch('../src/tokens/tokens.json').then((r) => r.json()).then(setData).catch(() => setData(null));
  }, []);
  return data;
}

const G = (glyph: ReactNode) => <Icon size="s" tone="inherit">{glyph}</Icon>;
const cssVar = (name: string, value: string): CSSProperties => ({ [name]: value } as CSSProperties);

function Part({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="pg-part" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Block({ id, title, note, children }: { id?: string; title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className="pg-block" id={id}>
      <h3>{title}</h3>
      {note && <p className="pg-note">{note}</p>}
      {children}
    </div>
  );
}

const Row_ = ({ children }: { children: ReactNode }) => <div className="pg-row">{children}</div>;
const Cap = ({ children }: { children: ReactNode }) => <p className="pg-label">{children}</p>;

function Swatch({ name, light, dark }: { name: string; light?: string; dark?: string }) {
  return (
    <div className="pg-sw">
      <div className="pg-sw__chip"><span className="pg-sw__fill" style={{ background: `var(${name})` }} /></div>
      <code>{name.replace('--color-', '')}</code>
      {light && <small>Light {light} · Dark {dark}</small>}
    </div>
  );
}

function ColourTokens({ data }: { data: TokenData }) {
  const groups: Record<string, string[]> = {};
  for (const k of Object.keys(data.color)) {
    const g = k.replace('--color-', '').split('-')[0] ?? 'other';
    (groups[g] ??= []).push(k);
  }
  return (
    <>
      {Object.entries(groups).map(([g, names]) => (
        <Block key={g} title={`Colour · ${g}`} note={`${names.length} tokens. Swatches follow the current theme; both hex values are listed.`}>
          <div className="pg-grid">
            {names.map((n) => <Swatch key={n} name={n} light={data.color[n]?.light} dark={data.color[n]?.dark} />)}
          </div>
        </Block>
      ))}
    </>
  );
}

function ScaleBars({ data, prefix, shape }: { data: TokenData; prefix: string; shape: 'bar' | 'radius' | 'square' }) {
  const rows = Object.entries(data.scales).filter(([k]) => k.startsWith(prefix));
  if (shape === 'bar') {
    return (
      <div className="pg-bars">
        {rows.map(([k, v]) => (
          <div className="pg-bar-row" key={k}><code>{k}</code><i style={cssVar('width', String(v))} /><span>{String(v)}</span></div>
        ))}
      </div>
    );
  }
  return (
    <div className="pg-row">
      {rows.map(([k, v]) => (
        <div className="pg-col" key={k}>
          <div className="pg-box" style={shape === 'radius' ? { width: '64px', height: '64px', borderRadius: String(v) } : { width: String(v), height: String(v) }} />
          <code className="pg-code">{k.replace(`--${prefix.replace('--', '')}`, '')}</code>
          <small className="pg-note">{String(v)}</small>
        </div>
      ))}
    </div>
  );
}

function TypeRamp({ data, viewport }: { data: TokenData; viewport: ViewportMode }) {
  const vp = viewport === 'auto' ? 'desktop' : viewport;
  const merged = { ...data.type.desktop, ...(vp === 'desktop' ? {} : data.type[vp]) };
  const roles = ['display', 'heading', 'text', 'label', 'link', 'overline'] as const;
  return (
    <>
      {roles.map((role) => {
        const steps = Object.keys(merged).filter((k) => k.startsWith(`--font-size-${role}-`)).map((k) => k.replace(`--font-size-${role}-`, ''));
        return (
          <Block key={role} title={`Type · ${role}`} note="Size, line height and tracking per step, for the selected type ramp.">
            {steps.map((s) => (
              <div className="pg-type-row" key={s}>
                <code className="pg-code">{role}/{s} · {merged[`--font-size-${role}-${s}`]}/{merged[`--line-height-${role}-${s}`]}</code>
                <Typography_ role={role} step={s} />
              </div>
            ))}
          </Block>
        );
      })}
      <Block title="Weights" note="Weight is orthogonal to size.">
        <Row_>
          {(['light', 'regular', 'semiBold', 'bold'] as const).map((w) => <Text key={w} weight={w}>{w} — The quick brown fox</Text>)}
        </Row_>
      </Block>
    </>
  );
}

function Typography_({ role, step }: { role: 'display' | 'heading' | 'text' | 'label' | 'link' | 'overline'; step: string }) {
  const sample = role === 'overline' ? 'SECTION LABEL' : 'The quick brown fox jumps over the lazy dog';
  if (role === 'heading') return <Heading step={step}>{sample}</Heading>;
  if (role === 'text') return <Text step={step}>{sample}</Text>;
  if (role === 'label') return <Label step={step}>{sample}</Label>;
  if (role === 'overline') return <Overline step={step}>{sample}</Overline>;
  return <Typography variant={role} step={step}>{sample}</Typography>;
}

/* --------------------------------------------------------------- components */

function Components() {
  const [page, setPage] = useState(3);
  const [rows, setRows] = useState(25);
  const [tool, setTool] = useState<ToolSwitchValue>('valuations');
  const [date, setDate] = useState<Date>(new Date(2026, 8, 22));
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      <Part id="c-core" title="Core & primitives">
        <Block title="Typography · Icon · Avatar · Chip · Divider · Link · Tooltip · Empty state">
          <Row_>
            <Heading step="xl">Heading</Heading><Text>Body text</Text><Label>Label</Label><Overline>Overline</Overline>
            <Link href="#c-core" size="m">A link</Link>
            <Tooltip content="Explains the control" position="bottom" open><Button variant="tertiary">Tooltip</Button></Tooltip>
          </Row_>
          <Row_>
            {(['xs', 's', 'm', 'l', 'xl'] as const).map((s) => <Avatar key={s} size={s} initials="BV" alt="Bayardo V." />)}
            {(['default', 'info', 'positive', 'negative', 'warning', 'ai'] as const).map((s) => <Chip key={s} styleVariant={s} onRemove={() => {}} removeLabel="Remove">{s}</Chip>)}
            {(['s', 'm', 'l'] as const).map((s) => <Chip key={s} size={s}>{`Size ${s}`}</Chip>)}
          </Row_>
          <Row_>
            {(['xs', 's', 'm', 'l', 'xl'] as const).map((s) => <Icon key={s} size={s} tone="primary"><icons.Search /></Icon>)}
            {(['primary', 'secondary', 'brand', 'positive', 'warning', 'negative', 'ai'] as const).map((t) => <Icon key={t} size="m" tone={t}><icons.Info /></Icon>)}
            <Divider /><Divider orientation="vertical" />
          </Row_>
          <Row_>
            <EmptyState type="no-data" title="No data yet" body="Add your first record to get started." actions={<Button size="s">Add record</Button>} />
            <EmptyState type="no-results" title="No results" body="Try a different filter." />
            <EmptyState type="error" title="Something failed" body="Check your connection and retry." actions={<Button size="s" variant="secondary">Retry</Button>} />
          </Row_>
        </Block>
      </Part>

      <Part id="c-actions" title="Actions">
        <Block title="Button · ButtonIcon · AIButton" note="Style (variant) carries weight, type (tone) carries meaning. Hover / pressed / focus are CSS states.">
          {(['primary', 'secondary', 'tertiary'] as const).map((v) => (
            <Row_ key={v}>
              {(['main', 'positive', 'warning', 'negative'] as const).map((t) => <Button key={t} variant={v} tone={t}>{`${v} ${t}`}</Button>)}
              <Button variant={v} disabled>Disabled</Button>
              <Button variant={v} loading>Loading</Button>
              <Button variant={v} selected>Selected</Button>
            </Row_>
          ))}
          <Row_>
            {(['s', 'm', 'l'] as const).map((s) => <Button key={s} size={s} leadingIcon={G(<glyphs.Plus />)} trailingIcon={G(<glyphs.ChevronDown />)}>{`Size ${s}`}</Button>)}
            <ButtonIcon label="Add" icon={G(<glyphs.Plus />)} /><ButtonIcon label="Delete" variant="secondary" tone="negative" icon={G(<glyphs.Trash />)} />
            <AIButton>Ask AI</AIButton>
          </Row_>
        </Block>
      </Part>

      <Part id="c-forms" title="Forms">
        <Block title="Inputs · selection controls · date picker">
          <div className="pg-grid">
            <FormField label="Name" helperText="As it appears on the filing"><Input placeholder="Placeholder" leadingIcon={G(<glyphs.Search />)} /></FormField>
            <FormField label="Amount" helperText="Enter a positive number" state="error"><Input defaultValue="-5" state="error" /></FormField>
            <FormField label="Disabled"><Input disabled placeholder="Disabled" /></FormField>
            <FormField label="Notes"><Textarea placeholder="Write a note" /></FormField>
            <FormField label="Type"><Select defaultValue="b"><option value="a">Common</option><option value="b">Series A</option><option value="c">Option pool</option></Select></FormField>
          </div>
          <Row_>
            <Checkbox>Checkbox label</Checkbox><CheckboxItem aria-label="Indeterminate" indeterminate /><CheckboxItem aria-label="Invalid" invalid />
            <Radio name="r" defaultChecked>Radio A</Radio><Radio name="r">Radio B</Radio><Radio name="r" invalid>Invalid</Radio>
            <Switch>Auto-save</Switch><Switch size="s" defaultChecked>Small</Switch>
          </Row_>
          <Row_>
            <DatePicker value={date} onChange={setDate} />
            <Row_>{(['1', '2', '3'] as const).map((d, i) => <CalendarDay key={d} day={d} selected={i === 1} today={i === 0} />)}<CalendarDay day="31" outside /></Row_>
          </Row_>
        </Block>
      </Part>

      <Part id="c-header" title="Header & menus">
        <Block title="Primary Menu · Company info · Tertiary Menu" note="The three navigation tiers. Three is the limit.">
          <div className="pg-stage">
            <PrimaryMenu
              end={<><SearchBar /><Notification unread /><ToolSwitch value={tool} onChange={setTool} /><Avatar size="s" initials="BV" alt="Bayardo V." /></>}
            >
              <MainMenuItem current>Intelligence</MainMenuItem><MainMenuItem>Valuations</MainMenuItem><MainMenuItem>Waterfalls</MainMenuItem>
              <CompanyDropdown>Companies</CompanyDropdown><Selector label="Measurement Date" value="01/17/2024" />
            </PrimaryMenu>
            <CompanyInfo name="Apple Inc." status={<Badge>Draft</Badge>} end={<><InformationLabel label="Equity Value" value="$34,560,000" /><ValuationInfo defaultOpen="both" equityValue="$34,560,000" unrealizedFirmTotal="$48,871,695" marketDate="06/01/2026" version="2026/06/01" /></>}>
              <SecondaryMenu><SecondaryMenuItem>Summary</SecondaryMenuItem><SecondaryMenuItem current>Valuations</SecondaryMenuItem><SecondaryMenuItem>Waterfall</SecondaryMenuItem></SecondaryMenu>
            </CompanyInfo>
            <TertiaryMenu onAdd={() => {}} end={<><AITool /><CurrencySelector currency="USD">($) Thousands</CurrencySelector><Button size="s" tone="positive">Save</Button></>}>
              <TertiaryMenuItem current>Summary</TertiaryMenuItem><TertiaryMenuItem>GPC</TertiaryMenuItem><TertiaryMenuItem>Backsolve</TertiaryMenuItem>
            </TertiaryMenu>
          </div>
        </Block>
        <Block title="Controls">
          <Row_>
            <Badge>Label</Badge><ComboTag label="Breakpoint Analysis" value="01" /><FilterDropdown>All funds</FilterDropdown>
            <Selector surface="surface" label="Date" value="Most Recent" /><AITool state="input" />
            <InformationLabel label="Market" value="06/01/2026" tone="brand" dropdown />
          </Row_>
          <MenuPanel label="Menu">
            <MenuGroupLabel>Pinned</MenuGroupLabel>
            <SubmenuItem state="pinned">Apple Inc.</SubmenuItem><SubmenuItem current>Acme Corp</SubmenuItem><SubmenuItem state="ai">Ask AI</SubmenuItem><SubmenuItem hasSubmenu>More</SubmenuItem>
          </MenuPanel>
        </Block>
      </Part>

      <Part id="c-nav" title="Navigation">
        <Block title="Tabs · Breadcrumb · Pagination · Stepper">
          <Tabs label="Sections"><TabItem active>Overview</TabItem><TabItem>Financials</TabItem><TabItem>Cap Table</TabItem></Tabs>
          <Breadcrumb items={[{ label: 'Companies', href: '#' }, { label: 'Apple Inc.', href: '#' }, { label: 'Valuations' }]} />
          <Pagination page={page} pageCount={12} onPageChange={setPage} rowsPerPage={rows} onRowsPerPageChange={setRows} />
          <Stepper label="Progress" steps={[{ label: 'Upload', state: 'complete' }, { label: 'Map columns', state: 'current' }, { label: 'Review', state: 'upcoming' }, { label: 'Publish', state: 'error' }]} />
          <Row_>{[1, 2, 3].map((n) => <PageItem key={n} page={n} current={n === 2} />)}<Step index={1} label="Single step" state="current" /></Row_>
        </Block>
      </Part>

      <Part id="c-grid" title="Data grid">
        <Block title="DataGrid · Row · Cell · ColumnHeader · status" note="Column tracks come from the header cells; every Row is a subgrid.">
          <DataGrid label="Cap table" head={<><ColumnHeader grow={2}>Security</ColumnHeader><ColumnHeader numeric sort="asc" onSortChange={() => {}}>Shares</ColumnHeader><ColumnHeader numeric>Value</ColumnHeader><ColumnHeader>Status</ColumnHeader></>}>
            <Row><Cell>Series A Preferred</Cell><Cell numeric type="data">1,250,000</Cell><Cell numeric type="input">$12,500,000</Cell><Cell><ModalStatus state="draft" /></Cell></Row>
            <Row zebra><Cell footnote={<Footnote>1</Footnote>}>Common</Cell><Cell numeric>8,000,000</Cell><Cell numeric state="error">$—</Cell><Cell><ValuationStatus state="in-service" /></Cell></Row>
            <Row type="total"><Cell state="total">Total</Cell><Cell state="total" numeric>9,250,000</Cell><Cell state="total" numeric>$12,500,000</Cell><Cell state="total">&nbsp;</Cell></Row>
          </DataGrid>
          <Row_>
            {(['draft', 'review', 'in-process-usa', 'in-process-arg', 'final', 'complete', 'published'] as const).map((s) => <ModalStatus key={s} state={s} />)}
            {(['in-service', 'awaiting-payment', 'complete-deal', 'cancelled'] as const).map((s) => <ValuationStatus key={s} state={s} />)}
            <Footnote currency="USD">1</Footnote><Footnote ai>2</Footnote>
          </Row_>
          <Row_><ContentCell type="user">Jane Doe</ContentCell><ContentCell type="date">11/12/2026</ContentCell><ContentCell type="note">A note</ContentCell><ContentCell type="label">Label</ContentCell><Ledger label="Ledger" /></Row_>
        </Block>
      </Part>

      <Part id="c-charts" title="Charts">
        <div className="pg-grid pg-grid--wide">
          <Block title="Bar chart"><BarChart title="Revenue by quarter" categoryLabel="Quarter" categories={['Q1', 'Q2', 'Q3', 'Q4']} series={[{ label: 'Product', values: [12, 18, 15, 22] }, { label: 'Services', values: [6, 8, 9, 11] }]} format={(v) => `$${v}M`} /></Block>
          <Block title="Line chart"><LineChart title="ARR" categoryLabel="Month" categories={['Jan', 'Feb', 'Mar', 'Apr']} series={[{ label: 'ARR', values: [10, 14, 13, 19] }]} /></Block>
          <Block title="Waterfall"><WaterfallChart title="Exit proceeds" steps={[{ label: 'Equity', value: 100, total: true }, { label: 'Debt', value: -30 }, { label: 'Fees', value: -5 }, { label: 'Net', value: 65, total: true }]} /></Block>
          <Block title="Donut"><DonutChart title="Ownership" total="100%" caption="Fully diluted" slices={[{ label: 'Founders', value: 55 }, { label: 'Investors', value: 30 }, { label: 'Pool', value: 15 }]} /></Block>
        </div>
        <Block title="Chart legend"><ChartLegend labels={['Product', 'Services', 'Other']} /></Block>
      </Part>

      <Part id="c-feedback" title="Cards & feedback">
        <Block title="Card · Alert · Toast · Progress · Skeleton">
          <Row_>
            <Card title="Fund / Company" tag={<Badge>Draft</Badge>} action={<ButtonIcon label="More" variant="tertiary" icon={G(<glyphs.MoreVertical />)} />}>
              <CardItem label="IRR" value="+25.8%" trend="up" /><CardItem label="MOIC" value="1.4x" /><CardItem label="NAV" value="-2.1%" trend="down" />
            </Card>
          </Row_>
          <div className="pg-grid">{(['info', 'positive', 'warning', 'negative'] as const).map((s) => <Alert key={s} style={s} title={`${s} alert`}>What happened and what to do next.</Alert>)}</div>
          <Row_>{(['info', 'positive', 'warning', 'negative'] as const).map((s) => <Toast key={s} style={s} onDismiss={() => {}}>{`${s} toast`}</Toast>)}</Row_>
          <Row_><ProgressBar value={40} label="Uploading" /><ProgressBar label="Working" />{(['text', 'title', 'circle', 'block'] as const).map((t) => <Skeleton key={t} type={t} />)}</Row_>
        </Block>
      </Part>

      <Part id="c-containers" title="Containers & overlays">
        <Block title="Accordion · Drawer · Modal · Workspace drawer · Data review">
          <Accordion><AccordionItem title="How was the discount rate derived?" defaultOpen>From the WACC build-up.</AccordionItem><AccordionItem title="Collapsed item">Hidden content.</AccordionItem><AccordionItem title="Disabled" disabled>—</AccordionItem></Accordion>
          <Row_><Button variant="secondary" onClick={() => setDrawer(true)}>Open drawer</Button><Button variant="secondary" onClick={() => setModal(true)}>Open modal</Button></Row_>
          <Drawer open={drawer} onClose={() => setDrawer(false)} title="Add a valuation" footer={<Button onClick={() => setDrawer(false)}>Done</Button>}>Drawer body</Drawer>
          <Modal open={modal} onClose={() => setModal(false)} title="Add columns" size="m" footer={<Button onClick={() => setModal(false)}>Add</Button>}>
            <ModalSearch /><ColumnTitle title="Group name" count="15 items" /><ColumnItem label="Invested Capital ($)" subText="Currency" selected />
          </Modal>
          <WorkspaceDrawer docked tabs={<><WorkspaceDrawerTab label="Data Review" count={6} ai active /><WorkspaceDrawerTab label="Notes" /><WorkspaceDrawerTab label="Sheets" /></>} />
          <DataReviewCard title="Class A - Original Issue Price - $1.00" sourceFile="Articles of Incorporation.pdf" quote="The Class A Original Issue Price shall mean $1.00 per share." rationale="Explicitly stated in the document." selected />
        </Block>
      </Part>

      <Part id="c-search" title="Search">
        <Block title="Search pieces" note="Global Search composes these; scope is a stack, not a filter.">
          <Row_>
            {(['firm', 'company', 'document', 'version', 'measurement-date'] as const).map((t) => <SearchScopeChip key={t} type={t}>{t}</SearchScopeChip>)}
            <KeyHint keyGlyph="↵" label="go" />
          </Row_>
          <SearchSectionHeader type="company">COMPANIES</SearchSectionHeader>
          {(['firm', 'company', 'page', 'document', 'version', 'measurement-date', 'firm-action', 'company-action', 'neutral'] as const).map((t) => <SearchResultRow key={t} type={t} title={`${t} result`} subtitle="Supporting detail" />)}
        </Block>
      </Part>

      <Part id="c-patterns" title="Patterns · Figma pages 20–26">
        <Gallery />
      </Part>

      <Part id="c-template" title="Page template">
        <Block title="PageTemplate" note="Navigation, a body slot and the docked drawer. Open ./page-template.html#content for the full page.">
          <iframe className="pg-frame" src="./page-template.html" title="Page template" />
        </Block>
      </Part>
    </>
  );
}

/* --------------------------------------------------------------------- app */

export function Playground() {
  const data = useTokens();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const nav: Array<[string, Array<[string, string]>]> = [
    ['Tokens', [['t-colour', 'Colour'], ['t-space', 'Spacing & radius'], ['t-size', 'Sizing'], ['t-type', 'Type ramp'], ['t-elev', 'Elevation & motion'], ['t-prim', 'Primitives']]],
    ['Components', [['c-core', 'Core & primitives'], ['c-actions', 'Actions'], ['c-forms', 'Forms'], ['c-header', 'Header & menus'], ['c-nav', 'Navigation'], ['c-grid', 'Data grid'], ['c-charts', 'Charts'], ['c-feedback', 'Cards & feedback'], ['c-containers', 'Containers & overlays'], ['c-search', 'Search'], ['c-patterns', 'Patterns 20–26'], ['c-template', 'Page template']]],
  ];
  return (
    <ScalarProvider mode={mode} viewport={viewport}>
      <div className="pg">
        <aside className="pg-side">
          <h1>Scalar playground</h1>
          <p>Every token and component, live from the code.</p>
          {nav.map(([group, items]) => (
            <div key={group}>
              <h2>{group}</h2>
              {items.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
            </div>
          ))}
        </aside>
        <div className="pg-main">
          <div className="pg-bar">
            <label>Theme
              <select value={mode} onChange={(e) => setMode(e.target.value as ThemeMode)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>
            </label>
            <label>Type ramp
              <select value={viewport} onChange={(e) => setViewport(e.target.value as ViewportMode)}><option value="desktop">Desktop (1440)</option><option value="desktop-large">Desktop Large (1920)</option><option value="mobile">Mobile (393)</option></select>
            </label>
          </div>

          <Part id="tokens" title="Tokens">
            {!data && <p className="pg-note">Loading tokens from src/tokens/tokens.json…</p>}
            {data && (
              <>
                <div id="t-colour"><ColourTokens data={data} /></div>
                <div id="t-space" className="pg-part">
                  <Block title="Spacing" note="Gap and padding only — never width or height."><ScaleBars data={data} prefix="--space-" shape="bar" /></Block>
                  <Block title="Radius"><ScaleBars data={data} prefix="--radius-" shape="radius" /></Block>
                </div>
                <div id="t-size" className="pg-part">
                  <Block title="Sizing" note="Width and height only."><ScaleBars data={data} prefix="--size-" shape="square" /></Block>
                  <Block title="Breakpoints"><ScaleBars data={data} prefix="--breakpoint-" shape="bar" /></Block>
                </div>
                <div id="t-type" className="pg-part"><TypeRamp data={data} viewport={viewport} /></div>
                <div id="t-elev" className="pg-part">
                  <Block title="Elevation" note="Raised < Overlay < Modal.">
                    <div className="pg-row">{(['raised', 'overlay', 'modal'] as const).map((e) => <div key={e} className="pg-box" style={{ width: '160px', height: '96px', boxShadow: `var(--elevation-${e})`, background: 'var(--color-bg-surface-raised)' }}>{e}</div>)}</div>
                  </Block>
                  <Block title="Layers and motion">
                    <div className="pg-col">{Object.entries(data.scales).filter(([k]) => /^--(z|duration|easing)-/.test(k)).map(([k, v]) => <code className="pg-code" key={k}>{k}: {String(v)}</code>)}</div>
                  </Block>
                </div>
                <div id="t-prim" className="pg-part">
                  <Block title="Primitives — reference only" note="Published but off-limits. Product code uses the Semantic tokens above.">
                    <p className="pg-warn">Never bind UI to a --primitive-* token: it has no mode and will not respond to the theme.</p>
                    <div className="pg-grid">
                      {Object.entries(data.primitives).map(([k, v]) => (
                        <div className="pg-sw" key={k}><div className="pg-sw__chip"><span className="pg-sw__fill" style={{ background: v }} /></div><code>{k.replace('--primitive-', '')}</code><small>{v}</small></div>
                      ))}
                    </div>
                  </Block>
                </div>
              </>
            )}
          </Part>

          <Components />
        </div>
      </div>
    </ScalarProvider>
  );
}
