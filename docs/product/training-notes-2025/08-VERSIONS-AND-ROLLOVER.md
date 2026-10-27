# 08 — Measurement, Versioning, Market Date and Rollover

## 1. The three distinct axes of time/scenario

**Measurement date**: valuation-as-of date for a company. Historical investments must occur no later than the valuation date in the training examples. [2025-07-23 @ 00:12:27; 2025-07-28 @ 00:12:22]

**Market date**: observation date for public security prices/comparable data; can be edited and refreshes market values. [2025-08-01 @ 00:54:33; 2025-08-04 @ 00:01:30]

**Version**: alternative dataset or valuation scenario **within a measurement date**, not a replacement for a new measurement. [2025-08-15 @ 00:14:59; 2025-08-18 @ 00:08:31]

## 2. Multiple versions supported in training

| Object | Documented semantics | Risk if implemented incorrectly |
|---|---|---|
| Financial statements | Create named versions for different assumptions/scenarios; change which financial version valuation uses. [2025-08-15 @ 00:14:59; 2025-08-18 @ 00:07:04] | Unexplained change to revenue/EBITDA or model inputs. |
| Cap Table | Create primary/secondary/other version for different security assumptions. [2025-08-15 @ 00:19:36] | Pricing using wrong security counts/priorities. |
| Fund Ownership | A matching ownership version is created/linked with the Cap Table version; 1:1 described. [2025-08-18 @ 00:07:04] | Mismatched fund holdings and securities. |
| Valuation | Multiple versions, potentially different methods, **same measurement date**. [2025-08-18 @ 00:08:31] | Display summary from wrong version or overwrite alternative scenarios. |

**VERIFY:** Pairing might be a logical constraint rather than literal database relationship; determine whether ownership is always auto-created, what can be edited independently, and which valuation version references which versions of finance/cap table.

## 3. Rollover — documented behavior

Purpose: carry existing company/valuation context from an earlier measurement date into a later date without re-entering all inputs; market-sensitive values may refresh. [2025-08-15 @ 00:48:40; 2025-08-18 @ 00:10:13]

Demonstrated options on August 18:

| Option | Meaning reported in training | Caution |
|---|---|---|
| `keep market data` | Retain original market-data date/data rather than rolling prices to new target date. | Do not call this "keep all financial data"; market data and financial version are separate. |
| `exclude valuation` | New date's valuation section is left empty instead of cloning approaches/results. | Confirm whether approach configuration or all valuation records are excluded. |
| `exclude documents` | Do not carry documents into the new measurement. | Confirm whether this also applies to notes and document links. |

Other reported behavior: the associated fund may also need rollover; some public market values changed materially over time; stale/unrefreshed values appeared yellow and required manual attention during buggy training. [2025-08-15 @ 00:48:40–01:03:28; 2025-08-18 @ 00:13:28]

## 4. Rollover as a suggested command flow (INFER)

```text
Choose source measurement and versions
  → choose target date
  → choose inclusion/market-data options
  → display source/target preview and affected objects
  → validate allowed target (existing measurement? date ordering?)
  → execute backend rollover transaction
  → verify resulting measurement and linked fund/ownership context
  → refresh market data if requested
  → inspect warnings and unresolved calculations
```

Only option semantics and the general carry-forward behavior are **DOC**. Preview, atomicity, collision handling, retries and warning model are **recommendations** requiring backend confirmation.

## 5. Bulk Market Date update is NOT rollover

August 18 demonstrates a mass action that changes market observation data for multiple companies at once without rebuilding measurements or copying valuation data. [2025-08-18 @ 00:24:33–00:32:13]

**Invariant:** A bulk market-price refresh must not accidentally create new Cap Table versions, edit original transaction dates or duplicate financial scenarios. The precise batch scope and rollback behavior are **VERIFY**.

## 6. Regression risks documented in 2025

- Cap Table secondary series could behave as though the primary version were selected. [2025-08-15 @ 00:19:36]
- Changes after version switching were sometimes persisted but not reflected until a full page refresh. [2025-08-15 @ 00:45:58]
- Rollover failed to update some market values automatically and showed values requiring manual repair. [2025-08-15 @ 00:57:30]
- The SSV summary sometimes reset or overwrote figures when switching Cap Table primary/secondary. [2025-08-04 @ 00:05:26]

These are evidence of issues at the **time of training**, not proof they remain present today.

## 7. Test contracts

1. Creating financial version B preserves A and shows different inputs when toggling; data persists after reload.
2. Creating Cap Table B creates/links the correct Fund Ownership B; switching back restores A's holdings.
3. Valuation V2 on same measurement date may have different method set than V1 and does not alter V1.
4. Editing market date refreshes market-derived values and does not alter measurement date.
5. Rollover with `keep market data` preserves previous market date; without it, behavior matches current approved spec.
6. Rollover with `exclude valuation` has no valuation data in the target according to backend contract.
7. Rollover with `exclude documents` does not copy selected document references according to backend contract.
8. Bulk market update operates on selected companies without cloning measurements.
9. If a background/remote update is incomplete, present truthful warning rather than an apparently reconciled number.
