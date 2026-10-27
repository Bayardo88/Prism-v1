/**
 * Approach and scenario weighting for the valuation version in view
 * (domain-logic.md §7–§8, P7, P8).
 *
 * - Each approach's weight is an input. Approach weights total exactly 100%.
 * - Calibrated (DOC): the approach becomes a read-only reference, carries no
 *   weight and is left out of the Valuation Summary above.
 * - Allocation scenario weights total exactly 100%.
 *
 * Off-total weights are reported in words, never rescaled.
 */
import {
  Banner, DataGrid, GridColumnHeader, GridValueCell, Heading, Row, RowLabelCell, Switch, space,
} from '@scalar/design-system';
import type { Company } from '../../data/fixtures.js';
import { useValuationContext, valuation } from '../../domain/context.js';
import { includedApproaches } from '../../domain/model.js';
import { pct1 } from '../../domain/display.js';
import { parseNumber, weightIssue } from '../../domain/validation.js';
import { EditCell } from '../../shell/EditCell.js';

export function WeightingPanel({ company }: { company: Company }) {
  const { valuation: v, readOnly } = useValuationContext(company);
  if (!v) return null;
  const approachIssue = weightIssue(includedApproaches(v).map((a) => a.weight), 'Approach weights');
  const scenarioIssue = weightIssue(v.scenarios.map((s) => s.weight), 'Scenario weights');
  const issues = [approachIssue, scenarioIssue].filter((x) => x !== null);

  return (
    <section aria-labelledby="weighting-heading" style={{ display: 'flex', flexDirection: 'column', gap: space.m, width: '60%' }}>
      <Heading level={2} step="s" id="weighting-heading">Weighting</Heading>
      {issues.length > 0 && (
        <Banner tone="warning" title="The weights do not total 100%. The concluded value can't be relied on until they do." issues={issues.map((i) => ({ label: i.message }))} />
      )}
      <DataGrid
        label="Approach weighting"
        head={
          <>
            <GridColumnHeader grow={2}>Approach</GridColumnHeader>
            <GridColumnHeader numeric>Weight</GridColumnHeader>
            <GridColumnHeader>Calibration</GridColumnHeader>
            <GridColumnHeader>In summary</GridColumnHeader>
          </>
        }
      >
        {v.approaches.map((a, i) => (
          <Row key={a.id} aria-label={a.name} zebra={i % 2 === 1}>
            <RowLabelCell>{a.name}</RowLabelCell>
            {a.calibrated
              ? <GridValueCell state="not-applicable">—</GridValueCell>
              : (
                <EditCell
                  label={`${a.name} weight`}
                  value={pct1(a.weight)}
                  onCommit={(t) => valuation.setApproach(company, a.id, { weight: parseNumber(t) ?? 0 })}
                  error={approachIssue ? approachIssue.message : null}
                  readOnly={readOnly}
                />
              )}
            <GridValueCell>
              <Switch
                size="s"
                checked={a.calibrated}
                disabled={readOnly}
                onChange={(e) => valuation.setApproach(company, a.id, { calibrated: e.currentTarget.checked })}
              >
                {`Use ${a.name} for calibration only`}
              </Switch>
            </GridValueCell>
            <GridValueCell>{a.calibrated ? 'Reference only — excluded' : 'Included'}</GridValueCell>
          </Row>
        ))}
        <Row type="total" aria-label="Approach weights total">
          <RowLabelCell type="total">Total</RowLabelCell>
          <GridValueCell kind="total">{pct1(includedApproaches(v).reduce((t, a) => t + a.weight, 0))}</GridValueCell>
          <GridValueCell kind="total" />
          <GridValueCell kind="total" />
        </Row>
      </DataGrid>

      <DataGrid
        label="Allocation scenario weighting"
        head={
          <>
            <GridColumnHeader grow={2}>Allocation scenario</GridColumnHeader>
            <GridColumnHeader numeric>Weighting/Probability</GridColumnHeader>
          </>
        }
      >
        {v.scenarios.map((s, i) => (
          <Row key={s.id} aria-label={s.method} zebra={i % 2 === 1}>
            <RowLabelCell>{s.method}</RowLabelCell>
            <EditCell
              label={`${s.method} scenario weighting`}
              value={pct1(s.weight)}
              onCommit={(t) => valuation.setScenarioWeight(company, s.id, parseNumber(t) ?? 0)}
              error={scenarioIssue ? scenarioIssue.message : null}
              readOnly={readOnly}
            />
          </Row>
        ))}
        <Row type="total" aria-label="Scenario weights total">
          <RowLabelCell type="total">Total</RowLabelCell>
          <GridValueCell kind="total">{pct1(v.scenarios.reduce((t, s) => t + s.weight, 0))}</GridValueCell>
        </Row>
      </DataGrid>
    </section>
  );
}
