/**
 * The pieces of the Tertiary Menu's right-hand toolbar, in the order the
 * navigation file draws them: AI tool, currency, fit to screen, filter, then
 * the page's primary action. Screens compose the ones they need.
 */
import type { ReactNode } from 'react';
import { AITool, Button, ButtonIcon, CurrencySelector, Icon, icons, space } from '@scalar/design-system';

/** The purple AI trigger. */
export function ToolbarAi({ onClick }: { onClick?: () => void }) {
  return <AITool onClick={onClick} />;
}

/** Display currency and unit: a green USD part, then the unit. */
export function ToolbarCurrency({ unit = '($) Thousands', currency = 'USD', onClick }: { unit?: ReactNode; currency?: ReactNode; onClick?: () => void }) {
  return <CurrencySelector currency={currency} onClick={onClick}>{unit}</CurrencySelector>;
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

/** The green primary action with a dropdown caret: Save, Save Notes & Documents. */
export function ToolbarSave({ children = 'Save', onClick, disabled }: { children?: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
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
}
