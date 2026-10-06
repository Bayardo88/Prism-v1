import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { Icon } from '../icon/Icon.js';
import { AttachMoney, HourglassEmpty } from '../icon/material.js';
import { InformationLabel } from './Controls.js';

/** Figma `Open`: which groups of labels are expanded. */
export type ValuationInfoOpen = 'none' | 'values' | 'dates' | 'both';

export interface ValuationInfoProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Controlled state. Omit to let the component own it. */
  open?: ValuationInfoOpen;
  /** Initial state when uncontrolled. Default `none` — both collapsed, the resting state. */
  defaultOpen?: ValuationInfoOpen;
  onOpenChange?: (next: ValuationInfoOpen) => void;
  /** Equity Value, e.g. "$34,560,000". */
  equityValue?: ReactNode;
  /** Unrealized Firm Total, e.g. "$48,871,695". */
  unrealizedFirmTotal?: ReactNode;
  /** Market date, e.g. "06/01/2026". */
  marketDate?: ReactNode;
  /** Valuation version, e.g. "2026/06/01". */
  version?: ReactNode;
  /** The Market date / Version pickers are triggers only — the screen owns the menus they open. */
  onMarketDateClick?: () => void;
  onVersionClick?: () => void;
  /** The Market date menu is open (`aria-expanded` on its picker). */
  marketDateExpanded?: boolean;
  /** The Version menu is open (`aria-expanded` on its picker). */
  versionExpanded?: boolean;
}

const hasValues = (o: ValuationInfoOpen) => o === 'values' || o === 'both';
const hasDates = (o: ValuationInfoOpen) => o === 'dates' || o === 'both';

/**
 * Valuation Info — the collapsible valuation context at the right end of Company
 * info on company valuation pages.
 *
 * Two 24px toggles on Background/Subtle. The `$` toggle (Icon/Positive) reveals
 * Equity Value and Unrealized Firm Total; the hourglass toggle (Icon/Brand)
 * reveals the Market date and Version pickers. Figma `Open` = None · Values ·
 * Dates · Both.
 *
 * Accessibility: the toggles are icon-only, so each carries a constant accessible
 * name ("Valuation values", "Market date and version") plus `aria-expanded` and
 * `aria-controls`; the pickers carry `aria-haspopup` and `aria-expanded`.
 */
export const ValuationInfo = forwardRef<HTMLDivElement, ValuationInfoProps>(function ValuationInfo({
  open,
  defaultOpen = 'none',
  onOpenChange,
  equityValue,
  unrealizedFirmTotal,
  marketDate,
  version,
  onMarketDateClick,
  onVersionClick,
  marketDateExpanded,
  versionExpanded,
  className,
  ...rest
}, ref) {
  const uid = useId();
  const valuesId = `${uid}-values`;
  const datesId = `${uid}-dates`;
  const [state, setState] = useControllableState<ValuationInfoOpen>(open, defaultOpen, onOpenChange);
  const toggle = (group: 'values' | 'dates') => {
    const v = hasValues(state);
    const d = hasDates(state);
    const nextV = group === 'values' ? !v : v;
    const nextD = group === 'dates' ? !d : d;
    setState(nextV && nextD ? 'both' : nextV ? 'values' : nextD ? 'dates' : 'none');
  };

  return (
    <div ref={ref} className={cx('scalar-valuation-info', className)} role="group" aria-label="Valuation info" {...rest}>
      <div className="scalar-valuation-info__group">
        <button
          type="button"
          className="scalar-valuation-info__toggle scalar-valuation-info__toggle--values"
          aria-expanded={hasValues(state)}
          aria-label="Valuation values"
          aria-controls={hasValues(state) ? valuesId : undefined}
          onClick={() => toggle('values')}
        >
          <Icon size="s" tone="positive"><AttachMoney /></Icon>
        </button>
        {hasValues(state) && (
          <span id={valuesId} className="scalar-valuation-info__revealed">
            <InformationLabel label="EV" value={equityValue} />
            <InformationLabel label="UFT" value={unrealizedFirmTotal} />
          </span>
        )}
      </div>
      <div className="scalar-valuation-info__group">
        <button
          type="button"
          className="scalar-valuation-info__toggle scalar-valuation-info__toggle--dates"
          aria-expanded={hasDates(state)}
          aria-label="Market date and version"
          aria-controls={hasDates(state) ? datesId : undefined}
          onClick={() => toggle('dates')}
        >
          <Icon size="s" tone="brand"><HourglassEmpty /></Icon>
        </button>
        {hasDates(state) && (
          <span id={datesId} className="scalar-valuation-info__revealed">
            <button type="button" className="scalar-valuation-info__picker" aria-haspopup="menu" aria-expanded={marketDateExpanded ?? false} onClick={onMarketDateClick}>
              <InformationLabel label="Market" value={marketDate} tone="brand" dropdown />
            </button>
            <button type="button" className="scalar-valuation-info__picker" aria-haspopup="menu" aria-expanded={versionExpanded ?? false} onClick={onVersionClick}>
              <InformationLabel label="Version" value={version} tone="brand" dropdown />
            </button>
          </span>
        )}
      </div>
    </div>
  );
});
