/**
 * The frame shared by every Company · Valuations screen (Prism Navigation V4):
 *
 * - Company header end: the Valuation Info toggles — a "$" button that reveals
 *   Equity Value / Unrealized Firm Total, a clock button that reveals Market
 *   Date / Version — then the work status (Final · Ready for Audit) and ⋮.
 * - Tertiary sub-nav: one tab per approach (Summary · Conclusions · External
 *   Valuation · Specified Share Value · Backsolve) and "+" → Add approach menu.
 * - Actions: AI tool, currency/units, fit to screen, filter, Save split button, ⋮.
 */
import { useState, type ReactNode } from 'react';
import {
  AITool, ButtonIcon, ContextMenu, CurrencySelector, Icon, InformationLabel, MenuItem,
  ModalStatus, SplitButton, TertiaryMenuItem, Text, glyphs, space, zIndex,
} from '@scalar/design-system';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import type { DockTab } from '../../shell/WorkspaceDock.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import type { Company } from '../../data/fixtures.js';

export type ValuationTab = 'summary' | 'conclusions' | 'external-valuation' | 'specified-share-value' | 'backsolve';

const TABS: Array<{ key: ValuationTab; label: string; to?: (id: string) => string }> = [
  { key: 'summary', label: 'Summary', to: routes.company.valuationSummary },
  { key: 'conclusions', label: 'Conclusions', to: routes.company.valuationConclusions },
  // No Figma frame (and so no route) exists yet for these two approaches.
  { key: 'external-valuation', label: 'External Valuation' },
  { key: 'specified-share-value', label: 'Specified Share Value' },
  { key: 'backsolve', label: 'Backsolve', to: routes.company.backsolve },
];

/** Approaches offered by "+". Backsolve is disabled: this version already has one. */
export const APPROACHES = [
  'Range sensitivity', 'Backsolve', 'Secondary transactions', 'Mutual fund marks', 'Discounted cash flow',
  'External valuation', 'Future exit', 'Public comps', 'Transaction comps', 'Specified share values',
  'Calibration', 'Allocation scenario',
] as const;

const DOCK: DockTab[] = [
  { key: 'notes', label: 'Notes', count: 0 },
  { key: 'sheets', label: 'Sheets' },
  { key: 'documents', label: 'Documents' },
];

export interface ValuationsLayoutProps {
  company: Company;
  tab: ValuationTab;
  /** Controlled "Add approach" menu under the "+" tab. */
  approachMenuOpen?: boolean;
  onApproachMenuChange?: (open: boolean) => void;
  /** Marks a tab as holding validation errors (icon + words, never colour alone). */
  errorTab?: ValuationTab;
  onSave?: () => void;
  overlay?: ReactNode;
  children?: ReactNode;
}

export function ValuationsLayout({
  company, tab, approachMenuOpen = false, onApproachMenuChange, errorTab, onSave, overlay, children,
}: ValuationsLayoutProps) {
  const [values, setValues] = useState(false);
  const [dates, setDates] = useState(false);

  const addApproach = (
    <div style={{ position: 'relative' }}>
      <ButtonIcon
        variant="tertiary"
        size="s"
        label="Add approach"
        aria-expanded={approachMenuOpen}
        onClick={() => onApproachMenuChange?.(!approachMenuOpen)}
        icon={<Icon size="s" tone="inherit"><glyphs.Plus /></Icon>}
      />
      {approachMenuOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: zIndex.overlay, marginTop: space.xs }}>
          <ContextMenu label="Add approach" heading="Add approach">
            {APPROACHES.map((a) => (
              <MenuItem
                key={a}
                disabled={a === 'Backsolve'}
                onClick={() => onApproachMenuChange?.(false)}
              >
                {a}
              </MenuItem>
            ))}
          </ContextMenu>
        </div>
      )}
    </div>
  );

  return (
    <CompanyLayout
      company={company}
      section="valuations"
      dock={DOCK}
      overlay={overlay}
      headerEnd={
        <>
          {values && (
            <>
              <InformationLabel label="Equity Value" value="$0" />
              <InformationLabel label="Unrealized Firm Total" value="$0" />
            </>
          )}
          <ButtonIcon
            variant="tertiary"
            size="s"
            selected={values}
            label={values ? 'Hide equity value and unrealized firm total' : 'Show equity value and unrealized firm total'}
            onClick={() => setValues((v) => !v)}
            icon={<Text as="span" step="m" weight="bold" tone="positive" aria-hidden>$</Text>}
          />
          {dates && (
            <>
              <InformationLabel label="Market Date" value={company.asOf} />
              <InformationLabel label="Version" value={`Version 1 - ${isoDate(company.asOf)}`} />
            </>
          )}
          <ButtonIcon
            variant="tertiary"
            size="s"
            selected={dates}
            label={dates ? 'Hide market date and version' : 'Show market date and version'}
            onClick={() => setDates((v) => !v)}
            icon={<Icon size="s" tone="brand"><glyphs.Clock /></Icon>}
          />
          <ModalStatus state="final" />
          <ModalStatus state="review">Ready for Audit</ModalStatus>
          <ButtonIcon
            variant="tertiary"
            size="s"
            label="Valuation actions"
            icon={<Icon size="s" tone="inherit"><glyphs.MoreVertical /></Icon>}
          />
        </>
      }
      subNav={
        <>
          {TABS.map((t) => (
            <TertiaryMenuItem
              key={t.key}
              current={t.key === tab}
              href={t.to ? href(t.to(company.id)) : undefined}
              icon={errorTab === t.key ? <Icon size="s" tone="negative" label="Has errors"><glyphs.Error /></Icon> : undefined}
            >
              {t.label}
            </TertiaryMenuItem>
          ))}
          {addApproach}
        </>
      }
      subNavEnd={
        <>
          <AITool />
          <CurrencySelector>
            <Text as="span" step="s" tone="positive">USD</Text>
            <Text as="span" step="s" tone="secondary">($) Thousands</Text>
          </CurrencySelector>
          <ButtonIcon variant="tertiary" size="s" label="Fit to screen" icon={<Icon size="s" tone="inherit"><glyphs.Expand /></Icon>} />
          <ButtonIcon variant="tertiary" size="s" label="Filter" icon={<Icon size="s" tone="inherit"><glyphs.Filter /></Icon>} />
          <SplitButton tone="positive" menuLabel="More save options" onClick={onSave}>Save</SplitButton>
          <ButtonIcon variant="tertiary" size="s" label="Page actions" icon={<Icon size="s" tone="inherit"><glyphs.MoreVertical /></Icon>} />
        </>
      }
    >
      {children}
    </CompanyLayout>
  );
}

/** "12/31/2024" → "2024-12-31", the version naming the app uses. */
function isoDate(us: string): string {
  const [m, d, y] = us.split('/');
  return `${y}-${m}-${d}`;
}
