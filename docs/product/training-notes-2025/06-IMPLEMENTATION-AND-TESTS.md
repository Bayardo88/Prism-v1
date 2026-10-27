# 06 — Implementation Guidance and Test Plan

## Goal

Implement or change Scalar features without breaking data provenance, version selection, share-allocation integrity, publication semantics or client deliverables. This is a **recommended engineering test strategy inferred from training** — not a description of a known Scalar test suite.

## 1. Architecture boundaries

```text
Reusable UI primitives
  ↳ Domain-aware feature components
       ↳ Context and version orchestration
          ↳ Authorized backend query/command
             ↳ Validated financial calculation services
                ↳ Persisted result / revision / publication output
```

- Put finance formulas and securities waterfall mathematics in verified calculation services; frontend may display computed values and perform safe input-format validation.
- Query keys should include the relevant firm, company, measurement, version IDs and market date; use actual repo conventions rather than inventing names.
- Server must enforce access and business rules (cross-firm access, transaction dating, published write restrictions if applicable).
- Choose a consistent money/percentage numeric representation with finance team approval; no arbitrary `toFixed` as calculation authority.
- Explicitly distinguish API `null`, missing value, zero, pending calculation, failed calculation and intentionally excluded/draft result.

## 2. Minimum component acceptance matrix

| Feature | Acceptance case | Evidence |
|---|---|---|
| Firm scope | Unauthorized firm/feature is inaccessible and no stale data from another firm remains. | [S01] |
| Company measurement | Different measurement date loads corresponding finance, Cap Table, valuation and ownership context. | [S02; S13] |
| Cap Table | Changes in security series affect dependent breakpoint/valuation data only after validated save/commit. | [S02–S05] |
| Convertible notes | Expected shares use verified business engine; no client-side substitute formula. | [S03] |
| Fund Ownership | Security/custom/note/cash-distribution transactions render distinctly and are date-validated. | [S04] |
| Financials | Historical/projected periods, annual/quarterly entry and selected version are clear. | [S03; S11–S12] |
| Breakpoints | Switching custom/default produces selected schedule; ordered thresholds validate; active mode is obvious. | [S05] |
| Public Comps | Market-date change refreshes dated prices/multiples and does not alter measurement. | [S06] |
| Transaction Comps | Both provider lookup and manual transaction are handled with missing data states; method weight validation. | [S07] |
| Method selection | Method-specific inputs and dependencies are preserved; calibrated method is reference-only. | [S06–S10] |
| Allocation | Waterfall vs OPM shows different assumptions/results through verified engine. | [S08–S10] |
| Publish | Draft valuations are not misreported as published fund/summary values. | [S09] |
| Version switch | Selecting secondary Cap Table does not reuse primary rows; selected valuation version has its own method set. | [S07; S11–S12] |
| Rollover | Include/exclude market data, valuation, documents matches approved backend behavior; original measurement preserved. | [S11–S12] |
| Bulk update | Market date across selected companies updates without creating new measurements. | [S12] |
| Notes | Note save, references and embedded spreadsheet preserve context and state. | [S06; S13] |
| Request portal | Submissions persist, confirmation is reliable, retries do not duplicate content. | [S12] |
| Export | Formula vs hardcoded yields correct output for active context. | [S09] |
| 409A report | Section visibility and display edits behave as approved and never accidentally change core valuation. | [S13] |

## 3. Cross-component integration tests

### Scenario A — One measurement, changing finance scenario

Create measurement M → populate Financial Version A and B → create valuation approach using finance → select B → recalculate → confirm B's figures/results → switch back A → confirm no overwrite. **Pass** only if UI, service request and persisted result agree on selected version. [S11–S12]

### Scenario B — Alternate capitalization and fund holdings

Create Cap Table Primary with security series and Fund Ownership → make Secondary Cap Table and corresponding Fund Ownership → change a series/investment in Secondary → switch between versions and re-run SSV/Waterfall → assert correct pair and no cross-contamination. [S07; S11–S12]

### Scenario C — Custom breakpoints into Waterfall

Create a valid custom breakpoint schedule → enable it → run Waterfall → inspect allocated series values → disable custom → assert computed defaults are active → re-enable and inspect preservation only if persistence contract confirmed. [S05]

### Scenario D — Dated market comparable

Select measurement 2018 → use 2018 comparable market date → capture Public Comps → change market date to a later date → fetched price/multiple values update → original measurement remains 2018. [S06]

### Scenario E — Draft, audit and publish

Create allocation with output in Draft → inspect fund summary → use audit read-only path → publish through permitted action → inspect published summary/export. **VERIFY** exact status sequence before writing assertions beyond observed draft/published distinctions. [S09]

### Scenario F — Rollover semantics

Create 2019 measurement with data, methods and docs → rollover to 2020 under each inclusion option → inspect target and original → check market date and method/doc inheritance → verify related fund context. [S11–S12]

### Scenario G — Secure request failure recovery

Analyst sends preset + custom questions and document requirement → external respondent uploads + submits → simulate UI confirmation failure after successful server commit → return and confirm response is present, not resent/reduplicated. [S12]

## 4. Numerical and state invariants

- **Documented:** In selected weighting contexts, total should be 100% (S05, S07, S08, S09); display rounding may not exactly equal persisted numeric precision.
- **Documented:** Waterfall allocated proceeds should reconcile to equity target within accepted rounding; S05 discussed minor decimal discrepancies.
- **Documented:** Future-dated investment relative to measurement is not permitted in the training flow. [S02]
- **Documented:** Published and draft affect summary visibility. [S09]
- **Unknown:** money scale, permissible negative values, IRR logic, ownership dilution rules, compounded interest, security preferences, approved precision, and any universal `sum(weights)=1` rule for methods with auto-weighting.

## 5. UI behavior and accessibility (INFER best practices)

For each feature component provide: focus order, keyboard selection, labels and error messages, skeleton/loading, blank state, read-only state, confirmation, failure recovery and clear version/date context. Financial tables must retain row/column associations for screen readers. Destructive actions and rollover deserve explicit confirmation and reviewable outcomes. These are recommended quality criteria; the training did not specify a11y implementation.

## 6. Agent code-review checklist

- [ ] Is the affected financial scope explicit in every query, mutation and UI label?
- [ ] Are date fields named by meaning: measurement vs market vs transaction vs conversion?
- [ ] Are version IDs and Cap Table ↔ Fund Ownership pairing preserved?
- [ ] Do dependent values recalculate with existing validated domain services?
- [ ] Are manual values, imported market values and calculated values distinct?
- [ ] Are weights validated in correct method context?
- [ ] Are `draft`, `published`, `calibrated`, `audit read-only` distinctly handled?
- [ ] Are historical bugs covered with regression tests?
- [ ] Does source evidence support every financial assumption? Are unknowns blocked rather than guessed?
- [ ] Does a successful operation visibly confirm *server-persisted* state?
- [ ] Are traceability fields (source ID/date/timestamp) included in the PR?
