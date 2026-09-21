# Scalar Design System — Token Reference

> Generated from `src/tokens/tokens.json`, which is generated from
> `src/styles/tokens.css`, which was extracted from the live Figma library
> `anrnTIJKgu27zV224h7vON (Scalar_Design_System-v1.1)`.
> **Do not hand-edit.** Run `npm run gen:tokens && node scripts/gen-docs.mjs`.

- **145** semantic colour tokens (Light + Dark)
- **142** primitive colour steps (reference only)
- **57** scale, elevation and motion tokens
- **77** typography tokens × 3 viewport modes

---

## 1. Semantic colour

Every token below responds to the theme. Use these, never the primitives.

### Text

On a filled surface always use an `on*` token — `text-primary` on a fill is a contrast bug (rule R3).

| Token | Light | Dark |
|---|---|---|
| `--color-text-ai` | `#a614ff` | `#d692ff` |
| `--color-text-brand` | `#0268c1` | `#68b1f1` |
| `--color-text-brand-hover` | `#02539a` | `#9acbf6` |
| `--color-text-brand-pressed` | `#013e73` | `#cde5fa` |
| `--color-text-disabled` | `#94a3b8` | `#475569` |
| `--color-text-editable` | `#0268c1` | `#68b1f1` |
| `--color-text-inverse` | `#f8fafc` | `#0f172a` |
| `--color-text-link` | `#2a3ef4` | `#9ea7fa` |
| `--color-text-link-hover` | `#0a1cc2` | `#ced3fd` |
| `--color-text-link-pressed` | `#071592` | `#e9ebfe` |
| `--color-text-negative` | `#cb0000` | `#ff999c` |
| `--color-text-negative-hover` | `#9c0000` | `#ffc8c9` |
| `--color-text-negative-pressed` | `#6c0003` | `#ffe6e7` |
| `--color-text-on-ai` | `#ffffff` | `#0f172a` |
| `--color-text-on-brand` | `#ffffff` | `#0f172a` |
| `--color-text-on-disabled` | `#475569` | `#cbd5e1` |
| `--color-text-on-negative` | `#ffffff` | `#0f172a` |
| `--color-text-on-positive` | `#ffffff` | `#0f172a` |
| `--color-text-on-warning` | `#0f172a` | `#0f172a` |
| `--color-text-positive` | `#007e17` | `#31c37b` |
| `--color-text-positive-hover` | `#006012` | `#7ed6a5` |
| `--color-text-positive-pressed` | `#00420f` | `#bbe8ce` |
| `--color-text-primary` | `#0f172a` | `#f8fafc` |
| `--color-text-secondary` | `#1e293b` | `#e3e8f0` |
| `--color-text-sourced` | `#007e17` | `#31c37b` |
| `--color-text-tertiary` | `#475569` | `#cbd5e1` |
| `--color-text-warning` | `#996600` | `#ffcc66` |
| `--color-text-warning-hover` | `#664400` | `#ffdd99` |
| `--color-text-warning-pressed` | `#332200` | `#ffeecc` |

### Background

| Token | Light | Dark |
|---|---|---|
| `--color-bg-ai` | `#a614ff` | `#c668ff` |
| `--color-bg-ai-subtle` | `#fbf4ff` | `#5d0095` |
| `--color-bg-brand` | `#0268c1` | `#3597ed` |
| `--color-bg-brand-hover` | `#02539a` | `#68b1f1` |
| `--color-bg-brand-pressed` | `#013e73` | `#9acbf6` |
| `--color-bg-brand-subtle` | `#e9f3fd` | `#01294c` |
| `--color-bg-disabled` | `#e3e8f0` | `#334155` |
| `--color-bg-inverse` | `#0f172a` | `#f8fafc` |
| `--color-bg-negative` | `#cb0000` | `#ff2f3d` |
| `--color-bg-negative-hover` | `#9c0000` | `#ff686e` |
| `--color-bg-negative-pressed` | `#6c0003` | `#ff999c` |
| `--color-bg-negative-subtle` | `#ffe6e7` | `#3b0104` |
| `--color-bg-page` | `#f8fafc` | `#0f172a` |
| `--color-bg-positive` | `#007e17` | `#00b04f` |
| `--color-bg-positive-hover` | `#006012` | `#31c37b` |
| `--color-bg-positive-pressed` | `#00420f` | `#7ed6a5` |
| `--color-bg-positive-subtle` | `#e0f5e9` | `#002409` |
| `--color-bg-subtle` | `#f1f5f9` | `#1e293b` |
| `--color-bg-surface` | `#ffffff` | `#1e293b` |
| `--color-bg-surface-raised` | `#ffffff` | `#334155` |
| `--color-bg-warning` | `#ffbb33` | `#ffbb33` |
| `--color-bg-warning-hover` | `#ffaa00` | `#ffcc66` |
| `--color-bg-warning-pressed` | `#cc8800` | `#ffdd99` |
| `--color-bg-warning-subtle` | `#fff7e8` | `#332200` |

### Stroke

`default`, `subtle` and `divider` are non-interactive container edges. Anything clickable, focusable or typable takes `control` (rule R5).

| Token | Light | Dark |
|---|---|---|
| `--color-stroke-ai` | `#a614ff` | `#d692ff` |
| `--color-stroke-brand` | `#0268c1` | `#3597ed` |
| `--color-stroke-brand-hover` | `#02539a` | `#68b1f1` |
| `--color-stroke-brand-pressed` | `#013e73` | `#9acbf6` |
| `--color-stroke-control` | `#64748b` | `#94a3b8` |
| `--color-stroke-default` | `#cbd5e1` | `#334155` |
| `--color-stroke-disabled` | `#e3e8f0` | `#334155` |
| `--color-stroke-divider` | `#e3e8f0` | `#334155` |
| `--color-stroke-focus` | `#037de8` | `#68b1f1` |
| `--color-stroke-negative` | `#cb0000` | `#ff2f3d` |
| `--color-stroke-negative-hover` | `#9c0000` | `#ff686e` |
| `--color-stroke-negative-pressed` | `#6c0003` | `#ff999c` |
| `--color-stroke-positive` | `#007e17` | `#00b04f` |
| `--color-stroke-positive-hover` | `#006012` | `#31c37b` |
| `--color-stroke-positive-pressed` | `#00420f` | `#7ed6a5` |
| `--color-stroke-strong` | `#475569` | `#cbd5e1` |
| `--color-stroke-subtle` | `#e3e8f0` | `#1e293b` |
| `--color-stroke-warning` | `#996600` | `#ffcc66` |
| `--color-stroke-warning-hover` | `#664400` | `#ffdd99` |
| `--color-stroke-warning-pressed` | `#332200` | `#ffeecc` |

### Icon

| Token | Light | Dark |
|---|---|---|
| `--color-icon-ai` | `#a614ff` | `#d692ff` |
| `--color-icon-brand` | `#0268c1` | `#3597ed` |
| `--color-icon-brand-hover` | `#02539a` | `#68b1f1` |
| `--color-icon-brand-pressed` | `#013e73` | `#9acbf6` |
| `--color-icon-disabled` | `#94a3b8` | `#475569` |
| `--color-icon-inverse` | `#f8fafc` | `#0f172a` |
| `--color-icon-negative` | `#cb0000` | `#ff2f3d` |
| `--color-icon-negative-hover` | `#9c0000` | `#ff686e` |
| `--color-icon-negative-pressed` | `#6c0003` | `#ff999c` |
| `--color-icon-on-brand` | `#ffffff` | `#0f172a` |
| `--color-icon-positive` | `#007e17` | `#00b04f` |
| `--color-icon-positive-hover` | `#006012` | `#31c37b` |
| `--color-icon-positive-pressed` | `#00420f` | `#7ed6a5` |
| `--color-icon-primary` | `#0f172a` | `#f8fafc` |
| `--color-icon-secondary` | `#475569` | `#94a3b8` |
| `--color-icon-warning` | `#996600` | `#ffcc66` |
| `--color-icon-warning-hover` | `#664400` | `#ffdd99` |
| `--color-icon-warning-pressed` | `#332200` | `#ffeecc` |

### Overlay & shadow

| Token | Light | Dark |
|---|---|---|
| `--color-overlay-medium` | `#00000080` | `#ffffff80` |
| `--color-overlay-scrim` | `#00000080` | `#00000099` |
| `--color-overlay-strong` | `#000000b2` | `#ffffffb2` |
| `--color-overlay-subtle` | `#0000004d` | `#ffffff4d` |

### Shadow

| Token | Light | Dark |
|---|---|---|
| `--color-shadow-ambient` | `#00000014` | `#00000066` |
| `--color-shadow-key` | `#00000029` | `#00000099` |

### Chart

⚠️ Series 2 and Series 3 separate by only ΔE 4.9 under deuteranopia in Light. Charts using both must carry direct labels or texture.

| Token | Light | Dark |
|---|---|---|
| `--color-chart-axis` | `#64748b` | `#64748b` |
| `--color-chart-grid` | `#e3e8f0` | `#1e293b` |
| `--color-chart-negative` | `#cb0000` | `#ff2f3d` |
| `--color-chart-positive` | `#007e17` | `#00b04f` |
| `--color-chart-series-1` | `#8e1242` | `#f088bd` |
| `--color-chart-series-1-subtle` | `#fce7f3` | `#5f0c29` |
| `--color-chart-series-2` | `#808135` | `#d3d392` |
| `--color-chart-series-2-subtle` | `#f3f3dd` | `#49491d` |
| `--color-chart-series-3` | `#cb0000` | `#ff686e` |
| `--color-chart-series-3-subtle` | `#ffc8c9` | `#6c0003` |
| `--color-chart-series-4` | `#046140` | `#9ce8cd` |
| `--color-chart-series-4-subtle` | `#cef3e6` | `#046140` |
| `--color-chart-series-5` | `#013e73` | `#3597ed` |
| `--color-chart-series-5-subtle` | `#cde5fa` | `#013e73` |
| `--color-chart-series-6` | `#d26000` | `#ffc790` |
| `--color-chart-series-6-subtle` | `#ffe0c4` | `#6f3300` |
| `--color-chart-series-7` | `#5826d6` | `#a77fff` |
| `--color-chart-series-7-subtle` | `#dfcfff` | `#2e1571` |
| `--color-chart-series-8` | `#0e7490` | `#67e8f9` |
| `--color-chart-series-8-subtle` | `#cffafe` | `#155e75` |
| `--color-chart-total` | `#0f172a` | `#f8fafc` |


### PRISM

Semantic colour for **what an item represents** — never access, availability or
permission (rule R11). `primary` is graphic only, `background` is the tint,
`text` is the only member safe for small text.

| Token | Light | Dark |
|---|---|---|
| `--color-entity-firm-primary` | `#cc8800` | `#ffbb33` |
| `--color-entity-firm-background` | `#ffeecc` | `#332200` |
| `--color-entity-firm-text` | `#664400` | `#ffcc66` |
| `--color-entity-company-primary` | `#0268c1` | `#3597ed` |
| `--color-entity-company-background` | `#cde5fa` | `#01294c` |
| `--color-entity-company-text` | `#02539a` | `#68b1f1` |
| `--color-data-document-primary` | `#0a1cc2` | `#3d4ff5` |
| `--color-data-document-background` | `#ced3fd` | `#020731` |
| `--color-data-document-text` | `#0a1cc2` | `#9ea7fa` |
| `--color-data-version-primary` | `#007e17` | `#00b04f` |
| `--color-data-version-background` | `#bbe8ce` | `#002409` |
| `--color-data-version-text` | `#006012` | `#31c37b` |
| `--color-data-measurement-date-primary` | `#0891b2` | `#22d3ee` |
| `--color-data-measurement-date-background` | `#cffafe` | `#164e63` |
| `--color-data-measurement-date-text` | `#0e7490` | `#67e8f9` |
| `--color-destination-page-primary` | `#be185d` | `#ea589e` |
| `--color-destination-page-background` | `#fce7f3` | `#2f0613` |
| `--color-destination-page-text` | `#be185d` | `#f6b7d9` |
| `--color-command-firm-action-primary` | `#a614ff` | `#c668ff` |
| `--color-command-firm-action-background` | `#f5e6ff` | `#5d0095` |
| `--color-command-firm-action-text` | `#9100e9` | `#d692ff` |
| `--color-command-company-action-primary` | `#808135` | `#c2c26b` |
| `--color-command-company-action-background` | `#f3f3dd` | `#303012` |
| `--color-command-company-action-text` | `#666629` | `#d3d392` |
| `--color-utility-neutral-primary` | `#475569` | `#94a3b8` |
| `--color-utility-neutral-background` | `#f1f5f9` | `#0f172a` |
| `--color-utility-neutral-text` | `#475569` | `#cbd5e1` |

---

## 2. Scales

### Spacing — gap and padding only

| Token | Value |
|---|---|
| `--space-none` | `0px` |
| `--space-2xs` | `2px` |
| `--space-xs` | `4px` |
| `--space-s` | `8px` |
| `--space-m` | `12px` |
| `--space-l` | `16px` |
| `--space-xl` | `24px` |
| `--space-2xl` | `32px` |
| `--space-3xl` | `48px` |
| `--space-4xl` | `64px` |

### Radius

| Token | Value |
|---|---|
| `--radius-none` | `0px` |
| `--radius-2xs` | `2px` |
| `--radius-xs` | `4px` |
| `--radius-s` | `8px` |
| `--radius-m` | `16px` |
| `--radius-l` | `24px` |
| `--radius-xl` | `32px` |
| `--radius-full` | `9999px` |

### Sizing — width and height only

| Token | Value |
|---|---|
| `--size-icon-xs` | `12px` |
| `--size-icon-s` | `16px` |
| `--size-icon-m` | `20px` |
| `--size-icon-l` | `24px` |
| `--size-icon-xl` | `32px` |
| `--size-control-s` | `32px` |
| `--size-control-m` | `40px` |
| `--size-control-l` | `48px` |
| `--size-avatar-xs` | `24px` |
| `--size-avatar-s` | `32px` |
| `--size-avatar-m` | `40px` |
| `--size-avatar-l` | `56px` |
| `--size-avatar-xl` | `80px` |
| `--size-row-compact` | `26px` |
| `--size-target-dense` | `24px` |
| `--size-target-minimum` | `44px` |
| `--size-target-comfortable` | `48px` |

### Breakpoints

| Token | Value |
|---|---|
| `--breakpoint-mobile` | `393px` |
| `--breakpoint-tablet-small` | `768px` |
| `--breakpoint-tablet` | `1024px` |
| `--breakpoint-desktop` | `1440px` |
| `--breakpoint-desktop-large` | `1920px` |

### Elevation

| Token | Value |
|---|---|
| `--elevation-raised` | `0 1px 3px 0 var(--color-shadow-ambient), 0 1px 2px 0 var(--color-shadow-key)` |
| `--elevation-overlay` | `0 8px 24px -4px var(--color-shadow-ambient), 0 2px 6px -1px var(--color-shadow-key)` |
| `--elevation-modal` | `0 24px 48px -12px var(--color-shadow-ambient), 0 8px 16px -4px var(--color-shadow-key)` |

### Border width

| Token | Value |
|---|---|
| `--border-width-s` | `1px` |
| `--border-width-m` | `2px` |

### Motion — duration

| Token | Value |
|---|---|
| `--duration-instant` | `100ms` |
| `--duration-fast` | `150ms` |
| `--duration-moderate` | `250ms` |

### Motion — easing

| Token | Value |
|---|---|
| `--easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--easing-decelerate` | `cubic-bezier(0, 0, 0, 1)` |

### Z-index ladder

| Token | Value |
|---|---|
| `--z-sticky` | `100` |
| `--z-drawer` | `200` |
| `--z-scrim` | `300` |
| `--z-modal` | `400` |
| `--z-overlay` | `500` |
| `--z-toast` | `600` |
| `--z-tooltip` | `700` |


---

## 3. Typography

Three modes (rule R6). Desktop is the default. Weight is orthogonal to size
(R7). The floor is 12px (R10).

Values are `size/line-height` in px.

#### Display

| Step | Desktop (1440) | Desktop Large (1920) | Mobile (393) | Tracking |
|---|---|---|---|---|
| `s` | 40px/44px | 48px/52px | 24px/32px | -1.5px |
| `m` | 48px/52px | 56px/60px | 28px/36px | -1.5px |
| `l` | 56px/60px | 64px/68px | 32px/40px | -1.5px |

#### Heading

| Step | Desktop (1440) | Desktop Large (1920) | Mobile (393) | Tracking |
|---|---|---|---|---|
| `s` | 12px/16px | 14px/18px | 12px/16px | 0px |
| `m` | 14px/18px | 16px/20px | 14px/18px | 0px |
| `l` | 16px/20px | 18px/24px | 16px/20px | -0.2px |
| `xl` | 18px/24px | 20px/26px | 18px/24px | -0.2px |
| `2xl` | 20px/26px | 24px/32px | 20px/26px | -0.5px |
| `3xl` | 24px/32px | 28px/36px | 24px/32px | -0.5px |
| `4xl` | 28px/36px | 32px/40px | 24px/32px | -1px |
| `5xl` | 32px/40px | 40px/48px | 28px/36px | -1px |

#### Text

| Step | Desktop (1440) | Desktop Large (1920) | Mobile (393) | Tracking |
|---|---|---|---|---|
| `s` | 12px/16px | 14px/20px | 12px/16px | 0px |
| `m` | 14px/20px | 16px/24px | 14px/20px | 0px |
| `l` | 16px/24px | 18px/26px | 16px/24px | 0px |
| `xl` | 18px/26px | 20px/28px | 18px/26px | 0px |
| `2xl` | 20px/28px | 24px/32px | 20px/28px | 0px |

#### Label

| Step | Desktop (1440) | Desktop Large (1920) | Mobile (393) | Tracking |
|---|---|---|---|---|
| `s` | 12px/16px | 14px/18px | 12px/16px | 0px |
| `m` | 14px/18px | 16px/20px | 14px/18px | 0px |
| `l` | 16px/20px | 18px/24px | 16px/20px | 0px |

#### Link

| Step | Desktop (1440) | Desktop Large (1920) | Mobile (393) | Tracking |
|---|---|---|---|---|
| `s` | 12px/16px | 14px/20px | 12px/16px | 0px |
| `m` | 14px/20px | 16px/24px | 14px/20px | 0px |
| `l` | 16px/24px | 18px/26px | 16px/24px | 0px |

#### Overline

| Step | Desktop (1440) | Desktop Large (1920) | Mobile (393) | Tracking |
|---|---|---|---|---|
| `s` | 12px/16px | 12px/16px | 12px/16px | 0.8px |
| `m` | 14px/18px | 14px/18px | 14px/18px | 0.8px |


---

## 4. Primitive colour — reference only

> **Rule R1: never bind product UI to a primitive.** They have no mode and will
> not respond to the theme. They are published here so the semantic aliases can
> be traced and audited.

### Neutral

| Token | Value |
|---|---|
| `--primitive-neutral-white` | `#ffffff` |
| `--primitive-neutral-black` | `#000000` |
| `--primitive-neutral-50` | `#f8fafc` |
| `--primitive-neutral-100` | `#f1f5f9` |
| `--primitive-neutral-200` | `#e3e8f0` |
| `--primitive-neutral-300` | `#cbd5e1` |
| `--primitive-neutral-400` | `#94a3b8` |
| `--primitive-neutral-500` | `#64748b` |
| `--primitive-neutral-600` | `#475569` |
| `--primitive-neutral-700` | `#334155` |
| `--primitive-neutral-800` | `#1e293b` |
| `--primitive-neutral-900` | `#0f172a` |
| `--primitive-neutral-alpha-white-30` | `#ffffff4d` |
| `--primitive-neutral-alpha-white-50` | `#ffffff80` |
| `--primitive-neutral-alpha-white-70` | `#ffffffb2` |
| `--primitive-neutral-alpha-black-08` | `#00000014` |
| `--primitive-neutral-alpha-black-16` | `#00000029` |
| `--primitive-neutral-alpha-black-30` | `#0000004d` |
| `--primitive-neutral-alpha-black-40` | `#00000066` |
| `--primitive-neutral-alpha-black-50` | `#00000080` |
| `--primitive-neutral-alpha-black-60` | `#00000099` |
| `--primitive-neutral-alpha-black-70` | `#000000b2` |

### Brand

| Token | Value |
|---|---|
| `--primitive-brand-50` | `#e9f3fd` |
| `--primitive-brand-100` | `#cde5fa` |
| `--primitive-brand-200` | `#9acbf6` |
| `--primitive-brand-300` | `#68b1f1` |
| `--primitive-brand-400` | `#3597ed` |
| `--primitive-brand-500` | `#037de8` |
| `--primitive-brand-600` | `#0268c1` |
| `--primitive-brand-700` | `#02539a` |
| `--primitive-brand-800` | `#013e73` |
| `--primitive-brand-900` | `#01294c` |

### Blue

| Token | Value |
|---|---|
| `--primitive-blue-50` | `#e9ebfe` |
| `--primitive-blue-100` | `#ced3fd` |
| `--primitive-blue-200` | `#9ea7fa` |
| `--primitive-blue-300` | `#6d7bf8` |
| `--primitive-blue-400` | `#3d4ff5` |
| `--primitive-blue-500` | `#2a3ef4` |
| `--primitive-blue-600` | `#0a1cc2` |
| `--primitive-blue-700` | `#071592` |
| `--primitive-blue-800` | `#050e61` |
| `--primitive-blue-900` | `#020731` |

### Green

| Token | Value |
|---|---|
| `--primitive-green-50` | `#e0f5e9` |
| `--primitive-green-100` | `#bbe8ce` |
| `--primitive-green-200` | `#7ed6a5` |
| `--primitive-green-300` | `#31c37b` |
| `--primitive-green-400` | `#00b04f` |
| `--primitive-green-500` | `#009c1c` |
| `--primitive-green-600` | `#007e17` |
| `--primitive-green-700` | `#006012` |
| `--primitive-green-800` | `#00420f` |
| `--primitive-green-900` | `#002409` |

### Red

| Token | Value |
|---|---|
| `--primitive-red-50` | `#ffe6e7` |
| `--primitive-red-100` | `#ffc8c9` |
| `--primitive-red-200` | `#ff999c` |
| `--primitive-red-300` | `#ff686e` |
| `--primitive-red-400` | `#ff2f3d` |
| `--primitive-red-500` | `#fb0000` |
| `--primitive-red-600` | `#cb0000` |
| `--primitive-red-700` | `#9c0000` |
| `--primitive-red-800` | `#6c0003` |
| `--primitive-red-900` | `#3b0104` |

### Yellow

| Token | Value |
|---|---|
| `--primitive-yellow-50` | `#fff7e8` |
| `--primitive-yellow-100` | `#ffeecc` |
| `--primitive-yellow-200` | `#ffdd99` |
| `--primitive-yellow-300` | `#ffcc66` |
| `--primitive-yellow-400` | `#ffbb33` |
| `--primitive-yellow-500` | `#ffaa00` |
| `--primitive-yellow-600` | `#cc8800` |
| `--primitive-yellow-700` | `#996600` |
| `--primitive-yellow-800` | `#664400` |
| `--primitive-yellow-900` | `#332200` |

### Orange

| Token | Value |
|---|---|
| `--primitive-orange-50` | `#fff1e4` |
| `--primitive-orange-100` | `#ffe0c4` |
| `--primitive-orange-200` | `#ffc790` |
| `--primitive-orange-300` | `#ffac5c` |
| `--primitive-orange-400` | `#ff9211` |
| `--primitive-orange-500` | `#ff7700` |
| `--primitive-orange-600` | `#d26000` |
| `--primitive-orange-700` | `#a04900` |
| `--primitive-orange-800` | `#6f3300` |
| `--primitive-orange-900` | `#3c1b00` |

### Teal

| Token | Value |
|---|---|
| `--primitive-teal-50` | `#e9faf4` |
| `--primitive-teal-100` | `#cef3e6` |
| `--primitive-teal-200` | `#9ce8cd` |
| `--primitive-teal-300` | `#6bdcb3` |
| `--primitive-teal-400` | `#39d19a` |
| `--primitive-teal-500` | `#08c581` |
| `--primitive-teal-600` | `#07a46b` |
| `--primitive-teal-700` | `#058355` |
| `--primitive-teal-800` | `#046140` |
| `--primitive-teal-900` | `#03402a` |

### Cyan

| Token | Value |
|---|---|
| `--primitive-cyan-50` | `#e9fdff` |
| `--primitive-cyan-100` | `#cffafe` |
| `--primitive-cyan-200` | `#a5f3fc` |
| `--primitive-cyan-300` | `#67e8f9` |
| `--primitive-cyan-400` | `#22d3ee` |
| `--primitive-cyan-500` | `#06b6d4` |
| `--primitive-cyan-600` | `#0891b2` |
| `--primitive-cyan-700` | `#0e7490` |
| `--primitive-cyan-800` | `#155e75` |
| `--primitive-cyan-900` | `#164e63` |

### Purple

| Token | Value |
|---|---|
| `--primitive-purple-50` | `#f1e9ff` |
| `--primitive-purple-100` | `#dfcfff` |
| `--primitive-purple-200` | `#c2a8ff` |
| `--primitive-purple-300` | `#a77fff` |
| `--primitive-purple-400` | `#8a58ff` |
| `--primitive-purple-500` | `#6e2fff` |
| `--primitive-purple-600` | `#5826d6` |
| `--primitive-purple-700` | `#441da3` |
| `--primitive-purple-800` | `#2e1571` |
| `--primitive-purple-900` | `#1a0b3e` |

### Pink

| Token | Value |
|---|---|
| `--primitive-pink-50` | `#fef4fa` |
| `--primitive-pink-100` | `#fce7f3` |
| `--primitive-pink-200` | `#f6b7d9` |
| `--primitive-pink-300` | `#f088bd` |
| `--primitive-pink-400` | `#ea589e` |
| `--primitive-pink-500` | `#e4287c` |
| `--primitive-pink-600` | `#be185d` |
| `--primitive-pink-700` | `#8e1242` |
| `--primitive-pink-800` | `#5f0c29` |
| `--primitive-pink-900` | `#2f0613` |

### Olive

| Token | Value |
|---|---|
| `--primitive-olive-50` | `#fafaf0` |
| `--primitive-olive-100` | `#f3f3dd` |
| `--primitive-olive-200` | `#e4e4b9` |
| `--primitive-olive-300` | `#d3d392` |
| `--primitive-olive-400` | `#c2c26b` |
| `--primitive-olive-500` | `#aaaa46` |
| `--primitive-olive-600` | `#808135` |
| `--primitive-olive-700` | `#666629` |
| `--primitive-olive-800` | `#49491d` |
| `--primitive-olive-900` | `#303012` |

### Ai

| Token | Value |
|---|---|
| `--primitive-ai-50` | `#fbf4ff` |
| `--primitive-ai-100` | `#f5e6ff` |
| `--primitive-ai-200` | `#e6bcff` |
| `--primitive-ai-300` | `#d692ff` |
| `--primitive-ai-400` | `#c668ff` |
| `--primitive-ai-500` | `#b63eff` |
| `--primitive-ai-600` | `#a614ff` |
| `--primitive-ai-700` | `#9100e9` |
| `--primitive-ai-800` | `#7700bf` |
| `--primitive-ai-900` | `#5d0095` |

