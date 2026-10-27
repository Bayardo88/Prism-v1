# 04 — Video Review and Reconciliation Protocol

**Current stage: video files not yet provided/reviewed.** This protocol exists so recordings can be converted into reproducible, implementation-ready evidence, without confusing narration, transient bugs and current intended behavior.

## 1. Priority review order

1. **2025-08-18:** version relationships, rollover choices, Bulk Action, secure request/portal failure.
2. **2025-08-20:** editable 409A dashboard, show/hide charts, note spreadsheet, PDF-report discussion.
3. **2025-08-15:** financial/Cap Table/valuation versions, rollover, stale UI bugs.
4. **2025-08-08 and 08-11:** approach weights, allocation, publish/audit, Excel exports and a compact full valuation.
5. **2025-07-28 and 07-30:** Fund Ownership, breakpoints, Waterfall and custom mode visibility.
6. **2025-07-23, 07-25, 08-01, 08-04, 08-06:** initial setup, financial input, models and valuation details.
7. **2025-07-21:** access/firm/first fund setup, if a playable video is available.

## 2. Per-video analysis worksheet

```md
### [VIDEO ID] YYYY-MM-DD — Feature name
- File name / duration / environment (dev, staging, production, unknown):
- Source timestamp range:
- User role and selected firm/company/fund:
- Measurement date / market date / financial version / Cap Table version:
- Screen / component name as shown:
- Precondition and current input data:
- Event: exact click, selection, key or drag action:
- Visible response: loading / updated value / toast / dialog / redirect:
- Data dependency: which other component changed and why:
- Persistence: evidence after Save/reload or return to screen:
- Validation / disabled / empty / error states:
- Speaker claim: intended behavior / bug / improvement / unclear:
- Screenshot or frame references:
- Corresponding document: [Sxx @ time]:
- Spec action: CONFIRM / MODIFY / ADD / FLAG OPEN QUESTION:
```

## 3. How to turn observation into a component contract

- **Operation:** e.g. `changeCapTableVersion`.
- **Context:** target measurement, selected cap table version, paired ownership version, selected valuation.
- **Preconditions:** data loaded, user authorized, unsaved edits resolved.
- **Trigger:** user opens version selector and selects secondary.
- **Observed UI response:** loading state, visible selected version, row update, dependent calculation update.
- **Persisted outcome:** verify after navigating away and returning.
- **Fallback:** permission denied, stale response, missing data, failed recalculation.
- **Design decision:** explicit indication of which version is active; do not use a historical bug as success behavior.

## 4. Evidence scoring

| Level | Evidence | Implementation confidence |
|---|---|---|
| `V1 — narrated` | Speaker says feature should do X. | Intent only. |
| `V2 — visibly performed` | Action and immediate response visible. | UI behavior likely for that build. |
| `V3 — persisted` | Same data observed after Save/reload/back-navigation. | Stronger state/persistence evidence. |
| `V4 — production-confirmed` | Result reproducible on an approved current production build. | Subject to stakeholder and financial approval. |

A video can show a broken behavior; a high evidence level **does not** turn a defect into a requirement.

## 5. Reconciliation checklist

- [ ] Confirm actual UI names (`Fund Ownership`, `Bulk Action`, `GPC`, allocation labels).
- [ ] Confirm field-level editor types, Save positions and validation.
- [ ] Confirm every date picker meaning, default and persistence scope.
- [ ] Confirm calculated vs user-editable cells and visibly derived outputs.
- [ ] Confirm loading/empty/error states, dialogs and side effects.
- [ ] Confirm what changes after versions/market date/rollover and whether the result survives reload.
- [ ] Confirm permission and feature flag variations without exposing personal credentials or secure links.
- [ ] Verify whether 409A display edits affect source valuation and how PDF generation works.
- [ ] Update `05-EVIDENCE-REGISTER.md`, component contracts, tests and risk register.
