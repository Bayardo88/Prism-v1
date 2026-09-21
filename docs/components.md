# Figma → React traceability

Every component in the Figma components file (`Z4MtKOfkNEzhMYJzN1q3kR`, 88
components across 16 pages) mapped to its React export.

**How the Figma variant matrix becomes props.** Figma models every combination
as a discrete variant — `Button` alone is 225. React collapses that: each Figma
variant *property* becomes a prop, and the interaction states (Hover, Pressed,
Focus) become CSS pseudo-classes rather than props, because the browser already
owns them. So `Button`'s Style × Size × State × Type matrix becomes
`variant` × `size` × `tone` plus `:hover` / `:active` / `:focus-visible`.

Legend: **=** direct mapping · **⊕** several Figma sets merged into one export ·
**＋** added by the code layer, with no Figma counterpart.

---

## 02 · Core (5)

| Figma | Variants | React | File |
|---|---|---|---|
| Divider | Orientation | = `Divider` | `core/Divider.tsx` |
| Link | Size × State | = `Link` | `core/Link.tsx` |
| Tooltip | Position | = `Tooltip` | `core/Tooltip.tsx` |
| Scrim | — | = `Scrim` | `core/Scrim.tsx` |
| Empty State | Type | = `EmptyState` | `core/EmptyState.tsx` |

## 03 · Avatar (1)

| Figma | Variants | React | File |
|---|---|---|---|
| Avatar | Size × With Image | = `Avatar` | `avatar/Avatar.tsx` |

## 04 · Button (3)

| Figma | Variants | React | File |
|---|---|---|---|
| Button | Style × Size × State × Type (225) | = `Button` | `button/Button.tsx` |
| Button_Icon | same matrix (225) | = `ButtonIcon` | `button/ButtonIcon.tsx` |
| AI-Button | — | = `AIButton` | `button/AIButton.tsx` |

## 05 · Chip (1)

| Figma | Variants | React | File |
|---|---|---|---|
| Chip | Style × Size | = `Chip` | `chip/Chip.tsx` |

## 06 · Input (2)

| Figma | Variants | React | File |
|---|---|---|---|
| input | State | = `Input` | `input/Input.tsx` |
| Form Field | State | = `FormField` | `input/FormField.tsx` |

## 07 · Checkbox (2)

| Figma | Variants | React | File |
|---|---|---|---|
| Checkbox Item | Status × Size | = `CheckboxItem` | `checkbox/CheckboxItem.tsx` |
| CheckBox | — | = `Checkbox` | `checkbox/Checkbox.tsx` |

## 08 · Form Controls (6)

| Figma | Variants | React | File |
|---|---|---|---|
| Radio | Status × Size | = `Radio` | `form-controls/Radio.tsx` |
| Switch | State × Size | = `Switch` | `form-controls/Switch.tsx` |
| Select | State | = `Select` | `input/Select.tsx` |
| Textarea | State | = `Textarea` | `input/Textarea.tsx` |
| Calendar Day | State | = `CalendarDay` | `form-controls/CalendarDay.tsx` |
| Date Picker | — | = `DatePicker` | `form-controls/DatePicker.tsx` |

## 09 · Header & Menus (24)

| Figma | Variants | React | File |
|---|---|---|---|
| Primary Menu | — | = `PrimaryMenu` | `header/Chrome.tsx` |
| Main-Menu-horizontal-item | State | = `MainMenuItem` | `header/Chrome.tsx` |
| Secondary Menu | State | = `SecondaryMenu` + `SecondaryMenuItem` | `header/Chrome.tsx` |
| Tertiary Menu | — | = `TertiaryMenu` | `header/Chrome.tsx` |
| Tertiary Menu Item | State | = `TertiaryMenuItem` | `header/Chrome.tsx` |
| Company info | — | = `CompanyInfo` | `header/Chrome.tsx` |
| Submenu Item | State | = `SubmenuItem` | `header/Menus.tsx` |
| Company Dropdown | — | = `CompanyDropdown` | `header/Controls.tsx` |
| Company Dropdown/Default | — | ⊕ `CompanyDropdownPanel` | `header/Menus.tsx` |
| Company Dropdown/Pinned Company | — | ⊕ `CompanyDropdownPanel` (`pinned` entries) | `header/Menus.tsx` |
| Captable sub-menu | State | ⊕ `SectionSubMenu` | `header/Menus.tsx` |
| Valuations sub-menu | State | ⊕ `SectionSubMenu` | `header/Menus.tsx` |
| Filter dropdown | — | = `FilterDropdown` | `header/Controls.tsx` |
| Search bar | — | = `SearchBar` | `header/Controls.tsx` |
| Notification | — | = `Notification` | `header/Controls.tsx` |
| Badge | — | = `Badge` | `header/Controls.tsx` |
| Combo tag | — | = `ComboTag` | `header/Controls.tsx` |
| Currency Selector | — | = `CurrencySelector` | `header/Controls.tsx` |
| Selector | — | = `Selector` | `header/Controls.tsx` |
| Information Label | — | = `InformationLabel` | `header/Controls.tsx` |
| Valuation | State | ⊕ `ToolSwitch` | `header/Controls.tsx` |
| Workboard | State | ⊕ `ToolSwitch` | `header/Controls.tsx` |
| Tool-switch | State | ⊕ `ToolSwitch` | `header/Controls.tsx` |
| AI tool | State | = `AITool` | `header/Controls.tsx` |

**Merges.** `Company Dropdown/Default` and `/Pinned Company` differ only by
whether a pinned group is present, so one component takes `companies` with a
`pinned` flag. `Captable sub-menu` and `Valuations sub-menu` share one token
contract by design "so the two sections navigate identically" — one component
takes the section's items. `Valuation`, `Workboard` and `Tool-switch` are one
control in three pieces; exactly one side is always selected, so a single
`value`/`onChange` pair models it correctly.

## 10 · Navigation (8)

| Figma | Variants | React | File |
|---|---|---|---|
| Tab Item | State | = `TabItem` | `navigation/Tabs.tsx` |
| Tabs | — | = `Tabs` | `navigation/Tabs.tsx` |
| Breadcrumb Item | State | ⊕ `Breadcrumb` (`items[]`) | `navigation/Breadcrumb.tsx` |
| Breadcrumb | — | = `Breadcrumb` | `navigation/Breadcrumb.tsx` |
| Page Item | State | = `PageItem` | `navigation/Pagination.tsx` |
| Pagination | — | = `Pagination` | `navigation/Pagination.tsx` |
| Step | State | = `Step` | `navigation/Stepper.tsx` |
| Stepper | — | = `Stepper` | `navigation/Stepper.tsx` |

## 11 · Table & Cells (9)

| Figma | Variants | React | File |
|---|---|---|---|
| cell | State × Type + 5 booleans (145) | = `Cell` | `table/Cell.tsx` |
| Header | Style + 6 booleans (11) | = `ColumnHeader` | `table/ColumnHeader.tsx` |
| Row-reading | 27 | ⊕ `Row` | `table/Row.tsx` |
| Row-input | 37 | ⊕ `Row` | `table/Row.tsx` |
| Content_Cell | Content | = `ContentCell` | `table/ContentCell.tsx` |
| Ledger | — | = `Ledger` | `table/ContentCell.tsx` |
| Modal_Status | State | = `ModalStatus` | `table/Status.tsx` |
| Valuation Status | State | = `ValuationStatus` | `table/Status.tsx` |
| Footnote | Content | = `Footnote` | `table/Footnote.tsx` |
| — | — | ＋ `DataGrid` | `table/DataGrid.tsx` |

**Merge.** `Row-reading` and `Row-input` have the same anatomy; the reading set
simply suppresses the editing affordances. In code that distinction lives on the
cell (`Cell type="readable"` vs `"input"`), so one `Row` covers both.

**Addition.** Figma has no single grid component — each screen assembles Header,
Rows and Cells itself. `DataGrid` is that assembly, kept in one place so sticky
header behaviour is not re-implemented per page.

## 12 · Charts (6)

| Figma | Variants | React | File |
|---|---|---|---|
| Chart Frame | Grid | = `ChartFrame` | `charts/ChartFrame.tsx` |
| Chart Legend Item | Series 1–8 | = `ChartLegendItem` (+ `ChartLegend`) | `charts/ChartLegend.tsx` |
| Bar Chart | Type | = `BarChart` | `charts/BarChart.tsx` |
| Line Chart | Type | = `LineChart` | `charts/LineChart.tsx` |
| Waterfall Chart | — | = `WaterfallChart` | `charts/WaterfallChart.tsx` |
| Donut Chart | State | = `DonutChart` | `charts/DonutChart.tsx` |

## 13 · Summary Card (2)

| Figma | Variants | React | File |
|---|---|---|---|
| Card | — | = `Card` | `card/Card.tsx` |
| Card_item | — | = `CardItem` | `card/Card.tsx` |

## 14 · Feedback (4)

| Figma | Variants | React | File |
|---|---|---|---|
| Alert | Style | = `Alert` | `feedback/Alert.tsx` |
| Toast | Style × State | = `Toast` (+ ＋`ToastViewport`) | `feedback/Toast.tsx` |
| Progress Bar | Type | = `ProgressBar` | `feedback/ProgressBar.tsx` |
| Skeleton | Type | = `Skeleton` | `feedback/Skeleton.tsx` |

## 15 · Accordion & Drawer (6)

| Figma | Variants | React | File |
|---|---|---|---|
| Accordion Item | State | = `AccordionItem` | `disclosure/Accordion.tsx` |
| Accordion | — | = `Accordion` | `disclosure/Accordion.tsx` |
| Drawer | Side | = `Drawer` | `disclosure/Drawer.tsx` |
| Workspace Drawer | State | = `WorkspaceDrawer` | `disclosure/WorkspaceDrawer.tsx` |
| Workspace Drawer Tab | State | = `WorkspaceDrawerTab` | `disclosure/WorkspaceDrawer.tsx` |
| Data Review Card | State | = `DataReviewCard` | `disclosure/DataReviewCard.tsx` |

## 16 · Modals (4)

| Figma | Variants | React | File |
|---|---|---|---|
| Column Item | State | = `ColumnItem` | `modals/ColumnPicker.tsx` |
| Column Title | State | = `ColumnTitle` | `modals/ColumnPicker.tsx` |
| Search | State | = `ModalSearch` | `modals/ColumnPicker.tsx` |
| Add_Column_Modal | State | ⊕ `Modal` + the three above | `modals/Modal.tsx` |
| — | — | ＋ `Modal` (the reusable shell) | `modals/Modal.tsx` |

**Note.** `Add_Column_Modal` is an assembled screen in Figma, composed from
Column Title, Column Item, Search and Button. In code it is that same
composition — build it from `Modal` plus those three, rather than importing a
one-off. The `Modal` shell is the reusable part and is new in the code layer.

## 17 · Global Search (5)

| Figma | Variants | React | File |
|---|---|---|---|
| Global Search | State | = `GlobalSearch` | `search/GlobalSearch.tsx` |
| Search Result Row | Type × State (27) | = `SearchResultRow` | `search/SearchResultRow.tsx` |
| Search Section Header | Type (9) | = `SearchSectionHeader` | `search/SearchSectionHeader.tsx` |
| Search Scope Chip | Type (5) | = `SearchScopeChip` | `search/SearchScopeChip.tsx` |
| Key Hint | — | = `KeyHint` | `search/KeyHint.tsx` |

## 18 · Template (0 components)

`Page Template · Data Sheet` is an assembled page, not a component. Build it
from `PrimaryMenu`, `CompanyInfo`, `SecondaryMenu`, `TertiaryMenu` and
`DataGrid`.

---

## Added by the code layer

These have no Figma counterpart. They exist because code needs them and
repeating them per page would guarantee drift.

| Export | Why |
|---|---|
| `ScalarProvider` | Carries the colour mode and the type-ramp mode. In Figma these are variable modes set on a frame. |
| `Icon` | Sizing and tint wrapper. Enforces the re-tint that SDS_Main glyphs require. |
| `Typography` / `Heading` / `Text` / `Label` / `Overline` | The type ramp as components. Figma expresses this as 68 text styles. |
| `DataGrid` | The grid shell — sticky header and scroll container. |
| `Modal` | The reusable dialog shell behind `Add_Column_Modal`. |
| `ToastViewport` | The fixed stack toasts render into. |
| `MenuPanel` / `MenuGroupLabel` | The floating surface shared by every dropdown. |
| `cx`, `useControllableState` | Utilities every component needs. |
