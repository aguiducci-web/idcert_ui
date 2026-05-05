# Plan 6b — Data Display Table

**Status**: Design approved
**Date**: 2026-05-05
**Author**: Andrea Alunni Guiducci
**Target version**: `@idcert/ui` v0.9.0
**Branch**: `feat/data-display-table` (off `main` after Plan 6a v0.8.0)
**Predecessor**: Plan 6a — Data Display Base (`feat/data-display-base`, v0.8.0)

---

## Overview

Plan 6b is the second half of the Data Display category from the master spec. It ships a single component — **Table** — as a pure semantic HTML primitive with 8 styled sub-parts, matching the shadcn/ui Table primitive shape exactly.

After Plan 6b, the Data Display category is fully delivered. Only the Utility category (Plan 7) remains in the master inventory.

**Design choice**: Table is a *headless presentation primitive*. Sorting, row selection, pagination integration, column resizing, and virtualization are NOT implemented internally — consumer apps wire them via their own state or via libraries like TanStack Table. Storybook stories document the canonical composition patterns.

---

## Goals

- Ship a Table compound that consumer apps can copy-paste from shadcn/ui examples without adaptation.
- Keep internal logic to zero — only styling and semantic HTML structure.
- Provide canonical sorting + selection composition patterns in Storybook stories so consumers know how to wire interactivity.
- Reuse all existing dependencies — no new runtime or peer deps.

## Non-goals (out of scope for Plan 6b)

- **Internal sorting logic** — consumer manages sort state and renders sortable headers as `<button>` inside `TableHead`.
- **Internal row selection logic** — consumer manages selected state (Set, Map, or array) and renders Checkboxes inside cells; sets `data-state="selected"` on the relevant `TableRow`.
- **Pagination integration** — consumer wraps Table with our `Pagination` component (from Plan 5a).
- **Column resizing** — consumer applies inline styles or `<col>` widths.
- **Virtualization** (TanStack Virtual, react-window, etc.) — out of scope; consumer integrates if needed.
- **Sticky header** — consumer applies `sticky top-0 bg-background z-10` className to `TableHeader`.
- **TanStack Table integration helpers** — future utility plan, not v0.9.0.
- **CommandPalette / full-featured DataGrid** — separate future components.

---

## Architecture

### Dependencies

**No new dependencies.** Table is pure semantic HTML wrapped with Tailwind utility classes.

### Component layer

| Sub-part | HTML | Custom logic |
|---|---|---|
| `Table` | `<div class="relative w-full overflow-auto">` wrapping `<table class="w-full caption-bottom text-sm">` | Wrapper provides horizontal scroll for tables wider than the container |
| `TableHeader` | `<thead>` | `[&_tr]:border-b` |
| `TableBody` | `<tbody>` | `[&_tr:last-child]:border-0` |
| `TableFooter` | `<tfoot>` | `border-t bg-muted/50 font-medium [&>tr]:last:border-b-0` |
| `TableRow` | `<tr>` | `border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted` |
| `TableHead` | `<th>` | `h-10 px-2 text-left align-middle font-medium text-muted-foreground` |
| `TableCell` | `<td>` | `p-2 align-middle` |
| `TableCaption` | `<caption>` | `mt-4 text-sm text-muted-foreground` |

### Selection styling

`TableRow` reads the `data-state` attribute via Tailwind's `data-[state=selected]:` selector. Consumer sets `data-state="selected"` (or omits the attribute) on the row to toggle the selection background.

```tsx
<TableRow data-state={selectedSet.has(id) ? 'selected' : undefined}>
```

This avoids adding an `active` or `selected` boolean prop that would require cva — consistent with shadcn/ui pattern.

### Wrapper element

The `Table` root component renders an outer `<div>` wrapper plus the inner `<table>`. The wrapper handles horizontal overflow on narrow viewports (`overflow-auto` on the wrapper, full-width table inside). The forwarded ref attaches to the inner `<table>` element so consumers can manipulate the table directly (e.g., for export-to-CSV utilities). Custom className passed to `Table` applies to the inner `<table>` element, not the wrapper.

---

## Component API

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@idcert/ui'

<Table>
  <TableCaption>List of recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell><Badge variant="success">Paid</Badge></TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">€250.00</TableCell>
    </TableRow>
    <TableRow data-state="selected">
      <TableCell className="font-medium">INV002</TableCell>
      <TableCell><Badge variant="warning">Pending</Badge></TableCell>
      <TableCell>Bank Transfer</TableCell>
      <TableCell className="text-right">€150.00</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
      <TableCell className="text-right">€400.00</TableCell>
    </TableRow>
  </TableFooter>
</Table>
```

**8 sub-parts** (all exported):

- `Table` — `<table>` wrapped in scrollable `<div>`. Ref forwards to inner `<table>`. Accepts standard `TableHTMLAttributes<HTMLTableElement>`.
- `TableHeader` — `<thead>`. Accepts standard `HTMLAttributes<HTMLTableSectionElement>`.
- `TableBody` — `<tbody>`. Accepts standard `HTMLAttributes<HTMLTableSectionElement>`.
- `TableFooter` — `<tfoot>`. Accepts standard `HTMLAttributes<HTMLTableSectionElement>`.
- `TableRow` — `<tr>`. Accepts standard `HTMLAttributes<HTMLTableRowElement>`. `data-state="selected"` triggers selection background via CSS.
- `TableHead` — `<th>`. Accepts standard `ThHTMLAttributes<HTMLTableCellElement>`.
- `TableCell` — `<td>`. Accepts standard `TdHTMLAttributes<HTMLTableCellElement>`.
- `TableCaption` — `<caption>`. Accepts standard `HTMLAttributes<HTMLTableCaptionElement>`.

All sub-parts are `forwardRef`'d to their respective DOM element types.

### Sorting composition (consumer-side, documented in story)

```tsx
import { ChevronDown, ChevronUp } from 'lucide-react'

function SortableTable() {
  const [sortKey, setSortKey] = React.useState<'name' | 'amount'>('name')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc')

  const sorted = React.useMemo(() => {
    return [...rows].sort((a, b) => {
      const cmp = a[sortKey] > b[sortKey] ? 1 : -1
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir])

  function toggleSort(key: 'name' | 'amount') {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function SortIcon({ k }: { k: 'name' | 'amount' }) {
    if (sortKey !== k) return null
    return sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              type="button"
              onClick={() => toggleSort('name')}
              className="flex items-center gap-1"
            >
              Name <SortIcon k="name" />
            </button>
          </TableHead>
          <TableHead className="text-right">
            <button
              type="button"
              onClick={() => toggleSort('amount')}
              className="ml-auto flex items-center gap-1"
            >
              Amount <SortIcon k="amount" />
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell className="text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Selection composition (consumer-side, documented in story)

```tsx
import { Checkbox } from '@idcert/ui'

function SelectableTable() {
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === rows.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(rows.map((r) => r.id)))
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={selected.size === rows.length}
              onCheckedChange={toggleAll}
              aria-label="Select all"
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={selected.has(row.id) ? 'selected' : undefined}
          >
            <TableCell>
              <Checkbox
                checked={selected.has(row.id)}
                onCheckedChange={() => toggle(row.id)}
                aria-label={`Select ${row.name}`}
              />
            </TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## File structure

```
packages/ui/src/components/table/
├── table.stories.tsx
├── table.test.tsx
└── index.tsx                       # 8 sub-parts, all forwardRef'd
```

Plus modified:
- `packages/ui/src/index.ts` (barrel re-exports)
- `apps/playground/app/data/page.tsx` (extend the existing data smoke page with a Table section that demonstrates plain rendering, selection state, and sorting state)
- `.changeset/v0.9.0-data-display-table.md` (release note)

**Component conventions** (from earlier plans, repeated):
- `React.forwardRef` on every sub-part.
- Named exports only.
- `cn` from `../../lib/cn.js` for className merging.
- `.js` extension on local imports.
- Storybook category: `'DataDisplay/Table'`.
- Stateful Storybook stories: extract demos with hooks to named function components.

---

## Test scope

Stack unchanged: `vitest` + `@testing-library/react` + `@testing-library/user-event`.

| Component | Tests | Coverage |
|---|---:|---|
| Table | 10 | renders `<table>` inside scrollable wrapper `<div>`, TableHeader renders `<thead>`, TableBody renders `<tbody>`, TableFooter renders `<tfoot>`, TableRow renders `<tr>`, TableRow with `data-state="selected"` applies `bg-muted` selected class, TableHead renders `<th>` with muted-foreground class, TableCell renders `<td>`, TableCaption renders `<caption>`, ref forwarding on Table (forwards to inner `<table>` element, not the wrapper) |

**Plan 6b total**: 10 tests.

**Test setup notes**:
- Tests are pure DOM assertions — no Base UI, no async timing, no portal handling.
- The "renders inside scrollable wrapper" test verifies the parent of the `<table>` is a `<div>` with `overflow-auto` class.
- The "selected state styling" test verifies `bg-muted` class is applied by the Tailwind `data-[state=selected]:bg-muted` selector when the data attribute is set. We assert the class string contains `data-[state=selected]:bg-muted` since runtime CSS isn't computed in jsdom; alternatively, assert the data attribute is present and trust the Tailwind utility resolution.

Coverage target: 100% public API. No visual regression.

---

## Versioning + release

Single changeset `.changeset/v0.9.0-data-display-table.md`:

```markdown
---
'@idcert/ui': minor
---

Add `Table` compound — pure semantic HTML primitive with styled sub-parts. Completes the Data Display category alongside Plan 6a.

Components (`@idcert/ui`):
- `Table` compound — semantic `<table>` wrapped in a scrollable `<div>` for horizontal overflow. 8 sub-parts: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`. Styled to match shadcn/ui Table primitive. `TableRow data-state="selected"` applies selection background — consumer manages selected state.

No internal sorting/selection/pagination logic — consumer composes with own state or third-party library (TanStack Table, etc.). Storybook docs include sortable and selectable composition examples.

No new dependencies.

Out of scope (deferred):
- Internal sorting / selection / pagination logic (use consumer state or external library).
- TanStack Table integration helpers (future utility plan).
- Column resizing, virtualization, sticky header utilities (consumer composes manually).
```

`@idcert/ui` minor 0.8.0 → 0.9.0. `@idcert/tokens` and `@idcert/tailwind-config` do not bump.

After Plan 6b, master spec inventory:

- ✅ Primitives, Layout, Feedback, Form avanzati, Navigation, **Data display**.
- ⬜ Utility (Plan 7) — Toaster (Base UI Toast region) + Portal helper. ThemeProvider already shipped in Plan 1.

---

## Risks and mitigations

- **`<caption>` placement**: HTML spec requires `<caption>` to be the first child of `<table>` (or absent). Stories show it as first child. Consumers who place it elsewhere may see browser warnings; not a runtime error. Documented in stories.
- **Wrapper `<div>` ref forwarding**: ref forwards to the inner `<table>`, not the wrapper. Consumers wanting to scroll the wrapper programmatically can pass their own ref via `wrapperRef` prop in a future iteration; not in v1. Documented.
- **Tailwind `[&_tr]:border-b` arbitrary selector**: requires Tailwind ≥3.0 (we're on 3.4). Verified safe.
- **TableRow selection styling**: relies on `data-[state=selected]:bg-muted`. If the consumer wants a different selected color, they pass a custom `className` with `data-[state=selected]:bg-...`. Tailwind's specificity means later utilities override earlier — order in className matters. Documented in story.
- **Table on small viewports**: the wrapper provides `overflow-auto` for horizontal scroll. The consumer can override the wrapper className via `Table`'s wrapper… actually the wrapper className isn't directly overridable in v1 (className applies to the inner `<table>`). If a consumer needs to style the wrapper, they wrap `Table` themselves or we add a `wrapperClassName` prop in a future iteration. Acceptable v1 trade-off.

---

## Acceptance criteria

- Table component passes `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` from the monorepo root.
- `publint` passes for `@idcert/ui`.
- Storybook builds; `DataDisplay/Table` stories visible (Default, WithFooter, WithCaption, Selectable, Sortable).
- Playground app `apps/playground/app/data/page.tsx` extended with a Table section; manual smoke verifies:
  - Default table renders with headers and rows.
  - Selectable table responds to checkbox clicks (row highlights when selected via `data-state="selected"`).
  - Sortable table re-orders rows on header button click.
  - Horizontal overflow scrolls the wrapper on narrow viewports.
- Changeset added; `pnpm exec changeset status` shows `@idcert/ui` minor bump 0.8.0 → 0.9.0.
- Branch `feat/data-display-table` clean, ~2 commits (Table component + final validation/changeset).
