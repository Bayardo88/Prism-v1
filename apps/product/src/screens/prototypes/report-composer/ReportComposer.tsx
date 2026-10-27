/**
 * 409A report composer (training C18, domain-logic.md §10, P10).
 *
 * DOC: the analyst tailors a client-facing 409A view — chooses which sections
 * and charts appear and can edit displayed figures such as enterprise value,
 * debt and share price.
 *
 * The blocking open question is whether those edits change the valuation or
 * only the presentation. Until it is answered the prototype treats every edit
 * as a presentation override: it is marked as an override, shown beside the
 * source value it differs from, and never written back to the valuation. PDF
 * generation inside Scalar is unconfirmed, so it is not offered.
 */
import { useMemo } from 'react';
import {
  Banner, Button, Card, DataGrid, ColumnHeader, GridValueCell, Heading, Icon, Row, RowLabelCell, Switch, Text,
  icons, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../../types.js';
import { companyById, usd } from '../../../data/fixtures.js';
import { CompanyLayout } from '../../../shell/CompanyLayout.js';
import { VersionPicker } from '../../../shell/VersionPicker.js';
import { useValuationContext } from '../../../domain/context.js';
import { isReported, usFromIso } from '../../../domain/model.js';
import { useEditor } from '../../../domain/useEditor.js';
import { parseNumber } from '../../../domain/validation.js';
import { EditCell } from '../../../shell/EditCell.js';
import { statusView } from '../../p02-intelligence/data.js';

const SECTIONS = [
  'Summary of value', 'Enterprise to equity bridge', 'Equity allocation chart', 'Comparable companies', 'Methodology', 'Assumptions and limiting conditions',
] as const;

interface Figure { key: string; label: string; source: number; format: (v: number) => string }
interface Composition { hidden: string[]; overrides: Record<string, number | undefined> }

const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

export function ReportComposer({ params }: ScreenProps) {
  const company = companyById(params.companyId);
  const v = useValuationContext(company);
  const figures: Figure[] = useMemo(() => [
    { key: 'ev', label: 'Enterprise value', source: company.equityValue * 1.2, format: usd.format },
    { key: 'debt', label: 'Debt', source: company.equityValue * 0.25, format: usd.format },
    { key: 'cash', label: 'Cash', source: company.equityValue * 0.05, format: usd.format },
    { key: 'equity', label: 'Equity value', source: company.equityValue, format: usd.format },
    { key: 'common', label: 'Common share price', source: company.lastRound.pricePerShare * 0.35, format: usd2.format },
  ], [company]);
  const ed = useEditor<Composition>(() => ({ hidden: [], overrides: {} }), { readOnly: v.readOnly });
  const shown = (f: Figure) => ed.data.overrides[f.key] ?? f.source;
  const isOverride = (f: Figure) => ed.data.overrides[f.key] !== undefined && ed.data.overrides[f.key] !== f.source;
  const toggle = (s: string) => ed.update((c) => ({ ...c, hidden: c.hidden.includes(s) ? c.hidden.filter((x) => x !== s) : [...c.hidden, s] }));
  const status = v.valuation?.status ?? 'draft';

  return (
    <CompanyLayout company={company} section="valuations" dock={false} headerEnd={<VersionPicker company={company} kind="valuation" label="Source version" />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
        <Heading level={1} step="m">409A client report</Heading>
        <Text step="s" tone="secondary">
          {`Source: ${v.valuation?.name ?? 'no valuation version'} (${statusView[status].label ?? status}) · measurement ${usFromIso(v.measurement.date)}`}
        </Text>
        {!isReported(v.valuation) && (
          <Banner tone="warning" title="The source version is not published">
            Client reports should be composed from a published valuation. Figures below are the version’s current values.
          </Banner>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: space.xl, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
            <section aria-labelledby="sections-h" style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
              <Heading level={2} step="s" id="sections-h">Sections shown to the client</Heading>
              {SECTIONS.map((s) => (
                <Switch key={s} size="s" checked={!ed.data.hidden.includes(s)} onChange={() => toggle(s)} disabled={v.readOnly}>{s}</Switch>
              ))}
            </section>

            <section aria-labelledby="figures-h" style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
              <Heading level={2} step="s" id="figures-h">Displayed figures</Heading>
              <Text step="s" tone="secondary">An edit here changes what the client sees, not the valuation. Each override stays beside its source value.</Text>
              <DataGrid
                label="Displayed figures"
                head={<><ColumnHeader grow={2}>Figure</ColumnHeader><ColumnHeader numeric>Source value</ColumnHeader><ColumnHeader numeric>Shown to client</ColumnHeader><ColumnHeader>Provenance</ColumnHeader></>}
              >
                {figures.map((f, i) => (
                  <Row key={f.key} aria-label={f.label} zebra={i % 2 === 1}>
                    <RowLabelCell>{f.label}</RowLabelCell>
                    <GridValueCell kind="sourced">{f.format(f.source)}</GridValueCell>
                    <EditCell
                      label={`${f.label} shown to client`}
                      value={f.format(shown(f))}
                      onCommit={(t) => ed.update((c) => ({ ...c, overrides: { ...c.overrides, [f.key]: parseNumber(t) } }))}
                      readOnly={v.readOnly}
                    />
                    <GridValueCell>
                      {isOverride(f)
                        ? <span style={{ display: 'inline-flex', gap: space.xs, alignItems: 'center' }}><Icon size="s" tone="warning"><icons.Edit /></Icon>Override</span>
                        : 'From valuation'}
                    </GridValueCell>
                  </Row>
                ))}
              </DataGrid>
            </section>

            <div style={{ display: 'flex', gap: space.s, alignItems: 'center' }}>
              <Button onClick={ed.save} disabled={!ed.dirty}>Save composition</Button>
              <Button variant="secondary" disabled>Export PDF</Button>
              <Text step="s" tone="secondary">PDF export isn’t available in the prototype.</Text>
            </div>
          </div>

          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.m, padding: space.m }}>
              <Heading level={2} step="s">Client preview</Heading>
              {SECTIONS.filter((s) => !ed.data.hidden.includes(s)).map((s) => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
                  <Text step="m" weight="semiBold">{s}</Text>
                  {s === 'Summary of value' && figures.map((f) => (
                    <Text key={f.key} step="s">{`${f.label}: ${f.format(shown(f))}${isOverride(f) ? ' (override)' : ''}`}</Text>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      {ed.guard.dialog}
    </CompanyLayout>
  );
}
