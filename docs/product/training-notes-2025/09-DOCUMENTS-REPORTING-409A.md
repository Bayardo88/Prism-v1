# 09 — Documents, Requests, Exports and Client-Facing 409A

## 1. Why these features exist

Analysts need evidence supporting a valuation, input from clients, and deliverable reports. Scalar connects internal notes, uploaded documents and request/response workflows to the broader valuation context. It also provides Excel export and a configurable client-facing **409A** dashboard. [2025-07-25 @ 00:09:03; 2025-08-18 @ 00:35:51; 2025-08-20 @ 00:31:28]

## 2. Notes and document references

**DOC:** Notes are used for analyst explanations and reminders; document references attach source evidence (uploaded files or requested documents). A valuation note can be associated with measurement date, and rollover may offer control over forwarding notes/documents. [2025-07-25 @ 00:09:03; 2025-08-01 @ 00:09:44]

**DOC:** August 20 highlighted a more capable note experience supporting spreadsheet content embedded into notes, simple spreadsheet-style calculations and document references. [2025-08-20 @ 00:49:51–00:58:09]

**INFER — UI behavior:** Keep the note's referenced measurement/method visible. Show separately: note editing status, attachment upload status, embedded spreadsheet edits, persistence result. Do not propagate a note spreadsheet result into the core valuation engine without documented linkage.

**VERIFY:** Is the embedded spreadsheet an uploaded workbook, inline spreadsheet instance or block-based component? What formula engine is used, and how are references resolved on rollover?

## 3. Document storage

**DOC:** Create folders and subfolders, drag/drop uploads, move files between folders and select documents as references. [2025-08-08 @ 00:47:26; 2025-08-18 @ 00:33:55]

**Component contract:** A selected document must be identified independently of folder display name. Show upload progress and a truthful persisted result; deletion/move must not silently break established valuation references (recommended; backend behavior VERIFY).

## 4. Information requests and secure respondent portal

### Documented analyst flow

1. Open request workflow from a company/firm context.
2. Choose predefined questions and add custom questions if necessary.
3. Select which documents are required.
4. Identify a responsible recipient; external contacts may be added if not already members of the firm.
5. Send request; recipient gets an email linking to secure portal.
6. External respondent answers questions and uploads documents **without conventional platform login**. [2025-08-18 @ 00:35:51–00:39:57]

### Critical historical issue

During August 18 session, uploads and answers could succeed while the portal failed after submission or during confirmation. The team reproduced failures in production and marked the issue critical. **Do not encode that failure as expected product behavior.** [2025-08-18 @ 00:46:16–00:56:10]

**INFER — required UX:** separate (i) validation, (ii) upload, (iii) answer submission, (iv) confirmation and (v) retry/recovery. If confirmation fails, inspect persisted request status before re-sending to prevent duplicate uploads/responses.

**VERIFY:** URL expiry/authentication; external access permissions; upload limits; whether requests can be partially completed; data isolation between firms; request completion state; lifecycle of recipients, documents and notifications.

## 5. Export paths

| Export | Training behavior | Questions |
|---|---|---|
| Valuation Excel export | Download extensive company data including Cap Table, transactions, cash flow, valuation approaches and methods; possibly individual pages. [2025-08-08 @ 00:38:25–00:44:26] | File naming, exact worksheets, multi-version selection and eligibility. |
| `formulate` option | Export retains formulas in cells. [2025-08-08 @ 00:49:12] | Formula reference fidelity, source of computation. |
| `hardcoded` option | Export has resolved values rather than cell formulas. [2025-08-08 @ 00:49:12] | Decimal and currency formatting and whether values correspond to published snapshot. |
| Broad `Excel Export` view | Firm/fund/company summary, investments, measurement dates, method and publication status. [2025-08-18 @ 00:17:41] | Exact scope and permissions; whether multiple firms are exportable at once. |

If export results display `draft` values differently from published results, document this as **status-based reporting behavior**, not an error where zeros should be filled in. [2025-08-18 @ 00:17:41–00:24:33]

## 6. Client-facing 409A dashboard

**DOC:** On August 20, the presenter showed a dashboard for 409A-related company valuation reporting and described it as a client-facing representation assembled/configured by the analyst. The analyst can choose what figures/charts/sections are visible; the UI allows editing displayed figures such as enterprise value, debt and share price and hiding/showing sections. [2025-08-20 @ 00:24:40, 00:31:28, 00:40:06, 00:43:04]

**Crucial distinction:** The source states that the 409A dashboard is **editable for presentation**, but it does not prove whether edits are display-only or change the underlying authoritative valuation. Treat this as a **blocking specification question** for implementation.

**DOC with caveat:** A 56-page client PDF report was shown/discussed. The presenter was uncertain whether the report is generated directly by the platform or completed from a template outside it. **Do not claim live PDF generation is an implemented feature** from these notes. [2025-08-20 @ 00:34:38–00:40:06]

### Report composer interaction contract (INFER)

```text
Select measurement and published/source valuation
  → choose client-facing sections/charts
  → configure editable presentation fields where explicitly supported
  → preview report
  → save composition
  → export/share through an approved workflow [VERIFY]
```

Separate the **source valuation result** from the **report presentation**. If users can override numbers, include provenance, edit authority and disclosure rules once approved by the product/finance team.

## 7. Suggested acceptance tests

- Document upload persists after navigation/reload and remains linked to correct measurement/method.
- Secure respondent is limited to only requested data; no firm-workspace access is accidentally granted.
- Repeated submit attempts do not duplicate accepted documents after a confirmation error.
- Excel export offers clearly labeled formula/value modes and matches selected measurement/version.
- 409A section visibility persists without altering unrelated report sections.
- 409A display overrides and authoritative valuation values remain distinguishable, pending confirmation of actual desired semantics.
- Rollover `exclude documents` respects the selection without deleting source documents.
