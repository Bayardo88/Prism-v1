# Scalar product logic: the domain contract

Read this before you build or change any product screen. [`AI-GUIDE.md`](../../AI-GUIDE.md) says how a screen
**looks**: tokens, components, R1–R15. This file says what a screen **means**: which firm, company, date and
version a number belongs to, when a value exists, and what an action changes. The short form of these rules
is [AI-GUIDE §11](../../AI-GUIDE.md#11-product-logic-rules) (P1–P10).

**Source.** This contract is condensed from the *Scalar Product Logic & AI Agent Guide*, which was built from
the 2025 training sessions S01–S13. The full guide is in [`training-notes-2025/`](training-notes-2025) and keeps
its citations (`[S06 @ 00:16:18]`). The guide is dated evidence, so **the current Figma frames and the DS
contract outrank it.** When they disagree, follow the frame and record the conflict under the page doc's
"Domain rules".

**Evidence marks.** These are used in this file and in code comments.

| Mark | Meaning | What you may do |
|---|---|---|
| `DOC` | Shown or described in training | Model it as documented behaviour |
| `INFER` | Engineering reading consistent with training | Use it as the recommended pattern, not as a product requirement |
| `VERIFY` | Ambiguous or never shown | Do not hard-code it. Keep it presentational and label it |
| `BUG-2025` | A defect seen in 2025 | Treat it as a regression target. **Never reproduce it** |

---

## 1 · Vocabulary

| Term | Means | Is not |
|---|---|---|
| **Firm** | The workspace: members, permissions, funds and companies | A fund |
| **Fund** | A pool of capital with its own currency. It invests in many companies | The parent of a company. A company can take money from many funds |
| **Company** | The entity being valued | An investment |
| **Measurement date** | The as-of date of a valuation. It anchors financials, cap table, ownership and valuation | The market date |
| **Market date** | The date market observations (prices, comps) are fetched for. It is editable and can differ from the measurement date | A new measurement |
| **Version** | An alternative scenario *within one measurement*. Financials, Cap Table and Valuation each have versions | A new measurement date |
| **Fund Ownership** | A fund's positions in a company's securities. Its version is **paired 1:1** with a Cap Table version | A free-standing table |
| **Breakpoints** | The equity values at which each security starts to participate. They are calculated by default and can be customised | A weighting |
| **Valuation approach** | A method that estimates enterprise or equity value (External, SSV, GPC, Transaction Comps, Future Exit, Backsolve, DCF) | An allocation method |
| **Allocation method** | A method that splits equity across securities (Waterfall, OPM, CSE) | An approach |
| **Calibration** | A flag on an approach: it becomes a read-only reference and is **left out of the summary** | A standalone approach |

## 2 · The context every number belongs to

A value on a company page is only meaningful inside its **valuation context**:

```ts
// apps/product/src/domain/model.ts
type ValuationContext = {
  companyId: string;
  measurementDate: string;          // the as-of date (ISO)
  financialVersionId: string;
  capTableVersionId: string;        // Fund Ownership follows it (pairing)
  valuationVersionId: string;
  breakpointMode: 'calculated' | 'custom';
  viewAs: 'analyst' | 'auditor';    // auditor = read-only
};
// The market date belongs to the measurement (measurement.marketDate), not the context:
// it is independent of measurementDate and moves only by a market-date edit, a bulk
// update or a rollover.
```

`useValuationContext(company)` returns the context resolved against the model: `measurement`
(with its `marketDate`), `financial`, `capTable`, `ownership` (always the Cap Table's pair), `valuation`,
`readOnly` and `key`.

Rules:
- **One context per company.** It is held in a store (`apps/product/src/domain/context.ts`), so it survives
  moving between Financials, Cap Table, Valuations and Waterfall, and it is kept for the browser session. A
  screen never keeps its own copy of a version or a date in local state.
- **Changing a date or version resets everything derived from it.** `App` keys every company screen on
  `contextKey(ctx)` (measurement + versions), so a switch remounts the screen from the new version's data.
  It can't show the previous version's rows (BUG-04 and BUG-07 were exactly that).
- **Show the context.** Every dependent view shows the version it is reading: the version pickers in the
  company header, and the "Using custom breakpoints" note on Waterfall.

## 3 · Three time axes, four actions

| Action | Changes | Never changes |
|---|---|---|
| Pick a **measurement date** | Which measurement is open | Anything stored |
| Edit the **market date** (Valuations header) | Market-derived values for *this* measurement | The measurement date, transaction dates, versions |
| **Bulk market-date update** (firm Valuations) | Market date for several companies at once | Creates no measurements and no versions |
| **Rollover** | Creates a *new* measurement from an existing one, with the options *Keep market data*, *Exclude valuation*, *Exclude documents* | The source measurement, which is never overwritten |

Rollover and the bulk update must say which one they are in their title **and** in their confirm button.
`DOC` for the options, and `VERIFY` for what exactly is copied.

## 4 · Versions and pairing

- Financials, Cap Table and Valuation each have one or more named versions per measurement. **Save as New
  Version** clones the current one, and the original is untouched. `DOC`
- Picking a Cap Table version selects its paired Fund Ownership version. Fund Ownership shows which Cap Table
  version it belongs to. `DOC` 1:1
- Each valuation version owns its **own approach set**. `DOC`
- Switching version while there are unsaved edits asks first, with the same `ConfirmationDialog` as leaving
  the page.

## 5 · State vocabulary

Every asynchronous or editable surface is in exactly one of these states. Use the DS component listed, not a
hand-drawn one.

| `AsyncState` | Shown with |
|---|---|
| `loading` | `Spinner` / `Skeleton` |
| `empty` | `EmptyState`, which offers the action that fills it |
| `ready` | The content |
| `dirty` | `SaveState state="unsaved"` + the unsaved-changes guard |
| `saving` | `SaveState state="saving"` |
| `saved` | `SaveState state="saved"` |
| `validationError` | `Banner tone="negative" issues` + `InCellControl state="error"` on each field (R8) |
| `serverError` | `SaveState state="error"` or a negative `Banner` with retry |
| `forbidden` | `EmptyState` saying the user has no access. **Never** an empty list |
| `stale` | `DataFreshness state="stale"` |

## 6 · Empty is not zero

Four different situations must look different. Use `displayValue()` from `apps/product/src/domain/display.ts`.

| Situation | Renders |
|---|---|
| A real computed or entered **zero** | `$0` |
| **Not entered** yet | `—` |
| **Not calculated** (inputs missing, no approach yet) | `Not calculated` |
| **Draft**, so left out of a published report | `Draft` |

A placeholder `$0` for a value that does not exist yet is a bug.

## 7 · Validation the prototype enforces

| Rule | Where | Mark |
|---|---|---|
| Transaction date ≤ measurement date | Fund Ownership, Cash Flow Ledger | `DOC` |
| Custom breakpoints ascend | Breakpoint Analysis | `DOC` |
| Weights in one group sum to **exactly 100%**. Show what is left or over-allocated, and never rescale the user's numbers | Valuation Summary weighting panel (approach and scenario weights), Backsolve weighting, Public / Transaction Comps metric weights | `DOC` for the 100% total, `INFER` for the copy |
| Allocation methods in a Backsolve are unique | Backsolve | Figma |

Errors use the DS pattern: a negative `Banner` listing the issues, plus the error state on each field. The
rules live in `apps/product/src/domain/validation.ts` and have unit tests (`npm run test:product`). Editors
run them through `useEditor` (`domain/useEditor.ts`): errors show once Save is tried and stay until fixed.
The Valuation Summary weights save at once, so off-total weights show as a warning straight away.

## 8 · Status: draft, review, published

A valuation version carries one workflow status. It uses the same six values as the company record and the firm
pages (`ModalStatus`): `draft` · `in-progress` · `in-review` · `ready-for-audit` · `final` · `published`.

| Rule | Mark |
|---|---|
| Draft (anything not `final` or `published`) is **not** reported. Firm Valuations and Intelligence show "Not Applicable" for it (`isReported`) | `DOC` |
| `published` values appear in fund, firm and Intelligence summaries. Publishing asks for confirmation | `DOC` |
| The firm pages already treat `final` as reported. The prototype keeps that | Current code. Unclear in training |
| An auditor reads a version **read-only**. "View as auditor" makes every page of the company read-only (a disabled fieldset plus a banner) | `DOC` |
| A calibrated approach is a read-only reference with no weight, and it is left out of the summary | `DOC` |
| A cloned or rolled-over valuation restarts as `draft` | `INFER` |

The prototype lets anyone make any move from the valuation ⋮ menu. The real transition graph, who may make each
move, and whether publishing freezes a snapshot are `VERIFY`. Don't build on them.

**Figma conflict.** The ABC Co frames draw two badges, *Final* and *Ready for Audit*. The model has one status,
so the header shows one badge: ABC Co is seeded as Ready for Audit. This is logged in page 08's doc.

## 9 · Maths stays out of the UI

- **Never put a valuation formula in a DS component.** Grids, inputs and charts render values. They do not
  compute them.
- The prototype needs *some* numbers (ownership %, liquidation preference, calculated breakpoints). They live
  in `apps/product/src/domain/illustrative-calcs.ts`, which is labelled **non-authoritative**. Don't port it to
  a product, and don't extend it into Waterfall, OPM, DCF, note conversion or IRR. Those formulas are a P0 open
  question (training-notes `10` §2) and need finance sign-off.
- Show calculated values separately from the inputs that produced them (blue = input, green = sourced or
  calculated; see [README §4](README.md#4--rules-that-apply-on-every-page)).

## 10 · Client-facing outputs

- **Excel export** offers *Formulas* or *Values (hard-coded)* and states the measurement, version, currency
  and publish status it exports. `DOC`
- **409A report composer:** sections can be shown or hidden, and a displayed figure can be overridden *for
  presentation*. An override is always marked and shown beside its source value. Whether an override changes
  the valuation is a **blocking `VERIFY`**, so in the prototype it never does.
- **Secure respondent portal:** validate, upload, submit, confirm and recover are separate steps. If
  confirmation fails after the server has the response, say so ("Your response was received") and never ask
  for a resend (BUG-09).

## 11 · Historic defects to regression-test

From training-notes `10` §1: BUG-03 duplicate uploads · BUG-04 SSV values reset on Cap Table switch · BUG-07
version changes not rendered until refresh, and the secondary series reading the primary · BUG-08 rollover
leaving stale market values · BUG-09 portal breaking after submit. UX-01: the active breakpoint mode was not
visible. UX-02: Save was not discoverable.

## 12 · Open questions (do not implement)

These come from training-notes `10` §2:
- P0: formulas, precision and rounding.
- P0: preference, participation and note mechanics.
- P0: whether 409A overrides are authoritative.
- P0: how the versions relate and which changes invalidate a published valuation.
- P0: the status transitions and who may make them.
- P0: portal authentication and idempotency.
- P1: what rollover copies, the market data provider, auto-weighted methods (CSE/CSB), FX.
- P2: naming (GPC vs Public Comps, Keller vs Scalar).

## 13 · Where it lives in code

| File (`apps/product/src/`) | What |
|---|---|
| `domain/model.ts` | Types, seeding, context reducers, versions, rollover, `isReported`, `includedApproaches` |
| `domain/context.ts` | The store, `useValuationContext`, `useContextKey`, `workflowStatusOf`, and the `valuation.*` actions |
| `domain/display.ts` | `displayValue`, `ABSENCE_LABEL`, `pct1` (P5) |
| `domain/validation.ts` | `weightIssue`, `descendingAt`, `transactionDateIssue`, `parseNumber` (P7) |
| `domain/useEditor.ts` · `domain/useDirtyGuard.tsx` | The edit, validate and save cycle, plus the unsaved-changes guard (P9). `guarded()` wraps version and date switches |
| `domain/illustrative-calcs.ts` | The only prototype maths. Non-authoritative (P6) |
| `shell/VersionPicker.tsx` · `shell/MarketDatePicker.tsx` · `shell/EditCell.tsx` · `shell/BreakpointModeNote.tsx` | Context-aware chrome |
| `screens/prototypes/{rollover,export,bulk-market-date,approaches,respondent-portal,report-composer}` | The frameless flows. See [pages/prototype-product-logic.md](pages/prototype-product-logic.md) |

Checks: `npm run test:product` (domain unit tests) and `npm run lint:product-logic` (placeholder `$0`, market
date fed from the as-of date). Both run in `npm run verify:product`.

