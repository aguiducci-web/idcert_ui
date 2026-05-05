# idcert-ui Navigation Base Implementation Plan (Plan 5a of 6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new components to `@idcert/ui` (Tabs, Breadcrumb, Pagination, DropdownMenu). Tabs and DropdownMenu wrap Base UI primitives; Breadcrumb is pure semantic HTML; Pagination is custom with an exported `getPaginationRange` helper. Plan ends with a `0.6.0` changeset.

**Architecture:** Tabs and DropdownMenu wrap Base UI 1.4.1 (`@base-ui/react/tabs`, `@base-ui/react/menu`) — no new runtime deps. Tabs exposes `default` (underline) and `pills` (rounded segment) variants via `cva` plus an internal `TabsVariantContext`. DropdownMenu exposes 12 sub-parts mirroring Base UI Menu; CheckboxItem and RadioItem use Base UI's dedicated `CheckboxItemIndicator` / `RadioItemIndicator` parts (not a generic `ItemIndicator`). Breadcrumb is `<nav><ol><li>` with `BreadcrumbLink asChild` via `@radix-ui/react-slot`. Pagination renders a smart range (prev / 1 / … / current ± siblingCount / … / N / next) using our existing `Button` component for visuals.

**Tech Stack:** React 18+, TypeScript 5.6+, Tailwind 3.4+ + `tailwindcss-animate`, `@base-ui/react` 1.4.1 (Tabs, Menu), `class-variance-authority`, `clsx` + `tailwind-merge`, `lucide-react`, `@radix-ui/react-slot`. **No new runtime or peer dependencies.**

**Branch:** `feat/navigation-base` (off `main` after Plan 4b v0.5.0 + Plan 4b integration fixes are merged).

**Spec:** `docs/superpowers/specs/2026-05-05-idcert-ui-navigation-base-design.md`
**Main spec:** `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`
**Previous plan:** `docs/superpowers/plans/2026-05-05-idcert-ui-forms-advanced.md`

---

## File Structure

Files added during this plan:

```
packages/ui/src/components/
├── tabs/
│   ├── tabs.stories.tsx
│   ├── tabs.test.tsx
│   └── index.tsx                       # Tabs, TabsList, TabsTrigger, TabsContent + TabsVariantContext
├── breadcrumb/
│   ├── breadcrumb.stories.tsx
│   ├── breadcrumb.test.tsx
│   └── index.tsx                       # Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis
├── pagination/
│   ├── pagination.stories.tsx
│   ├── pagination.test.tsx
│   └── index.tsx                       # Pagination + getPaginationRange helper
└── dropdown-menu/
    ├── dropdown-menu.stories.tsx
    ├── dropdown-menu.test.tsx
    └── index.tsx                       # 12 sub-parts wrapping Base UI Menu
```

Plus modified:
- `packages/ui/src/index.ts` (barrel re-exports for the 4 new modules)
- `apps/playground/app/navigation/page.tsx` (new smoke page)
- `.changeset/v0.6.0-navigation-base.md` (release note)

**Component conventions** (from Plans 1–4b, repeated for clarity):
- Single file per component (compound components export sub-parts from same `index.tsx`).
- `'use client'` first line for any component using Base UI, browser APIs, or React state hooks. Pure semantic HTML components (`Breadcrumb`) don't need it but adding it costs nothing.
- `React.forwardRef` where the component renders a single DOM element with a public ref.
- Named exports only.
- cva for variants when more than one visual variant exists.
- Stories accompany every component (`<name>.stories.tsx`).
- Tests cover: render, key prop application, primary interaction, ARIA, ref forwarding.
- `.js` extension on local imports (NodeNext + ESM config).
- Storybook category for navigation: `'Navigation/<Component>'`.
- Stateful Storybook stories: extract demos with hooks to named function components (avoids `react-hooks/rules-of-hooks` ESLint error on lowercase `render: () => { ... }`).

---

## Task 0: Branch + dependency verification

No new deps. This task only creates the branch and verifies the existing toolchain still works.

**Files:**
- Create branch: `feat/navigation-base`

- [ ] **Step 1: Create the navigation-base branch**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
git checkout main
git log --oneline -3
```

Expected: `main` has the Plan 5a spec commit at the top, plus the merged Plan 4b commits (`8c35d3c chore(playground): serialize File metadata in forms smoke output`, etc.).

```bash
git checkout -b feat/navigation-base
git branch --show-current
```

Expected: `feat/navigation-base`.

- [ ] **Step 2: Verify Base UI Tabs and Menu parts are available**

```bash
cat node_modules/.pnpm/@base-ui+react@1.4.1*/node_modules/@base-ui/react/tabs/index.parts.d.ts
```

Expected output should include `Root`, `Tab`, `Indicator`, `Panel`, `List`.

```bash
cat node_modules/.pnpm/@base-ui+react@1.4.1*/node_modules/@base-ui/react/menu/index.parts.d.ts
```

Expected output should include `Root`, `Trigger`, `Portal`, `Positioner`, `Popup`, `Item`, `Group`, `GroupLabel`, `Separator`, `CheckboxItem`, `CheckboxItemIndicator`, `RadioGroup`, `RadioItem`, `RadioItemIndicator`, `SubmenuRoot`, `SubmenuTrigger`.

If any part name differs in your installed version, document it as a deviation and adapt the wrappers accordingly during the relevant component task.

- [ ] **Step 3: Sanity rebuild + test**

```bash
pnpm install
pnpm --filter @idcert/ui build
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui test
```

All exit 0. Total test count from prior plans: 192.

- [ ] **Step 4: Commit (no-op marker for branch start)**

This task adds nothing to commit — the branch creation alone is the marker. Skip the commit. Subsequent tasks add commits.

If you prefer a marker commit (some workflows do), create an empty commit:

```bash
git commit --allow-empty -m "chore(ui): start navigation-base branch (no new deps)"
```

This is optional. The plan does NOT require it; later tasks won't depend on it. Default: skip.

---

## Component Task Pattern

Tasks 1–4 each follow the same shape:

1. Write the failing test (`<name>.test.tsx`)
2. Run test, verify it fails with module-not-found
3. Implement the component (`<name>/index.tsx`)
4. Run tests, verify all pass
5. Add the Storybook story (`<name>.stories.tsx`)
6. Update `packages/ui/src/index.ts` to re-export the new component(s)
7. Run typecheck + lint + build
8. Commit (single commit per component for clean history)

Order: Tabs (simplest Base UI wrapper) → Breadcrumb (pure HTML) → Pagination (helper + component) → DropdownMenu (heaviest, 12 sub-parts).

---

## Task 1: Tabs component

Wraps Base UI `Tabs.*`. Exposes 4 sub-parts. cva variants `default` (underline) + `pills` (rounded segment). Variant propagated via internal `TabsVariantContext`.

**Files:**
- Create: `packages/ui/src/components/tabs/tabs.test.tsx`
- Create: `packages/ui/src/components/tabs/index.tsx`
- Create: `packages/ui/src/components/tabs/tabs.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/tabs/tabs.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from './index.js'

function renderTabs(props?: {
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills'
}) {
  return render(
    <Tabs defaultValue="account" {...props}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="locked" disabled>Locked</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account body</TabsContent>
      <TabsContent value="password">Password body</TabsContent>
      <TabsContent value="locked">Locked body</TabsContent>
    </Tabs>,
  )
}

describe('Tabs', () => {
  test('renders triggers and the active panel', () => {
    renderTabs()
    expect(screen.getByRole('tab', { name: 'Account' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Password' })).toBeInTheDocument()
    expect(screen.getByText('Account body')).toBeInTheDocument()
  })

  test('clicking a trigger switches the active panel', async () => {
    const user = userEvent.setup()
    renderTabs()
    await user.click(screen.getByRole('tab', { name: 'Password' }))
    expect(screen.getByText('Password body')).toBeInTheDocument()
  })

  test('controlled mode reflects the passed value', () => {
    renderTabs({ value: 'password' })
    expect(screen.getByText('Password body')).toBeInTheDocument()
  })

  test('controlled onValueChange fires on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderTabs({ value: 'account', onValueChange: onChange })
    await user.click(screen.getByRole('tab', { name: 'Password' }))
    expect(onChange).toHaveBeenCalledWith('password', expect.anything())
  })

  test('vertical orientation applies orientation attr to the list', () => {
    renderTabs({ orientation: 'vertical' })
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
  })

  test('default variant applies underline classes to the list', () => {
    renderTabs({ variant: 'default' })
    expect(screen.getByRole('tablist')).toHaveClass('border-b')
  })

  test('pills variant applies rounded segment classes to the list', () => {
    renderTabs({ variant: 'pills' })
    expect(screen.getByRole('tablist')).toHaveClass('bg-muted')
  })

  test('disabled trigger does not switch panel on click', async () => {
    const user = userEvent.setup()
    renderTabs()
    const lockedTrigger = screen.getByRole('tab', { name: 'Locked' })
    expect(lockedTrigger).toBeDisabled()
    await user.click(lockedTrigger)
    expect(screen.getByText('Account body')).toBeInTheDocument()
  })

  test('forwards ref to TabsTrigger', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger ref={ref} value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A body</TabsContent>
      </Tabs>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test tabs --run
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/tabs/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

type TabsVariant = 'default' | 'pills'

const TabsVariantContext = React.createContext<TabsVariant>('default')

export type TabsProps = React.ComponentProps<typeof BaseTabs.Root> & {
  variant?: TabsVariant
}

export function Tabs({ variant = 'default', children, ...props }: TabsProps): React.JSX.Element {
  return (
    <TabsVariantContext.Provider value={variant}>
      <BaseTabs.Root {...props}>{children}</BaseTabs.Root>
    </TabsVariantContext.Provider>
  )
}

const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      default: 'h-10 w-full justify-start border-b border-border',
      pills: 'h-10 justify-start rounded-md bg-muted p-1',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type TabsListProps = React.ComponentProps<typeof BaseTabs.List>

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ className, ...props }, ref) {
    const variant = React.useContext(TabsVariantContext)
    return (
      <BaseTabs.List
        ref={ref}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    )
  },
)

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'h-10 px-3 -mb-px border-b-2 border-transparent text-muted-foreground hover:text-foreground data-[selected]:border-primary data-[selected]:text-foreground',
        pills:
          'h-8 rounded-sm px-3 text-muted-foreground data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type TabsTriggerProps = React.ComponentProps<typeof BaseTabs.Tab> &
  VariantProps<typeof tabsTriggerVariants>

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ className, ...props }, ref) {
    const variant = React.useContext(TabsVariantContext)
    return (
      <BaseTabs.Tab
        ref={ref}
        className={cn(tabsTriggerVariants({ variant }), className)}
        {...props}
      />
    )
  },
)

export type TabsContentProps = React.ComponentProps<typeof BaseTabs.Panel>

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ className, ...props }, ref) {
    return (
      <BaseTabs.Panel
        ref={ref}
        className={cn(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
        {...props}
      />
    )
  },
)
```

Notes:
- Base UI Tabs uses `data-selected` (not `data-state="active"`) on the active tab. cva conditional `data-[selected]:` reflects that.
- `Tabs` is NOT `forwardRef` — it's a context provider wrapping `BaseTabs.Root`. If a consumer needs the root ref, they can wrap their own ref in `BaseTabs.Root` directly via the props pass-through. Most consumers don't need this.
- `orientation` is a Base UI prop and passes through automatically.

- [ ] **Step 4: Run test, expect 9 passing**

```bash
pnpm --filter @idcert/ui test tabs --run
```

Expected: all 9 tests pass. If `data-[selected]` mismatches the actual Base UI 1.4.1 attribute, inspect the DOM in jsdom and adapt; document deviation.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/tabs/tabs.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './index.js'

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Manage your account.</TabsContent>
      <TabsContent value="password">Change your password.</TabsContent>
      <TabsContent value="notifications">Notification settings.</TabsContent>
    </Tabs>
  ),
}

export const Pills: Story = {
  render: () => (
    <Tabs defaultValue="grid" variant="pills" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="grid">Grid</TabsTrigger>
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="kanban">Kanban</TabsTrigger>
      </TabsList>
      <TabsContent value="grid">Grid view.</TabsContent>
      <TabsContent value="list">List view.</TabsContent>
      <TabsContent value="kanban">Kanban board.</TabsContent>
    </Tabs>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="general" orientation="vertical" className="flex w-[500px] gap-4">
      <TabsList className="flex-col items-stretch h-auto w-40 border-b-0 border-r border-border">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="general">General settings.</TabsContent>
        <TabsContent value="profile">Profile settings.</TabsContent>
        <TabsContent value="security">Security settings.</TabsContent>
      </div>
    </Tabs>
  ),
}

function ControlledDemo() {
  const [v, setV] = React.useState('a')
  return (
    <div className="space-y-2">
      <Tabs value={v} onValueChange={(next) => setV(String(next))} className="w-[400px]">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
        <TabsContent value="c">Panel C</TabsContent>
      </Tabs>
      <div className="text-sm text-muted-foreground">Active: {v}</div>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
} from './components/tabs/index.js'
```

- [ ] **Step 7: Verify all green**

```bash
pnpm --filter @idcert/ui test
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui lint
pnpm --filter @idcert/ui build
```

All exit 0. `dist/index.js` first line still `"use client";`.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/tabs packages/ui/src/index.ts
git commit -m "feat(ui): add Tabs compound (Base UI) with default + pills variants"
```

---

## Task 2: Breadcrumb component

Pure semantic HTML. 7 sub-parts. `BreadcrumbLink asChild` via `@radix-ui/react-slot`.

**Files:**
- Create: `packages/ui/src/components/breadcrumb/breadcrumb.test.tsx`
- Create: `packages/ui/src/components/breadcrumb/index.tsx`
- Create: `packages/ui/src/components/breadcrumb/breadcrumb.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/breadcrumb/breadcrumb.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './index.js'

describe('Breadcrumb', () => {
  test('renders a <nav> with aria-label="breadcrumb"', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb')
  })

  test('BreadcrumbList renders an <ol>', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList data-testid="list">
          <BreadcrumbItem>
            <BreadcrumbPage>x</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(container.querySelector('ol')).not.toBeNull()
  })

  test('BreadcrumbItem renders an <li>', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>x</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const items = container.querySelectorAll('li')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  test('BreadcrumbLink renders an <a> with href', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toHaveAttribute('href', '/docs')
  })

  test('BreadcrumbLink with asChild renders the custom child element', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a href="/custom" data-testid="custom-link">Custom</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const link = screen.getByTestId('custom-link')
    expect(link).toHaveAttribute('href', '/custom')
    expect(link).toHaveTextContent('Custom')
  })

  test('BreadcrumbPage has aria-current="page"', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const page = screen.getByText('Current')
    expect(page).toHaveAttribute('aria-current', 'page')
  })

  test('BreadcrumbSeparator renders a default ChevronRight icon', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator data-testid="sep" />
          <BreadcrumbItem>
            <BreadcrumbPage>x</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const sep = screen.getByTestId('sep')
    expect(sep).toHaveAttribute('aria-hidden', 'true')
    expect(sep.querySelector('svg')).not.toBeNull()
  })

  test('BreadcrumbEllipsis renders MoreHorizontal icon', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbEllipsis data-testid="ellipsis" />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const ellipsis = screen.getByTestId('ellipsis')
    expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
    expect(ellipsis.querySelector('svg')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test breadcrumb --run
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/breadcrumb/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type BreadcrumbProps = React.HTMLAttributes<HTMLElement>

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb({ className, ...props }, ref) {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn(className)}
        {...props}
      />
    )
  },
)

export type BreadcrumbListProps = React.OlHTMLAttributes<HTMLOListElement>

export const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  function BreadcrumbList({ className, ...props }, ref) {
    return (
      <ol
        ref={ref}
        className={cn(
          'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
          className,
        )}
        {...props}
      />
    )
  },
)

export type BreadcrumbItemProps = React.LiHTMLAttributes<HTMLLIElement>

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ className, ...props }, ref) {
    return (
      <li
        ref={ref}
        className={cn('inline-flex items-center gap-1.5', className)}
        {...props}
      />
    )
  },
)

export type BreadcrumbLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  asChild?: boolean
}

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ className, asChild, ...props }, ref) {
    const Comp = asChild ? Slot : 'a'
    return (
      <Comp
        ref={ref}
        className={cn('transition-colors hover:text-foreground', className)}
        {...props}
      />
    )
  },
)

export type BreadcrumbPageProps = React.HTMLAttributes<HTMLSpanElement>

export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  function BreadcrumbPage({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn('font-normal text-foreground', className)}
        {...props}
      />
    )
  },
)

export type BreadcrumbSeparatorProps = React.LiHTMLAttributes<HTMLLIElement>

export const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  function BreadcrumbSeparator({ className, children, ...props }, ref) {
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('[&>svg]:h-3.5 [&>svg]:w-3.5', className)}
        {...props}
      >
        {children ?? <ChevronRight />}
      </li>
    )
  },
)

export type BreadcrumbEllipsisProps = React.HTMLAttributes<HTMLSpanElement>

export const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  function BreadcrumbEllipsis({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('flex h-9 w-9 items-center justify-center', className)}
        {...props}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More</span>
      </span>
    )
  },
)
```

Notes:
- `BreadcrumbPage` uses `role="link"` + `aria-disabled="true"` + `aria-current="page"` per shadcn's pattern (announces as a non-navigable link representing the current page).
- `BreadcrumbSeparator` uses `role="presentation"` and accepts custom `children` to override the default chevron.
- `BreadcrumbLink asChild` swaps `<a>` for Radix `Slot`, which clones the child and merges props (used to embed Next.js `<Link>`).

- [ ] **Step 4: Run test, expect 8 passing**

```bash
pnpm --filter @idcert/ui test breadcrumb --run
```

- [ ] **Step 5: Story**

Create `packages/ui/src/components/breadcrumb/breadcrumb.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Slash } from 'lucide-react'
import * as React from 'react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './index.js'

const meta = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Components</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
}

export const WithEllipsis: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs/components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Button</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
}

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Current</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
}

export const AsChildLink: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <a href="/" data-app-link="home">
              Home (custom)
            </a>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Current</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  type BreadcrumbProps,
  type BreadcrumbListProps,
  type BreadcrumbItemProps,
  type BreadcrumbLinkProps,
  type BreadcrumbPageProps,
  type BreadcrumbSeparatorProps,
  type BreadcrumbEllipsisProps,
} from './components/breadcrumb/index.js'
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
git add packages/ui/src/components/breadcrumb packages/ui/src/index.ts
git commit -m "feat(ui): add Breadcrumb compound (semantic HTML + asChild slot)"
```

---

## Task 3: Pagination component

Smart data-driven component. Renders prev / 1 … current ± siblingCount … N / next. Exports `getPaginationRange` helper.

**Files:**
- Create: `packages/ui/src/components/pagination/pagination.test.tsx`
- Create: `packages/ui/src/components/pagination/index.tsx`
- Create: `packages/ui/src/components/pagination/pagination.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/pagination/pagination.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import { Pagination, getPaginationRange } from './index.js'

describe('getPaginationRange', () => {
  test('returns all pages when totalPages <= 7 (no ellipsis)', () => {
    expect(getPaginationRange(3, 5, 1)).toEqual([1, 2, 3, 4, 5])
    expect(getPaginationRange(1, 7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  test('currentPage near start: no left ellipsis', () => {
    expect(getPaginationRange(2, 20, 1)).toEqual([1, 2, 3, 4, 5, 'ellipsis-right', 20])
  })

  test('currentPage near end: no right ellipsis', () => {
    expect(getPaginationRange(19, 20, 1)).toEqual([1, 'ellipsis-left', 16, 17, 18, 19, 20])
  })

  test('middle currentPage: both ellipsis', () => {
    expect(getPaginationRange(10, 20, 1)).toEqual([
      1,
      'ellipsis-left',
      9,
      10,
      11,
      'ellipsis-right',
      20,
    ])
  })

  test('siblingCount=0 returns minimal range', () => {
    expect(getPaginationRange(10, 20, 0)).toEqual([
      1,
      'ellipsis-left',
      10,
      'ellipsis-right',
      20,
    ])
  })
})

describe('Pagination', () => {
  test('renders prev, next, and page number buttons', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
  })

  test('clicking a page number fires onPageChange with that page', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '3' }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  test('clicking prev fires onPageChange with currentPage-1', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /previous page/i }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  test('clicking next fires onPageChange with currentPage+1', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /next page/i }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  test('prev disabled when currentPage=1', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
  })

  test('next disabled when currentPage=totalPages', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
  })

  test('current page button has data-active="true"', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('data-active', 'true')
  })

  test('ellipsis renders inside the pagination', () => {
    render(<Pagination currentPage={10} totalPages={20} onPageChange={() => {}} />)
    const items = screen.getAllByRole('presentation')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  test('showPrevNext={false} hides prev/next buttons', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={() => {}}
        showPrevNext={false}
      />,
    )
    expect(screen.queryByRole('button', { name: /previous page/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next page/i })).not.toBeInTheDocument()
  })

  test('aria-label defaults to "Pagination" on the nav', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />,
    )
    const nav = container.querySelector('nav')
    expect(nav).toHaveAttribute('aria-label', 'Pagination')
  })

  test('forwards ref to the nav element', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <Pagination
        ref={ref}
        currentPage={1}
        totalPages={3}
        onPageChange={() => {}}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.tagName).toBe('NAV')
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test pagination --run
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/pagination/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type PaginationRangeItem = number | 'ellipsis-left' | 'ellipsis-right'

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PaginationRangeItem[] {
  const totalShown = siblingCount * 2 + 5

  if (totalPages <= totalShown) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1)
  const rightSibling = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  const items: PaginationRangeItem[] = []

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + siblingCount * 2
    const left = Array.from({ length: leftCount }, (_, i) => i + 1)
    items.push(...left, 'ellipsis-right', totalPages)
    return items
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + siblingCount * 2
    const right = Array.from(
      { length: rightCount },
      (_, i) => totalPages - rightCount + i + 1,
    )
    items.push(1, 'ellipsis-left', ...right)
    return items
  }

  // both ellipsis
  const middle = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  )
  items.push(1, 'ellipsis-left', ...middle, 'ellipsis-right', totalPages)
  return items
}

export type PaginationProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'onChange'
> & {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
  showPrevNext?: boolean
  'aria-label'?: string
}

const buttonBase =
  'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const inactiveButton = 'text-foreground hover:bg-accent hover:text-accent-foreground'
const activeButton = 'bg-primary text-primary-foreground hover:bg-primary'
const iconButton =
  'inline-flex h-9 items-center justify-center gap-1 rounded-md px-2.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      currentPage,
      totalPages,
      onPageChange,
      siblingCount = 1,
      showPrevNext = true,
      className,
      'aria-label': ariaLabel = 'Pagination',
      ...props
    },
    ref,
  ) {
    const range = getPaginationRange(currentPage, totalPages, siblingCount)
    const isFirst = currentPage <= 1
    const isLast = currentPage >= totalPages

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={cn('mx-auto flex w-full justify-center', className)}
        {...props}
      >
        <ul className="flex flex-row items-center gap-1">
          {showPrevNext && (
            <li>
              <button
                type="button"
                aria-label="Previous page"
                disabled={isFirst}
                onClick={() => onPageChange(currentPage - 1)}
                className={iconButton}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            </li>
          )}
          {range.map((item, index) => {
            if (item === 'ellipsis-left' || item === 'ellipsis-right') {
              return (
                <li
                  key={`${item}-${index}`}
                  role="presentation"
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More pages</span>
                </li>
              )
            }
            const isActive = item === currentPage
            return (
              <li key={item}>
                <button
                  type="button"
                  aria-label={`Page ${item}`}
                  aria-current={isActive ? 'page' : undefined}
                  data-active={isActive || undefined}
                  onClick={() => onPageChange(item)}
                  className={cn(buttonBase, isActive ? activeButton : inactiveButton)}
                >
                  {item}
                </button>
              </li>
            )
          })}
          {showPrevNext && (
            <li>
              <button
                type="button"
                aria-label="Next page"
                disabled={isLast}
                onClick={() => onPageChange(currentPage + 1)}
                className={iconButton}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </li>
          )}
        </ul>
      </nav>
    )
  },
)
```

Notes:
- The page-number button uses `aria-label={\`Page ${item}\`}` AND text content `{item}`. The test uses `getByRole('button', { name: '2' })` — testing-library's accessible name includes text content when no `aria-label` overrides it; here `aria-label` of "Page 2" overrides the text. The test uses exact string `'2'` to match by text-only access; if the test fails because `aria-label` shadows text, change the assertion to `name: /Page 2/` or use `getByText('2', { selector: 'button' })`.
- `data-active` data attribute is the test hook for the active state.
- `currentPage` is clamped at the boundaries via `disabled` on prev/next; the helper returns valid range.

If a test fails because `getByRole('button', { name: '2' })` doesn't match because of `aria-label="Page 2"`, adapt the assertion in the test before committing — or remove the `aria-label` on page-number buttons and rely on text content alone (test-driven choice; either is acceptable). Document the choice.

- [ ] **Step 4: Run test, expect 16 passing (5 helper + 11 component)**

Total tests in this file: 5 (helper) + 11 (component) = 16. The Plan 5a spec said "~12" — actual is 16 because helper sub-tests are counted individually by vitest.

```bash
pnpm --filter @idcert/ui test pagination --run
```

Expected: 16/16 pass.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/pagination/pagination.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Pagination } from './index.js'

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

function ControlledDemo({ totalPages = 20, siblingCount = 1 }: { totalPages?: number; siblingCount?: number }) {
  const [page, setPage] = React.useState(5)
  return (
    <div className="space-y-2">
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        siblingCount={siblingCount}
      />
      <div className="text-center text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => <ControlledDemo />,
}

export const Short: Story = {
  render: () => <ControlledDemo totalPages={5} />,
}

export const Long: Story = {
  render: () => <ControlledDemo totalPages={100} />,
}

export const SiblingCountZero: Story = {
  render: () => <ControlledDemo totalPages={50} siblingCount={0} />,
}

export const NoPrevNext: Story = {
  render: () => {
    function Inner() {
      const [page, setPage] = React.useState(1)
      return (
        <Pagination
          currentPage={page}
          totalPages={5}
          onPageChange={setPage}
          showPrevNext={false}
        />
      )
    }
    return <Inner />
  },
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  Pagination,
  getPaginationRange,
  type PaginationProps,
  type PaginationRangeItem,
} from './components/pagination/index.js'
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
git add packages/ui/src/components/pagination packages/ui/src/index.ts
git commit -m "feat(ui): add Pagination (smart data-driven + getPaginationRange helper)"
```

---

## Task 4: DropdownMenu compound (12 sub-parts)

Heaviest of the four. Wraps Base UI Menu. CheckboxItem and RadioItem use Base UI's dedicated `CheckboxItemIndicator` / `RadioItemIndicator` parts (verified during Task 0 step 2).

**Files:**
- Create: `packages/ui/src/components/dropdown-menu/dropdown-menu.test.tsx`
- Create: `packages/ui/src/components/dropdown-menu/index.tsx`
- Create: `packages/ui/src/components/dropdown-menu/dropdown-menu.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/dropdown-menu/dropdown-menu.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './index.js'

async function openMenu(user: ReturnType<typeof userEvent.setup>, name: RegExp | string) {
  await user.click(screen.getByRole('button', { name }))
  await waitFor(() => {
    expect(
      screen.getByRole('menu') ||
        screen.getAllByRole('menuitem').length > 0,
    ).toBeTruthy()
  })
}

describe('DropdownMenu', () => {
  test('renders the trigger', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  test('opens menu on trigger click', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    expect(await screen.findByText('Profile')).toBeInTheDocument()
  })

  test('clicking an Item closes the menu', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    const item = await screen.findByText('Profile')
    await user.click(item)
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    })
  })

  test('disabled Item does not fire onSelect', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={onSelect}>Disabled</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    const item = await screen.findByText('Disabled')
    await user.click(item)
    expect(onSelect).not.toHaveBeenCalled()
  })

  test('Separator renders', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>B</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    expect(await screen.findByRole('separator')).toBeInTheDocument()
  })

  test('Label renders text', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    expect(await screen.findByText('My Account')).toBeInTheDocument()
  })

  test('Group renders', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>Grouped</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    await waitFor(() => {
      expect(screen.getByText('Grouped')).toBeInTheDocument()
    })
    expect(container.querySelector('[role="group"]')).not.toBeNull()
  })

  test('CheckboxItem toggles checked state via onCheckedChange', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Notifications
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    await user.click(await screen.findByText('Notifications'))
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything())
  })

  test('checked CheckboxItem renders Check indicator', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    const item = await screen.findByText('Checked')
    const itemRow = item.closest('[role="menuitemcheckbox"]')!
    expect(itemRow.querySelector('svg')).not.toBeNull()
  })

  test('RadioGroup mutual exclusion via onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="a" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    await user.click(await screen.findByText('B'))
    expect(onValueChange).toHaveBeenCalledWith('b', expect.anything())
  })

  test('SubTrigger renders trailing chevron', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    const subTrigger = await screen.findByText('Share')
    const triggerRow = subTrigger.closest('[role="menuitem"]')!
    expect(triggerRow.querySelector('svg')).not.toBeNull()
  })

  test('Sub opens submenu on hover-equivalent click', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await openMenu(user, 'Open')
    await user.click(await screen.findByText('Share'))
    await waitFor(() => {
      expect(screen.getByText('Copy link')).toBeInTheDocument()
    })
  })

  test('asChild trigger composes with another component', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button data-testid="custom-trigger">Custom</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const trigger = screen.getByTestId('custom-trigger')
    await user.click(trigger)
    expect(await screen.findByText('Profile')).toBeInTheDocument()
  })

  test('forwards ref to DropdownMenuTrigger', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger ref={ref}>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
```

If async tests time out, apply Plan 4b's lesson: do NOT use `vi.useFakeTimers()` without `{ toFake: ['Date'] }` — Base UI popups hang otherwise. The default real-timer setup in this test file should work; if it doesn't, switch to controlled-open assertions only.

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test dropdown-menu --run
```

Expected: import error.

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/dropdown-menu/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type DropdownMenuProps = React.ComponentProps<typeof BaseMenu.Root>

export function DropdownMenu(props: DropdownMenuProps): React.JSX.Element {
  return <BaseMenu.Root {...props} />
}

export type DropdownMenuTriggerProps = Omit<
  React.ComponentProps<typeof BaseMenu.Trigger>,
  'render'
> & {
  asChild?: boolean
}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ asChild, children, ...props }, ref) {
    if (asChild && React.isValidElement(children)) {
      return (
        <BaseMenu.Trigger
          ref={ref as never}
          render={children as React.ReactElement}
          {...(props as Record<string, unknown>)}
        />
      )
    }
    return (
      <BaseMenu.Trigger ref={ref as never} {...props}>
        {children}
      </BaseMenu.Trigger>
    )
  },
)

const popupClassName = cn(
  'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-background p-1 text-foreground shadow-md',
  'data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0',
  'data-[closed]:zoom-out-95 data-[open]:zoom-in-95',
)

export type DropdownMenuContentProps = React.ComponentProps<typeof BaseMenu.Popup> & {
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
}

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent({ className, children, sideOffset = 4, align, ...props }, ref) {
    return (
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={sideOffset} align={align} className="outline-none">
          <BaseMenu.Popup ref={ref} className={cn(popupClassName, className)} {...props}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    )
  },
)

const itemClassName = cn(
  'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
  'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
)

export type DropdownMenuItemProps = React.ComponentProps<typeof BaseMenu.Item>

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  function DropdownMenuItem({ className, ...props }, ref) {
    return (
      <BaseMenu.Item ref={ref} className={cn(itemClassName, className)} {...props} />
    )
  },
)

export type DropdownMenuGroupProps = React.ComponentProps<typeof BaseMenu.Group>

export const DropdownMenuGroup = React.forwardRef<HTMLDivElement, DropdownMenuGroupProps>(
  function DropdownMenuGroup(props, ref) {
    return <BaseMenu.Group ref={ref} {...props} />
  },
)

export type DropdownMenuLabelProps = React.ComponentProps<typeof BaseMenu.GroupLabel>

export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  function DropdownMenuLabel({ className, ...props }, ref) {
    return (
      <BaseMenu.GroupLabel
        ref={ref}
        className={cn('px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground', className)}
        {...props}
      />
    )
  },
)

export type DropdownMenuSeparatorProps = React.ComponentProps<typeof BaseMenu.Separator>

export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  function DropdownMenuSeparator({ className, ...props }, ref) {
    return (
      <BaseMenu.Separator
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-border', className)}
        {...props}
      />
    )
  },
)

export type DropdownMenuCheckboxItemProps = React.ComponentProps<typeof BaseMenu.CheckboxItem>

export const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
    return (
      <BaseMenu.CheckboxItem
        ref={ref}
        className={cn(
          itemClassName,
          'pl-8',
          className,
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <BaseMenu.CheckboxItemIndicator>
            <Check aria-hidden="true" className="h-4 w-4" />
          </BaseMenu.CheckboxItemIndicator>
        </span>
        {children}
      </BaseMenu.CheckboxItem>
    )
  },
)

export type DropdownMenuRadioGroupProps = React.ComponentProps<typeof BaseMenu.RadioGroup>

export function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps): React.JSX.Element {
  return <BaseMenu.RadioGroup {...props} />
}

export type DropdownMenuRadioItemProps = React.ComponentProps<typeof BaseMenu.RadioItem>

export const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  function DropdownMenuRadioItem({ className, children, ...props }, ref) {
    return (
      <BaseMenu.RadioItem
        ref={ref}
        className={cn(
          itemClassName,
          'pl-8',
          className,
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <BaseMenu.RadioItemIndicator>
            <Circle aria-hidden="true" className="h-2 w-2 fill-current" />
          </BaseMenu.RadioItemIndicator>
        </span>
        {children}
      </BaseMenu.RadioItem>
    )
  },
)

export type DropdownMenuSubProps = React.ComponentProps<typeof BaseMenu.SubmenuRoot>

export function DropdownMenuSub(props: DropdownMenuSubProps): React.JSX.Element {
  return <BaseMenu.SubmenuRoot {...props} />
}

export type DropdownMenuSubTriggerProps = React.ComponentProps<typeof BaseMenu.SubmenuTrigger>

export const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  function DropdownMenuSubTrigger({ className, children, ...props }, ref) {
    return (
      <BaseMenu.SubmenuTrigger
        ref={ref}
        className={cn(itemClassName, className)}
        {...props}
      >
        {children}
        <ChevronRight aria-hidden="true" className="ml-auto h-4 w-4" />
      </BaseMenu.SubmenuTrigger>
    )
  },
)

export type DropdownMenuSubContentProps = React.ComponentProps<typeof BaseMenu.Popup> & {
  sideOffset?: number
}

export const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  function DropdownMenuSubContent({ className, children, sideOffset = 4, ...props }, ref) {
    return (
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={sideOffset} className="outline-none">
          <BaseMenu.Popup ref={ref} className={cn(popupClassName, className)} {...props}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    )
  },
)
```

Notes:
- `DropdownMenuTrigger asChild` translates to Base UI `render={children}` only when `asChild` is true and `children` is a single React element. Otherwise wraps `children` directly inside `BaseMenu.Trigger`.
- CheckboxItem and RadioItem use the dedicated indicators (`CheckboxItemIndicator`, `RadioItemIndicator`) — Base UI 1.4 does NOT have a generic `Menu.ItemIndicator`.
- `Sub` opens via Base UI's default behavior: hover or click on `SubmenuTrigger`. Tests rely on click for jsdom determinism.
- If `BaseMenu.GroupLabel` styling expects to be inside a `BaseMenu.Group`, document and either always wrap or update tests accordingly.

- [ ] **Step 4: Run test, expect 14 passing**

```bash
pnpm --filter @idcert/ui test dropdown-menu --run
```

If any test fails because Base UI 1.4 emits different roles or attributes (e.g. `menuitemcheckbox` with different ARIA structure), inspect actual rendered DOM and adapt the test queries; document any deviation in the commit message.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/dropdown-menu/dropdown-menu.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Navigation/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Disabled item</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

function CheckboxDemo() {
  const [showStatusBar, setShowStatusBar] = React.useState(true)
  const [showActivityBar, setShowActivityBar] = React.useState(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showStatusBar}
          onCheckedChange={setShowStatusBar}
        >
          Status bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showActivityBar}
          onCheckedChange={setShowActivityBar}
        >
          Activity bar
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const WithCheckboxItems: Story = {
  render: () => <CheckboxDemo />,
}

function RadioDemo() {
  const [view, setView] = React.useState('grid')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View: {view}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={view} onValueChange={(v) => setView(String(v))}>
          <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="kanban">Kanban</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const WithRadioGroup: Story = {
  render: () => <RadioDemo />,
}

export const WithSubmenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>New file</DropdownMenuItem>
        <DropdownMenuItem>Open file</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Embed</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Exit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const FullExample: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Account menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  type DropdownMenuProps,
  type DropdownMenuTriggerProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuGroupProps,
  type DropdownMenuLabelProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuRadioGroupProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuSubProps,
  type DropdownMenuSubTriggerProps,
  type DropdownMenuSubContentProps,
} from './components/dropdown-menu/index.js'
```

- [ ] **Step 7: Verify all green**

```bash
pnpm --filter @idcert/ui test
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui lint
pnpm --filter @idcert/ui build
```

All exit 0. `dist/index.js` first line still `"use client";`.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/dropdown-menu packages/ui/src/index.ts
git commit -m "feat(ui): add DropdownMenu compound (12 sub-parts, Base UI Menu)"
```

---

## Task 5: Final validation + v0.6.0 changeset

- [ ] **Step 1: Clean rebuild**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
pnpm clean
pnpm install
pnpm build
```

Expected: 5/5 packages successful. `dist/index.js` and `dist/index.cjs` start with `"use client";`. `@base-ui/react/tabs` and `@base-ui/react/menu` import paths preserved as externals.

```bash
head -3 packages/ui/dist/index.js
```

Expected: first line `"use client";`. Bundle size grows by ~10–15 KB from new wrappers (acceptable for 4 components).

- [ ] **Step 2: Run all gates**

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm exec publint packages/ui
pnpm exec publint packages/tokens
pnpm exec publint packages/tailwind-config
```

All must pass. Total test count target after Plan 5a:

| Source                       | Tests |
|------------------------------|------:|
| Plans 1+2 + Plan 3 + Plan 4a | 153   |
| Plan 4a Slider scalar        | +2    |
| Plan 4b Tasks 1–5            | +39   |
| Plan 5a Tabs                 | +9    |
| Plan 5a Breadcrumb           | +8    |
| Plan 5a Pagination           | +16   |
| Plan 5a DropdownMenu         | +14   |
| **Total target**             | **~241** |

Record actual count.

- [ ] **Step 3: Verify Storybook indexes new stories**

```bash
pnpm --filter @idcert/storybook build
```

Expected: build succeeds and indexes 4 new stories: `Navigation/Tabs`, `Navigation/Breadcrumb`, `Navigation/Pagination`, `Navigation/DropdownMenu`.

- [ ] **Step 4: Create playground smoke page**

Create `apps/playground/app/navigation/page.tsx`:

```tsx
'use client'

import * as React from 'react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  Pagination,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@idcert/ui'

export default function NavigationPage() {
  const [page, setPage] = React.useState(5)
  const [view, setView] = React.useState('grid')
  const [statusBar, setStatusBar] = React.useState(true)

  return (
    <main className="mx-auto max-w-3xl space-y-12 p-8">
      <h1 className="text-2xl font-semibold">Navigation smoke test</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Breadcrumb</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Components</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tabs (default + pills)</h2>
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="account">Manage your account.</TabsContent>
          <TabsContent value="password">Change your password.</TabsContent>
          <TabsContent value="notifications">Notification settings.</TabsContent>
        </Tabs>

        <Tabs defaultValue="grid" variant="pills" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>
          <TabsContent value="grid">Grid view.</TabsContent>
          <TabsContent value="list">List view.</TabsContent>
          <TabsContent value="kanban">Kanban board.</TabsContent>
        </Tabs>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">DropdownMenu (full features)</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Account menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={statusBar}
              onCheckedChange={setStatusBar}
            >
              Show status bar
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>View</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={view} onValueChange={(v) => setView(String(v))}>
              <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem>Email</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Pagination</h2>
        <Pagination
          currentPage={page}
          totalPages={20}
          onPageChange={setPage}
          siblingCount={1}
        />
        <div className="text-center text-sm text-muted-foreground">
          Page {page} of 20
        </div>
      </section>
    </main>
  )
}
```

Verify the playground builds:

```bash
pnpm --filter @idcert/playground build
```

Expected: build succeeds, route `/navigation` rendered as static.

- [ ] **Step 5: Add v0.6.0 changeset**

Create `.changeset/v0.6.0-navigation-base.md`:

```markdown
---
'@idcert/ui': minor
---

Add 4 new components in the Navigation category (first half — second half is Plan 5b: Navbar + Sidebar).

Components (`@idcert/ui`):
- `Tabs` compound — Base UI Tabs wrapper. Sub-parts: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. cva variants: `default` (underline) and `pills` (rounded segment). Horizontal and vertical orientation.
- `DropdownMenu` compound — Base UI Menu wrapper. 12 sub-parts: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`. `asChild` prop on `DropdownMenuTrigger`. CheckboxItem and RadioItem use Base UI's dedicated `CheckboxItemIndicator` / `RadioItemIndicator` parts (not a generic `ItemIndicator`).
- `Breadcrumb` compound — semantic HTML (`<nav><ol><li>`). 7 sub-parts: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`. `BreadcrumbLink asChild` for Next.js Link integration.
- `Pagination` — smart data-driven component with auto range calculation. Props: `currentPage`, `totalPages`, `onPageChange`, `siblingCount`, `showPrevNext`. Helper `getPaginationRange` exported for advanced custom layouts.

No new dependencies.

Out of scope (deferred):
- Navbar + Sidebar → Plan 5b layout shells.
- Tabs underline+boxed variants, animated indicator, lazy mount panels.
- DropdownMenuShortcut display, ContextMenu, CommandPalette.
- Pagination items-per-page selector, route integration, jump-to-page input.
```

- [ ] **Step 6: Verify changeset status**

```bash
pnpm exec changeset status
```

Expected: `@idcert/ui` minor bump.

- [ ] **Step 7: Final commit**

```bash
git add .changeset/v0.6.0-navigation-base.md apps/playground/app/navigation/page.tsx
git commit -m "chore: changeset for v0.6.0 (navigation base) + playground smoke"
```

- [ ] **Step 8: Final state check**

```bash
git status                                                          # clean
git log --oneline main..feat/navigation-base | wc -l               # ~5-6 commits expected
pnpm test                                                           # all green
```

Expected: working tree clean, ~5-6 commits ahead of main, all gates green.

Commits expected on the branch (no Task 0 commit since it was a no-op):
1. Tabs
2. Breadcrumb
3. Pagination
4. DropdownMenu
5. v0.6.0 changeset + playground smoke

---

## Self-Review Notes

**Spec coverage:**

- Spec section "Component APIs / 1. Tabs" — covered in Task 1. 4 sub-parts, default + pills variants, horizontal + vertical orientation, variant context propagation.
- Spec section "Component APIs / 2. DropdownMenu (12 sub-parts)" — covered in Task 4. All 12 sub-parts implemented and exported. CheckboxItemIndicator + RadioItemIndicator (not generic ItemIndicator) per Base UI 1.4.1 verified API.
- Spec section "Component APIs / 3. Breadcrumb (7 sub-parts)" — covered in Task 2. Pure semantic HTML, BreadcrumbLink asChild via @radix-ui/react-slot.
- Spec section "Component APIs / 4. Pagination (smart data-driven)" — covered in Task 3. Helper export + smart component.
- Spec section "Architecture / Internal `TabsVariantContext`" — covered in Task 1.
- Spec section "Architecture / `getPaginationRange` algorithm" — covered in Task 3 with 5 unit tests.
- Spec section "File structure" — matches Task definitions.
- Spec section "Test scope" — Tabs 9, Breadcrumb 8, Pagination 16 (5 helper + 11 component, slightly above the spec's "12" because helper sub-tests count individually), DropdownMenu 14. Total Plan 5a: 47 tests. Spec target was ~43 — actual is slightly above due to helper unit tests being counted separately.
- Spec section "Versioning + release" — covered in Task 5.
- Spec section "Risks and mitigations" — addressed inline in component task notes (Base UI Menu sub-part naming, CheckboxItem/RadioItem indicator usage, asChild translation, variant context fallback).

**Placeholder scan:**

- No "TBD", "TODO", "implement later" in plan body.
- Test count discrepancy with spec: spec said ~43, plan has 47 — documented in Task 5 Step 2 reconciliation table.
- One conditional in Task 1 ("If `data-[selected]` mismatches the actual Base UI 1.4.1 attribute") — concrete next step (inspect DOM, adapt cva). Not a blocker.
- One conditional in Task 4 ("If any test fails because Base UI 1.4 emits different roles") — concrete adaptation guidance.
- One conditional in Task 5 Step 1 (bundle size estimate) — informational, not a placeholder.

**Type consistency:**

- `TabsVariant` type ('default' | 'pills') consistent across Tabs context, TabsList variants, TabsTrigger variants.
- `PaginationRangeItem` union type defined in Task 3, used in Pagination component, exported from barrel.
- `getPaginationRange` signature `(currentPage: number, totalPages: number, siblingCount?: number) => PaginationRangeItem[]` consistent across helper, tests, and exposed export.
- `DropdownMenuTriggerProps['asChild']` consistent between component implementation, test, and story usage.
- `BreadcrumbLinkProps['asChild']` consistent.
- All sub-part types exported from each module's `index.tsx` and re-exported via barrel.

**Risks tracked from spec:**

- Base UI Menu sub-part naming → addressed in Task 0 Step 2 verification.
- Base UI Menu composite list → confirmed not required (Menu has no `Menu.List` part).
- DropdownMenu `asChild` translation → covered in Task 4 implementation with `render={children}` fallback.
- Tabs variant context → fallback to `'default'` if missing, no throw.
- Pagination range edge cases → 5 helper unit tests cover them.
- Breadcrumb + Next.js Link → @radix-ui/react-slot already used elsewhere; pattern consistent.
- DropdownMenu trigger inside FormControl → documented as not-supported, fallback is `asChild` Button pattern.
