import { useState, type ReactNode } from 'react';
import {
  Icon, glyphs, Button,
  MenuItem, MenuDivider, ContextMenu, UserMenu, MenuSubItems, SplitButton, Fab, SpeedDial, SpeedDialItem,
  SegmentedControl, ViewTab, ViewTabBar,
  FloatingLabelInput, FloatingLabelSelect, NumberField, TimeField, TagInput, CopyField, ComboboxPanel,
  RepeatableRow, Dropzone, Slider, InlineEdit, InlinePicker, Input,
  RowLabelCell, GridValueCell, InCellControl, ColumnGroupHeader, GridColumnHeader, AddColumnHeader,
  CollapsedColumnRail, GridColumnDivider, ChartHoverCard,
  FileTypeBadge, FileRow, TreeItem, PageStepper, ZoomControl, DocumentViewerHeader, ScrollHintPill,
  Banner, Spinner, ProgressRing, DataFreshness, SaveState,
  SettingRow, NotificationCenter, RowActionToolbar,
  KeyValueRow, VersionHistoryItem, PermissionMatrixRow, RoleSelector, ProfileHeader, FilterBar, DirectoryGroup,
  ProductTile, FirmSwitcherTile, PageTaskHeader, CodeGrid, RichTextToolbar, AppFooter,
  ValuationInfo, InformationLabel, Selector, ColumnHeader, Cell,
} from '@scalar/design-system';

const G = (glyph: ReactNode) => <Icon size="s" tone="inherit">{glyph}</Icon>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-m)', padding: 'var(--space-xl)', borderBottom: '1px solid var(--color-stroke-divider)' }}>
      <h2 className="scalar-type-heading-m" style={{ margin: 0, color: 'var(--color-text-primary)' }}>{title}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xl)', alignItems: 'flex-start' }}>{children}</div>
    </section>
  );
}

export function Gallery() {
  const [seg, setSeg] = useState('chart');
  const [tags, setTags] = useState(['firm.com', 'firm.co.uk']);
  const [q, setQ] = useState('');
  const [n, setN] = useState<number | ''>(10);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [notif, setNotif] = useState<'inbox' | 'settings'>('inbox');
  const [on, setOn] = useState(true);
  const [name, setName] = useState('');
  const companies = ['ABC Co', 'Backside Blocks', 'Holding Co.', 'jan23'].filter((c) => c.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ background: 'var(--color-bg-page)' }}>
      <Section title="20 · Menus & Actions">
        <ContextMenu label="View actions" heading="Firm summary">
          <MenuItem icon={G(<glyphs.Edit />)}>Edit</MenuItem>
          <MenuItem icon={G(<glyphs.Copy />)} selected>Clone</MenuItem>
          <MenuItem icon={G(<glyphs.Download />)} disabled>Excel export</MenuItem>
          <MenuDivider />
          <MenuItem icon={G(<glyphs.Trash />)} tone="destructive">Delete</MenuItem>
        </ContextMenu>
        <UserMenu name="Spatical Ventures" detail="name@firm.com" initials="SV">
          <MenuItem icon={G(<glyphs.User />)}>Account settings</MenuItem>
          <MenuItem icon={G(<glyphs.Settings />)} hasSubmenu expanded selected>Firm settings</MenuItem>
          <MenuSubItems><MenuItem>Firm profile</MenuItem><MenuItem>Single sign-on</MenuItem></MenuSubItems>
          <MenuDivider />
          <MenuItem>Sign out</MenuItem>
        </UserMenu>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-m)' }}>
          <SplitButton leadingIcon={G(<glyphs.Plus />)} menuLabel="More add options">Add projection year</SplitButton>
          <SplitButton tone="positive" menuLabel="More save options" menuOpen onMenuToggle={() => {}}>Save</SplitButton>
          <SplitButton variant="secondary" menuLabel="More report options">Report</SplitButton>
          <SplitButton disabled menuLabel="More">Disabled</SplitButton>
          <SegmentedControl label="View" value={seg} onChange={setSeg} options={[{ value: 'chart', label: 'Chart' }, { value: 'table', label: 'Table' }, { value: 'latest', label: 'Latest' }]} />
          <SegmentedControl label="Layout" value="list" onChange={() => {}} options={[{ value: 'list', label: 'List', icon: G(<glyphs.List />) }, { value: 'cal', label: 'Calendar', icon: G(<glyphs.Calendar />) }]} />
          <ViewTabBar label="Saved views" onAdd={() => {}}>
            <ViewTab selected onMenu={() => {}}>Firm summary</ViewTab>
            <ViewTab onMenu={() => {}}>New view (copy)</ViewTab>
            <ViewTab onClose={() => {}}>Backside Blocks</ViewTab>
          </ViewTabBar>
        </div>
        <SpeedDial label="Add approach" trigger={<Fab open hasMenu fixed={false}>Add</Fab>}>
          <SpeedDialItem>Backsolve</SpeedDialItem>
          <SpeedDialItem>Public comps</SpeedDialItem>
          <SpeedDialItem disabled>Calibration</SpeedDialItem>
        </SpeedDial>
        <Fab fixed={false}>Add security</Fab>
      </Section>

      <Section title="21 · Form Patterns">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-m)', width: 280 }}>
          <FloatingLabelInput label="Firm name" defaultValue="Spatical Ventures" />
          <FloatingLabelInput label="Website" />
          <FloatingLabelInput label="Zip" state="error" defaultValue="ABC" helperText="Enter a 5-digit zip code" />
          <FloatingLabelSelect label="Country" defaultValue="us"><option value="us">United States</option><option value="ni">Nicaragua</option></FloatingLabelSelect>
          <FloatingLabelInput label="Disabled" state="disabled" defaultValue="Locked" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-m)', width: 320 }}>
          <NumberField value={n} onChange={setN} min={0} unitLabel="trading days" aria-label="Short window" />
          <NumberField value={5} suffix="%" aria-label="Threshold" />
          <TimeField defaultValue="08:00" aria-label="Report send time" />
          <TagInput label="Associated email domains" prefix="@" values={tags} onChange={setTags} placeholder="Add a domain" />
          <CopyField label="SCIM endpoint" value="https://app.scalar.com/api/scim/v2" />
          <CopyField label="SCIM token" value="scim_1sgLpA9f83kd02kd83" secret />
          <RepeatableRow onRemove={() => {}}><Input placeholder="e.g. alerts@firm.com" aria-label="Recipient" /></RepeatableRow>
        </div>
        <ComboboxPanel label="Companies" items={companies.map((c) => ({ value: c, label: c }))} value="Backside Blocks" onSelect={() => {}} query={q} onQueryChange={setQ}
          searchPlaceholder="Find a company" showMore={{ label: 'Show 24 more companies', onClick: () => {} }}
          footer={<Button variant="secondary" leadingIcon={G(<glyphs.Plus />)}>Add new company</Button>} />
        <ComboboxPanel label="Companies filter" items={['All companies', 'ABC Co', 'jan23'].map((c) => ({ value: c, label: c }))} value={['ABC Co']} onSelect={() => {}} query="" onQueryChange={() => {}} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-m)', width: 420 }}>
          <Dropzone onFiles={() => {}} hint="CSV, XLSX or PDF · 15 MB max" />
          <Dropzone onFiles={() => {}} hint="CSV, XLSX or PDF · 15 MB max" state="uploading" progress={64} message="Uploading template.csv… 64%" />
          <Dropzone onFiles={() => {}} hint="CSV, XLSX or PDF · 15 MB max" state="error" message="That file is larger than 15 MB" />
          <Slider label="Zoom" defaultValue={40} min={0} max={100} minIcon={G(<glyphs.ZoomOut />)} maxIcon={G(<glyphs.Plus />)} />
          <div style={{ display: 'flex', gap: 'var(--space-m)', alignItems: 'center' }}>
            <InlineEdit label="Group name" value={name} onCommit={setName} placeholder="Enter name" />
            <InlineEdit label="Group name" value="test" onCommit={() => {}} placeholder="Enter name" />
            <InlinePicker label="Previous versions" secondary="V-2">09/21/2026</InlinePicker>
          </div>
        </div>
      </Section>

      <Section title="22 · Grid Patterns">
        <div role="grid" aria-label="Balance sheet" style={{ display: 'grid', gridTemplateColumns: '240px repeat(3, 152px) 3px 152px', width: 'max-content' }}>
          <GridColumnHeader draggable>Line item</GridColumnHeader>
          <ColumnGroupHeader span={3} styleVariant="emphasis" periodDivider>Projections</ColumnGroupHeader>
          <div />
          <GridColumnHeader sort="descending" onSort={() => {}} numeric selected onFilter={() => {}}>LTM</GridColumnHeader>
          <RowLabelCell type="group-header" expanded onToggle={() => {}}>VIP Fund</RowLabelCell>
          <RowLabelCell expanded={false} onToggle={() => {}}>Cash and equivalents</RowLabelCell>
          <GridValueCell kind="editable">$1,112,233</GridValueCell><GridValueCell kind="sourced" hasComment>$980,000</GridValueCell><GridValueCell state="focused">$1,200</GridValueCell><GridColumnDivider /><GridValueCell>$4,000</GridValueCell>
          <RowLabelCell type="child">Plus cash</RowLabelCell>
          <GridValueCell kind="editable" state="error" hasComment errorMessage="The allocation method must be unique">$0</GridValueCell><GridValueCell kind="editable" state="placeholder" /><GridValueCell state="not-applicable" /><GridColumnDivider /><InCellControl type="select" label="Method" />
          <RowLabelCell type="subtotal">Total current assets</RowLabelCell>
          <InCellControl type="date" label="Exit date">09/22/2026</InCellControl><InCellControl type="currency" label="Currency" open>USD</InCellControl><GridValueCell /><GridColumnDivider type="pinned" /><GridValueCell />
          <RowLabelCell type="total">Firm total</RowLabelCell>
          <GridValueCell kind="total">$4,778,382,719</GridValueCell><GridValueCell kind="total">$1</GridValueCell><GridValueCell kind="total">$2</GridValueCell><GridColumnDivider /><GridValueCell kind="total">$3</GridValueCell>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-m)', alignItems: 'flex-start' }}>
          <CollapsedColumnRail count={8} onExpand={() => {}} />
          <div style={{ width: 160 }}><AddColumnHeader onClick={() => {}} /></div>
          <ChartHoverCard heading="Dec 31, 2024" rows={[{ label: 'Invested capital', value: '$100,000', swatch: 'var(--color-chart-series-1)' }]} />
        </div>
      </Section>

      <Section title="23 · Files & Documents">
        <div style={{ display: 'flex', gap: 'var(--space-s)' }}>{['a.pdf', 'b.docx', 'c.xlsx', 'd.csv', 'e.png', 'f.md', 'g.zip'].map((f) => <FileTypeBadge key={f} file={f} />)}</div>
        <div style={{ width: 720 }}>
          <FileRow name="Financial statements 2024-12-31.pdf" checked onCheckedChange={() => {}} draggable onDownload={() => {}} onMenu={() => {}}
            meta={[{ icon: G(<glyphs.User />), label: 'Uploaded by Analyst' }, { icon: G(<glyphs.Calendar />), label: 'Feb 6, 2023' }]} />
          <FileRow name="Cap table export.xlsx" selected onDownload={() => {}} onMenu={() => {}} />
        </div>
        <div role="tree" aria-label="Documents" style={{ width: 320 }}>
          <TreeItem type="folder" expanded count="43 docs" onToggle={() => {}}>12/31/2024</TreeItem>
          <TreeItem type="folder" level={1} count="5 docs" onToggle={() => {}}>ABC Co</TreeItem>
          <TreeItem type="file" level={2} selected>Cap table export.xlsx</TreeItem>
          <TreeItem type="file" level={2}>Notes.md</TreeItem>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-m)', width: 640 }}>
          <DocumentViewerHeader fileName="Financial statements 2024-12-31.pdf" meta="Uploaded by Analyst · Feb 6, 2023" onDownload={() => {}} onCopyLink={() => {}} onRename={() => {}} onDelete={() => {}} onExpand={() => {}} onClose={() => {}} />
          <div style={{ display: 'flex', gap: 'var(--space-l)', alignItems: 'center' }}>
            <PageStepper page={page} total={12} onChange={setPage} />
            <ZoomControl value={zoom} onChange={setZoom} onFit={() => setZoom(100)} />
            <ScrollHintPill>17 companies</ScrollHintPill>
          </div>
        </div>
      </Section>

      <Section title="24 · Feedback Patterns">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-m)', width: 900 }}>
          <Banner tone="negative" title="This valuation has 1 error and cannot be saved" issues={[{ label: 'Backsolve_416 · allocation method must be unique' }]}>Fix the highlighted cells, then save again.</Banner>
          <Banner tone="warning" title="This company is not linked to a common profile" action={<Button variant="secondary" tone="warning" size="s">Edit common profile</Button>}>Market data will not update until it is linked.</Banner>
          <Banner tone="neutral" title="Summary values shown for published valuations" onDismiss={() => {}} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
          <Spinner size="s" /><Spinner /><Spinner size="l" label="Preparing preview…" />
          <ProgressRing value={0} max={0} label="Requests answered" />
          <ProgressRing value={3} max={5} label="Requests answered" />
          <ProgressRing value={5} max={5} label="Requests answered" display="percent" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-s)' }}>
          <DataFreshness onRefresh={() => {}}>Market data as of Sep 22, 2026, 2:00 PM CST</DataFreshness>
          <DataFreshness state="refreshing">Refreshing market data…</DataFreshness>
          <DataFreshness state="stale" onRefresh={() => {}}>Market data is 2 days old</DataFreshness>
          <div style={{ display: 'flex', gap: 'var(--space-l)' }}>{(['saved', 'unsaved', 'saving', 'no-changes', 'error'] as const).map((s) => <SaveState key={s} state={s} />)}</div>
        </div>
      </Section>

      <Section title="25 · Overlays & Panels">
        <NotificationCenter scope="Spatical Ventures" view={notif} onViewChange={setNotif}
          delivery={<><SettingRow label="Desktop notifications" checked={false} onChange={() => {}} /><SettingRow label="Global notifications" checked={on} onChange={setOn} /></>}
          settings={<><SettingRow label="Processing jobs" description="When an export or import finishes" checked onChange={() => {}} /><SettingRow label="Valuations" checked onChange={() => {}} /></>} />
        <RowActionToolbar label="Row actions" onClose={() => {}} actions={[{ label: 'Edit user', icon: G(<glyphs.Edit />), onClick: () => {} }, { label: 'Email user', icon: G(<glyphs.Mail />), onClick: () => {} }, { label: 'Delete user', icon: G(<glyphs.Trash />), onClick: () => {}, destructive: true }]} />
      </Section>

      <Section title="26 · Settings & Admin">
        <dl style={{ width: 480, margin: 0 }}>
          <KeyValueRow label="Name"><InlineEdit label="Name" value="test" onCommit={() => {}} placeholder="Enter name" /></KeyValueRow>
          <KeyValueRow label="Previous versions"><InlinePicker label="Previous versions" secondary="V-2">09/21/2026</InlinePicker></KeyValueRow>
          <KeyValueRow label="Status" layout="stacked">Operating</KeyValueRow>
        </dl>
        <ol style={{ width: 420, margin: 0, padding: 0 }}>
          <VersionHistoryItem current range="Aug 24, 2026 5:01 PM — Present" meta="Changed by Analyst · Firm template change" />
          <VersionHistoryItem range="Jun 2, 2026 9:12 AM — Aug 24, 2026" meta="Changed by Firm admin" action={<Button variant="tertiary" size="s">Restore</Button>} />
        </ol>
        <div role="grid" aria-label="Permissions" style={{ width: 480 }}>
          <PermissionMatrixRow type="group" label="Funds" edit={false} view={false} />
          <PermissionMatrixRow label="VIP Fund" edit view />
          <PermissionMatrixRow label="Holding Co." edit={false} view />
        </div>
        <ProfileHeader name="Full name" email="name@firm.com" lastLogin="Last login: Sep 22, 2026, 11:37 AM" initials="FN" role={<RoleSelector role="Firm admin" />} />
        <div style={{ width: '100%' }}>
          <FilterBar action={<Button leadingIcon={G(<glyphs.Refresh />)}>Refresh</Button>}>
            <Input placeholder="Business unit" aria-label="Business unit" /><Input placeholder="Start date" aria-label="Start date" /><Input placeholder="End date" aria-label="End date" />
          </FilterBar>
        </div>
        <div style={{ width: 1000 }}><DirectoryGroup letter="A" entries={['ABC Co', 'Acme Robotics', 'Alexandria', 'Atlas Health', 'Aurora Bio', 'Axon Labs'].map((l) => ({ label: l, href: '#' }))} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 240px)', gap: 'var(--space-m)' }}>
          <ProductTile product="intelligence" title="Intelligence" description="Portfolio summaries and daily NAV" icon={<Icon size="m" tone="inherit"><glyphs.Trend /></Icon>} />
          <ProductTile product="valuations" title="Valuations" description="Build, review and publish valuations" icon={<Icon size="m" tone="inherit"><glyphs.Check /></Icon>} />
          <ProductTile product="waterfalls" title="Waterfalls" description="Model exit proceeds" icon={<Icon size="m" tone="inherit"><glyphs.List /></Icon>} />
          <ProductTile product="documents" title="Documents" description="Collect and organise documents" icon={<Icon size="m" tone="inherit"><glyphs.Document /></Icon>} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-s)' }}><FirmSwitcherTile name="Spatical Ventures" initials="SV" selected /><FirmSwitcherTile name="Other firm" initials="TS" /></div>
        <div style={{ width: '100%' }}><PageTaskHeader title="Information request" subtitle="ABC Co · 3 documents, 2 questions" onBack={() => {}} actions={<><Button variant="tertiary">Save draft</Button><Button trailingIcon={G(<glyphs.ArrowRight />)}>Send</Button></>} /></div>
        <CodeGrid masked codes={Array.from({ length: 10 }, () => 'xxxx-xxxx')} actions={<><Button variant="tertiary" size="s">Download codes</Button><Button variant="tertiary" size="s">Print codes</Button></>} />
        <RichTextToolbar active={['bold']} onToggle={() => {}} />
        <div style={{ width: '100%' }}><AppFooter version="v8.12.4" /></div>
      </Section>
      <Section title="Property gaps closed · Valuation Info, Header, cell, Information Label, Selector">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-s)' }}>
          {(['none', 'values', 'dates', 'both'] as const).map((o) => (
            <ValuationInfo key={o} defaultOpen={o} equityValue="$34,560,000" unrealizedFirmTotal="$48,871,695" marketDate="06/01/2026" version="2026/06/01" />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-s)' }}>
          <InformationLabel label="Equity Value" value="$34,560,000" />
          <InformationLabel label="Equity Value" value="$34,560,000" longValue="Valuation Version - 12/31/2026" />
          <InformationLabel label="Market" value="06/01/2026" tone="brand" dropdown />
          <Selector surface="surface" label="Measurement Date" value="01/17/2024" />
          <Selector surface="surface" label="Measurement Date" value="01/17/2024" dropdown={false} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '232px', gap: 'var(--space-xs)' }}>
          <ColumnHeader icon={G(<glyphs.Plus />)}>Column Header</ColumnHeader>
          <ColumnHeader kind="action-button" icon={G(<glyphs.Plus />)}>Column Header</ColumnHeader>
          <ColumnHeader input icon={G(<glyphs.Plus />)}>Column Header</ColumnHeader>
          <ColumnHeader label="Projection" icon={G(<glyphs.Plus />)}>Column Header</ColumnHeader>
          <ColumnHeader mark label="Projection" tooltip="Forecast periods" icon={G(<glyphs.Plus />)}>Column Header</ColumnHeader>
          <ColumnHeader action icon={G(<glyphs.Plus />)}>Column Header</ColumnHeader>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '200px', gap: 'var(--space-xs)' }}>
          <Cell numeric trailingIcon="dropdown">$80,000,000</Cell>
          <Cell numeric trailingIcon="calendar">06/01/2026</Cell>
          <Cell numeric label="Label" tooltip="Source: cap table" trailingIcon="dropdown" footnote={<span>1</span>}>$80,000,000</Cell>
        </div>
      </Section>
    </div>
  );
}
