# idcert-ui Data Display Table Implementation Plan (Plan 6b of 7)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the `Table` compound to `@idcert/ui`. Pure semantic HTML primitive with 8 styled sub-parts (Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption). No internal sorting / selection / pagination logic — consumer composes those with own state or external library. Plan ends with a `0.9.0` changeset that completes the Data Display category.

**Architecture:** Pure semantic HTML wrapped in Tailwind utility classes. The `Table` root renders a wrapper `<div class="relative w-full overflow-auto">` for horizontal scroll on narrow viewports, plus the inner `<table class="w-full caption-bottom text-sm">`. Other 7 sub-parts are thin `forwardRef`'d wrappers around `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`, `<caption>`. `TableRow` reads `data-state="selected"` for selection background via Tailwind's `data-[state=selected]:` selector — no `selected` boolean prop, matching shadcn/ui convention.

**Tech Stack:** React 18+, TypeScript 5.6+, Tailwind 3.4+, `clsx` + `tailwind-merge` (via `cn`). **No new runtime or peer dependencies.** No Base UI primitive, no `class-variance-authority` (single visual variant).

**Branch:** `feat/data-display-table` (off `main` after Plan 6a v0.8.0 is merged).

**Spec:** `docs/superpowers/specs/2026-05-05-idcert-ui-data-display-table-design.md`
**Main spec:** `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`
**Previous plan:** `docs/superpowers/plans/2026-05-05-idcert-ui-data-display-base.md`

---

## File Structure

Files added during this plan:

```
packages/ui/src/components/table/
├── table.stories.tsx
├── table.test.tsx
└── index.tsx                       # 8 sub-parts: Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption
```

Plus modified:
- `packages/ui/src/index.ts` (barrel re-exports for the new module)
- `apps/playground/app/data/page.tsx` (extend with Table section: plain rendering, selectable, sortable)
- `.changeset/v0.9.0-data-display-table.md` (release note)

**Component conventions** (from earlier plans, repeated for clarity):
- `React.forwardRef` on every sub-part.
- Named exports only.
- `cn` from `../../lib/cn.js` for className merging.
- `.js` extension on local imports (NodeNext + ESM).
- `<name>.test.tsx` and `<name>.stories.tsx` accompany every component.
- Storybook category for data display: `'DataDisplay/<Component>'`.
- Stateful Storybook stories: extract demos with hooks to named function components (avoids `react-hooks/rules-of-hooks` ESLint error).

---

## Task 0: Branch + dependency verification

No new deps. This task creates the branch and verifies the existing toolchain still works.

**Files:**
- Create branch: `feat/data-display-table`

- [ ] **Step 1: Create the data-display-table branch**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
git checkout main
git log --oneline -3
```

Expected: `main` has the Plan 6b spec commit at the top, plus the merged Plan 6a commits.

```bash
git checkout -b feat/data-display-table
git branch --show-current
```

Expected: `feat/data-display-table`.

- [ ] **Step 2: Sanity rebuild + test**

```bash
pnpm install
pnpm --filter @idcert/ui build
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui test
```

All exit 0. Total test count from prior plans: 320.

- [ ] **Step 3: Commit (no-op marker — skip)**

This task adds nothing to commit. Skip the commit. Subsequent tasks add commits.

---

## Task 1: Table compound

Pure semantic HTML compound. 8 sub-parts.

**Files:**
- Create: `packages/ui/src/components/table/table.test.tsx`
- Create: `packages/ui/src/components/table/index.tsx`
- Create: `packages/ui/src/components/table/table.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/table/table.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './index.js'

describe('Table', () => {
  test('Table renders <table> inside scrollable wrapper', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const table = container.querySelector('table')
    expect(table).not.toBeNull()
    const wrapper = table?.parentElement
    expect(wrapper?.tagName).toBe('DIV')
    expect(wrapper).toHaveClass('overflow-auto')
  })

  test('TableHeader renders <thead>', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    )
    expect(container.querySelector('thead')).not.toBeNull()
  })

  test('TableBody renders <tbody>', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(container.querySelector('tbody')).not.toBeNull()
  })

  test('TableFooter renders <tfoot>', () => {
    const { container } = render(
      <Table>
        <TableFooter>
          <TableRow>
            <TableCell>total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    )
    expect(container.querySelector('tfoot')).not.toBeNull()
  })

  test('TableRow renders <tr>', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow data-testid="row">
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByTestId('row').tagName).toBe('TR')
  })

  test('TableRow with data-state="selected" applies selected styling class', () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-state="selected" data-testid="row">
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const row = screen.getByTestId('row')
    expect(row).toHaveAttribute('data-state', 'selected')
    // Tailwind data-[state=selected]:bg-muted is in the class string; runtime CSS not computed in jsdom.
    expect(row.className).toMatch(/data-\[state=selected\]:bg-muted/)
  })

  test('TableHead renders <th> with muted-foreground class', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="head">Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    )
    const head = screen.getByTestId('head')
    expect(head.tagName).toBe('TH')
    expect(head).toHaveClass('text-muted-foreground')
    expect(container.querySelector('th')).not.toBeNull()
  })

  test('TableCell renders <td>', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell data-testid="cell">x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByTestId('cell').tagName).toBe('TD')
  })

  test('TableCaption renders <caption>', () => {
    const { container } = render(
      <Table>
        <TableCaption>List of items</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const caption = container.querySelector('caption')
    expect(caption).not.toBeNull()
    expect(caption).toHaveTextContent('List of items')
  })

  test('forwards ref to inner <table> element (not the wrapper)', () => {
    const ref = React.createRef<HTMLTableElement>()
    render(
      <Table ref={ref}>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('TABLE')
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test table
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/table/index.tsx`:

```tsx
import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type TableProps = React.TableHTMLAttributes<HTMLTableElement>

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  function Table({ className, ...props }, ref) {
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        />
      </div>
    )
  },
)

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader({ className, ...props }, ref) {
    return (
      <thead
        ref={ref}
        className={cn('[&_tr]:border-b', className)}
        {...props}
      />
    )
  },
)

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody({ className, ...props }, ref) {
    return (
      <tbody
        ref={ref}
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
      />
    )
  },
)

export type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  function TableFooter({ className, ...props }, ref) {
    return (
      <tfoot
        ref={ref}
        className={cn(
          'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
          className,
        )}
        {...props}
      />
    )
  },
)

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ className, ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
          className,
        )}
        {...props}
      />
    )
  },
)

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  function TableHead({ className, ...props }, ref) {
    return (
      <th
        ref={ref}
        className={cn(
          'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
          className,
        )}
        {...props}
      />
    )
  },
)

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ className, ...props }, ref) {
    return (
      <td
        ref={ref}
        className={cn(
          'p-2 align-middle [&:has([role=checkbox])]:pr-0',
          className,
        )}
        {...props}
      />
    )
  },
)

export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption({ className, ...props }, ref) {
    return (
      <caption
        ref={ref}
        className={cn('mt-4 text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)
```

Notes:
- `Table` renders an outer `<div>` wrapper plus inner `<table>`. The `ref` forwards to the inner `<table>` (not the wrapper) so consumers can manipulate the table directly.
- `[&:has([role=checkbox])]:pr-0` on `TableHead` and `TableCell` removes right padding when the cell hosts a checkbox — matches shadcn pattern for compact selection columns.
- All sub-parts are pure semantic HTML with `forwardRef`. No `'use client'` directive needed (no hooks, no Base UI), but other components in the codebase mark every file with it for consistency. Skip here to keep the file small — pure HTML is server-safe.

- [ ] **Step 4: Run test, expect 10 passing**

```bash
pnpm --filter @idcert/ui test table
```

Expected: 10/10 pass.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/table/table.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import * as React from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './index.js'
import { Badge } from '../badge/index.js'
import { Checkbox } from '../checkbox/index.js'

const meta = {
  title: 'DataDisplay/Table',
  component: Table,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const sampleRows = [
  { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: 250 },
  { id: 'INV002', status: 'Pending', method: 'Bank Transfer', amount: 150 },
  { id: 'INV003', status: 'Paid', method: 'PayPal', amount: 320 },
  { id: 'INV004', status: 'Failed', method: 'Credit Card', amount: 99 },
] as const

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'Paid' ? 'success' :
    status === 'Pending' ? 'warning' :
    status === 'Failed' ? 'destructive' :
    'secondary'
  return <Badge variant={variant}>{status}</Badge>
}

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleRows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell><StatusBadge status={row.status} /></TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell className="text-right">€{row.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>List of recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleRows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell><StatusBadge status={row.status} /></TableCell>
            <TableCell className="text-right">€{row.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const WithFooter: Story = {
  render: () => {
    const total = sampleRows.reduce((sum, row) => sum + row.amount, 0)
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleRows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.id}</TableCell>
              <TableCell><StatusBadge status={row.status} /></TableCell>
              <TableCell className="text-right">€{row.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell className="text-right">€{total.toFixed(2)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
  },
}

function SelectableDemo() {
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
    if (selected.size === sampleRows.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(sampleRows.map((r) => r.id)))
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={selected.size === sampleRows.length}
              onChange={toggleAll}
              aria-label="Select all"
            />
          </TableHead>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleRows.map((row) => (
          <TableRow
            key={row.id}
            data-state={selected.has(row.id) ? 'selected' : undefined}
          >
            <TableCell>
              <Checkbox
                checked={selected.has(row.id)}
                onChange={() => toggle(row.id)}
                aria-label={`Select ${row.id}`}
              />
            </TableCell>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell><StatusBadge status={row.status} /></TableCell>
            <TableCell className="text-right">€{row.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const Selectable: Story = {
  render: () => <SelectableDemo />,
}

function SortableDemo() {
  const [sortKey, setSortKey] = React.useState<'id' | 'amount'>('id')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc')

  const sorted = React.useMemo(() => {
    return [...sampleRows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = av > bv ? 1 : av < bv ? -1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [sortKey, sortDir])

  function toggleSort(key: 'id' | 'amount') {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function SortIcon({ k }: { k: 'id' | 'amount' }) {
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
              onClick={() => toggleSort('id')}
              className="flex items-center gap-1"
            >
              Invoice <SortIcon k="id" />
            </button>
          </TableHead>
          <TableHead>Status</TableHead>
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
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell><StatusBadge status={row.status} /></TableCell>
            <TableCell className="text-right">€{row.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const Sortable: Story = {
  render: () => <SortableDemo />,
}
```

Notes on the stories:
- `SelectableDemo` and `SortableDemo` are extracted as named function components to satisfy `react-hooks/rules-of-hooks` ESLint rule (Plan 4a/4b/5a/5b precedent).
- `Checkbox` import path is `../checkbox/index.js` — verify the file exists at `packages/ui/src/components/checkbox/index.tsx` and that it accepts `checked` + `onChange` props (or `onCheckedChange` if we changed the API in earlier plans). If the API differs, adapt the stories accordingly. Per Plan 4b's playground note, Switch (and probably Checkbox) is a native input so it uses `onChange={(e) => ...}` in some places. Inspect Checkbox before writing the stories.
- `SortIcon` is a tiny inline helper for the sortable header arrows.

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  type TableProps,
  type TableHeaderProps,
  type TableBodyProps,
  type TableFooterProps,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
  type TableCaptionProps,
} from './components/table/index.js'
```

- [ ] **Step 7: Verify all green**

```bash
pnpm --filter @idcert/ui test
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui lint
pnpm --filter @idcert/ui build
```

All exit 0.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/table packages/ui/src/index.ts
git commit -m "feat(ui): add Table compound (8 sub-parts, semantic HTML)"
```

---

## Task 2: Final validation + v0.9.0 changeset

- [ ] **Step 1: Clean rebuild**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
pnpm clean
pnpm install
pnpm build
```

Expected: 5/5 packages successful. `dist/index.js` and `dist/index.cjs` start with `"use client";`.

```bash
head -3 packages/ui/dist/index.js
```

Expected: first line `"use client";`.

- [ ] **Step 2: Run all gates**

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm exec publint packages/ui
pnpm exec publint packages/tokens
pnpm exec publint packages/tailwind-config
```

All must pass. Total tests target after Plan 6b: 320 + 10 = **330**.

- [ ] **Step 3: Verify Storybook indexes new stories**

```bash
pnpm --filter @idcert/storybook build
```

Expected: build succeeds and indexes 5 new stories under `DataDisplay/Table`: `Default`, `WithCaption`, `WithFooter`, `Selectable`, `Sortable`.

- [ ] **Step 4: Extend playground smoke page**

Edit `apps/playground/app/data/page.tsx`. Add a new section after the existing EmptyState section (just before the closing `</main>`):

```tsx
import {
  // existing imports preserved …
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@idcert/ui'
```

Then add this section before the final `</main>`:

```tsx
<section className="space-y-3">
  <h2 className="text-lg font-semibold">Table</h2>
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
      <TableRow>
        <TableCell className="font-medium">INV003</TableCell>
        <TableCell><Badge variant="success">Paid</Badge></TableCell>
        <TableCell>PayPal</TableCell>
        <TableCell className="text-right">€320.00</TableCell>
      </TableRow>
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={3}>Total</TableCell>
        <TableCell className="text-right">€720.00</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
</section>
```

The pre-selected `INV002` row visually demonstrates `data-state="selected"` styling.

Verify the playground builds:

```bash
pnpm --filter @idcert/playground build
```

Expected: build succeeds, `/data` route still rendered as static.

DO NOT start `pnpm dev` from this task.

- [ ] **Step 5: Add v0.9.0 changeset**

Create `.changeset/v0.9.0-data-display-table.md`:

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

- [ ] **Step 6: Verify changeset status**

```bash
pnpm exec changeset status
```

Expected: `@idcert/ui` minor bump.

- [ ] **Step 7: Final commit**

```bash
git add .changeset/v0.9.0-data-display-table.md apps/playground/app/data/page.tsx
git commit -m "chore: changeset for v0.9.0 (data display table) + playground smoke"
```

- [ ] **Step 8: Final state check**

```bash
git status                                                              # clean
git log --oneline main..feat/data-display-table | wc -l                # 2 commits expected
pnpm test                                                               # all green
```

Expected: working tree clean, 2 commits ahead of main, all gates green.

Commits expected on the branch:
1. Table component
2. v0.9.0 changeset + playground smoke

---

## Self-Review Notes

**Spec coverage:**

- Spec section "Component API / Sub-parts" — Task 1. All 8 sub-parts implemented and exported with their respective HTML element types and `forwardRef` wiring.
- Spec section "Architecture / Wrapper element" — Task 1 implementation. Outer `<div>` for horizontal overflow + inner `<table>`. Ref forwards to inner table.
- Spec section "Architecture / Selection styling" — `TableRow` cva-less className includes `data-[state=selected]:bg-muted`. Test asserts the class string.
- Spec section "Sorting composition" — documented in Storybook story `Sortable` (named function component pattern).
- Spec section "Selection composition" — documented in Storybook story `Selectable`.
- Spec section "File structure" — matches Task 1 file definitions.
- Spec section "Test scope" — Task 1 implements the 10 tests.
- Spec section "Versioning + release" — Task 2.
- Spec section "Risks and mitigations" — addressed inline (caption placement documented in story; ref forwarding to inner table tested directly).

**Placeholder scan:**

- No "TBD", "TODO", "implement later" in plan body.
- One conditional in Task 1 Step 5 ("If the Checkbox API differs, adapt the stories accordingly") — concrete adaptation guidance with reference to existing playground patterns.
- Test count exactly matches spec (10 tests).

**Type consistency:**

- `TableProps`, `TableHeaderProps`, `TableBodyProps`, `TableFooterProps`, `TableRowProps`, `TableHeadProps`, `TableCellProps`, `TableCaptionProps` consistently exported and re-exported via barrel.
- Each `forwardRef` uses the correct `HTMLTableElement` / `HTMLTableSectionElement` / `HTMLTableRowElement` / `HTMLTableCellElement` / `HTMLTableCaptionElement` element types.
- `data-state="selected"` attribute handled via CSS selector — no boolean prop, no cva, consistent with shadcn/ui.

**Risks tracked from spec:**

- `<caption>` placement — documented in spec, story shows it as first child.
- Wrapper `<div>` ref forwarding — ref forwards to inner `<table>`, tested directly in Task 1 Step 1 final test.
- Tailwind arbitrary selector `[&_tr]:border-b` — Tailwind 3.4 supported, verified.
- Selection styling override — consumers can pass custom `className` with their own `data-[state=selected]:` utility; standard className merging handles it.
- Wrapper className not directly overridable — accepted v1 trade-off; documented in spec.
