# AI Outline — the "AI is working" animation

`AiOutline` draws a 3px ring in the AI gradient over the edge of any surface (a
notification card, the notification bell, a panel, a field) and, while AI is
working on it, sends a short comet of the gradient round the edge once every 3
seconds, with a matching glow just outside it. The surface keeps its own fill and border. It is the system's one sanctioned
way to say "a model is working on this" with motion.

- **Code:** `AiOutline` from `@scalar/design-system` (`src/components/feedback-patterns/AiOutline.tsx`)
- **Styles:** `.scalar-ai-outline` in `src/styles/components.css`
- **Tokens:** `--color-gradient-ai-{violet|blue|teal|pink}` → `color.gradient.ai.*`
- **Storybook:** *Feedback › AiOutline* (live) and *Feedback › AiOutline spec* (this page, rendered)
- **Figma:** tokens *Semantic: Color › Gradient/AI/\** and the component **AI Outline**. See §7.
- **First used in:** the Notifications Center prototype (`apps/product/src/screens/prototypes/notifications-center/`)
- **On the bell:** `<Notification working />` (see §6)

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
<AiOutline style={{ padding: space.m, background: color.bg.surface }}>
  <Spinner size="s" label="Reading Annual Report 2026.pdf…" />
</AiOutline>

// Put the outline on your own element (a card, an <article>) — no extra wrapper
<AiOutline asChild active={job.running}>
  <article aria-labelledby={titleId} style={{ padding: space.m }}>…</article>
</AiOutline>

// Finished: the whole ring, still
<AiOutline active={false}>…</AiOutline>
```

| Prop | Type | Default | What it does |
|---|---|---|---|
| `active` | `boolean` | `true` | `true` sends a comet of the gradient round the edge. `false` shows the whole ring still. |
| `asChild` | `boolean` | `false` | Renders your single child element with the outline classes merged on (`Slot`). |
| …rest | div attributes | — | `ref`, `className` (merged), `style`, `data-*`, `aria-*` all land on the root. |

**Rules**

- **The surface keeps its own colours.** The ring is drawn on the element's `::before`, so set the
  card's `background` and `border` as you would without it; they don't change while AI works.
  Don't use `::before` on the host for anything else.
- The ring sits inside the host's border box, 3px wide, and follows its corner radius
  (`radius.m` by default, or whatever the host's own class or `borderRadius` sets).
- The host becomes `position: relative` and isolates its stacking context; the ring sits above
  the content at the edge and never takes clicks.
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
:where(.scalar-ai-outline) { position: relative; border-radius: var(--radius-m); }
.scalar-ai-outline { isolation: isolate; }
.scalar-ai-outline::before {                  /* the ring, on its own layer */
  content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
  border: 3px solid transparent; border-radius: inherit;
  background: conic-gradient(from var(--scalar-ai-outline-angle),
    var(--color-gradient-ai-violet), var(--color-gradient-ai-blue),
    var(--color-gradient-ai-teal), var(--color-gradient-ai-pink),
    var(--color-gradient-ai-violet)) border-box;                 /* still: the whole ring */
  mask: linear-gradient(black 0 0) padding-box, linear-gradient(black 0 0);
  mask-composite: exclude;                                         /* keep only the 3px border */
}
@media (prefers-reduced-motion: no-preference) {
  .scalar-ai-outline--active::before {
    background: conic-gradient(from var(--scalar-ai-outline-angle),
      transparent 0deg 245deg, var(--color-gradient-ai-violet) 265deg,
      var(--color-gradient-ai-blue) 290deg, var(--color-gradient-ai-teal) 315deg,
      var(--color-gradient-ai-pink) 335deg, transparent 355deg) border-box;   /* the comet */
    animation: scalar-ai-outline-orbit 3s linear infinite;   /* ::before and the ::after glow */
  }
}
@keyframes scalar-ai-outline-orbit { to { --scalar-ai-outline-angle: 360deg; } }
```

The glow (`.scalar-ai-outline.scalar-ai-outline--active::after`, inside the same media query) is the
same comet filled across the host's box, `inset: calc(-1 * var(--space-m))` with `padding: var(--space-m)`,
`filter: blur(8px)`, `opacity: 0.6`, and masked to exclude its content box, so only the band outside the
host shows. The bell overrides it to `blur(4px) saturate(1.5)` at full opacity so it reads on navy.

- **Why conic, not linear.** A conic gradient is angular, so turning its start angle moves the
  colours *round the outline*, following every corner, instead of sliding the whole gradient
  sideways. A full turn ends on its first frame, so the loop has no seam or jump.
- **Why `@property`.** A plain custom property can't be animated (it would jump from 0° to
  360°). Registering it as an `<angle>` lets the browser interpolate it.
- **The comet.** While active, about 110° of the circle is coloured (violet → blue → teal → pink) and
  the rest transparent, so a short beam travels the edge. Still, the whole circle is coloured.
- **Why a masked layer.** The mask keeps only the layer's 3px transparent border, so the gradient
  never touches the host's fill or border (the border-beam technique).
- **The glow.** Blurring happens before masking, so the blurred comet is masked to the band *outside*
  the host: it lights the surroundings in the comet's colours and never tints the fill. It uses the
  host's `::after` while active (on the bell that replaces its extended hit area; the 32px bell is still a
  full target). It is a deliberate exception to "no glow beyond the elevation ladder" (R9). Keep about
  `space.m` of room round the host, or a clipping parent cuts the glow off.
- **Only the ring moves.** Content, padding, size and focus never shift, and nothing is re-laid out.

| Motion value | Value | Note |
|---|---|---|
| Duration | 3s per turn | Brisk enough to read as "working", still calm next to text |
| Glow | blur 8px · opacity 0.6, in a `space.m` band outside the edge | Bell: blur 4px, saturate 1.5, opacity 1 |
| Easing | `linear` | Constant speed, no pauses |
| Iterations | infinite while `active` | |
| Stroke | 3px | Over the host's edge, inside its border box |
| Comet | 245° → 355° of the circle | violet → blue → teal → pink, transparent elsewhere |

**Reduced motion:** the comet and orbit only apply under `prefers-reduced-motion: no-preference`,
so with reduced motion the whole ring shows still. This is a separate rule because `base.css`'s
global reduced-motion rule only zeroes transitions.

**Browser support:** `@property` is in Chrome/Edge 85+, Safari 16.4+ and Firefox 128+. Where it is
missing, the comet renders without the motion.

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
- Motion stops under reduced motion. No flashing: one turn every 3 seconds, no luminance flicker, well below any flash threshold.

## 6. Related: the Notifications Center prototype

The prototype (`#/prototypes/notifications-center/abc-co`) uses `AiOutline asChild` on the
in-progress AI notification card, and `Notification working` on the bell (through
`GlobalMenuOverrides.aiWorking`) for as long as the job runs. The bell's name becomes
"Notifications, unread, AI working". See
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
**Out of date:** the Figma component still draws the earlier 2px full-gradient stroke, not the 3px comet.
The tokens were written in code first (known gap 15). If a value changes in Figma, the library wins:
re-transcribe it into `src/styles/tokens.css`, then run `npm run gen:tokens`, `node scripts/gen-docs.mjs`
and `npm run verify`.
