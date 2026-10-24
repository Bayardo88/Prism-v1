# AI Outline — the "AI is working" animation

`AiOutline` draws a 2px outline in the AI gradient around any surface (a
notification card, a panel, a field) and, while AI is working on it, sends the
colours round the outline once every 6 seconds. It is the system's one sanctioned
way to say "a model is working on this" with motion.

- **Code:** `AiOutline` from `@scalar/design-system` (`src/components/feedback-patterns/AiOutline.tsx`)
- **Styles:** `.scalar-ai-outline` in `src/styles/components.css`
- **Tokens:** `--color-gradient-ai-{violet|blue|teal|pink}` → `color.gradient.ai.*`
- **Storybook:** *Feedback › AiOutline* (live) and *Feedback › AiOutline spec* (this page, rendered)
- **Figma:** tokens *Semantic: Color › Gradient/AI/\** and the component **AI Outline**. See §7.
- **First used in:** the Notifications Center prototype (`apps/product/src/screens/prototypes/notifications-center/`)

---

## 1. When to use it

| Use it for | Don't use it for |
|---|---|
| An item a model is processing right now: a notification for an AI job, a document being read, a field being filled | Status (done, failed, warning): that's a `Chip`, `Alert` or `Toast` |
| An AI-made item that has finished, with `active={false}` (still outline) | Decoration, emphasis or "new" (use a `Chip` with words) |
| One or two items on screen at a time | Every row of a table, or a whole page |

It is **decorative**. On its own it never says "working" (R8), so always pair it with words
("Reading documents…") or a `Spinner`.

## 2. Use it

```tsx
import { AiOutline, Spinner } from '@scalar/design-system';

// Wraps its children in a div with the outline
<AiOutline style={{ padding: space.m }}>
  <Spinner size="s" label="Reading Annual Report 2026.pdf…" />
</AiOutline>

// Put the outline on your own element (a card, an <article>) — no extra wrapper
<AiOutline asChild active={job.running}>
  <article aria-labelledby={titleId} style={{ padding: space.m }}>…</article>
</AiOutline>

// Finished: keep the AI outline but stop the motion
<AiOutline active={false}>…</AiOutline>
```

| Prop | Type | Default | What it does |
|---|---|---|---|
| `active` | `boolean` | `true` | `true` sends the colours round the outline. `false` holds the outline still. |
| `asChild` | `boolean` | `false` | Renders your single child element with the outline classes merged on (`Slot`). |
| …rest | div attributes | — | `ref`, `className` (merged), `style`, `data-*`, `aria-*` all land on the root. |

**Rules**

- **Don't set a background or a border on it.** The outline is painted by the element's own
  `background` (the fill on the padding box, the gradient on the border box) and a transparent 2px
  `border`. To change the fill inside the outline, set the custom property instead:
  `style={{ '--ai-outline-fill': color.bg.subtle }}`.
- Corner radius defaults to `radius.m` (16px). Override `borderRadius` if the surface needs another.
- Remove it (or set `active={false}`) as soon as the work ends. A spinning outline on finished work misreports the state.

### CSS-only (no React)

```html
<div class="scalar-ai-outline scalar-ai-outline--active">…</div>   <!-- moving -->
<div class="scalar-ai-outline">…</div>                              <!-- still -->
```

## 3. How the animation works

```css
@property --scalar-ai-outline-angle {        /* registered, so it interpolates */
  syntax: '<angle>'; inherits: false; initial-value: 0deg;
}
.scalar-ai-outline {
  border: 2px solid transparent;
  border-radius: var(--radius-m);
  background:
    linear-gradient(var(--ai-outline-fill), var(--ai-outline-fill)) padding-box,   /* the fill */
    conic-gradient(from var(--scalar-ai-outline-angle),                             /* the outline */
      var(--color-gradient-ai-violet), var(--color-gradient-ai-blue),
      var(--color-gradient-ai-teal), var(--color-gradient-ai-pink),
      var(--color-gradient-ai-violet)) border-box;
}
.scalar-ai-outline--active { animation: scalar-ai-outline-orbit 6s linear infinite; }
@keyframes scalar-ai-outline-orbit { to { --scalar-ai-outline-angle: 360deg; } }
@media (prefers-reduced-motion: reduce) { .scalar-ai-outline--active { animation: none; } }
```

- **Why conic, not linear.** A conic gradient is angular, so turning its start angle moves the
  colours *round the outline*, following every corner, instead of sliding the whole gradient
  sideways. A full turn ends on its first frame, so the loop has no seam or jump.
- **Why `@property`.** A plain custom property can't be animated (it would jump from 0° to
  360°). Registering it as an `<angle>` lets the browser interpolate it.
- **Only the outline moves.** Content, padding, size and focus never shift, and nothing is re-laid out.

| Motion value | Value | Note |
|---|---|---|
| Duration | 6s per turn | Calm enough to sit next to text for a long job |
| Easing | `linear` | Constant speed, no pauses |
| Iterations | infinite while `active` | |
| Stroke | 2px | The Figma card stroke |
| Order | violet → blue → teal → pink → violet | |

**Reduced motion:** `prefers-reduced-motion: reduce` stops the orbit and keeps the coloured
outline. This is a separate rule because `base.css`'s global reduced-motion rule only zeroes transitions.

**Browser support:** `@property` is in Chrome/Edge 85+, Safari 16.4+ and Firefox 128+. Where it is
missing, the outline still renders with all four colours, just without the motion.

## 4. Tokens

| Token | Light | Dark | Figma | Same value as |
|---|---|---|---|---|
| `--color-gradient-ai-violet` | `#a614ff` | `#c668ff` | Gradient/AI/Violet → AI/600 · AI/400 | `bg.ai` |
| `--color-gradient-ai-blue` | `#0268c1` | `#3597ed` | Gradient/AI/Blue → Brand/600 · Brand/400 | PRISM Entity/Company |
| `--color-gradient-ai-teal` | `#0891b2` | `#22d3ee` | Gradient/AI/Teal → Cyan/600 · Cyan/400 | PRISM Data/Measurement Date |
| `--color-gradient-ai-pink` | `#be185d` | `#ea589e` | Gradient/AI/Pink → Pink/600 · Pink/400 | PRISM Destination/Page |

They share values with PRISM but **are not PRISM**. PRISM states what an item is (R11) and is never
borrowed for decoration, so these are separate tokens and can change without touching Global Search.
Each stop clears 3:1 on page and surface in both modes (`npm run lint:contrast`). Never use them for text.

In TypeScript: `color.gradient.ai.violet` (and so on) → `var(--color-gradient-ai-violet)`.

## 5. Accessibility

- The outline is decorative and has no role or name. The *words* next to it carry the state.
- Announce progress where it matters: a `Spinner` has `role="status"`, and a notification list is a polite live region.
- Motion stops under reduced motion. No flashing: one slow turn every 6 seconds, well below any flash threshold.

## 6. Related: the Notifications Center prototype

The prototype (`#/prototypes/notifications-center/abc-co`) uses `AiOutline asChild` on the
in-progress AI notification card and the AI-tinted toast. See
`docs/product/pages/prototype-notifications-center.md` for its logic, states and gaps. The panel and
the notification card there are screen-local compositions, proposed in Figma as **Notification
Item** and **Notification Panel** (components file, page *25 · Overlays & Panels*).

## 7. Figma

| Asset | File | Where |
|---|---|---|
| `Gradient/AI/Violet · Blue · Teal · Pink` | tokens `anrnTIJKgu27zV224h7vON` | *Semantic: Color*, `VariableID:677:2`–`677:5`; specimen on page *01 · Color* |
| **AI Outline** (`State=Active · Still`) | components `Z4MtKOfkNEzhMYJzN1q3kR` | page *24 · Feedback Patterns*, `1753:95` |
| **Notification Item** (`Kind=AI processing · Alert · New · Alert · Read · Activity`) | components | page *25 · Overlays & Panels*, `1751:267` (proposed) |
| **Notification Panel** (`Filters=Closed · Open`) | components | page *25 · Overlays & Panels*, `1754:502` (proposed) |

Figma can't play the orbit. It shows one frame, and the component description states the motion.
The tokens were written in code first (known gap 15). If a value changes in Figma, the library wins:
re-transcribe it into `src/styles/tokens.css`, then run `npm run gen:tokens`, `node scripts/gen-docs.mjs`
and `npm run verify`.
