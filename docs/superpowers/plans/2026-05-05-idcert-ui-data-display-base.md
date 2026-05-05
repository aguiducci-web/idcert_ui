# idcert-ui Data Display Base Implementation Plan (Plan 6a of 7)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6 new components to `@idcert/ui` (Badge, Skeleton, List, EmptyState, Progress, Avatar). Six lightweight presentational primitives covering badges, skeleton loaders, simple lists, empty-state placeholders, linear progress bars, and user avatars (with grouping). Plan ends with a `0.8.0` changeset. Plan 6b will land Table separately.

**Architecture:** Badge, Skeleton, List, ListItem, and the EmptyState compound are pure semantic HTML with `cva` variants where useful. Progress wraps Base UI 1.4.1 `Progress.*` (Root + Track + Indicator), encapsulated in a single public `Progress` component with no exposed sub-parts. Avatar wraps Base UI 1.4.1 `Avatar.*` (Root + Image + Fallback) with cva size variants; AvatarGroup is a custom layout helper that stacks children horizontally with negative margin and ring offset, and truncates with a `+N` overflow fallback.

**Tech Stack:** React 18+, TypeScript 5.6+, Tailwind 3.4+, `@base-ui/react` 1.4.1 (Avatar, Progress), `class-variance-authority`, `clsx` + `tailwind-merge`, `lucide-react`. **No new runtime or peer dependencies.**

**Branch:** `feat/data-display-base` (off `main` after Plan 5b v0.7.0 is merged).

**Spec:** `docs/superpowers/specs/2026-05-05-idcert-ui-data-display-base-design.md`
**Main spec:** `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`
**Previous plan:** `docs/superpowers/plans/2026-05-05-idcert-ui-navigation-shells.md`

---

## File Structure

Files added during this plan:

```
packages/ui/src/components/
├── badge/
│   ├── badge.stories.tsx
│   ├── badge.test.tsx
│   └── index.tsx                       # Badge + cva 6 variants + badgeVariants
├── skeleton/
│   ├── skeleton.stories.tsx
│   ├── skeleton.test.tsx
│   └── index.tsx                       # Skeleton (single component)
├── list/
│   ├── list.stories.tsx
│   ├── list.test.tsx
│   └── index.tsx                       # List + ListItem (divider opt-in)
├── empty-state/
│   ├── empty-state.stories.tsx
│   ├── empty-state.test.tsx
│   └── index.tsx                       # 5 sub-parts (Root/Icon/Title/Description/Action)
├── progress/
│   ├── progress.stories.tsx
│   ├── progress.test.tsx
│   └── index.tsx                       # Progress (Base UI wrap, encapsulated)
└── avatar/
    ├── avatar.stories.tsx
    ├── avatar.test.tsx
    └── index.tsx                       # Avatar + AvatarImage + AvatarFallback + AvatarGroup + avatarVariants
```

Plus modified:
- `packages/ui/src/index.ts` (barrel re-exports for the 6 new modules)
- `apps/playground/app/data/page.tsx` (new — smoke page)
- `.changeset/v0.8.0-data-display-base.md` (release note)

**Component conventions** (from earlier plans, repeated for clarity):
- `'use client'` first line for any component using Base UI or React state hooks. Pure HTML components don't strictly need it but adding it costs nothing and keeps the package consistent.
- `React.forwardRef` on components that render a single DOM element with a public ref.
- Named exports only.
- cva for variants when more than one visual variant exists.
- `<name>.test.tsx` and `<name>.stories.tsx` accompany every component.
- `.js` extension on local imports (NodeNext + ESM).
- Storybook category for data display: `'DataDisplay/<Component>'`.
- Stateful Storybook stories: extract demos with hooks to named function components (avoids `react-hooks/rules-of-hooks` ESLint).

---

## Task 0: Branch + dependency verification

No new deps. This task creates the branch and verifies the existing toolchain still works.

**Files:**
- Create branch: `feat/data-display-base`

- [ ] **Step 1: Create the data-display-base branch**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
git checkout main
git log --oneline -3
```

Expected: `main` has the Plan 6a spec commit at the top, plus the merged Plan 5b commits.

```bash
git checkout -b feat/data-display-base
git branch --show-current
```

Expected: `feat/data-display-base`.

- [ ] **Step 2: Verify Base UI Avatar and Progress parts available**

```bash
cat node_modules/.pnpm/@base-ui+react@1.4.1*/node_modules/@base-ui/react/avatar/index.parts.d.ts
```

Expected output should include `Root`, `Image`, `Fallback`.

```bash
cat node_modules/.pnpm/@base-ui+react@1.4.1*/node_modules/@base-ui/react/progress/index.parts.d.ts
```

Expected output should include `Root`, `Track`, `Indicator`, `Value`, `Label`.

If any part name differs, document it as a deviation and adapt the wrappers.

- [ ] **Step 3: Sanity rebuild + test**

```bash
pnpm install
pnpm --filter @idcert/ui build
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui test
```

All exit 0. Total test count from prior plans: 278.

- [ ] **Step 4: Commit (no-op marker — skip)**

This task adds nothing to commit. Skip the commit. Subsequent tasks add commits.

---

## Component Task Pattern

Tasks 1–6 each follow the same shape:

1. Write the failing test (`<name>.test.tsx`)
2. Run test, verify it fails with module-not-found
3. Implement the component (`<name>/index.tsx`)
4. Run tests, verify all pass
5. Add the Storybook story (`<name>.stories.tsx`)
6. Update `packages/ui/src/index.ts` to re-export the new component(s)
7. Run typecheck + lint + build
8. Commit (single commit per component for clean history)

Order by complexity: Badge → Skeleton → List → EmptyState → Progress → Avatar.

---

## Task 1: Badge component

Pure HTML `<span>` with cva 6 variants. Simplest component in the plan.

**Files:**
- Create: `packages/ui/src/components/badge/badge.test.tsx`
- Create: `packages/ui/src/components/badge/index.tsx`
- Create: `packages/ui/src/components/badge/badge.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/badge/badge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { Badge } from './index.js'

describe('Badge', () => {
  test('renders with text content', () => {
    render(<Badge>Hello</Badge>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  test('default variant applies bg-primary class', () => {
    render(<Badge data-testid="b">x</Badge>)
    expect(screen.getByTestId('b')).toHaveClass('bg-primary')
  })

  test.each([
    ['secondary', 'bg-secondary'],
    ['destructive', 'bg-destructive'],
    ['outline', 'text-foreground'],
    ['success', 'bg-green-500'],
    ['warning', 'bg-yellow-500'],
  ] as const)('variant %s applies expected class %s', (variant, expectedClass) => {
    render(
      <Badge variant={variant} data-testid="b">x</Badge>,
    )
    expect(screen.getByTestId('b')).toHaveClass(expectedClass)
  })

  test('merges custom className', () => {
    render(<Badge className="custom-class" data-testid="b">x</Badge>)
    expect(screen.getByTestId('b')).toHaveClass('custom-class')
  })

  test('forwards ref', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(<Badge ref={ref}>x</Badge>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test badge
```

Expected: import error.

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/badge/index.tsx`:

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-500 text-white',
        warning: 'border-transparent bg-yellow-500 text-yellow-950',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge({ className, variant, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  },
)

export { badgeVariants }
```

- [ ] **Step 4: Run test, expect 8 passing**

```bash
pnpm --filter @idcert/ui test badge
```

Expected: 8/8 (1 default + 5 parametrized variants + 1 className + 1 ref).

- [ ] **Step 5: Story**

Create `packages/ui/src/components/badge/badge.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './index.js'

const meta = {
  title: 'DataDisplay/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: 'Default' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Beta' } }
export const Destructive: Story = { args: { variant: 'destructive', children: 'Error' } }
export const Outline: Story = { args: { variant: 'outline', children: 'Outlined' } }
export const Success: Story = { args: { variant: 'success', children: 'Active' } }
export const Warning: Story = { args: { variant: 'warning', children: 'Pending' } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export { Badge, badgeVariants, type BadgeProps } from './components/badge/index.js'
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
git add packages/ui/src/components/badge packages/ui/src/index.ts
git commit -m "feat(ui): add Badge component with 6 cva variants"
```

---

## Task 2: Skeleton component

Single-element styled `<div>` with `animate-pulse`. Smallest component in the plan.

**Files:**
- Create: `packages/ui/src/components/skeleton/skeleton.test.tsx`
- Create: `packages/ui/src/components/skeleton/index.tsx`
- Create: `packages/ui/src/components/skeleton/skeleton.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/skeleton/skeleton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { Skeleton } from './index.js'

describe('Skeleton', () => {
  test('renders a div', () => {
    render(<Skeleton data-testid="s" />)
    expect(screen.getByTestId('s').tagName).toBe('DIV')
  })

  test('applies default animate-pulse and bg-muted classes', () => {
    render(<Skeleton data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el).toHaveClass('animate-pulse')
    expect(el).toHaveClass('bg-muted')
    expect(el).toHaveClass('rounded-md')
  })

  test('merges custom className while keeping defaults', () => {
    render(<Skeleton className="h-4 w-24" data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el).toHaveClass('h-4')
    expect(el).toHaveClass('w-24')
    expect(el).toHaveClass('animate-pulse')
  })

  test('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Skeleton ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test skeleton
```

Expected: import error.

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/skeleton/index.tsx`:

```tsx
import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn('animate-pulse rounded-md bg-muted', className)}
        {...props}
      />
    )
  },
)
```

- [ ] **Step 4: Run test, expect 4 passing**

```bash
pnpm --filter @idcert/ui test skeleton
```

- [ ] **Step 5: Story**

Create `packages/ui/src/components/skeleton/skeleton.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './index.js'

const meta = {
  title: 'DataDisplay/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const TextLine: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
}

export const Avatar: Story = {
  render: () => <Skeleton className="h-12 w-12 rounded-full" />,
}

export const Card: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  ),
}

export const FullWidth: Story = {
  render: () => (
    <div className="w-96">
      <Skeleton className="h-32 w-full" />
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export { Skeleton, type SkeletonProps } from './components/skeleton/index.js'
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
git add packages/ui/src/components/skeleton packages/ui/src/index.ts
git commit -m "feat(ui): add Skeleton component (animate-pulse loader)"
```

---

## Task 3: List component (List + ListItem)

`<ul>` + `<li>` styled compound with optional `divider` prop.

**Files:**
- Create: `packages/ui/src/components/list/list.test.tsx`
- Create: `packages/ui/src/components/list/index.tsx`
- Create: `packages/ui/src/components/list/list.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/list/list.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { List, ListItem } from './index.js'

describe('List', () => {
  test('renders a <ul>', () => {
    const { container } = render(
      <List>
        <ListItem>Item</ListItem>
      </List>,
    )
    expect(container.querySelector('ul')).not.toBeNull()
  })

  test('ListItem renders a <li>', () => {
    const { container } = render(
      <List>
        <ListItem>Item</ListItem>
      </List>,
    )
    expect(container.querySelector('li')).not.toBeNull()
  })

  test('divider prop applies divide-y class', () => {
    render(
      <List divider data-testid="list">
        <ListItem>A</ListItem>
        <ListItem>B</ListItem>
      </List>,
    )
    expect(screen.getByTestId('list')).toHaveClass('divide-y')
  })

  test('without divider, default gap classes apply', () => {
    render(
      <List data-testid="list">
        <ListItem>A</ListItem>
      </List>,
    )
    expect(screen.getByTestId('list')).toHaveClass('gap-2')
  })

  test('renders multiple items', () => {
    render(
      <List>
        <ListItem>One</ListItem>
        <ListItem>Two</ListItem>
        <ListItem>Three</ListItem>
      </List>,
    )
    expect(screen.getByText('One')).toBeInTheDocument()
    expect(screen.getByText('Two')).toBeInTheDocument()
    expect(screen.getByText('Three')).toBeInTheDocument()
  })

  test('forwards ref to List', () => {
    const ref = React.createRef<HTMLUListElement>()
    render(
      <List ref={ref}>
        <ListItem>x</ListItem>
      </List>,
    )
    expect(ref.current).toBeInstanceOf(HTMLUListElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test list
```

Expected: import error.

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/list/index.tsx`:

```tsx
import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type ListProps = React.HTMLAttributes<HTMLUListElement> & {
  divider?: boolean
}

export const List = React.forwardRef<HTMLUListElement, ListProps>(
  function List({ className, divider, ...props }, ref) {
    return (
      <ul
        ref={ref}
        className={cn(
          'flex flex-col text-sm',
          divider
            ? 'divide-y divide-border [&>li]:py-2 [&>li:first-child]:pt-0 [&>li:last-child]:pb-0'
            : 'gap-2',
          className,
        )}
        {...props}
      />
    )
  },
)

export type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem({ className, ...props }, ref) {
    return (
      <li
        ref={ref}
        className={cn('text-foreground', className)}
        {...props}
      />
    )
  },
)
```

- [ ] **Step 4: Run test, expect 6 passing**

```bash
pnpm --filter @idcert/ui test list
```

- [ ] **Step 5: Story**

Create `packages/ui/src/components/list/list.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { List, ListItem } from './index.js'

const meta = {
  title: 'DataDisplay/List',
  component: List,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <List className="w-64">
      <ListItem>First item</ListItem>
      <ListItem>Second item</ListItem>
      <ListItem>Third item</ListItem>
    </List>
  ),
}

export const WithDivider: Story = {
  render: () => (
    <List divider className="w-64">
      <ListItem>First item</ListItem>
      <ListItem>Second item</ListItem>
      <ListItem>Third item</ListItem>
    </List>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <List divider className="w-72">
      <ListItem className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Active connection
      </ListItem>
      <ListItem className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-yellow-500" />
        Pending verification
      </ListItem>
      <ListItem className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-destructive" />
        Failed sync
      </ListItem>
    </List>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  List,
  ListItem,
  type ListProps,
  type ListItemProps,
} from './components/list/index.js'
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
git add packages/ui/src/components/list packages/ui/src/index.ts
git commit -m "feat(ui): add List + ListItem (semantic ul/li with divider opt-in)"
```

---

## Task 4: EmptyState compound (5 sub-parts)

Composition pattern. 5 styled sub-parts: Root + Icon + Title + Description + Action.

**Files:**
- Create: `packages/ui/src/components/empty-state/empty-state.test.tsx`
- Create: `packages/ui/src/components/empty-state/index.tsx`
- Create: `packages/ui/src/components/empty-state/empty-state.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/empty-state/empty-state.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { Inbox } from 'lucide-react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from './index.js'

describe('EmptyState', () => {
  test('EmptyState root renders children', () => {
    render(
      <EmptyState>
        <span>content</span>
      </EmptyState>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  test('EmptyStateIcon contains its child SVG', () => {
    render(
      <EmptyStateIcon data-testid="icon">
        <Inbox />
      </EmptyStateIcon>,
    )
    expect(screen.getByTestId('icon').querySelector('svg')).not.toBeNull()
  })

  test('EmptyStateTitle renders as h3', () => {
    render(<EmptyStateTitle>No items</EmptyStateTitle>)
    const heading = screen.getByText('No items')
    expect(heading.tagName).toBe('H3')
  })

  test('EmptyStateDescription renders as p', () => {
    render(<EmptyStateDescription>Inbox is empty</EmptyStateDescription>)
    const paragraph = screen.getByText('Inbox is empty')
    expect(paragraph.tagName).toBe('P')
  })

  test('EmptyStateAction renders its children', () => {
    render(
      <EmptyStateAction>
        <button type="button">New</button>
      </EmptyStateAction>,
    )
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
  })

  test('EmptyState forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<EmptyState ref={ref}>x</EmptyState>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test empty-state
```

Expected: import error.

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/empty-state/index.tsx`:

```tsx
import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement>

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center gap-3 py-12 px-6',
          className,
        )}
        {...props}
      />
    )
  },
)

export type EmptyStateIconProps = React.HTMLAttributes<HTMLDivElement>

export const EmptyStateIcon = React.forwardRef<HTMLDivElement, EmptyStateIconProps>(
  function EmptyStateIcon({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:h-6 [&>svg]:w-6',
          className,
        )}
        {...props}
      />
    )
  },
)

export type EmptyStateTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export const EmptyStateTitle = React.forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  function EmptyStateTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn('text-lg font-semibold text-foreground', className)}
        {...props}
      />
    )
  },
)

export type EmptyStateDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export const EmptyStateDescription = React.forwardRef<HTMLParagraphElement, EmptyStateDescriptionProps>(
  function EmptyStateDescription({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground max-w-sm', className)}
        {...props}
      />
    )
  },
)

export type EmptyStateActionProps = React.HTMLAttributes<HTMLDivElement>

export const EmptyStateAction = React.forwardRef<HTMLDivElement, EmptyStateActionProps>(
  function EmptyStateAction({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('mt-2 flex gap-2', className)}
        {...props}
      />
    )
  },
)
```

- [ ] **Step 4: Run test, expect 6 passing**

```bash
pnpm --filter @idcert/ui test empty-state
```

- [ ] **Step 5: Story**

Create `packages/ui/src/components/empty-state/empty-state.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { FileX, Inbox, Search } from 'lucide-react'
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'DataDisplay/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon><Inbox /></EmptyStateIcon>
      <EmptyStateTitle>No messages</EmptyStateTitle>
      <EmptyStateDescription>
        Your inbox is empty. Compose to start the conversation.
      </EmptyStateDescription>
      <EmptyStateAction>
        <Button>New message</Button>
      </EmptyStateAction>
    </EmptyState>
  ),
}

export const NoActions: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon><FileX /></EmptyStateIcon>
      <EmptyStateTitle>File not found</EmptyStateTitle>
      <EmptyStateDescription>
        The file you requested does not exist or has been moved.
      </EmptyStateDescription>
    </EmptyState>
  ),
}

export const SearchResults: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon><Search /></EmptyStateIcon>
      <EmptyStateTitle>No results</EmptyStateTitle>
      <EmptyStateDescription>
        We couldn&apos;t find anything matching your search. Try different keywords.
      </EmptyStateDescription>
      <EmptyStateAction>
        <Button variant="outline">Clear filters</Button>
        <Button>New search</Button>
      </EmptyStateAction>
    </EmptyState>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
  type EmptyStateProps,
  type EmptyStateIconProps,
  type EmptyStateTitleProps,
  type EmptyStateDescriptionProps,
  type EmptyStateActionProps,
} from './components/empty-state/index.js'
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
git add packages/ui/src/components/empty-state packages/ui/src/index.ts
git commit -m "feat(ui): add EmptyState compound (5 sub-parts)"
```

---

## Task 5: Progress component

Wraps Base UI `Progress.*`. Encapsulated single public component.

**Base UI Progress data attributes** (verified in Task 0): Track emits `data-progressing`, `data-complete`, `data-indeterminate` (presence-based, no value). Indicator/Track read these for styling.

**Files:**
- Create: `packages/ui/src/components/progress/progress.test.tsx`
- Create: `packages/ui/src/components/progress/index.tsx`
- Create: `packages/ui/src/components/progress/progress.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/progress/progress.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { Progress } from './index.js'

describe('Progress', () => {
  test('renders with role progressbar', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  test('value=60 sets aria-valuenow=60', () => {
    render(<Progress value={60} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60')
  })

  test('value=null indeterminate state has no aria-valuenow', () => {
    render(<Progress value={null} />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
  })

  test('custom max changes ARIA scale', () => {
    render(<Progress value={120} max={200} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '200')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '120')
  })

  test('value=100 sets data-complete on track', () => {
    const { container } = render(<Progress value={100} />)
    // Track is the inner element with width transition; data-complete is set when value === max.
    expect(container.querySelector('[data-complete]')).not.toBeNull()
  })

  test('forwards ref to root', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Progress ref={ref} value={50} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test progress
```

Expected: import error.

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/progress/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Progress as BaseProgress } from '@base-ui/react/progress'
import { cn } from '../../lib/cn.js'

export type ProgressProps = React.ComponentProps<typeof BaseProgress.Root>

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  function Progress({ className, ...props }, ref) {
    return (
      <BaseProgress.Root
        ref={ref}
        className={cn('relative w-full', className)}
        {...props}
      >
        <BaseProgress.Track className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <BaseProgress.Indicator className="h-full bg-primary transition-transform" />
        </BaseProgress.Track>
      </BaseProgress.Root>
    )
  },
)
```

Notes:
- Base UI Progress.Indicator handles its own width via internal CSS variable / transform; no manual `style={{ width: ... }}` needed.
- Indeterminate state: when `value={null}` Base UI emits `data-indeterminate` on Track; we don't add an explicit indeterminate animation in v1 (CSS pulse is implicit through Base UI's default styling). If consumer wants a sliding indeterminate animation, they override the indicator className or wait for a future enhancement.
- Sub-parts (`Track`, `Indicator`, `Value`, `Label`) are intentionally NOT exported. Public surface is just `Progress`.

- [ ] **Step 4: Run test, expect 6 passing**

```bash
pnpm --filter @idcert/ui test progress
```

If Base UI sets `aria-valuenow` differently (e.g. always present even for indeterminate, or as a string), inspect the actual DOM and adapt the assertion. Document any deviation.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/progress/progress.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Progress } from './index.js'

const meta = {
  title: 'DataDisplay/Progress',
  component: Progress,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const ThirtyPercent: Story = {
  render: () => (
    <div className="w-80">
      <Progress value={30} />
    </div>
  ),
}

export const SixtyPercent: Story = {
  render: () => (
    <div className="w-80">
      <Progress value={60} />
    </div>
  ),
}

export const Complete: Story = {
  render: () => (
    <div className="w-80">
      <Progress value={100} />
    </div>
  ),
}

export const Indeterminate: Story = {
  render: () => (
    <div className="w-80">
      <Progress value={null} />
    </div>
  ),
}

function AnimatedDemo() {
  const [v, setV] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => {
      setV((prev) => (prev >= 100 ? 0 : prev + 10))
    }, 500)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="w-80 space-y-2">
      <Progress value={v} />
      <div className="text-center text-sm text-muted-foreground">{v}%</div>
    </div>
  )
}

export const Animated: Story = {
  render: () => <AnimatedDemo />,
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export { Progress, type ProgressProps } from './components/progress/index.js'
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
git add packages/ui/src/components/progress packages/ui/src/index.ts
git commit -m "feat(ui): add Progress component (Base UI Progress wrap)"
```

---

## Task 6: Avatar compound (heaviest)

Wraps Base UI `Avatar.*`. 4 sub-parts: Avatar (with cva size variants), AvatarImage, AvatarFallback, AvatarGroup (custom, no Base UI primitive).

**Files:**
- Create: `packages/ui/src/components/avatar/avatar.test.tsx`
- Create: `packages/ui/src/components/avatar/index.tsx`
- Create: `packages/ui/src/components/avatar/avatar.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/avatar/avatar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from './index.js'

describe('Avatar', () => {
  test('renders root', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>U</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
  })

  test('AvatarImage renders with src and alt when image loads', () => {
    // jsdom does not actually load images. The image element renders
    // and Base UI keeps it mounted; alt is set on the underlying img.
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test user" />
        <AvatarFallback>T</AvatarFallback>
      </Avatar>,
    )
    // Base UI Avatar.Image renders an <img> element; we look it up by alt text.
    const img = document.querySelector('img[alt="Test user"]')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('src', '/test.jpg')
  })

  test('AvatarFallback renders text content', () => {
    render(
      <Avatar>
        <AvatarFallback>AG</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('AG')).toBeInTheDocument()
  })

  test.each([
    ['sm', 'h-6'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
    ['xl', 'h-16'],
  ] as const)('size %s applies expected class %s', (size, expectedClass) => {
    render(
      <Avatar size={size} data-testid="a">
        <AvatarFallback>U</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByTestId('a')).toHaveClass(expectedClass)
  })

  test('AvatarGroup renders all children when count <= max', () => {
    render(
      <AvatarGroup max={3}>
        <Avatar><AvatarFallback>U1</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U2</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U3</AvatarFallback></Avatar>
      </AvatarGroup>,
    )
    expect(screen.getByText('U1')).toBeInTheDocument()
    expect(screen.getByText('U2')).toBeInTheDocument()
    expect(screen.getByText('U3')).toBeInTheDocument()
    // No overflow fallback present.
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  test('AvatarGroup truncates and shows +N when count > max', () => {
    render(
      <AvatarGroup max={3}>
        <Avatar><AvatarFallback>U1</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U2</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U3</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U4</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U5</AvatarFallback></Avatar>
      </AvatarGroup>,
    )
    expect(screen.getByText('U1')).toBeInTheDocument()
    expect(screen.getByText('U2')).toBeInTheDocument()
    expect(screen.getByText('U3')).toBeInTheDocument()
    expect(screen.queryByText('U4')).not.toBeInTheDocument()
    expect(screen.queryByText('U5')).not.toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  test('AvatarGroup without max renders all children', () => {
    render(
      <AvatarGroup>
        <Avatar><AvatarFallback>U1</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U2</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U3</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U4</AvatarFallback></Avatar>
      </AvatarGroup>,
    )
    expect(screen.getByText('U1')).toBeInTheDocument()
    expect(screen.getByText('U4')).toBeInTheDocument()
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  test('forwards ref to Avatar root', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(
      <Avatar ref={ref}>
        <AvatarFallback>U</AvatarFallback>
      </Avatar>,
    )
    expect(ref.current).not.toBeNull()
  })
})
```

Test count: 1 root + 1 image + 1 fallback + 4 size variants + 3 group + 1 ref = 11. Spec target was 9; actual is 11 because the size variants count individually and the group has 3 sub-tests. Acceptable.

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test avatar
```

Expected: import error.

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/avatar/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const avatarVariants = cva(
  'relative inline-flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-6 w-6 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export type AvatarProps = React.ComponentProps<typeof BaseAvatar.Root> &
  VariantProps<typeof avatarVariants>

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar({ className, size, ...props }, ref) {
    return (
      <BaseAvatar.Root
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      />
    )
  },
)

export type AvatarImageProps = React.ComponentProps<typeof BaseAvatar.Image>

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  function AvatarImage({ className, ...props }, ref) {
    return (
      <BaseAvatar.Image
        ref={ref}
        className={cn('aspect-square h-full w-full object-cover', className)}
        {...props}
      />
    )
  },
)

export type AvatarFallbackProps = React.ComponentProps<typeof BaseAvatar.Fallback>

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback({ className, ...props }, ref) {
    return (
      <BaseAvatar.Fallback
        ref={ref}
        className={cn(
          'flex h-full w-full items-center justify-center bg-muted text-muted-foreground font-medium',
          className,
        )}
        {...props}
      />
    )
  },
)

export type AvatarGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  max?: number
  size?: VariantProps<typeof avatarVariants>['size']
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup({ className, children, max, size, ...props }, ref) {
    const childrenArr = React.Children.toArray(children)
    const visibleArr = max && childrenArr.length > max ? childrenArr.slice(0, max) : childrenArr
    const overflow = max && childrenArr.length > max ? childrenArr.length - max : 0

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex [&>*:not(:first-child)]:-ml-2 [&>*]:ring-2 [&>*]:ring-background',
          className,
        )}
        {...props}
      >
        {visibleArr}
        {overflow > 0 && (
          <Avatar size={size}>
            <AvatarFallback>+{overflow}</AvatarFallback>
          </Avatar>
        )}
      </div>
    )
  },
)

export { avatarVariants }
```

Notes:
- `Avatar` is `forwardRef<HTMLSpanElement>` because Base UI `Avatar.Root` renders a `<span>`. (Confirm by inspecting jsdom output if needed; Base UI 1.4 uses `<span>` for the avatar root.)
- `AvatarImage` ref is `HTMLImageElement` — Base UI renders `<img>` inside.
- `AvatarFallback` ref is `HTMLSpanElement` — Base UI renders `<span>` for fallback. If actual element type differs, adjust.
- `AvatarGroup`: stacks children with `-ml-2` overlap, `ring-2 ring-background` to outline each avatar against the background. Wraps `+N` overflow in a same-sized Avatar with Fallback.

- [ ] **Step 4: Run test, expect 11 passing**

```bash
pnpm --filter @idcert/ui test avatar
```

Expected: 11/11 (1 root + 1 image + 1 fallback + 4 size variants via test.each + 3 group + 1 ref). The plan spec target was 9; actual is 11 because of subtest granularity. Acceptable.

If the AvatarFallback test fails because Base UI delays fallback rendering (anti-flicker behavior on fast loads), use `findByText` (async) with a longer default timeout, or set `delayMs={0}` on `Avatar.Root` if Base UI exposes such a prop. Document the deviation.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/avatar/avatar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { User } from 'lucide-react'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from './index.js'

const meta = {
  title: 'DataDisplay/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/100?img=1" alt="User one" />
      <AvatarFallback>U1</AvatarFallback>
    </Avatar>
  ),
}

export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AG</AvatarFallback>
    </Avatar>
  ),
}

export const FallbackIcon: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback><User /></AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm"><AvatarFallback>S</AvatarFallback></Avatar>
      <Avatar size="md"><AvatarFallback>M</AvatarFallback></Avatar>
      <Avatar size="lg"><AvatarFallback>L</AvatarFallback></Avatar>
      <Avatar size="xl"><AvatarFallback>XL</AvatarFallback></Avatar>
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=1" alt="" /><AvatarFallback>U1</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=2" alt="" /><AvatarFallback>U2</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=3" alt="" /><AvatarFallback>U3</AvatarFallback></Avatar>
    </AvatarGroup>
  ),
}

export const GroupWithOverflow: Story = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=1" alt="" /><AvatarFallback>U1</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=2" alt="" /><AvatarFallback>U2</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=3" alt="" /><AvatarFallback>U3</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=4" alt="" /><AvatarFallback>U4</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=5" alt="" /><AvatarFallback>U5</AvatarFallback></Avatar>
    </AvatarGroup>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  avatarVariants,
  type AvatarProps,
  type AvatarImageProps,
  type AvatarFallbackProps,
  type AvatarGroupProps,
} from './components/avatar/index.js'
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
git add packages/ui/src/components/avatar packages/ui/src/index.ts
git commit -m "feat(ui): add Avatar compound (Base UI Avatar + AvatarGroup)"
```

---

## Task 7: Final validation + v0.8.0 changeset

- [ ] **Step 1: Clean rebuild**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
pnpm clean
pnpm install
pnpm build
```

Expected: 5/5 packages successful. `dist/index.js` and `dist/index.cjs` start with `"use client";`. `@base-ui/react/avatar` and `@base-ui/react/progress` external (not inlined).

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

All must pass. Total tests target after Plan 6a:

| Source | Tests |
|---|---:|
| Pre-Plan-6a baseline | 278 |
| Plan 6a Badge | +8 |
| Plan 6a Skeleton | +4 |
| Plan 6a List | +6 |
| Plan 6a EmptyState | +6 |
| Plan 6a Progress | +6 |
| Plan 6a Avatar | +11 |
| **Total target** | **~319** |

Record actual count.

- [ ] **Step 3: Verify Storybook indexes new stories**

```bash
pnpm --filter @idcert/storybook build
```

Expected: build succeeds and indexes 6 new stories under `DataDisplay/*`.

- [ ] **Step 4: Create playground smoke page**

Create `apps/playground/app/data/page.tsx`:

```tsx
'use client'

import { Inbox } from 'lucide-react'
import * as React from 'react'
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  Badge,
  Button,
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  List,
  ListItem,
  Progress,
  Skeleton,
} from '@idcert/ui'

export default function DataPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-12 p-8">
      <h1 className="text-2xl font-semibold">Data Display smoke test</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Badge</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Avatar</h2>
        <div className="flex items-center gap-6">
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/100?img=1" alt="" />
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
          <AvatarGroup max={3}>
            <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=1" alt="" /><AvatarFallback>U1</AvatarFallback></Avatar>
            <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=2" alt="" /><AvatarFallback>U2</AvatarFallback></Avatar>
            <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=3" alt="" /><AvatarFallback>U3</AvatarFallback></Avatar>
            <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=4" alt="" /><AvatarFallback>U4</AvatarFallback></Avatar>
            <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=5" alt="" /><AvatarFallback>U5</AvatarFallback></Avatar>
          </AvatarGroup>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Progress</h2>
        <div className="space-y-3 max-w-md">
          <Progress value={30} />
          <Progress value={60} />
          <Progress value={100} />
          <Progress value={null} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Skeleton</h2>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">List</h2>
        <div className="grid grid-cols-2 gap-6">
          <List>
            <ListItem>Default item one</ListItem>
            <ListItem>Default item two</ListItem>
            <ListItem>Default item three</ListItem>
          </List>
          <List divider>
            <ListItem>Divider item one</ListItem>
            <ListItem>Divider item two</ListItem>
            <ListItem>Divider item three</ListItem>
          </List>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">EmptyState</h2>
        <div className="rounded-lg border">
          <EmptyState>
            <EmptyStateIcon><Inbox /></EmptyStateIcon>
            <EmptyStateTitle>No messages</EmptyStateTitle>
            <EmptyStateDescription>
              Your inbox is empty. Compose to start.
            </EmptyStateDescription>
            <EmptyStateAction>
              <Button>New message</Button>
            </EmptyStateAction>
          </EmptyState>
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

Expected: build succeeds, route `/data` rendered as static.

DO NOT start `pnpm dev` from this task.

- [ ] **Step 5: Add v0.8.0 changeset**

Create `.changeset/v0.8.0-data-display-base.md`:

```markdown
---
'@idcert/ui': minor
---

Add 6 new components in the Data Display category (first half — Table is Plan 6b).

Components (`@idcert/ui`):
- `Badge` — pill `<span>` with 6 cva variants: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`. Exports `badgeVariants` for consumer override.
- `Skeleton` — single styled `<div>` with `animate-pulse` + `bg-muted rounded-md`. Consumer dimensions via className. `aria-hidden` by default.
- `Progress` — Base UI Progress wrapper. Linear bar. Accepts `value` (0-`max`) or `null` for indeterminate. Sub-parts (Track/Indicator/Value/Label) encapsulated; only `Progress` exported.
- `List` compound — `<ul>` + `<li>` styled. Sub-parts: `List`, `ListItem`. `divider?: boolean` prop adds separator between items.
- `EmptyState` compound — semantic empty-state pattern. 5 sub-parts: `EmptyState`, `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateAction`.
- `Avatar` compound — Base UI Avatar wrapper. 4 sub-parts: `Avatar` (with cva size variants sm/md/lg/xl), `AvatarImage`, `AvatarFallback`, `AvatarGroup` (custom: stacks children with overlap, `max` prop truncates with "+N" fallback). Exports `avatarVariants`.

No new dependencies.

Out of scope (deferred):
- `Table` (Plan 6b — sorting + selection + heavy custom logic).
- Badge dot variant + removable, Skeleton shimmer + shape presets, Progress circular + label, List ordered + interactive, EmptyState illustrations, Avatar status indicator, AvatarGroup hover-expand.
```

- [ ] **Step 6: Verify changeset status**

```bash
pnpm exec changeset status
```

Expected: `@idcert/ui` minor bump.

- [ ] **Step 7: Final commit**

```bash
git add .changeset/v0.8.0-data-display-base.md apps/playground/app/data/page.tsx
git commit -m "chore: changeset for v0.8.0 (data display base) + playground smoke"
```

- [ ] **Step 8: Final state check**

```bash
git status                                                                # clean
git log --oneline main..feat/data-display-base | wc -l                   # ~7 commits expected
pnpm test                                                                 # all green
```

Expected: working tree clean, 7 commits ahead of main, all gates green.

Commits expected on the branch:
1. Badge
2. Skeleton
3. List
4. EmptyState
5. Progress
6. Avatar
7. v0.8.0 changeset + playground smoke

---

## Self-Review Notes

**Spec coverage:**

- Spec section "Component APIs / 1. Badge" — Task 1. cva 6 variants + `badgeVariants` export.
- Spec section "Component APIs / 2. Skeleton" — Task 2. Single styled `<div>` with `animate-pulse` + `aria-hidden`.
- Spec section "Component APIs / 3. Progress" — Task 5. Base UI wrap encapsulated. Sub-parts not exported.
- Spec section "Component APIs / 4. List + ListItem" — Task 3. `divider?: boolean` prop.
- Spec section "Component APIs / 5. EmptyState compound" — Task 4. 5 sub-parts.
- Spec section "Component APIs / 6. Avatar + AvatarGroup" — Task 6. cva size variants + custom AvatarGroup with `+N` truncation.
- Spec section "Architecture / Avatar size variants" — Task 6 implementation.
- Spec section "Architecture / AvatarGroup truncation logic" — Task 6 implementation (visible slice + overflow count).
- Spec section "File structure" — matches Task definitions.
- Spec section "Test scope" — Tasks 1–6 implement target counts (8 + 4 + 6 + 6 + 6 + 11 = 41; spec said ~39; +2 over due to parametrized test granularity in Avatar). Acceptable.
- Spec section "Versioning + release" — Task 7.
- Spec section "Risks and mitigations" — addressed in Task notes (Avatar fallback timing, Progress data attrs, AvatarGroup ring offset, Badge color tokens, Skeleton aria-hidden, EmptyState heading level, List divider gap conflict).

**Placeholder scan:**

- No "TBD", "TODO", "implement later" in plan body.
- One conditional in Task 5 ("If Base UI sets `aria-valuenow` differently") with concrete adaptation guidance. Not a blocker.
- One conditional in Task 6 ("If AvatarFallback test fails because Base UI delays fallback rendering") with concrete fallback (`findByText` async). Not a blocker.
- Test count discrepancies (spec ~39 vs plan 41) — documented in Task 7 reconciliation table.

**Type consistency:**

- `BadgeProps`, `SkeletonProps`, `ProgressProps`, `ListProps`, `ListItemProps`, `EmptyState*Props`, `AvatarProps`, `AvatarImageProps`, `AvatarFallbackProps`, `AvatarGroupProps` consistently exported and used in tests/stories.
- `avatarVariants` and `badgeVariants` cva exports consistent across implementation and barrel.
- `AvatarGroup` `max?: number` and `size?: ...` consistent.
- `List` `divider?: boolean` consistent.
- `Progress` `value?: number | null` and `max?: number` consistent.

**Risks tracked from spec:**

- Avatar fallback timing → documented in Task 6 with `findByText` fallback.
- Progress data attrs → verified in Task 0 step 2 + adapted in Task 5 if needed.
- AvatarGroup ring offset → consumer override documented.
- Badge token-vs-hardcoded colors → accepted v1, future refactor.
- Skeleton `aria-hidden` → applied by default in Task 2 implementation.
- EmptyState heading level → fixed `<h3>` v1, consumer wraps if needed.
- List divider + gap conflict → documented in spec; consumers override per-item padding.
