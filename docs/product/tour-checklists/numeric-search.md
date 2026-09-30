# Numeric search in Looking Glass — guided-tour checklist (SCAL-9327 handoff)

Prototype: `apps/product/src/data/numericSearch.ts` (logic), `shell/overlays/SearchOverlay.tsx` (UI), `screens/p02-intelligence/Summaries.tsx` (landing highlight).
"Looking Glass" is taken to be the Intelligence → Summaries grid. The tour itself is **not** built here.

## Stable selectors
| Element | Selector |
|---|---|
| Search overlay host (`data-numeric-mode="on"` when the query parsed as numeric) | `[data-tour="numeric-search"]` |
| Result row | `[data-tour="numeric-search-result-row"]` |
| Loading | `[data-tour="numeric-search-state-loading"]` |
| Empty | `[data-tour="numeric-search-state-empty"]` |
| Error | `[data-tour="numeric-search-state-error"]` |
| Truncated ("Showing 25 of N") | `[data-tour="numeric-search-state-truncated"]` |
| Refusals | `…-state-disabled`, `…-state-unauthorized-firm`, `…-state-unavailable-date` |
| Matched grid cell after navigation | `[data-tour="numeric-highlight"]` (also `[data-cell="<companyId>\|<colKey>"]`) |

Trigger = the Primary Menu search bar (`input[type=search]`, ⌘K). Row attributes are applied by an effect because `GlobalSearch` does not forward attributes (see Gaps).

## Representative queries
`10M` · `$10,000,000` · `12.5%` · `3.2x` · `moic 3x` · `fair value 10M` · `0` (exact zeros only) · `-6.3%` (negatives match negatives only) · `Q2 2026` (not numeric → normal search).

## Scope and rules
- Active firm + selected measurement date only. Companies measured after the selected date are excluded.
- Tolerance ±10% of the normalised value. Zero matches only zero; sign must match.
- Unit narrows the kind: `%` percent columns, `x` multiples, `$`/`k`/`M`/`B` money + plain number columns, bare number = any.
- Leftover words must name a column (or alias: fair value, revenue, ownership, preference, ev); otherwise it is not a numeric query.
- Max 25 rows shown, closest first; a footer row reports the total.
- Numeric queries never enter AI mode.

## Permission / feature flag (demo switches on the URL hash)
`?nsFirm=vk` unauthorised firm · `?nsDate=2023-06-30` unavailable date · `?nsFlag=off` feature off · `?nsError=1` error state. Refusals happen before any data is read.

## Behaviour
Selecting a row closes the palette, routes to `/intelligence/summaries?hl=<companyId>|<colKey>`, pages to the row, scrolls the column into view and focuses the cell. Clicking any cell clears the highlight. Status rows (loading, empty, error, truncated, refusals) are not selectable.
