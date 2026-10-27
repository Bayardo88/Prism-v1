# Prototype · Product-logic flows

These flows come from the product-logic contract ([`../domain-logic.md`](../domain-logic.md)) and have **no Figma
frame yet**. They live under `apps/product/src/screens/prototypes/`. Each one becomes a real page only after a frame
exists: add the frame, then a route in `routes.ts`, then promote the screen. Every one reads the company's
valuation context (`useValuationContext`) and follows P1–P10.

## Approach tabs — `/prototypes/approach/:companyId/{external-valuation | specified-share-value | public-comps | transaction-comps}`

Opened from the Valuations **External Valuation** and **Specified Share Value** tabs, and from **+ Add approach**
(External valuation, Specified share values, Public comps, Transaction comps).

| Approach | Shows | Never does |
|---|---|---|
| External Valuation | Source, appraisal date, EV and equity value. All four are analyst inputs | Derive an EV → equity bridge |
| Specified Share Value | One price-per-share input per series of the **Cap Table version in view**. Shares are sourced from that version (BUG-04) | Aggregate or dilute: Value reads "Not calculated" |
| Public / Transaction Comps | Provider rows (green, "Provider · market date") apart from manual rows (blue). Missing provider data reads "—". `DataFreshness` shows the market date. Mean / median / percentile choice. Metric weights must total 100% | Compute statistics or multiples: "Not calculated" |

## Rollover — dialog on every company page

Opened from **Add Measurement Date** in the Date menu, the company ⋮ (Financials, Summary) and the valuation ⋮.
You pick a source measurement and a new, later date, then the options *Keep market data*, *Exclude valuation*
and *Exclude documents*. A preview lists what the new measurement starts with. The confirm button reads
"Roll over to <date>". The source is never changed, and an existing date is refused. Rolled valuations restart as
drafts. Unit tested in `domain/model.test.ts`.

## Bulk market-date update — firm Valuations → page actions → Bulk Actions

You pick companies and a date. Only each company's market date moves: no measurement and no version is created
(the dialog says "This is not a rollover"). A positive banner confirms the count and the date.

## Excel Export — company ⋮ and valuation ⋮

You choose *Formulas* or *Values (hard-coded)* and pick pages. The dialog states the exported context: measurement,
market date, all three versions, workflow status and currency. An unpublished version gets a warning. No file is
produced.

## Respondent portal — `/prototypes/respondent-portal/:requestId`

The external contact's page. It is opened from **Preview respondent page** on Information Request. Validate,
upload (per file), submit and confirm are separate steps. In the `confirmation-failed` state the page says the
response *was received* and that it doesn't need to be sent again (BUG-09). Re-submitting reuses the submission id,
so nothing is duplicated (BUG-03). A prototype checkbox simulates the confirmation failure. States: `default`,
`received`, `confirmation-failed`.

## 409A report composer — `/prototypes/report-composer/:companyId`

Opened from the valuation ⋮ → **Compose 409A client report**. You show or hide sections and override displayed
figures. Every override is marked "Override" and sits beside its sourced value, and it **never** writes back to the
valuation (the blocking P0 question). An unpublished source version gets a warning. PDF export is not offered.

## Workspace → Sheets

A scratch grid with its own save state. It says it is not connected to the valuation, and nothing reads it.
