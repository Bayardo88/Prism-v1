# 10 — Historic Risks, Open Questions and Pending Confirmation

## How to use this register

These are **2025 training observations**, not claims about the current product. Each issue has an impact and a verification or implementation action. An AI agent must not silently resolve high-impact ambiguity with generic finance assumptions.

## 1. Known issues observed during training

| Key | 2025 observation | Evidence | Risk / action |
|---|---|---|---|
| BUG-01 | In development, creating a fund/company failed; users sometimes lacked firm access. | [S02 @ 00:00:41–00:04:39] | Check permission vs platform failure; distinguish unauthorized from server error. |
| BUG-02 | Some permission/feature visibility settings were not editable; Request controlled by flag. | [S01] | Current RBAC and feature-gating review. |
| BUG-03 | Documents sometimes duplicated during uploads. | [S06 @ 00:12:21] | Upload idempotency and duplication test. |
| BUG-04 | Switching SSV between primary/secondary Cap Tables reset/overwrote displayed values. | [S07 @ 00:05:26] | Version-scoped calculation regression. |
| BUG-05 | Comgroup percentages and some market method displays were questionable. | [S07 @ 00:25:36–00:46:25] | Test under correct source/method/date; distinguish bad data from UI bug. |
| BUG-06 | Calibration/adjustment method occasionally failed. | [S08 @ 00:41:22] | Verify current availability before implementing. |
| BUG-07 | Version updates did not render until refresh; secondary series selection could reference primary. | [S11 @ 00:19:36, 00:45:58] | Current version coherency, query invalidation, cache regression. |
| BUG-08 | Rollover did not update some market data; yellow values required manual action; fund-linked copy had errors. | [S11 @ 00:57:30; next steps] | Test rollover partial failure behavior and post-copy audit. |
| BUG-09 | Secure request portal broke after upload/answer submission, including production reproduction. | [S12 @ 00:46:16–00:56:10] | Priority regression: distinguish persisted response from confirmation error. |
| BUG-10 | Notebook/spreadsheet embedding in notes appeared to break during the demo. | [S13 @ 00:54:50] | Verify current editor, formula support, and error path. |
| UX-01 | Active default/custom breakpoint mode hard to discover in Waterfall. | [S05 @ 00:36:29] | Proposed persistent active-mode indicator. |
| UX-02 | Unclear Save control led to an unsaved note. | [S06 @ 00:52:10] | Proposed dirty-state/saved-state feedback. |

## 2. Blocking finance/product questions

| Priority | Question to confirm | Owner to consult |
|---|---|---|
| P0 | What are the source-approved **formulas, assumptions, rate sources, precision and rounding rules** for each valuation approach and allocation model? | Finance/valuation SME + backend owner |
| P0 | How exactly do **Cap Table liquidation preferences, participation, notes, dividend accruals and breakpoints** determine Waterfall/OPM outcomes? | Finance + backend |
| P0 | Do edits in **409A dashboard** change underlying valuation numbers or only client-facing presentation values? Is the report generated inside Scalar? | Product + 409A owner |
| P0 | What is the authoritative relation among **financial version, Cap Table version, ownership version and valuation version**? Which changes invalidate existing published results? | Backend + product |
| P0 | What are the exact **draft → audit → published → final** transitions, allowed actors and immutable snapshot rules? | Product + compliance |
| P0 | What are **secure portal** authentication, token expiry, file permissions and idempotency semantics? | Security/backend |
| P1 | What's the exact difference between a **measurement-date change**, **market-date refresh**, **Bulk Action**, and **rollover** on each data entity? | Product + backend |
| P1 | What does rollover copy for **funds, document links, notes, embedded spreadsheets, custom investments and versions**? | Product + backend |
| P1 | What is the actual **pricing/data provider**, null-data handling and ticker/transaction identity model? | Market data owner |
| P1 | Which weights auto-calculate (CSE/CSB/SCB?), and which groups require a 100% user-entered sum? | Finance SME |
| P1 | Does the platform permit a **company investment in a fund** separate from fund investment in a company? The described `Fund Investment` feature is new. | Product + engineering |
| P1 | How are external currencies converted and **as-of exchange rates** chosen? | Finance + data |
| P2 | What is the definitive product vocabulary for GPC/Public Comps, Fund Ownership, CSE/CSB, `formulate`/`hardcoded`, and Keller/Scalar? | Product/design |
| P2 | What components and visual layouts are current in the Figma design system, and which are deprecated? | Design systems owner |
| P2 | Is the Confluence finance glossary appendix available, and can it confirm method equations? | Product + finance |

## 3. Confidence and next evidence

**Strongly supported from notes:** firm/fund/company concepts; measurement versus market date; share-series/cap table; fund ownership transactions; default/custom breakpoints; multiple versions; range of valuation methods; allocation distinction; draft/publication; Excel exports; requests; 409A configurability.

**Moderately supported:** exact component positioning and labels; detailed version pairing; `keep market data` option effects; note spreadsheet editing capabilities.

**Insufficient:** calculation algorithms, current security permissions, present-day defect status, rendering specifics/animations, exact request and 409A PDF workflows.

## 4. Required action when videos arrive

For each video: record duration and source metadata; match session date; capture each demonstrated feature's precondition, exact click/keyboard action, visible loading state, user-supplied value, recalculated fields, save success/error, and linked view changes. Mark whether speaker called a behavior a bug or proposed improvement. Reconcile the document evidence register and open questions; do not overwrite transcript evidence silently.
