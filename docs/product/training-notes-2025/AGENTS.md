# AGENTS.md — Operational Contract for AI Agents Working on Scalar

## Mission

Preserve the product's business semantics while implementing UI components that are **context-aware, version-aware, calculation-aware and auditable**. Scalar is not a spreadsheet-themed generic dashboard; user actions change a connected valuation model.

## Mandatory read order

`README.md` → `01-PRODUCT-MODEL.md` → `02-INTERACTION-STATE-MODEL.md` → `07-VALUATION-METHODS.md` → `08-VERSIONS-AND-ROLLOVER.md` → `03-COMPONENT-CONTRACTS.md` → task-specific files → `06-IMPLEMENTATION-AND-TESTS.md`.

## Non-negotiable practices

1. **Bind every action to a scope.** At minimum identify firm, company/fund, measurement date, applicable version(s) and method/scenario when relevant. Never assume the currently displayed row alone identifies a financial object. [S02, S03, S11, S12]
2. **Preserve date semantics.** Measurement date anchors valuation context; market date anchors external market observations. Editing market date is **not equivalent** to creating a new measurement or executing rollover. [S07, S11, S12]
3. **Do not derive or implement unknown formulas.** Valuation, convertible-note share counts, option-pricing, security preferences, breakpoints and exchange rates must use verified domain services or signed-off formulas. [S03, S05, S08]
4. **Do not conflate entities.** Company, fund, investment, security series, fund ownership, valuation approach, allocation method and published report have different meanings. [S01–S04]
5. **Do not silently overwrite scenarios.** Cap Table, financials and valuations can have multiple versions; users compare or select the intended one. Pairing between cap table and fund ownership is described as 1:1 per version. [S11–S12]
6. **Recalculate dependents when inputs change.** A changed financial period, market date, security class, ownership transaction or weighting can affect several downstream summaries. Use existing calculation contracts; avoid stale cached financial values. [S07–S10]
7. **Honor method visibility and readiness.** Calibration is described as locking a reference method and excluding it from the active valuation summary. Draft and published valuation outputs are not interchangeable. [S08, S09]
8. **Treat role and feature flags as real gates.** Firm Admin, access to a firm, and Request availability were discussed; exact role matrix remains unverified. UI hiding alone does not authorize actions. [S01]
9. **Never intentionally replicate 2025 errors.** Document-loading failures, stale values after version switches, incorrect secondary Cap Table selection, broken portal confirmation and similar defects are regression targets. [S09, S11–S12]
10. **Trace all consequential changes.** For financial operations, capture source, rationale, selected scope, changed fields, dependent views, test cases and unresolved questions.

## Rule hierarchy when evidence conflicts

1. A current, explicitly approved product/finance specification or accepted decision.
2. Validated current implementation and production behavior.
3. Current approved design-system contracts.
4. The dated session documentation in this package.
5. Engineering inference or general financial knowledge.

This is a **recommended reconciliation method**, not a policy proven to exist in Scalar. A production bug is never authoritative merely because it is observable.

## Required task execution flow

For each task: (a) identify actor and business goal; (b) map source evidence; (c) list impacted contexts and versions; (d) define transitions and failure modes; (e) specify UI contracts and dependent calculations; (f) implement against validated services; (g) add tests; (h) report evidence, assumptions and unverified areas.

### Required pull-request evidence template

```md
## Business behavior
- Actor / permission scope:
- Firm / company / fund / measurement / version(s):
- User action, invariant and downstream effect:
- Source: [Sxx @ hh:mm:ss]
## Component contract
- Inputs / events / output / loading / empty / error / success:
- Keyboard and screen reader behavior:
## Financial and safety guardrails
- Calculation service used:
- Rounding, currency and as-of date policy:
- Draft / publish / audit visibility:
## Validation
- Acceptance tests:
- Known historical regressions covered:
- Open questions (VERIFY):
```

## Design principle

Prefer **reusable visual components** plus domain-specific orchestration. Example: a reusable percentage input can render any percentage; a *valuation method weighting editor* must additionally understand a given method set, the weight-sum constraint and the downstream recomputation event. Do not embed financial formulas into UI primitives.
