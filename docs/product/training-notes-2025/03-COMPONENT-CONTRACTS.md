# 03 — Component Behavior Contracts

Component names below are **semantic contracts**, not verified names in Figma or source code. A reusable component's *appearance* can come from the design system, but its *financial meaning* must come from the connected domain model. Each source mark points to training-era evidence.

## Interface principle

**UI primitive** (table, input, chart, dialog) → **feature component** (Cap Table Editor, Weighting Editor) → **domain command/query** → **validated calculation or persistence layer** → **dependent views**.

Never implement valuation mathematics inside generic inputs or chart widgets. Never infer missing source data from a screenshot.

## 1. Context and navigation components

### C01 — Firm Selector / Firm Workspace

- **DOC:** Firms expose metadata (name, country, address, logo), funds/companies and membership; feature availability depends on permission/flags. [S01; S13]
- **Inputs:** authorized firms, selected firm, active actor and access state.
- **Events:** `selectFirm`, `updateFirmMetadata` (authorized), `manageMembers` (authorized).
- **Behavior (INFER):** Clearing dependent selected company/measurement on firm change prevents cross-firm context mixing. Display forbidden/error distinctly from zero records.
- **VERIFY:** exact navigation hierarchy, admin controls, create permission and feature flags.

### C02 — Company / Fund Navigation and Measurement Selector

- **DOC:** Creating company measurement activates financial/capitalization/valuation screens; a fund can invest in multiple companies and vice versa. [S02; S13]
- **Inputs:** selected firm, company/fund list, current measurement and historical measurements.
- **Events:** `selectCompany`, `selectFund`, `createMeasurement`, `selectMeasurement`.
- **Behavior:** Include visible measurement date in context; switching dates must reload data and versions. [DOC for dependence, INFER for exact UI]
- **VERIFY:** copy/create behavior, date conflicts, deletion/archival rules.

### C03 — Version Picker (Financial, Cap Table, Valuation)

- **DOC:** Users create named versions, switch active versions and use them as alternate scenarios; Cap Table ↔ Fund Ownership versions correspond 1:1. Valuation versions can differ in active methods on one date. [S11–S12]
- **Inputs:** version type, all accessible versions, selected version, paired version reference.
- **Events:** `selectVersion`, `createVersion` and relevant version action.
- **Behavior:** Show current version on every dependent view; when Cap Table switches, resolve matching ownership version. [DOC pairing, INFER UI]
- **VERIFY:** naming collisions, delete/reorder semantics and whether valuation binds explicit finance/captable version IDs.

## 2. Financial and ownership components

### C04 — Cap Table Editor / Security Series Rows

- **DOC:** Create preferred/common securities and attributes including quantity, price, conversion terms, dividends and PIK; multiple Cap Table versions are supported. [S02–S03; S11]
- **Inputs:** selected measurement/version, security rows, server-defined columns and rules.
- **Events:** add/edit/remove security series; save; change version.
- **Behavior:** Changes may affect breakpoints and allocations. Do not infer that `preferred` always guarantees an exact economic payoff without a verified priority model.
- **States:** empty, editing, invalid, saving, saved, failed, loading another version.
- **VERIFY:** complete field schema, term validations, exact priority logic.

### C05 — Convertible Note / Loan Editor

- **DOC:** Convertible notes use amount, interest, dates and expected shares; loans differ from converted shares; expected-share calculation is not simple division. [S03 @ 00:00:58–00:05:04]
- **Events:** update note terms, conversion date, interest fields and save.
- **Behavior:** Show calculated expected shares/amount separately from user-entered source terms; use verified backend/model.
- **VERIFY:** compounding, day-count basis, conversion mechanics, discount/cap terms, treatment of maturity after measurement.

### C06 — Fund Ownership / Investment Ledger

- **DOC:** Record holdings against a security, number of shares, purchase price and cost basis; also custom investments outside Cap Table, convertible notes and cash distributions. Filter investments by fund. [S04 @ 00:01:07–00:21:50]
- **Events:** select fund filter, add security investment, add custom investment, add note-based investment, add distribution, save.
- **Behavior:** Honor transaction date `<=` measurement date as documented. Present distinct types for `shares`, `convertible-note amount`, `custom investment` and `cash distribution`; do not force all into a share-count table. [S02; S04]
- **VERIFY:** exact transaction type enum, reversals/deletions, partial exits and treatment across Cap Table versions.

### C07 — Financial Statements Grid

- **DOC:** Annual or quarterly entry, default two historical and three projected years around measurement, extendable years; LTM and NTM derive from fiscal/calendar context. Revenue, COGS, EBITDA/EBIT, taxes, cash and debt are discussed. [S03 @ 00:17:38–00:33:57]
- **Events:** select period/financial version, edit financial line, add historical/projected year, save.
- **Behavior:** Label actual vs forecast and time basis; avoid treating blank as zero; show calculations as derived rather than editable when not source-input. [INFER]
- **VERIFY:** formulas, fiscal-year settings, permissions, tabular validation and rounding.

### C08 — Breakpoint Table / Custom Mode Toggle

- **DOC:** Default breakpoints are computed; analysts can activate custom breakpoints, enter ascending values, assign weights and use them in Waterfall. [S05 @ 00:14:00, 00:30:57, 00:32:40]
- **Events:** `toggleCustomBreakpoints`, edit ordered thresholds, edit weights, save.
- **Behavior:** Clearly indicate active breakpoint mode and its input version. Preserve custom values when mode is turned off/on only if backend confirms this behavior; that expectation was raised in training. [S07 @ 00:00:00]
- **Validation:** ascending breakpoint order; applicable weights sum to 100% where used.
- **VERIFY:** exact threshold formula, maximum range, persistence between modes and impact of alternate versions.

## 3. Valuation/analytics components

### C09 — Valuation Approach List / Add Method

- **DOC:** Multiple approaches per valuation version; add/delete methods and view resulting summary. Calibration can mark a method read-only/reference and exclude it from summary. [S06–S12]
- **Inputs:** current measurement, version, available method types, existing method instances, method status.
- **Events:** `addMethod(type)`, `configureMethod`, `deleteMethod`, `toggleCalibration`, `refreshMethodData`.
- **Behavior:** Only show fields supported by the selected method; do not force all methods to require Cap Table and finance data.
- **VERIFY:** ability to duplicate methods, method names, status lifecycle and recalculation triggers.

### C10 — Comparable Company / Transaction Picker

- **DOC:** Public Comps searches tickers and loads public price/market cap/revenue/EBITDA for market date; Transaction Comps can use known transaction IDs or manual acquisitions and `comgroups`. [S06 @ 00:20:30–00:26:18; S07 @ 00:11:21–00:25:36]
- **Events:** `searchTicker`, `addComparable`, `selectComgroup`, `addManualTransaction`, `changeMarketDate`, `refreshMarketData`.
- **Behavior:** Distinguish externally loaded entries from manual comparables; keep source and as-of date visible. [INFER]
- **States:** lookup loading, no results, incomplete data, stale market data, selection, error.
- **VERIFY:** data provider, ticker canonicalization, null handling, transactions external IDs.

### C11 — Percentile / Multiple / Weight Editor

- **DOC:** Users choose mean/median/percentiles, LTM/NTM data and distribute weights across comparable metrics; examples use a total of 100%. Percentiles described as ranging 1–100. [S06 @ 00:28:57–00:43:42; S07 @ 00:19:03]
- **Events:** `selectStatistic`, `setPercentile`, `editWeight`, `saveWeights`.
- **Behavior:** Sum should be exactly 100% by validated numeric precision; explain remaining/overallocated percentage without changing user weights silently. [INFER]
- **VERIFY:** which method has auto-weights, whether some buckets are excluded and 0% validity.

### C12 — Allocation Scenario Selector (Waterfall / OPM)

- **DOC:** Allocation follows valuation; Waterfall is described as a linear distribution according to active breakpoint ranges; OPM additionally uses maturity and volatility and yields different per-share values. [S05; S09–S10]
- **Events:** select allocation method, set supported parameters, choose weighting, calculate/refresh.
- **Behavior:** Never swap different methods under the same output label without changing context/assumptions. Render security-level result and return comparison when available.
- **VERIFY:** formulas, required fields, allowed combination of multiple allocation approaches and weighting rules.

### C13 — Valuation / Fund Summary Cards and Tables

- **DOC:** Summary displays enterprise/equity values, applicable methods, security values and return information. The fund summary may omit unpublished values. [S09 @ 00:08:36–00:20:29; S10 @ 00:54:38]
- **Events:** select date, version, valuation, fund/series; inspect details.
- **Behavior:** A blank published value must not be silently shown as zero. Explicitly represent draft/not published/unknown. [INFER]
- **VERIFY:** treatment of manually overridden or calibrated methods, published snapshot consistency.

## 4. Documentation and delivery components

### C14 — Notes Editor + Embedded Spreadsheet

- **DOC:** Notes can be attached to valuation/measurement context, with document references; August 20 highlights embedded spreadsheet calculations within a note. [S06 @ 00:09:44; S13 @ 00:49:51–00:58:09]
- **Events:** create/edit/save note; attach/reference document; insert spreadsheet; edit spreadsheet cells.
- **Behavior:** Make pending/persisted state visible. Do not assume embedded spreadsheet formulas are the same as the valuation engine. [INFER]
- **VERIFY:** embedding model, supported formulas, file-attachment access and rollover behavior.

### C15 — Document Folder and File Manager

- **DOC:** Create folders/subfolders; upload via drag/drop; move documents and reference them from a valuation. [S09 @ 00:47:26; S12 @ 00:33:55]
- **Events:** create folder, upload file, move, select for reference.
- **Behavior:** Distinguish upload completion from later reference attachment; expose failure and retry. [INFER]
- **VERIFY:** type/size limits, permissions, deduplication and version retention.

### C16 — Request Builder / Secure Respondent Portal

- **DOC:** Analyst selects preset/custom questions, requested documents and responsible party; system emails secure portal URL; external respondent can complete without logging in. [S12 @ 00:35:51–00:39:57]
- **Events:** add/remove question, select requested docs, add recipient, send request; on portal answer/upload/submit.
- **Behavior:** Preserve responses/upload records independently of confirmation UI; never imply failure/success solely from a broken confirmation page. [S12 @ 00:46:16–00:56:10]
- **VERIFY:** one-time vs reusable link, expiry, anti-abuse/security requirements, partial save and confirmation design.

### C17 — Export Controls

- **DOC:** Excel exports may cover company valuation and fund/firm summaries, with `formulate` (formulas) or `hardcoded` (values) options; selected pages can be downloaded. [S09 @ 00:38:25–00:50:28; S12 @ 00:17:41]
- **Events:** select export scope, choose formulas/hardcoded, download.
- **Behavior:** Identify selected measurement, version, currency, publication state and calculation provenance in export metadata (INFER; verify implementation).
- **VERIFY:** precise sheet set, formulas, file naming, and which pages are eligible.

### C18 — 409A Client Dashboard / Report Composer

- **DOC:** Analyst tailors client-facing view; edit displayed values and choose which graphs/sections appear. Some sections can be hidden/shown. [S13 @ 00:24:40–00:43:04]
- **Events:** select visible sections, configure chart, edit supported display values, save composition.
- **Behavior:** Distinguish presentation overrides from authoritative valuation calculations; avoid mutating underlying valuation because a display field changed unless an approved model says so. [INFER — a critical unknown]
- **VERIFY:** exact source of numbers, 409A PDF pipeline, whether sections truly edit domain data or only report data.

### C19 — Rollover / Bulk Market Date Dialog

- **DOC:** Rollover creates future-measurement continuation with options `keep market data`, exclude valuation and exclude documents; bulk market update operates across several companies without full rollover. [S11–S12]
- **Events:** select source and target dates, toggle inclusion options, preview, confirm.
- **Behavior:** Distinguish the two operations in both labels and confirmation; prevent silent source measurement overwrite (INFER).
- **VERIFY:** which financial histories/versions, notes, funds and ownership data are cloned, and atomic failure behavior.

## 5. Recommended event contract (illustrative; no claimed API)

```ts
type ComponentOperation<T> = {
  context: {
    firmId: string;
    companyId?: string;
    fundId?: string;
    measurementId?: string;
    versionId?: string;
  };
  input: T;
  expectedRevision?: string; // optimistic-locking recommendation, not observed
};

type OperationOutcome<TResult> =
  | { status: 'success'; value: TResult }
  | { status: 'validation-error'; fields: Record<string, string> }
  | { status: 'forbidden' }
  | { status: 'conflict' }
  | { status: 'error'; retryable: boolean };
```

The purpose is to make an AI agent account for all result states. **Do not scaffold actual endpoints, revision keys, or payloads from this illustration.**
