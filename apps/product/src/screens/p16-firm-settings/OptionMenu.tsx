/**
 * An open select menu, drawn under its field. The DS select is native (the OS
 * draws its list), so the Figma "… menu open" states are composed from
 * ComboboxOption rows on a raised surface. The field's trigger owns the open
 * state; this is the surface only.
 */
import { ComboboxOption, color, elevation, radius, space } from '@scalar/design-system';
import type { ReactNode } from 'react';

export interface MenuOption {
  value: string;
  label: string;
  /** Trailing marker, e.g. the "uses more credits" glyph on high-effort AI options. */
  detail?: ReactNode;
  disabled?: boolean;
}

export function OptionMenu({ label, options, value, onSelect, width = '100%' }: {
  label: string;
  options: readonly MenuOption[];
  value: string;
  onSelect: (value: string) => void;
  width?: string;
}) {
  return (
    <div
      role="listbox"
      aria-label={label}
      style={{
        position: 'absolute', top: '100%', left: 0, width, zIndex: 20, marginTop: space.xs,
        padding: `${space.xs} 0`, background: color.bg.surfaceRaised,
        border: `1px solid ${color.stroke.subtle}`, borderRadius: radius.s, boxShadow: elevation.overlay,
      }}
    >
      {options.map((o) => (
        <ComboboxOption
          key={o.value}
          selected={o.value === value}
          active={o.value === value}
          disabled={o.disabled}
          detail={o.detail}
          onSelect={() => onSelect(o.value)}
        >
          {o.label}
        </ComboboxOption>
      ))}
    </div>
  );
}
