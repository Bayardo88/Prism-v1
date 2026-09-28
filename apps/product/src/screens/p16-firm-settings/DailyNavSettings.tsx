import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Button, Dropzone, FloatingLabelInput, FloatingLabelSelect, FormField, Heading, Icon, Input, Label, Link,
  NumberField, Overline, RepeatableRow, SaveState, Text, TimeField, VersionHistoryItem, glyphs, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { FirmSettingsFrame, SectionRule, SidePanel } from './FirmSettingsFrame.js';
import { OptionMenu } from './OptionMenu.js';
import { tradingMarkets } from './data.js';

function Section({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: space.m }}>
      <Heading level={2} step="m">{title}</Heading>
      {children}
    </section>
  );
}

const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: space.m } as const;

function Threshold({ label, value }: { label: string; value: number | '' }) {
  const [v, setV] = useState<number | ''>(value);
  return (
    <FormField label={label}>
      <NumberField value={v} onChange={setV} suffix="%" min={0} max={100} />
    </FormField>
  );
}

interface Recipient { id: number; email: string }

function RecipientList({ initial, placeholder, label }: { initial: Recipient[]; placeholder: string; label: string }) {
  const [rows, setRows] = useState(initial);
  useEffect(() => setRows(initial), [initial]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.s, maxWidth: '50%' }}>
      {rows.map((r) => (
        <RepeatableRow key={r.id} removeLabel={`Remove ${r.email || 'empty'} recipient`} onRemove={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}>
          <Input
            type="email"
            aria-label={label}
            placeholder={placeholder}
            value={r.email}
            onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, email: e.target.value } : x)))}
          />
        </RepeatableRow>
      ))}
      <div>
        <Button
          variant="tertiary"
          leadingIcon={<Icon size="s" tone="inherit"><glyphs.Plus /></Icon>}
          onClick={() => setRows((rs) => [...rs, { id: Date.now(), email: '' }])}
        >
          Add recipient
        </Button>
      </div>
    </div>
  );
}

const alertRecipients = (added: boolean): Recipient[] => [
  { id: 1, email: 'steven.hansen@scalar.io' },
  ...(added ? [{ id: 2, email: '' }] : []),
];
const noDelivery: Recipient[] = [{ id: 1, email: '' }];

export function DailyNavSettings({ state }: ScreenProps) {
  const [marketOpen, setMarketOpen] = useState(state === 'market-menu');
  const [market, setMarket] = useState(tradingMarkets[0]!);
  const [dirty, setDirty] = useState(state === 'recipient-added');
  const [short, setShort] = useState<number | ''>(1);
  const [long, setLong] = useState<number | ''>(5);
  const [port, setPort] = useState<number | ''>(21);
  const [recipients, setRecipients] = useState(() => alertRecipients(state === 'recipient-added'));
  useEffect(() => {
    setMarketOpen(state === 'market-menu');
    setDirty(state === 'recipient-added');
    setRecipients(alertRecipients(state === 'recipient-added'));
  }, [state]);

  const marketRef = useRef<HTMLDivElement>(null);
  const recipientsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // The Figma frames for these states are scrolled to the part they show.
    const target = state === 'market-menu' ? marketRef.current : state === 'recipient-added' ? recipientsRef.current : null;
    // Deferred: the app resets scroll to the top on navigation after this effect runs.
    if (!target) return;
    const t = window.setTimeout(() => window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - window.innerHeight / 4 }), 0);
    return () => window.clearTimeout(t);
  }, [state]);

  const windowError = short !== '' && long !== '' && short >= long;

  return (
    <FirmSettingsFrame tab="dailyNav" saveDisabled={!dirty}>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: space.xl, alignItems: 'start' }}>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: space.xl, minWidth: 0 }}
          onChangeCapture={() => setDirty(true)}
          onClickCapture={(e) => { if ((e.target as HTMLElement).closest('button')) setDirty(true); }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
            <Heading level={1} step="l">Daily NAV Settings</Heading>
            <div><Link size="s" href={href(routes.intelligence.dailyNav)}>View Daily NAV</Link></div>
          </div>

          <Section title="Default Alert Thresholds">
            <Text step="s" tone="secondary">
              The defaults can be superseded at a company level. If no threshold is set at the company level, these defaults will be used.
            </Text>
            <Text step="s" tone="secondary">
              The number of trading days each delta window looks back. The short window must be less than the long window; both must be between 1 and 31 trading days.
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: space.m }}>
              <FormField
                label="Short Window (trading days)"
                state={windowError ? 'error' : 'default'}
                helperText={windowError ? 'Make the short window smaller than the long window.' : undefined}
              >
                <NumberField value={short} onChange={setShort} min={1} max={31} unitLabel="trading days" />
              </FormField>
              <FormField label="Long Window (trading days)">
                <NumberField value={long} onChange={setLong} min={1} max={31} unitLabel="trading days" />
              </FormField>
            </div>
            <SaveState state={dirty ? 'unsaved' : 'no-changes'}>{dirty ? undefined : 'No changes to save.'}</SaveState>

            <Overline>Capital IQ</Overline>
            <div style={grid3}>
              <Threshold label="1 Trading Day Δ" value={1} />
              <Threshold label="5 Trading Days Δ" value={5} />
              <Threshold label="Since Last Valuation Δ" value={5} />
            </div>
            <Overline>Secondary Transaction</Overline>
            <div style={grid3}>
              <Threshold label="1 Trading Day Δ" value={1} />
              <Threshold label="5 Trading Days Δ" value={5} />
              <Threshold label="Since Last Valuation Δ" value={5} />
              <Threshold label="% Change from Mark" value="" />
            </div>
          </Section>
          <SectionRule />

          <Section title="Trading Market">
            <Text step="s" tone="secondary">
              The market whose trading calendar defines the NAV day. Its market close is when market data is read up to, and allocations finalized by then are the ones included in that day's report. Trading holidays are not NAV days, and early closes are handled automatically. Each day uses the market that was in effect on that date.
            </Text>
            <Text step="s" tone="secondary" as="p" style={{ fontStyle: 'italic', margin: 0 }}>
              This sets the day's timing only. It does not affect which public comps are tracked or where their prices come from — those are set per company in Daily Monitoring.
            </Text>
            <Text step="s" tone="secondary">
              Config changes apply to the next NAV day automatically. Saving also offers to apply them to the day currently in progress, and you can apply later from the Apply action on the open version in Version History; a day that has already closed or been finalized can never be changed.
            </Text>
            <div ref={marketRef} style={{ position: 'relative', maxWidth: '60%' }}>
              <FloatingLabelSelect
                label="Trading Market"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                onMouseDown={(e) => { e.preventDefault(); setMarketOpen((o) => !o); }}
                aria-expanded={marketOpen}
              >
                {tradingMarkets.map((m) => <option key={m}>{m}</option>)}
              </FloatingLabelSelect>
              {marketOpen && (
                <OptionMenu
                  label="Trading Market"
                  width="120%"
                  options={tradingMarkets.map((m) => ({ value: m, label: m }))}
                  value={market}
                  onSelect={(v) => { setMarket(v); setMarketOpen(false); setDirty(true); }}
                />
              )}
            </div>
          </Section>
          <SectionRule />

          <Section title="Daily Alert Notification Recipients">
            <Text step="s" tone="secondary">
              These recipients receive the daily report at the clock time below, in the trading market's timezone (America/New_York) — not UTC and not your local timezone.
            </Text>
            <div style={{ maxWidth: '33%' }}>
              <FormField label="Report send time (America/New_York)">
                <TimeField defaultValue="16:00" />
              </FormField>
            </div>
            <div ref={recipientsRef}>
              <RecipientList initial={recipients} placeholder="e.g. alerts@firm.com" label="Alert recipient email" />
            </div>
          </Section>
          <SectionRule />

          <Section title="Report Template">
            <Text step="s" tone="secondary">
              Upload the firm's exact CSV template, then map every column to Daily NAV data or a hardcoded value. Column names, duplicates, and order are preserved in the generated report.
            </Text>
            <Dropzone accept=".csv" hint="CSV · 15 MB max file size" onFiles={() => setDirty(true)} />
          </Section>
          <SectionRule />

          <Section title="Delivery">
            <Text step="s" tone="secondary">
              Delivery recipients are emailed the report when it is sent. If an SFTP host is configured, the report is also uploaded with key-based authentication.
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.m }}>
              <FloatingLabelInput label="SFTP host" />
              <div style={{ maxWidth: '50%' }}>
                <FormField label="Port">
                  <NumberField value={port} onChange={setPort} min={1} max={65535} unitLabel="port" />
                </FormField>
              </div>
              <FloatingLabelInput label="Path" />
              <FloatingLabelInput label="Username" autoComplete="off" />
            </div>
            <Label step="m" tone="secondary" as="span">Delivery recipients</Label>
            <RecipientList initial={noDelivery} placeholder="e.g. delivery@firm.com" label="Delivery recipient email" />
          </Section>
        </div>

        <SidePanel label="Version History">
          <Heading level={2} step="m">Version History</Heading>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <VersionHistoryItem
              current
              range="Aug 24, 2026 5:01 PM — Present"
              meta={<>Today's NAV and the next · Changed by Steven Hansen</>}
              action={<div><Button variant="secondary" disabled={!dirty}>Apply to open NAV day</Button></div>}
            />
          </ul>
        </SidePanel>
      </div>
    </FirmSettingsFrame>
  );
}
