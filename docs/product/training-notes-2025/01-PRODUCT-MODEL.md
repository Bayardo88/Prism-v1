# 01 — Scalar Product Model

## 1. What the product does

**DOC.** The training introduces a browser-based platform for analysts to evaluate private companies and investments, assemble financial and capital structure data, use multiple valuation approaches, allocate equity value among security classes, and deliver results to clients. The move from Excel to a shared web application provides collaboration, accessible records and Excel exports. The August 20 notes briefly call the software "Keller"; the training series is named **Scalar**. Treat the "Keller" naming as unresolved terminology rather than silently renaming the product. [S01 @ overview; S13 @ 00:06:52]

The product is **measurement-driven**: the value of a company/security is meaningful only in the context of its date and financial/market conditions. The teaching examples repeatedly use December 31, 2018 as a measurement date. [S02 @ 00:12:27; S03 @ 00:17:38; S13 @ 00:08:45]

## 2. Actors and workspaces

| Actor | Documented activity | Not confirmed |
|---|---|---|
| Firm administrator | Configure firm, add users, access firm-level settings/funds. [S01] | Full permission matrix, membership edge cases, delegation and approval gates. |
| Analyst | Add financials, Cap Table, ownership, valuation methods and allocations; publish/export valuation and configure 409A report. [S02–S13] | Role-specific editing/locking permissions and cross-user change resolution. |
| Auditor | View a `ready for audit` valuation in a read-only context. [S09 @ 00:20:29] | How audit sign-off/rejection/approval works. |
| Client / external respondent | Answer document requests and upload files through a secure emailed portal without normal login. [S12 @ 00:39:57] | Link expiry, identity authentication, recovery and request visibility. |
| Investor/fund analyst | Track fund capital, security holdings, transactions and returns. [S04, S09] | Exact investor-facing access and the new Fund Investment screen contract. |

## 3. Conceptual domain hierarchy

```text
Firm (workspace: metadata, logo, members, permissions)
  ├─ Company
  │    └─ Measurement (valuation as-of date)
  │         ├─ Financial statements [version(s)]
  │         ├─ Cap Table [version(s)] ── paired Fund Ownership [version(s)]
  │         │    ├─ preferred/common securities; convertible notes / loans
  │         │    └─ derived or custom breakpoints
  │         ├─ Valuation [version(s)]
  │         │    ├─ valuation approaches (External, Public Comps, ...)
  │         │    └─ allocation approaches (Waterfall, OPM, ...)
  │         ├─ Notes + document references
  │         └─ Summary, publication, reporting and 409A presentation
  └─ Fund (capital, currency, holdings, fund-level reports)
       └─ Investments associated with companies/securities/measurement context
```

**INFER:** Nesting is conceptual, not a relational database specification. The notes also say a company can receive capital from different funds and a fund can invest in many companies; do **not** implement an exclusive fund → company parent relationship. [S04 @ 00:24:22; S13 @ 00:08:45]

## 4. Vocabulary and business invariants

| Concept | Definition / documented rule | Source |
|---|---|---|
| **Firm** | Top-level workspace with name, address, country, logo, members and permissions. | [S01] |
| **Fund** | Pool of investment capital; fund record includes its capital and currency. A fund can invest in many companies. | [S01; S04 @ 00:24:22; S13 @ 00:08:45] |
| **Company** | Entity being modeled/valued; can receive investment from multiple funds. | [S02; S13] |
| **Measurement date** | Time anchor for evaluating the company, securities and investments. Transactions entered for the measurement cannot be later than this date, per training. | [S02 @ 00:12:27; S04 @ 00:12:22] |
| **Market date** | Date used to fetch/refresh market-observed prices and comparable data. Can differ from measurement and be manually changed. | [S06 @ 00:54:33; S07 @ 00:01:30; S12 @ 00:13:28] |
| **Cap Table** | Capitalization structure: number/type of shares, preferred and common securities, price and terms. Origin described as company formation/capital records. | [S02 @ 00:10:05] |
| **Security series** | Preferred securities may include seniority, dividends, cumulative interest, PIK and conversion features; common shares have different rights. | [S02 @ 00:11:12, 00:19:40] |
| **Fund Ownership** | Track fund investments in a company/security, transaction quantity, price, date and cost basis; may include a custom holding and cash distribution. | [S04 @ 00:01:07, 00:06:28, 00:08:54, 00:19:10] |
| **Convertible note** | Amount- and date-based instrument with conversion date, interest and expected shares. Actual expected-share formula was not provided. | [S03 @ 00:00:58–00:05:04] |
| **Financials** | Historical and projected revenue, expenses, EBITDA/EBIT, debt, cash and related items used by valuation methods. The training defaults to two historical and three projected years around measurement and allows extension. | [S03 @ 00:17:38, 00:31:40] |
| **Breakpoints** | Thresholds describing allocation of equity proceeds across security classes under a liquidation/exit-style scenario. Default/calculated or user-customized. | [S04 @ 00:40:15–01:04:15; S05] |
| **Valuation approach** | Method estimating company/equity value using external, comparable, stock-specific, future or financial data. Different approaches require different inputs. | [S06–S10] |
| **Allocation method** | Method allocating total equity value to security classes/shares, e.g. Waterfall and OPM. | [S09–S10] |
| **Valuation summary** | Aggregates approaches/allocations; reported values may remain absent or draft until publication. | [S09 @ 00:20:29] |

## 5. Business value flow: one simplified valuation

1. **Choose accessible firm and establish company/fund scope.** User access may depend on workspace membership, feature flags and environment. [S01–S02]
2. **Create/open company measurement.** Establish measurement date and currency context. [S02; S13 @ 00:11:59]
3. **Define capital structure.** Create preferred/common share series and convertible instruments in the Cap Table. [S02–S03]
4. **Enter relevant fund transactions and holdings.** Associate selected funds, securities and transaction dates; inspect cost basis. [S04]
5. **Enter historical and forecast financials.** Supply revenue, EBITDA, debt/cash and other relevant fields; choose applicable financial version. [S03]
6. **Review or customize breakpoints.** Default breakpoints are derived from cap table; custom breakpoints affect Waterfall in demonstrations. [S05]
7. **Build valuation approaches.** External Valuation, SSV, Public Comps, Transaction Comps, Future Exit, Backsolve, DCF and others. [S06–S10]
8. **Choose allocation and method weights.** Waterfall and/or OPM produce security-level values; values and return multiple can be viewed in results. [S09–S10]
9. **Review, publish or mark for audit.** Draft values and published outputs are not identical in summary visibility. [S09]
10. **Deliver or carry forward.** Excel exports (with formulas/hardcoded), client-oriented 409A dashboard, document references and rollover to new dates. [S09; S12–S13]

The precise workflow can differ by method; custom breakpoints are optional; methods may not all require both financials and cap table data. **Do not force a rigid 10-step wizard** without further validation.

## 6. What components must *understand*, not merely render

- **Context:** active firm, company/fund, measurement, version, currency and market date.
- **Provenance:** manually entered versus fetched external data; chosen comparison set; notes and reference files.
- **Dependencies:** securities and finance drive method inputs; methods and weights drive allocation; published valuation drives report visibility.
- **Reviewability:** alternative scenarios, prior versions, as-of dates, draft vs published status and recalculation/review states.
- **Financial integrity:** units, sign, rate/percentage semantics, persistence and safe validation; none should be invented from visual formatting.

## 7. Important limitation

The sessions are training examples, sometimes using arbitrary or intentionally simplified values. Do not treat sample securities (Series A/B/C/Z), specific companies, exchange rates, return multiples or demonstration numbers as production defaults. The 2025 transcript includes speech-recognition errors, especially around model names and formulas. See `10-RISKS-AND-OPEN-QUESTIONS.md`.
