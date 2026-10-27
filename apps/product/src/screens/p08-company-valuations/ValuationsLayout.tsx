/**
 * The frame shared by every Company · Valuations screen (Prism Navigation V4):
 *
 * - Company header end: the Valuation Info toggles — an attach_money button that reveals
 *   Equity Value / Unrealized Firm Total, an hourglass button that reveals Market
 *   Date / Version — then the work status (Final · Ready for Audit) and ⋮.
 * - Tertiary sub-nav: one tab per approach (Summary · Conclusions · External
 *   Valuation · Specified Share Value · Backsolve) and "+" → Add approach menu.
 * - Actions: AI tool, currency/units, fit to screen, filter, Save split button, ⋮.
 */
import { useState, type ReactNode } from 'react';
import {
  ButtonIcon, ContextMenu, Icon, InformationLabel, MenuItem,
  ModalStatus, type SaveStateValue, TertiaryMenuItem, icons, space, zIndex,
} from '@scalar/design-system';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import { ToolbarAi, ToolbarCurrency, ToolbarKebab, ToolbarSave, ToolbarTableTools } from '../../shell/Toolbar.js';
import type { DockTab } from '../../shell/WorkspaceDock.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import type { Company } from '../../data/fixtures.js';
import { headlineFor } from './data.js';
import { MarketDatePicker } from '../../shell/MarketDatePicker.js';
import { VersionPicker } from '../../shell/VersionPicker.js';
import { useValuationContext } from '../../domain/context.js';
import { statusView } from '../p02-intelligence/data.js';
import { ValuationActions } from './ValuationActions.js';

export type ValuationTab =
  | 'overview' | 'summary' | 'conclusions' | 'external-valuation' | 'specified-share-value' | 'backsolve'
  | 'public-comps' | 'transaction-comps';

const TABS: Array<{ key: ValuationTab; label: string; to?: (id: string) => string }> = [
  { key: 'summary', label: 'Summary', to: routes.company.valuationSummary },
  { key: 'conclusions', label: 'Conclusions', to: routes.company.valuationConclusions },
  // No Figma frame exists yet for these two approaches: they open the approach prototypes.
  { key: 'external-valuation', label: 'External Valuation', to: routes.prototypes.approach('external-valuation') },
  { key: 'specified-share-value', label: 'Specified Share Value', to: routes.prototypes.approach('specified-share-value') },
  { key: 'backsolve', label: 'Backsolve', to: routes.company.backsolve },
];

/** Approaches offered by "+". Backsolve is disabled: this version already has one. */
export const APPROACHES = [
  'Range sensitivity', 'Backsolve', 'Secondary transactions', 'Mutual fund marks', 'Discounted cash flow',
  'External valuation', 'Future exit', 'Public comps', 'Transaction comps', 'Specified share values',
  'Calibration', 'Allocation scenario',
] as const;

/** Add-approach items that open an approach prototype (no Figma frame yet). */
const PROTOTYPE_APPROACH: Partial<Record<(typeof APPROACHES)[number], Parameters<typeof routes.prototypes.approach>[0]>> = {
  'External valuation': 'external-valuation',
  'Specified share values': 'specified-share-value',
  'Public comps': 'public-comps',
  'Transaction comps': 'transaction-comps',
};

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
  /** Prototype only: when set, an Overview tab is prepended and links here. */
  overviewHref?: string;
  /** Marks a tab as holding validation errors (icon + words, never colour alone). */
  errorTab?: ValuationTab;
  onSave?: () => void;
  /** Shown beside Save (P9). */
  saveState?: SaveStateValue;
  overlay?: ReactNode;
  children?: ReactNode;
}

export function ValuationsLayout({
  company, tab, overviewHref, approachMenuOpen = false, onApproachMenuChange, errorTab, onSave, saveState, overlay, children,
}: ValuationsLayoutProps) {
  const [values, setValues] = useState(false);
  const [dates, setDates] = useState(false);
  const headline = headlineFor(company);
  const { valuation } = useValuationContext(company);
  const status = statusView[valuation?.status ?? 'draft'];

  const addApproach = (
    <div style={{ position: 'relative' }}>
      <ButtonIcon
        variant="tertiary"
        size="s"
        label="Add approach"
        aria-expanded={approachMenuOpen}
        onClick={() => onApproachMenuChange?.(!approachMenuOpen)}
        icon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}
      />
      {approachMenuOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: zIndex.overlay, marginTop: space.xs }}>
          <ContextMenu label="Add approach" heading="Add approach">
            {APPROACHES.map((a) => {
              const proto = PROTOTYPE_APPROACH[a];
              return (
                <MenuItem
                  key={a}
                  disabled={a === 'Backsolve'}
                  href={proto ? href(routes.prototypes.approach(proto)(company.id)) : undefined}
                  onClick={() => onApproachMenuChange?.(false)}
                >
                  {a}
                </MenuItem>
              );
            })}
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
              <InformationLabel label="Equity Value" value={headline.equityValue} />
              <InformationLabel label="Unrealized Firm Total" value={headline.unrealized} />
            </>
          )}
          <ButtonIcon
            variant="tertiary"
            size="s"
            selected={values}
            label={values ? 'Hide equity value and unrealized firm total' : 'Show equity value and unrealized firm total'}
            onClick={() => setValues((v) => !v)}
            icon={<Icon size="s" tone="positive"><icons.AttachMoney /></Icon>}
          />
          {dates && (
            <>
              {/* P2: the market date is held apart from the measurement date. */}
              <MarketDatePicker company={company} />
              <VersionPicker company={company} kind="valuation" />
            </>
          )}
          <ButtonIcon
            variant="tertiary"
            size="s"
            selected={dates}
            label={dates ? 'Hide market date and version' : 'Show market date and version'}
            onClick={() => setDates((v) => !v)}
            icon={<Icon size="s" tone="brand"><icons.HourglassEmpty /></Icon>}
          />
          {/* P8: the version's own workflow status, not a drawn label. */}
          <ModalStatus state={status.state}>{status.label}</ModalStatus>
          <ValuationActions company={company} />
        </>
      }
      subNav={
        <>
          {overviewHref && (
            <TertiaryMenuItem current={tab === 'overview'} href={overviewHref}>Overview</TertiaryMenuItem>
          )}
          {TABS.map((t) => (
            <TertiaryMenuItem
              key={t.key}
              current={t.key === tab}
              href={t.to ? href(t.to(company.id)) : undefined}
              icon={errorTab === t.key ? <Icon size="s" tone="negative" label="Has errors"><icons.Error /></Icon> : undefined}
            >
              {t.label}
            </TertiaryMenuItem>
          ))}
          {addApproach}
        </>
      }
      subNavEnd={
        <>
          <ToolbarAi />
          <ToolbarCurrency />
          <ToolbarTableTools />
          <ToolbarSave onClick={onSave} state={saveState} />
          <ToolbarKebab />
        </>
      }
    >
      {children}
    </CompanyLayout>
  );
}
