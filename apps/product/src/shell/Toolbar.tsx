/**
 * The pieces of the Tertiary Menu's right-hand toolbar, in the order the
 * navigation file draws them: AI tool, currency, fit to screen, filter, then
 * the page's primary action. Screens compose the ones they need.
 */
import type { ReactNode } from 'react';
import { AITool, Button, ButtonIcon, CurrencySelector, Icon, SaveState, WORLD_CURRENCIES, icons, space, type CurrencyDisplayUnit, type SaveStateValue } from '@scalar/design-system';
import { setDisplayCurrency, setDisplayUnit, useDisplayCurrency, useDisplayUnit } from './displayUnit.js';

/** The purple AI trigger. A click opens the prompt field; the AI mark or Escape closes it. */
export function ToolbarAi({ onClick }: { onClick?: () => void }) {
  return <AITool onClick={onClick} />;
}

/**
 * Display currency and unit, platform-wide. The code opens a list of world
 * currencies; the unit steps Hundreds → Thousands → Millions → Hundreds. Both
 * live in `shell/displayUnit.ts`, so every screen's tables follow the same
 * choice (they format money through `useMoney`). Rates are illustrative (FX is
 * an open question, P1); the list footer says so.
 */
export function ToolbarCurrency({ recorded = 'Thousands' }: {
  /** The screen's recorded unit, shown until the user picks one. */
  recorded?: CurrencyDisplayUnit;
} = {}) {
  const unit = useDisplayUnit() ?? recorded;
  const code = useDisplayCurrency();
  return (
    <CurrencySelector
      currencies={WORLD_CURRENCIES}
      currency={code}
      onCurrencyChange={setDisplayCurrency}
      unit={unit}
      onUnitChange={setDisplayUnit}
      currencyNote="Illustrative rates, not market data. Display only — nothing is converted or recorded."
    />
  );
}

/** Fit to screen and column filter — the two table tools. */
export function ToolbarTableTools() {
  return (
    <>
      <ButtonIcon variant="tertiary" size="xs" label="Fit to screen" icon={<Icon size="s" tone="secondary"><icons.FitScreen /></Icon>} />
      <ButtonIcon variant="tertiary" size="xs" label="Filter" icon={<Icon size="s" tone="secondary"><icons.FilterList /></Icon>} />
    </>
  );
}

/** A 24px kebab that opens the page's actions. */
export function ToolbarKebab({ label = 'Page actions', onClick }: { label?: string; onClick?: () => void }) {
  return (
    <ButtonIcon variant="tertiary" size="xs" label={label} onClick={onClick} icon={<Icon size="l" tone="primary"><icons.MoreVert /></Icon>} />
  );
}

/**
 * The green primary action with a dropdown caret: Save, Save Notes & Documents.
 * With `state`, the save state sits beside it so the user knows whether edits
 * are persisted (P9).
 */
export function ToolbarSave({ children = 'Save', onClick, disabled, state }: {
  children?: ReactNode; onClick?: () => void; disabled?: boolean; state?: SaveStateValue;
}) {
  const button = (
    <Button
      size="xs"
      tone="positive"
      disabled={disabled}
      onClick={onClick}
      style={{ paddingLeft: space.s }}
      trailingIcon={<Icon size="s" tone="inherit"><icons.KeyboardArrowDown /></Icon>}
    >
      {children}
    </Button>
  );
  if (!state) return button;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: space.s }}>
      <SaveState state={state} />
      {button}
    </span>
  );
}
