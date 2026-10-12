import {
  forwardRef, useEffect, useId, useRef, useState,
  type HTMLAttributes, type KeyboardEvent, type PointerEvent,
} from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { useLatestRef } from '../../utils/useLatestRef.js';
import { Button } from '../button/Button.js';
import { Input } from '../input/Input.js';

/* ---------------------------------------------------------------------------
 * Colour maths. The picked colour and the hue spectrum are DATA (what the user
 * is choosing), not design tokens: they are computed here and passed as inline
 * style, never written into the component layer.
 * ------------------------------------------------------------------------ */

export interface Hsv {
  /** 0–360 */
  h: number;
  /** 0–1 */
  s: number;
  /** 0–1 */
  v: number;
}

const HEX = /^#?([0-9a-f]{6})$/i;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** `#RRGGBB` (with or without `#`) → HSV. Returns `undefined` for anything else. */
export function hexToHsv(hex: string): Hsv | undefined {
  const match = HEX.exec(hex.trim());
  if (!match?.[1]) return undefined;
  const n = parseInt(match[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

/** HSV → lowercase `#rrggbb`. */
export function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const x = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${x(f(5))}${x(f(3))}${x(f(1))}`;
}

/** The full hue circle, left to right — a data gradient (every hue at full saturation and value). */
export const HUE_SPECTRUM = `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360].map((h) => hsvToHex({ h, s: 1, v: 1 })).join(', ')})`;
const WHITE = hsvToHex({ h: 0, s: 0, v: 1 });
const BLACK = hsvToHex({ h: 0, s: 0, v: 0 });
/** The saturation × value plane for a hue: white → hue across, transparent → black down. */
const planeFor = (h: number) =>
  `linear-gradient(to top, ${BLACK}, transparent), linear-gradient(to right, ${WHITE}, transparent), ${hsvToHex({ h, s: 1, v: 1 })}`;

/* ---------------------------------------------------------------------------
 * Colour Picker
 * ------------------------------------------------------------------------ */

export interface ColorPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** What the colour is for ("Draft"). Names the picker. */
  label: string;
  /** The colour to start from, `#RRGGBB`. Remount (`key`) to start over from a new value. */
  value: string;
  /** Commit the colour. */
  onApply: (hex: string) => void;
  /** Leave without changing anything. Escape inside the picker calls it too. */
  onCancel: () => void;
  /** Every change while picking, for a live preview. */
  onChange?: (hex: string) => void;
  applyLabel?: string;
  cancelLabel?: string;
}

/**
 * Colour Picker — choose a colour by hex, on a saturation × brightness square
 * and on a hue slider, then Apply or Cancel. For user-defined colours (a status
 * colour a firm sets for itself) — never for picking a design token.
 *
 * Composition: `Input` (hex), `Button` × 2. The square and the hue track are
 * data, not tokens: their gradients are computed (`HUE_SPECTRUM`) and set
 * inline.
 *
 * Keyboard: both are `role="slider"` and one tab stop each.
 * Square — Left/Right saturation, Up/Down brightness (1%, Shift 10%),
 * Home/End saturation 0 / 100%, Page Up/Down brightness ±10%.
 * Hue — Left/Down and Right/Up 1° (Shift 10°), Page Up/Down 30°, Home/End 0° / 359°.
 * The value text says the numbers ("Saturation 40%, brightness 90%", "Hue 210°").
 * An invalid hex is flagged (`aria-invalid`) and reverts on blur.
 */
export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(function ColorPicker(
  { label, value, onApply, onCancel, onChange, applyLabel = 'Apply', cancelLabel = 'Cancel', className, ...rest },
  ref,
) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  // Escape from anywhere inside cancels. The host owns open state and focus return.
  const onCancelRef = useLatestRef(onCancel);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const handler = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        onCancelRef.current();
      }
    };
    root.addEventListener('keydown', handler);
    return () => root.removeEventListener('keydown', handler);
  }, [onCancelRef]);
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value) ?? { h: 210, s: 0.5, v: 0.9 });
  const hex = hsvToHex(hsv);
  const [hexText, setHexText] = useState(hex.toUpperCase());
  const hexValid = HEX.test(hexText.trim());

  const update = (next: Hsv) => {
    setHsv(next);
    const nextHex = hsvToHex(next);
    setHexText(nextHex.toUpperCase());
    onChange?.(nextHex);
  };

  /** Pointer drag on a track: capture, then map the pointer to 0–1 on each axis. */
  const track = (apply: (x: number, y: number) => void) => {
    const at = (event: PointerEvent<HTMLDivElement>) => {
      const box = event.currentTarget.getBoundingClientRect();
      apply(
        clamp01(box.width ? (event.clientX - box.left) / box.width : 0),
        clamp01(box.height ? (event.clientY - box.top) / box.height : 0),
      );
    };
    return {
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        at(event);
      },
      onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) at(event);
      },
    };
  };

  const onPlaneKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.01;
    let { s, v } = hsv;
    switch (event.key) {
      case 'ArrowLeft': s -= step; break;
      case 'ArrowRight': s += step; break;
      case 'ArrowUp': v += step; break;
      case 'ArrowDown': v -= step; break;
      case 'Home': s = 0; break;
      case 'End': s = 1; break;
      case 'PageUp': v += 0.1; break;
      case 'PageDown': v -= 0.1; break;
      default: return;
    }
    event.preventDefault();
    update({ ...hsv, s: clamp01(s), v: clamp01(v) });
  };

  const onHueKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 1;
    let { h } = hsv;
    switch (event.key) {
      case 'ArrowLeft': case 'ArrowDown': h -= step; break;
      case 'ArrowRight': case 'ArrowUp': h += step; break;
      case 'PageDown': h -= 30; break;
      case 'PageUp': h += 30; break;
      case 'Home': h = 0; break;
      case 'End': h = 359; break;
      default: return;
    }
    event.preventDefault();
    update({ ...hsv, h: Math.min(359, Math.max(0, Math.round(h))) });
  };

  const sPct = Math.round(hsv.s * 100);
  const vPct = Math.round(hsv.v * 100);
  const hDeg = Math.round(hsv.h);

  return (
    <div
      ref={composeRefs(rootRef, ref)}
      role="group"
      aria-labelledby={`${id}-label`}
      className={cx('scalar-color-picker', className)}
      {...rest}
    >
      <div className="scalar-color-picker__head">
        <span id={`${id}-label`} className="scalar-color-picker__label">{label}</span>
        <span className="scalar-color-picker__swatch" style={{ background: hex }} aria-hidden />
        <Input
          className="scalar-color-picker__hex"
          aria-label="Hex colour"
          value={hexText}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          state={hexValid ? undefined : 'error'}
          aria-invalid={!hexValid || undefined}
          onChange={(event) => {
            const text = event.target.value;
            setHexText(text);
            const parsed = hexToHsv(text);
            if (parsed) {
              setHsv(parsed);
              onChange?.(hsvToHex(parsed));
            }
          }}
          onBlur={() => setHexText(hex.toUpperCase())}
        />
      </div>

      <span id={`${id}-sat`} className="scalar-color-picker__caption">Saturation</span>
      <div
        role="slider"
        tabIndex={0}
        aria-labelledby={`${id}-sat`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={sPct}
        aria-valuetext={`Saturation ${sPct}%, brightness ${vPct}%`}
        className="scalar-color-picker__plane"
        style={{ background: planeFor(hsv.h) }}
        onKeyDown={onPlaneKey}
        {...track((x, y) => update({ ...hsv, s: x, v: 1 - y }))}
      >
        <span className="scalar-color-picker__thumb" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hex }} />
      </div>

      <span id={`${id}-hue`} className="scalar-color-picker__caption">Hue</span>
      <div
        role="slider"
        tabIndex={0}
        aria-labelledby={`${id}-hue`}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={hDeg}
        aria-valuetext={`Hue ${hDeg}°`}
        className="scalar-color-picker__hue"
        style={{ backgroundImage: HUE_SPECTRUM }}
        onKeyDown={onHueKey}
        {...track((x) => update({ ...hsv, h: Math.min(359, Math.round(x * 360)) }))}
      >
        <span className="scalar-color-picker__thumb scalar-color-picker__thumb--hue" style={{ left: `${(hsv.h / 360) * 100}%`, background: hsvToHex({ h: hsv.h, s: 1, v: 1 }) }} />
      </div>

      <div className="scalar-color-picker__footer">
        <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant="primary" onClick={() => onApply(hex)}>{applyLabel}</Button>
      </div>
    </div>
  );
});
