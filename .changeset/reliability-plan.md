---
'@scalar/design-system': minor
---

Reliability pass.

- **Accessibility:** resting borders of `Input`, `Select`, `Textarea`, `Checkbox`, `Radio` and `Switch` now use `Stroke/Control` (>= 3:1, WCAG 1.4.11); hover moves to `Stroke/Strong`. Focus indicators added for the global search bar, AI tool input and the header search bar.
- **Charts:** the eight `Chart/Series` colours (and their subtle fills) are re-stepped so every pair separates by at least CIEDE2000 6 under normal vision, deuteranopia, protanopia and tritanopia, in Light and Dark; no series equals `Chart/Negative`. **Visible change: every chart changes colour.** `seriesAccessibilityWarning` now only warns past 8 series. Charts render through `react-chartjs-2` (new dependency).
- **Responsive:** every fixed-width panel (`cell-history`, `notification-center`, `user-menu`, date picker, select menu and others) can shrink to the viewport. `ProgressBar` animates with `translate` instead of `width`.
- **Tokens:** `--font-size-heading-xs` is 12px (was 10px) to honour the 12px floor.
- **Gates (CI):** new contrast and colour-blind gate (`npm run lint:contrast`), reflow gate at 320px (`npm run check:reflow`), numeric 12px floor, `outline: none` and fixed-width lint rules, coverage ratchet, React 18/19 consumer smoke.
