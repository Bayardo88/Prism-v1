# Prototype · Firm Valuations preview drawer

**Route:** `#/prototypes/firm-valuations-preview` (states `default`, `open`, `open-unpublished`)
**Source:** no Figma frame yet. States are `proto:firm-valuations-preview:1–3`.
**Code:** `apps/product/src/screens/prototypes/firm-valuations-preview/`

## Purpose

See a company's latest valuation without leaving the Firm Valuations list. Clicking a company opens a preview drawer. Another click swaps the preview, so an analyst can move down the list and check each one, and the grid keeps its scroll position.

## How users get here

This is the real Firm Valuations screen (page 03), composed unchanged. The prototype passes two optional props to `FirmValuations`: `onOpenRow` / `openRowId` and a `drawer`. The real `/valuations` route passes neither, so its rows still link to Valuation Summary.

## Logic

1. **Open:** a click on a company name opens the DS `Drawer` (right, `modal={false}`) and marks that row header `selected`. Ctrl/Cmd/Shift-click and middle-click still follow the row's link (`GridRow.onOpen` in `PortfolioGrid`).
2. **Swap:** clicking another row closes this preview and opens that one. The URL doesn't change, so the screen doesn't remount and the grid keeps its scroll.
3. **Close:** × or *Close*, Escape, or a click outside. Focus returns to the row.
4. **Open valuation** (primary) goes to the company's Valuation Summary. *Open Summary* in Earlier measurements does the same.

## Contents

| Section | Source | Rule |
|---|---|---|
| Status + version name | `StatusCell`, `useValuationContext(company).valuation` | Workflow status from the store (P8) |
| Valuation: measurement date, market date, approaches, allocation | `ctx.measurement.date`, `ctx.measurement.marketDate`, `valuationValues()` | P1: the context. P2: the market date is shown apart from the measurement date |
| Headline values: EV, equity, breakeven, current fund value, change | `valuationValues()` (the grid's own figures) via `useMoney().amount` | Only for a published valuation. Otherwise `PublishedNote`, never `$0` (P5) |
| Open tasks | `Tasks` from FirmValuations | Same pills and links as the grid |
| Earlier measurements | `versionsFor()` from company-valuations-v2 | Synthetic quarter-back history, labelled by measurement date |

Components used: Drawer, Card, CardItem (`trend` on change), ModalStatus (via StatusCell), TaskPill (via Tasks), Link, Button, Text. Nothing new in `src/`.

## Gaps & open questions

- **No Figma frame.** It needs a design pass before it's promoted to page 03.
- **The drawer covers the right end of the Primary Menu** (bell, avatar), because the DS `Drawer` is full height. Should a preview drawer start below Tier 1–3? That would be a DS change (rung 7).
- **Earlier measurements are synthetic** (the same source as the company-valuations-v2 prototype). The store doesn't hold earlier measurements' values for firm-level reads yet.
- **Approaches and allocation are blank until published,** as in the grid. Should a draft show its working approaches here?
- The selected row header is marked only by `RowHeader selected`, which is subtle on the grid. Is that enough?
