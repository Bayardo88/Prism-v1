# 07 — Valuation Approaches, Allocation and Financial Dependencies

## Fundamental distinction

**Valuation approaches** estimate enterprise/equity value; **allocation methods** distribute equity value among ownership classes and help derive share-level returns. They are related but **not interchangeable**. The sessions show method blending and weighting as part of the process. [S06–S10]

## 1. Documented valuation approaches

| Approach (normalized training label) | Inputs/behavior documented | Source | Missing for implementation |
|---|---|---|---|
| **External Valuation** | Analyst enters/prepares value from outside appraisal or arbitrary example; company value and equity value respond to financial/debt assumptions. | [S06 @ 00:02:33–00:03:53; S10 @ 00:20:15] | Source pedigree, permitted override fields, exact enterprise-to-equity bridge. |
| **Specific Share Value (SSV)** | Analyst specifies price per share on selected Cap Table series; share quantities contribute to result. Can use primary or secondary Cap Table. | [S07 @ 00:02:48–00:07:11; S10 @ 00:23:56] | All aggregation rules, dilution treatment, which series eligible. |
| **Public Comps / Global Public Companies (GPC)** | Select publicly traded comparables by ticker; retrieve date-sensitive price, market cap, revenue, EBITDA; select mean/median/percentiles and LTM/NTM weights; multiples applied to company financials. | [S06 @ 00:20:30–00:54:33; S10 @ 00:25:08–00:29:35] | Exact multiple definitions, data vendor, percentile and outlier policy, stats/weight formula. |
| **Transaction Comps** | Comparable acquisition transactions, fetched by transaction ID or entered manually; groupable with `comgroups`; revenue/EBITDA produce multiples; metric weights sum to 100% in demonstration. | [S07 @ 00:08:57–00:25:36] | Purchase-price/enterprise-value bridge, transaction date adjustments, grouping semantics. |
| **Future Exit** | Project future exit date and financial basis (LTM revenue demonstrated), with dilution/discount adjustments; may use transaction inputs or manual assumptions. | [S07 @ 00:32:13–00:37:21; S08 @ 00:08:45–00:20:16] | Exact time, dilution, discounting, value selection formula. |
| **Backsolve** | Starts from prior investment/transaction assumptions, with allocation methods including Waterfall and OPM; calibration and market adjustments discussed separately. | [S08 @ 00:21:38–00:41:22] | Backsolve calibration algorithm, starting security value, constraints, rounding. |
| **Discounted Cash Flow (DCF)** | Financial-focused method with revenue growth, taxes, depreciation, capex and discounted future cash flows; speaker also mentions H Model. | [S08 @ 00:48:34–01:00:17; S09 @ 00:08:36] | WACC/discount rate, terminal growth, timing, tax and working-capital model. |
| **Calibration** | An existing approach can be flagged as immutable reference; excluded from active valuation summary. Do not assume it's a standalone valuation method merely because discussed beside one. | [S06 @ 00:16:18] | Difference between calibration flag, calibration algorithm, and market adjustment. |

> **Important:** Source IDs follow `05-EVIDENCE-REGISTER.md`: S07 is Aug 4, S08 is Aug 6, S09 is Aug 8. Numerical examples are training fixtures, not approved formulas.

## 2. Allocation methods

### Waterfall

- **DOC:** Uses a breakpoint schedule and priority/participation of security series. The presenter described a linear interpolation between breakpoint ranges; total allocated amounts should reconcile to the equity amount, subject to explained rounding. [S04 @ 00:55:38–01:04:15; S05 @ 00:06:01–00:07:24, 00:38:44; S10 @ 00:34:36]
- **DOC:** Switching default/custom breakpoints changes the result; active breakpoint set matters. [S05 @ 00:32:40]
- **Do not implement:** a generic proportional split by share count without the security liquidation-preference model.

### Option Pricing Model (OPM)

- **DOC:** The demonstrations use maturity and volatility assumptions and show different class/share outcomes than Waterfall. [S08 @ 00:18:53; S10 @ 00:50:49]
- **Do not implement:** Black-Scholes or any option-pricing formula from memory; the exact engine, calibration and method variants were never supplied.

### CSE/CSB naming

The transcription mentions `CSE`, `CSB` and perhaps other phonetic labels, sometimes in the context of allocation/automatic weighting. **VERIFY canonical terminology with financial owner and screenshots** before adding enum values. [S08 @ 00:21:38; S09 @ 00:28:45]

## 3. Shared calculation principles

1. **Enterprise value vs equity value:** Financial assets/liabilities cause them to differ. The notes discuss debt and cash adjusting the bridge; exact formula and sign conventions must be confirmed before coding. [S06 @ 00:42:33; S09 @ 00:10:21]
2. **Weights:** Some valuation/comparable/allocation approaches accept analyst-defined weights distributed to 100%. A method may automatically set its own weight. Interpret weight in its **specific method context**; do not force a single global editable field. [S05 @ 00:30:57; S07 @ 00:19:03; S09 @ 00:24:31–00:28:45]
3. **Market observations:** Public companies have dated statistics; newer market date may change outputs, independent of user-entered financials. [S06 @ 00:54:33]
4. **Returns:** Training interprets a return multiple above 1 as gain and below 1 as loss. This is not an APR/IRR formula. Label correctly. [S09 @ 00:14:44–00:17:41]
5. **Security ordering:** Preferred securities may receive priority in breakpoints/Waterfall and common holders may receive little or nothing in low-value exits. [S04 @ 01:04:15]
6. **Precision:** Floating point tolerances, display decimals and reconciliation rules **not specified**. Use approved engine/financial testing rather than arbitrary JS floats. [S05 @ 00:06:01]

## 4. Conceptual dependency table

| Method or output | Finances | Cap Table | Market/comparable data | Breakpoints | Specific parameters |
|---|---|---|---|---|---|
| External Valuation | May adjust equity/enterprise bridge | No firm general requirement established | External valuation value | No | Source valuation/value override |
| SSV | May need equity context | Yes | No | No | Security/share price |
| Public Comps | Yes | No direct requirement established | Yes | No | Stats and multiples weighting |
| Transaction Comps | Yes | No direct requirement established | Yes or manual transaction data | No | Selection/grouping and weights |
| Future Exit | Yes | Possible downstream allocation | Possibly transaction reference | Depends on downstream allocation | Date, dilution, discounts |
| Backsolve | Related to transaction input | Yes, through allocation | Depending method | Possibly | Historic investment, allocation choice |
| DCF | Yes | Not a primary input in demonstration | May require market discount inputs (VERIFY) | No | Financial projections and discount assumptions |
| Waterfall **allocation** | Aggregate equity result | Yes | No | Yes | Selected breakpoint set, capitalization preferences |
| OPM **allocation** | Aggregate equity result | Yes | Possibly volatility calibration data | Security tranches potentially | Maturity, volatility, rates (VERIFY) |

Cells marked "possible" or "VERIFY" are NOT established requirements; ensure actual calculator signatures before implementation.

## 5. Suggested AI test questions

- If an analyst changes the **financial version**, which approaches must recalculate and which independent inputs remain unchanged?
- If an analyst toggles **custom breakpoints**, are those active in **Waterfall**, and is the selection visible?
- If the **market date** updates, are prices and multiples recomputed without changing the **measurement date**?
- If the **Cap Table version** switches, does SSV use the selected version, and is Fund Ownership paired correctly?
- If method weighting changes, does allocation and per-share return reflect the new total equity output?
- If a method is flagged **calibrated**, is it excluded from the active valuation summary and treated as reference-only?

These are validation requirements derived from the material, not verified current behavior of Scalar.

### Source index

The authoritative ID-to-date mapping is `05-EVIDENCE-REGISTER.md`, covering **S01–S13**. If a citation appears inconsistent, check its date and transcript timestamp before using it.
