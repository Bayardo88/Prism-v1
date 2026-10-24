# Prototype · Notifications Center

**Route:** `#/prototypes/notifications-center/:companyId` (e.g. `abc-co`)
**Source:** Figma `BbebfOi2JVBIYgQWaSj52G` (Notifications-center). Frames: 131:19540 default, 130:2095 AI processing, 1:5857 inbox, 130:3528 filters, 79:1853 / 131:4940 the panel alone, 55:1457 data spec.
**Code:** `apps/product/src/screens/prototypes/notifications-center/`

## Purpose

See AI job results and teammates' changes under the bell, filter them by scope, and jump to the source. "Temporary updates while you're active": a session feed, not an archive.

## How users get here

The bell in the Primary Menu, on the Cap Table. The prototype composes the real `CapTable` screen unchanged and swaps the bell's menu through `GlobalMenuOverridesContext` (`shell/AppFrame.tsx`). Product screens don't provide that context, so nothing else changes.

## Logic

1. **An event is emitted** with `type`, `priority` (normal | high) and optional `actor`, `context`, `link` and `display` (spec 13.2 and 13.3).
2. **Filters:** scope (all firms, all companies in the firm, or only the company in view) and *Only my changes* (`actor` is you). Failing items stay in the feed, hidden, and come back when the filters widen. System announcements always pass.
3. **The bell** shows the unread dot while any visible item is unread.
4. **Delivery:** with the panel closed, a toast appears (`ToastViewport`; the result toast hides after 8 s and pauses on hover). With the panel open, the item lands on top with a **New** chip and a coloured edge (AI items get `stroke.ai`, others `stroke.brand`).
5. **Closing the panel** marks what was seen as read. Running jobs stay live.
6. **Actions:** *Dismiss* (×) removes an `alert`. `activity` items (someone's change) can't be dismissed and stay as a log. *View results* or *View change* navigates to `link`.
7. **AI job:** "AI processing · Reading documents" (`Spinner` + AI chip) becomes "AI processing complete" when the job finishes (simulated at 6 s in the `ai-processing` state).

## Motion (from the AI Studio prototype, app `b01d6c65-38cf-47a1-a253-5cacf2ce2a4e`)

| AI Studio (`src/App.tsx`) | Here |
|---|---|
| Toast `animate-in slide-in-from-bottom-5 fade-in duration-300` | Fade + rise from `space.l`, `motion.moderate` + `motion.decelerate` (`motion.ts`, a transition, so reduced motion turns it off) |
| `animate-gradient` (fuchsia → blue → emerald, background-position 0 → 200%, 3 s linear, infinite) on the in-progress card's border | Replaced by the DS **`AiOutline`** (`<AiOutline asChild>` on the card), built from `GOOGLE_AI_STUDIO_GRADIENT_INPUT_ANIMATION.md`: a 2px outline in `color.gradient.ai.*` (violet → blue → teal → pink, the AI fill plus Global Search's blue, teal and pink as their own tokens). The colours orbit it every 6 s, following the corners, with no seam (a `@property` angle on a conic gradient). It stops under reduced motion, and comes off when the job completes. |
| The same gradient filling the "Reading Documents" chip | Kept the DS `Chip styleVariant="ai"` (a tint). A gradient fill with white text would restyle the chip. |
| The same gradient on the bell while AI runs (15 s) | **Not built.** DS `Notification` has no busy or AI state, so this needs a DS addition. The "AI processing" toast stands in. |
| Toggle knob slide and colour transitions | Not built. The DS `Switch` snaps, and animating it is a DS change. |
| AI job 15 s, then a toast that hides after 8 s | Same timings (`JOB_MS`, `TOAST_MS`) |

**Figma:** the AI gradient is the library's *Gradient/AI/\** variables (known gap 15, now published). The panel and card are proposed in the components file as **Notification Panel** (`1754:502`) and **Notification Item** (`1751:267`), page *25 · Overlays & Panels*, with **AI Outline** (`1753:95`) on page 24. The markdown's Google palette (green, red, amber) is left out because those are status colours here, and its outer glow is not built because there is no glow token beyond the elevation ladder (R9).

## States

`default` · `ai-processing` · `inbox` · `filters` · `empty`, each reachable by `?state=`.

## Components

The `NotificationCenter` surface classes, `Checkbox`, `ButtonIcon`, `EmptyState`, `Toast` + `ToastViewport`, `Chip`, `Spinner`, `Link`, `Icon` (`glyphs.AiMark` for AI items, Material glyphs otherwise) and `Typography`. The panel and the notification card are screen-local compositions of these parts. The DS has no notification item, and `NotificationCenter` itself can't hold the filters above the list (see Gaps).

## Gaps and deviations from the Figma frames (DS wins, AI-GUIDE)

- **Filters:** four `Checkbox`es, as in Figma 131:4940 (AI-GUIDE would pick a `Switch` for a setting that applies at once, but the frame wins here at the product owner's request). The scopes nest, so the widest ticked one applies; with none ticked, only system announcements show. "Only My changes" starts unticked, because the frame ticks it while still listing teammates' changes.
- **Panel layout (DS gap):** the gear sits in the "Receive notifications for" row and opens the checkboxes above the list, which stays visible and re-filters live. The list runs to the foot of the viewport (`100vh` minus two `size.control.l`). DS `NotificationCenter` swaps the list out for settings and caps its body at 480px, so the panel is composed on its surface classes instead. Proposal for the DS: an inline-settings mode and a height that fills the viewport.
- **AI icon:** the Figma "Union" layer is the Scalar AI mark filled with the AI gradient. Code uses `glyphs.AiMark` in AI purple (`tone="ai"`), or white on the toast. The gradient fill has no code token (known gap 5).
- **Toast while the panel is open:** hidden, because the panel already shows the job.
- **Toast position:** Figma draws the toast under the bell. The DS `ToastViewport` stacks bottom-right.
- **Bell count:** Figma shows "6". `Notification`'s dot is unread-only and carries no count (AI-GUIDE §7). The navigation spec says a counter, so the two docs conflict.
- **Chevron on activity cards:** dropped. A button that navigates is the wrong component, so the card's `Link` does it.
- **Enum gaps:** `table.updated` ("Table Updated") and an in-progress `document_ai.processing` appear in the frames but not in spec 13.3.
- **Priority copy:** the frames mix "Important", "High" and "Normal". The prototype uses "High priority" and "Normal priority".
- **Notification card:** not a DS component yet. If the feature ships, promote it via the rung-7 protocol, with a story and a test.
