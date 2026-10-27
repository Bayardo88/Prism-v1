# 05 — Evidence Register and Source Cross-References

## Status

**Analyzed sources:** 13 uploaded `.docx` files with automated Gemini summaries and training-session transcripts, July 21–August 20, 2025. **Unreviewed:** actual screen recordings, live Scalar application, current codebase, live design system, financial model formulas, and the Confluence finance appendix referenced in the training. Some transcripts contain misheard English finance/technical terminology. Use the **date**, **recording timestamp** and **topic** to locate original evidence.

## Source IDs (canonical)

| ID | Date | Exact DOCX basename | Key domains |
|---|---|---|---|
| **S01** | 2025-07-21 | `Training Scalar - 2025_07_21 14_51 CST - Notas de Gemini.docx` | Product intro; firm and funds; login/2FA; roles and flags |
| **S02** | 2025-07-23 | `Training Scalar - 2025_07_23 14_54 CST - Notas de Gemini.docx` | Company; Cap Table; preferred/common series; measurement and investment dates |
| **S03** | 2025-07-25 | `Training Scalar - 2025_07_25 14_57 CST - Notas de Gemini.docx` | Convertible notes; financial grid; historical/projected years; document references |
| **S04** | 2025-07-28 | `Training Scalar - 2025_07_28 13_56 CST - Notas de Gemini.docx` | Fund Ownership; investments; custom holdings; distributions; breakpoints |
| **S05** | 2025-07-30 | `Training Scalar - 2025_07_30 13_55 CST - Notas de Gemini.docx` | Custom breakpoints; ordering; waterfall intervals; weighting and usability |
| **S06** | 2025-08-01 | `Training Scalar - 2025_08_01 13_59 CST - Notas de Gemini.docx` | External Valuation; calibration; public comps; market date; notes |
| **S07** | 2025-08-04 | `Training Scalar - 2025_08_04 14_04 CST - Notas de Gemini.docx` | SSV; transaction comps; comgroups; future exit; model errors |
| **S08** | 2025-08-06 | `Training Scalar - 2025_08_06 13_58 CST - Notas de Gemini.docx` | Backsolve; Waterfall; OPM; calibration; DCF |
| **S09** | 2025-08-08 | `Training Scalar - 2025_08_08 13_51 CST - Notas de Gemini.docx` | Allocation; weights; publication/audit; export formulas |
| **S10** | 2025-08-11 | `Training Scalar - 2025_08_11 13_54 CST - Notas de Gemini.docx` | End-to-end valuation walkthrough with methods and allocation |
| **S11** | 2025-08-15 | `Training Scalar - 2025_08_15 13_57 CST - Notas de Gemini.docx` | Multiversions; rollover; stale UI/other defects; fund investment |
| **S12** | 2025-08-18 | `Training Scalar - 2025_08_18 13_59 CST - Notas de Gemini.docx` | Versions and 1:1 pairing; rollover options; bulk market date; requests/portal |
| **S13** | 2025-08-20 | `Training Scalar - 2025_08_20 14_00 CST - Notas de Gemini.docx` | 409A client dashboard; notes spreadsheet; software overview |

## High-value direct evidence anchors

| Topic | Source anchor | Evidentiary status |
|---|---|---|
| Date constraint for investments | S02 @ 00:12:27; S04 @ 00:12:22 | `DOC` |
| Cap Table securities (preferred/common) | S02 @ 00:10:05–00:19:40 | `DOC` |
| Convertible notes formulas not fully explained | S03 @ 00:00:58–00:05:04 | `DOC` + formula `VERIFY` |
| Annual vs quarterly financial periods; historical/forecast defaults | S03 @ 00:17:38–00:33:57 | `DOC` |
| Fund investment, custom transaction, distributions | S04 @ 00:06:28–00:21:50 | `DOC` |
| Default/custom breakpoints and Waterfall | S05 @ 00:30:57–00:38:44 | `DOC` |
| Calibration immutable, omitted in summary | S06 @ 00:16:18 | `DOC` |
| Public Comps and market-date controls | S06 @ 00:20:30–00:54:33 | `DOC` |
| SSV and Transaction Comps | S07 @ 00:02:48–00:25:36 | `DOC` |
| Backsolve, OPM, DCF | S08 @ 00:18:53–01:12:01 | `DOC` |
| Publish, audit read-only and formula/hardcoded export | S09 @ 00:20:29; 00:49:12 | `DOC` |
| Full valuation and allocation example | S10 @ 00:20:15–00:54:38 | `DOC` |
| Multiple finance/cap table/valuation versions | S11 @ 00:12:39–00:45:58; S12 @ 00:05:00–00:08:31 | `DOC` |
| Rollover and choices | S12 @ 00:10:13–00:14:47 | `DOC` |
| Bulk market-date update | S12 @ 00:24:33–00:32:13 | `DOC` |
| Secure request portal | S12 @ 00:35:51–00:56:10 | `DOC` + `BUG-2025` |
| 409A report visibility & editing | S13 @ 00:24:40–00:43:04 | `DOC` + PDF path `VERIFY` |
| Embedded spreadsheet notes | S13 @ 00:49:51–00:58:09 | `DOC` |

## Aliases and transcription ambiguity

- **"Font Ownership"**, "Fund Ownership" and "fone" appear to refer to the same area; verify UI naming before renaming anything.
- **"waiting"** is generally the speaker's pronunciation/transcription of **weighting**.
- **"Merch date"** is an apparent mis-transcription of **measurement date** in some segments; do not confuse with explicitly named **market date**.
- **"Publics" / "GPC" / "Global Public Company"** and **"Public Comps"** may refer to overlapping comparison workflows; verify exact feature labels/types.
- **"CSE" / "CSB" / "SCB"** are ambiguous transcripts of an allocation method. No canonical enum can be determined.
- **"Excel Sport" / "Exceles por"** describes **Excel Export**.
- **"Bull Action"** probably describes a **Bulk Action**. The change across multiple companies is clear; precise UI label requires video.
- **"Keller"** in the August 20 training may be the software name used in that segment or a transcription artifact; the overall training title is Scalar.

## How to cite new behavior

Use `Source: [Sxx @ hh:mm:ss]` with enough detail that someone can find the scene. If inferred, add `Status: INFER`; if awaiting video, add `Status: VERIFY`. For a conflict, cite both sources and explain which one was approved (if any); don't silently choose.
