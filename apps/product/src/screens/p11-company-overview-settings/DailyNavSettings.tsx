import { useEffect, useState } from 'react';
import {
  Banner, Button, Card, Checkbox, Chip, Divider, FormField, Heading, Icon, Input, NumberField, Overline, SaveState,
  Select, Text, VersionHistoryItem, icons, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import { ToolbarAi, ToolbarSave } from '../../shell/Toolbar.js';
import { CompanyActions, CurrencyUnit, SummarySubNav } from '../p06-company-summary-financials/CompanyChrome.js';

interface Threshold {
  key: string;
  label: string;
  /** The firm default this company inherits while the field is empty. */
  inherited: number | null;
}

const CAPITAL_IQ: Threshold[] = [
  { key: 'ciq-1d', label: '1 Trading Day Δ', inherited: 1 },
  { key: 'ciq-5d', label: '5 Trading Days Δ', inherited: 5 },
  { key: 'ciq-slv', label: 'Since Last Valuation Δ', inherited: 5 },
];
const SECONDARY: Threshold[] = [
  { key: 'st-1d', label: '1 Trading Day Δ', inherited: 1 },
  { key: 'st-5d', label: '5 Trading Days Δ', inherited: 5 },
  { key: 'st-slv', label: 'Since Last Valuation Δ', inherited: 5 },
  { key: 'st-mark', label: '% Change from Mark', inherited: null },
];

function ThresholdField({ t, value, onChange }: { t: Threshold; value: number | ''; onChange: (v: number | '') => void }) {
  const inherited = value === '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs, alignItems: 'flex-start' }}>
      <div style={{ alignSelf: 'stretch' }}>
        <NumberField
          label={t.label}
          value={value}
          onChange={onChange}
          suffix="%"
          min={0}
          unitLabel={t.label}
          placeholder={t.inherited === null ? '—' : String(t.inherited)}
        />
      </div>
      <Chip size="s" styleVariant={inherited ? 'default' : 'info'}>
        {inherited ? `Inherited (${t.inherited ?? '—'}%)` : 'Company override'}
      </Chip>
    </div>
  );
}

function ThresholdGroup({ title, fields, values, set }: {
  title: string;
  fields: Threshold[];
  values: Record<string, number | ''>;
  set: (k: string, v: number | '') => void;
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
      <Overline>{title}</Overline>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: space.m }}>
        {fields.map((t) => <ThresholdField key={t.key} t={t} value={values[t.key] ?? ''} onChange={(v) => set(t.key, v)} />)}
      </div>
    </section>
  );
}

export function DailyNavSettings({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  // The record's dailyNav flag; ABC Co is the frame's company and is drawn ticked.
  const initiallyIncluded = company.dailyNav || company.id === 'abc-co';
  const [included, setIncluded] = useState(initiallyIncluded);
  const [values, setValues] = useState<Record<string, number | ''>>({});
  const [profileQuery, setProfileQuery] = useState('');
  const dirty = included !== initiallyIncluded || Object.values(values).some((v) => v !== '');
  const set = (k: string, v: number | '') => setValues((s) => ({ ...s, [k]: v }));

  // "Scrolled to bottom": wait a tick so the app's own scroll-to-top on route change runs first.
  useEffect(() => {
    if (state !== 'scrolled') return;
    const t = window.setTimeout(() => window.scrollTo(0, document.documentElement.scrollHeight), 0);
    return () => window.clearTimeout(t);
  }, [state]);

  return (
    <CompanyLayout
      company={company}
      section="summary"
      date={company.asOf}
      headerEnd={<CompanyActions company={company} />}
      subNav={<SummarySubNav company={company} current="daily-nav" />}
      subNavEnd={
        <>
          <ToolbarAi />
          <CurrencyUnit unit="$" />
          <ToolbarSave disabled={!dirty} />
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: space.xl, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
          <header style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
            <Heading level={2} step="l">Daily NAV Settings</Heading>
            <Text step="m" tone="secondary">
              Alert thresholds for this company. Fields left as inherited use the firm default; setting a value (including 0%)
              overrides the firm default for this company only.
            </Text>
          </header>

          <Checkbox checked={included} onChange={(e) => setIncluded(e.target.checked)}>
            Include this company in Daily NAV generation
          </Checkbox>
          <SaveState state={dirty ? 'unsaved' : 'no-changes'} />

          <ThresholdGroup title="Capital IQ" fields={CAPITAL_IQ} values={values} set={set} />
          <ThresholdGroup title="Secondary Transaction" fields={SECONDARY} values={values} set={set} />

          <Divider />

          <section style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
            <Heading level={2} step="l">External Company Profile</Heading>
            <Text step="m" tone="secondary">
              The external company profile this company's market data is pulled from. Saving a change opens a new config
              version, so records already evaluated keep the profile they used.
            </Text>
            <Text step="m">Not linked to an external company profile.</Text>
            <FormField
              label="Find the external profile"
              helperText="Defaults to this company's name and website. Names are matched literally, so try a legal or alternate name if there is no hit."
            >
              <Input
                value={profileQuery}
                onChange={(e) => setProfileQuery(e.target.value)}
                placeholder="Search by company name..."
                leadingIcon={<Icon size="s" tone="secondary"><icons.Search /></Icon>}
              />
            </FormField>
            <Banner tone="info" title="No match found">
              No match in external company database. Try the company's legal or alternate name.
            </Banner>
          </section>

          <Divider />

          <section style={{ display: 'flex', flexDirection: 'column', gap: space.s, alignItems: 'flex-start' }}>
            <Heading level={2} step="l">Comps Watchlist</Heading>
            <Text step="m" tone="secondary">Public comps and ETFs tracked alongside this company's Daily NAV monitoring.</Text>
            <div style={{ display: 'flex', gap: space.s, alignItems: 'center' }}>
              <Select aria-label="GPC approach" disabled defaultValue="">
                <option value="">No GPC approaches available</option>
              </Select>
              <Button variant="secondary" disabled>Copy Comps</Button>
            </div>
            <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}>
              Add Comparable Company/ETF
            </Button>
            <Text step="m" tone="secondary">No comps added yet.</Text>
          </section>
        </div>

        <Card title="Version History">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <VersionHistoryItem
              current
              currentLabel="Current — today's NAV and the next"
              range="Aug 24, 2026 5:01 PM — Present"
              meta="Changed by Steven Hansen · Firm template change"
              action={<Button variant="secondary" disabled>Apply to Open NAV Day</Button>}
            />
          </ul>
        </Card>
      </div>
    </CompanyLayout>
  );
}
