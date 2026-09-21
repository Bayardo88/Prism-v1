# Screen archetypes

Six shapes cover nearly every Scalar screen. Pick one, then compose it from the
components listed. Each entry ends with the traps specific to that shape.

---

## `data-sheet` — a dense grid of figures

The core Scalar screen: a cap table, a waterfall, an assumptions sheet.

**Chrome:** `PrimaryMenu` → `CompanyInfo` → `SecondaryMenu` → `TertiaryMenu`
**Body:** `DataGrid` with `ColumnHeader` in `head`, then `Row` + `Cell`
**Furniture:** `Footnote`, `ModalStatus`, `ValuationStatus`, `Ledger`, `Pagination`

```tsx
<DataGrid
  label="Cap table"
  head={<>
    <ColumnHeader style={{ flex: 2 }}>Security</ColumnHeader>
    <ColumnHeader numeric style={{ flex: 1 }}>Shares</ColumnHeader>
  </>}
>
  <Row>
    <Cell style={{ flex: 2 }}>Series A Preferred</Cell>
    <Cell numeric type="data" style={{ flex: 1 }}>1,000,000</Cell>
  </Row>
  <Row type="total">
    <Cell state="total" style={{ flex: 2 }}>Total</Cell>
    <Cell state="total" numeric style={{ flex: 1 }}>1,000,000</Cell>
  </Row>
</DataGrid>
```

**Traps**

- `Cell type` states *where the number came from*: `readable` for a plain
  figure, `input` for something editable, `data` for a value pulled from a
  source. Getting this wrong misreports provenance, which matters in a
  valuation product.
- Every money column takes `numeric` — it right-aligns and applies tabular
  figures. Without it, digits jitter between rows.
- Column widths are yours (`flex` or fixed), but the header and its body cells
  must use the **same** values or the grid shears.
- Grid furniture is the one place `Button size="s"` and the 24px dense target
  are allowed. Never carry that exception into the rest of the page.

---

## `dashboard` — an overview of many things

**Chrome:** `PrimaryMenu` → `SecondaryMenu`
**Body:** a grid of `Card` + `CardItem`, plus charts
**Furniture:** `Chip`, `Badge`, `Alert`

**Traps**

- A `Card` is a surface, not a button. If the whole card navigates, it still
  needs a named action inside it.
- `CardItem` trend direction never rests on colour — the arrow and the sign
  carry it.
- Charts: legend mandatory at 2+ series, direct labels at 3+. See
  AI-GUIDE §7 and the CVD gap.
- Resist filling the page. A dashboard that shows everything ranks nothing.

---

## `detail` — one object, in depth

A single valuation, company or document.

**Chrome:** `PrimaryMenu` → `CompanyInfo` → `SecondaryMenu` → `Breadcrumb`
**Body:** `Tabs` for peer views, `Accordion` for secondary detail, `Card` for summary
**Edit:** `Drawer` (page stays visible) or `Modal` (full attention)

**Traps**

- `Tabs` are for peer views of one thing. Steps in a process are `Stepper`;
  paging records is `Pagination`.
- The last `Breadcrumb` item is where the user already is — not a link.
- Never hide anything required to finish the task inside a collapsed
  `AccordionItem`.

---

## `form` — ask for input

**Body:** `FormField` wrapping `Input` / `Select` / `Textarea`; `Checkbox`,
`Radio`, `Switch`, `DatePicker`
**Actions:** `Button` pair, primary action last in the DOM

**Traps**

- Always `FormField`, never a bare `Input`. The label is permanent — a
  placeholder standing in for one disappears exactly when it is needed.
- Error text says what is wrong **and how to fix it**. "Invalid" is not a
  message.
- `Switch` only when the change applies immediately. If it needs Save, it is a
  `Checkbox`.
- Above ~7 options use `Select`; below that `Radio` shows every choice at once.
- A far-off date is typed, not clicked to. Pair `DatePicker` with a text field.

---

## `list-search` — find something among many

**Body:** `ModalSearch` or `SearchBar`, `FilterDropdown`, `Chip` for active
filters, `DataGrid` or a row list, `Pagination`
**Global:** `GlobalSearch` for the cross-entity command palette

**Traps**

- `GlobalSearch` is not a page filter. It crosses firms, companies, documents
  and versions; a filter narrows one list.
- In `GlobalSearch`, scope is a **stack** — Tab pushes, Backspace pops. Never
  show more than three chips.
- Result rows are coloured by **PRISM type only**, and the badge must match the
  tint. A row tinted Company carrying a Document badge states something false.
- `FilterDropdown` shows the value in force, not the filter's name.
- Empty results are an `EmptyState type="no-results"` that offers the way out.

---

## `empty-or-error` — nothing to show, or something broke

**Body:** `EmptyState`, `Alert`, `Skeleton`

**Traps**

- `no-data` is first-run and offers the action that fills it. `no-results`
  follows a search and offers the way out. `error` explains what failed and
  offers a retry.
- Write guidance, not apology. "Something went wrong" is not an error state.
- `Skeleton` must match the layout it replaces, or the page jumps when real
  content lands. Under 300ms show nothing at all.
- Inline and persistent is `Alert`; transient and floating is `Toast`. If the
  user must act, it is an `Alert`.

---

## Composing the chrome

Every product screen shares the same top. Three tiers is the limit — a fourth
level belongs in the page body.

```tsx
<ScalarProvider mode="system" viewport="auto">
  <PrimaryMenu
    logo={<ScalarMark />}
    end={<><SearchBar /><Notification unread /><Avatar size="s" initials="BV" /></>}
  >
    <MainMenuItem current>Companies</MainMenuItem>
    <MainMenuItem>Valuations</MainMenuItem>
  </PrimaryMenu>

  <CompanyInfo
    avatar={<Avatar size="s" initials="AC" />}
    name="Acme Inc."
    meta="ACME · Software"
    status={<ValuationStatus state="in-service" />}
  />

  <SecondaryMenu>
    <SecondaryMenuItem current>Overview</SecondaryMenuItem>
    <SecondaryMenuItem>Cap table</SecondaryMenuItem>
  </SecondaryMenu>

  <main className="scalar-page">{/* archetype body */}</main>
</ScalarProvider>
```
