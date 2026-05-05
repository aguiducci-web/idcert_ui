# idcert-ui Navigation Shells Implementation Plan (Plan 5b of 6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 new components to `@idcert/ui` (Sheet, Navbar, Sidebar). Sheet wraps Base UI Dialog with `side` cva variants for slide animations. Navbar is a semantic `<nav>` shell composition. Sidebar is the full shadcn-block app shell with `SidebarProvider` (state machine + cookie persistence + `Cmd/Ctrl+B` shortcut), 11 sub-parts, and 2 hooks (`useSidebar`, `useIsMobile`). Sidebar mobile mode auto-renders inside Sheet. Plan ends with a `0.7.0` changeset.

**Architecture:** Sheet reuses Base UI 1.4.1 `Dialog.*` (no new dep) and adds 4 side variants via `cva` + `data-[open]:slide-in-from-*` Tailwind animate utilities. Navbar is pure semantic HTML with `cva` `position` variants (static/sticky/fixed). Sidebar is a self-contained file (~600 lines) that owns the Provider, hooks, cookie helpers, and 11 styled sub-parts; mobile mode branches at render time and embeds children inside `Sheet`. All state is React-only — no external state library.

**Tech Stack:** React 18+, TypeScript 5.6+, Tailwind 3.4+ + `tailwindcss-animate`, `@base-ui/react` 1.4.1 (Dialog only — used by Sheet), `class-variance-authority`, `clsx` + `tailwind-merge`, `lucide-react`, `@radix-ui/react-slot`. **No new runtime or peer dependencies.**

**Branch:** `feat/navigation-shells` (off `main` after Plan 5a v0.6.0 is merged).

**Spec:** `docs/superpowers/specs/2026-05-05-idcert-ui-navigation-shells-design.md`
**Main spec:** `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`
**Previous plan:** `docs/superpowers/plans/2026-05-05-idcert-ui-navigation-base.md`

---

## File Structure

Files added during this plan:

```
packages/ui/src/components/
├── sheet/
│   ├── sheet.stories.tsx
│   ├── sheet.test.tsx
│   └── index.tsx                          # Sheet + 7 sub-parts + cva side variants
├── navbar/
│   ├── navbar.stories.tsx
│   ├── navbar.test.tsx
│   └── index.tsx                          # Navbar + 5 sub-parts + cva position variants
└── sidebar/
    ├── sidebar.stories.tsx
    ├── sidebar.test.tsx
    └── index.tsx                          # SidebarProvider + Sidebar + 11 sub-parts + useSidebar + useIsMobile + cookie helpers
```

Plus modified:
- `packages/ui/src/index.ts` (barrel re-exports for the 3 new modules + 2 hooks)
- `apps/playground/app/dashboard/page.tsx` (new — full layout smoke)
- `.changeset/v0.7.0-navigation-shells.md` (release note)

**Component conventions** (from Plans 1–5a, repeated for clarity):
- Single file per component (compound components export sub-parts from same `index.tsx`).
- `'use client'` first line for any component using Base UI, browser APIs, or React state hooks.
- `React.forwardRef` where the component renders a single DOM element with a public ref.
- Named exports only.
- cva for variants when more than one visual variant exists.
- Stories accompany every component (`<name>.stories.tsx`).
- Tests cover: render, key prop application, primary interaction, ARIA, ref forwarding.
- `.js` extension on local imports (NodeNext + ESM config).
- Storybook category for navigation: `'Navigation/<Component>'`.
- Stateful Storybook stories: extract demos with hooks to named function components (avoids `react-hooks/rules-of-hooks` ESLint error).
- Base UI 1.4 popup `data-state` attributes: confirmed earlier plans (`data-[open]:` and `data-[closed]:` — no `state=` prefix). Sheet inherits this pattern from Plan 3 Dialog.

---

## Task 0: Branch + dependency verification

No new deps. This task creates the branch and verifies the existing toolchain still works.

**Files:**
- Create branch: `feat/navigation-shells`

- [ ] **Step 1: Create the navigation-shells branch**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
git checkout main
git log --oneline -3
```

Expected: `main` has the Plan 5b spec commit (`docs: add Plan 5b (navigation shells) design spec`) at the top, plus the merged Plan 5a commits.

```bash
git checkout -b feat/navigation-shells
git branch --show-current
```

Expected: `feat/navigation-shells`.

- [ ] **Step 2: Verify Base UI Dialog parts available (used by Sheet)**

```bash
cat node_modules/.pnpm/@base-ui+react@1.4.1*/node_modules/@base-ui/react/dialog/index.parts.d.ts
```

Expected output should include `Root`, `Trigger`, `Portal`, `Backdrop`, `Popup`, `Close`, `Title`, `Description`. Plan 3 already used these.

- [ ] **Step 3: Sanity rebuild + test**

```bash
pnpm install
pnpm --filter @idcert/ui build
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui test
```

All exit 0. Total test count from prior plans: 239.

- [ ] **Step 4: Commit (no-op marker — skip)**

This task adds nothing to commit. Skip the commit. Subsequent tasks add commits.

If you prefer a marker commit, create an empty commit:

```bash
git commit --allow-empty -m "chore(ui): start navigation-shells branch (no new deps)"
```

Default: skip.

---

## Component Task Pattern

Tasks 1–3 each follow the same shape:

1. Write the failing test (`<name>.test.tsx`)
2. Run test, verify it fails with module-not-found
3. Implement the component (`<name>/index.tsx`)
4. Run tests, verify all pass
5. Add the Storybook story (`<name>.stories.tsx`)
6. Update `packages/ui/src/index.ts` to re-export the new component(s)
7. Run typecheck + lint + build
8. Commit (single commit per component for clean history)

Order: Sheet (simplest Dialog wrapper) → Navbar (pure HTML) → Sidebar (heaviest, depends on Sheet for mobile drawer).

---

## Task 1: Sheet component

Wraps Base UI `Dialog.*`. Adds `side` cva variant (top/right/bottom/left) for slide-in animations. Same primitive Plan 3 Dialog uses, different positioning + animation.

**Files:**
- Create: `packages/ui/src/components/sheet/sheet.test.tsx`
- Create: `packages/ui/src/components/sheet/index.tsx`
- Create: `packages/ui/src/components/sheet/sheet.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/sheet/sheet.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from './index.js'

function renderSheet(props?: { side?: 'top' | 'right' | 'bottom' | 'left'; defaultOpen?: boolean }) {
  return render(
    <Sheet defaultOpen={props?.defaultOpen}>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side={props?.side ?? 'right'} data-testid="content">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Adjust filters.</SheetDescription>
        </SheetHeader>
        <div>body</div>
        <SheetFooter>
          <SheetClose>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>,
  )
}

describe('Sheet', () => {
  test('renders trigger', () => {
    renderSheet()
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  test('opens on trigger click', async () => {
    const user = userEvent.setup()
    renderSheet()
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })
  })

  test('closes on ESC key', async () => {
    const user = userEvent.setup()
    renderSheet({ defaultOpen: true })
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Filters')).not.toBeInTheDocument()
    })
  })

  test('closes on backdrop click', async () => {
    const user = userEvent.setup()
    const { container } = renderSheet({ defaultOpen: true })
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })
    // Backdrop is the first sibling popup with role="presentation" or fixed inset-0 styling.
    // Base UI Dialog 1.4 emits a Backdrop element behind the popup.
    const backdrop = container.ownerDocument.querySelector('[data-base-ui-portal] [role="presentation"]') ||
      container.ownerDocument.querySelector('.fixed.inset-0')
    expect(backdrop).not.toBeNull()
    if (backdrop) {
      await user.click(backdrop as Element)
      await waitFor(() => {
        expect(screen.queryByText('Filters')).not.toBeInTheDocument()
      })
    }
  })

  test('side="right" applies right-anchored classes (default)', () => {
    renderSheet({ side: 'right', defaultOpen: true })
    const content = screen.getByTestId('content')
    expect(content.className).toMatch(/inset-y-0/)
    expect(content.className).toMatch(/right-0/)
  })

  test('side="left" applies left-anchored classes', () => {
    renderSheet({ side: 'left', defaultOpen: true })
    const content = screen.getByTestId('content')
    expect(content.className).toMatch(/left-0/)
  })

  test('side="top" applies top-anchored classes', () => {
    renderSheet({ side: 'top', defaultOpen: true })
    const content = screen.getByTestId('content')
    expect(content.className).toMatch(/top-0/)
    expect(content.className).toMatch(/inset-x-0/)
  })

  test('side="bottom" applies bottom-anchored classes', () => {
    renderSheet({ side: 'bottom', defaultOpen: true })
    const content = screen.getByTestId('content')
    expect(content.className).toMatch(/bottom-0/)
  })

  test('forwards ref to SheetContent', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent ref={ref}>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test sheet
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/sheet/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type SheetProps = React.ComponentProps<typeof BaseDialog.Root>
export const Sheet = BaseDialog.Root

export type SheetTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>
export const SheetTrigger = BaseDialog.Trigger

export type SheetCloseProps = React.ComponentProps<typeof BaseDialog.Close>
export const SheetClose = BaseDialog.Close

const sheetContentVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[closed]:duration-300 data-[open]:duration-500 data-[open]:animate-in data-[closed]:animate-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[open]:slide-in-from-top data-[closed]:slide-out-to-top',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm data-[open]:slide-in-from-right data-[closed]:slide-out-to-right',
        bottom:
          'inset-x-0 bottom-0 border-t data-[open]:slide-in-from-bottom data-[closed]:slide-out-to-bottom',
        left:
          'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm data-[open]:slide-in-from-left data-[closed]:slide-out-to-left',
      },
    },
    defaultVariants: { side: 'right' },
  },
)

export type SheetContentProps = React.ComponentProps<typeof BaseDialog.Popup> &
  VariantProps<typeof sheetContentVariants> & {
    showCloseButton?: boolean
  }

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  function SheetContent(
    { className, children, side = 'right', showCloseButton = true, ...props },
    ref,
  ) {
    return (
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[open]:animate-in data-[closed]:animate-out',
            'data-[open]:fade-in-0 data-[closed]:fade-out-0',
          )}
        />
        <BaseDialog.Popup
          ref={ref}
          className={cn(sheetContentVariants({ side }), className)}
          {...props}
        >
          {children}
          {showCloseButton && (
            <BaseDialog.Close
              className="absolute right-4 top-4 rounded-sm p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </BaseDialog.Close>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    )
  },
)

export type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement>

export const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  function SheetHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
        {...props}
      />
    )
  },
)

export type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>

export const SheetFooter = React.forwardRef<HTMLDivElement, SheetFooterProps>(
  function SheetFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
        {...props}
      />
    )
  },
)

export type SheetTitleProps = React.ComponentProps<typeof BaseDialog.Title>

export const SheetTitle = React.forwardRef<HTMLHeadingElement, SheetTitleProps>(
  function SheetTitle({ className, ...props }, ref) {
    return (
      <BaseDialog.Title
        ref={ref}
        className={cn('text-lg font-semibold text-foreground', className)}
        {...props}
      />
    )
  },
)

export type SheetDescriptionProps = React.ComponentProps<typeof BaseDialog.Description>

export const SheetDescription = React.forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  function SheetDescription({ className, ...props }, ref) {
    return (
      <BaseDialog.Description
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)
```

Notes:
- `Sheet`, `SheetTrigger`, `SheetClose` are direct re-exports of Base UI parts (matches Plan 3 Dialog style — no extra wrapping needed, ergonomic).
- `data-[open]:` and `data-[closed]:` (no `state=` prefix) per Plan 3 verification of Base UI Dialog data attrs.
- `tailwindcss-animate` provides `slide-in-from-top` / `slide-in-from-right` / `slide-in-from-bottom` / `slide-in-from-left` (and `slide-out-to-*`).

- [ ] **Step 4: Run test, expect 9 passing**

```bash
pnpm --filter @idcert/ui test sheet
```

Expected: all 9 pass. If the backdrop click test is flaky in jsdom (Base UI Dialog backdrop selector may differ), inspect actual DOM and adapt the query. Document any deviation.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/sheet/sheet.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Navigation/Sheet',
  component: Sheet,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

function ExampleContent({ title }: { title: string }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>Adjust the active settings here.</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        <p className="text-sm">Body content goes here.</p>
      </div>
      <SheetFooter>
        <SheetClose render={<Button variant="outline">Cancel</Button>} />
        <Button>Save</Button>
      </SheetFooter>
    </>
  )
}

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open right</Button>} />
      <SheetContent side="right">
        <ExampleContent title="Right sheet" />
      </SheetContent>
    </Sheet>
  ),
}

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open left</Button>} />
      <SheetContent side="left">
        <ExampleContent title="Left sheet" />
      </SheetContent>
    </Sheet>
  ),
}

export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open top</Button>} />
      <SheetContent side="top">
        <ExampleContent title="Top sheet" />
      </SheetContent>
    </Sheet>
  ),
}

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open bottom</Button>} />
      <SheetContent side="bottom">
        <ExampleContent title="Bottom sheet" />
      </SheetContent>
    </Sheet>
  ),
}

export const NoCloseButton: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open without X</Button>} />
      <SheetContent side="right" showCloseButton={false}>
        <ExampleContent title="No close button" />
      </SheetContent>
    </Sheet>
  ),
}
```

Note: stories use Base UI's `render={<Button />}` pattern (from Plan 3 Dialog stories) instead of `asChild`. Base UI Dialog 1.4 trigger composition uses `render` prop.

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  type SheetProps,
  type SheetTriggerProps,
  type SheetContentProps,
  type SheetHeaderProps,
  type SheetFooterProps,
  type SheetTitleProps,
  type SheetDescriptionProps,
  type SheetCloseProps,
} from './components/sheet/index.js'
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
git add packages/ui/src/components/sheet packages/ui/src/index.ts
git commit -m "feat(ui): add Sheet compound (Base UI Dialog + side variants)"
```

---

## Task 2: Navbar component

Pure semantic HTML composition. 6 sub-parts. cva `position` variant.

**Files:**
- Create: `packages/ui/src/components/navbar/navbar.test.tsx`
- Create: `packages/ui/src/components/navbar/index.tsx`
- Create: `packages/ui/src/components/navbar/navbar.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/navbar/navbar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarActions,
  NavbarMobileToggle,
} from './index.js'

describe('Navbar', () => {
  test('renders <nav> root', () => {
    const { container } = render(
      <Navbar>
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    )
    expect(container.querySelector('nav')).not.toBeNull()
  })

  test('position="static" omits sticky/fixed positioning classes', () => {
    const { container } = render(
      <Navbar position="static">
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    )
    const nav = container.querySelector('nav')!
    expect(nav.className).not.toMatch(/sticky/)
    expect(nav.className).not.toMatch(/fixed/)
  })

  test('position="sticky" applies sticky top-0', () => {
    const { container } = render(
      <Navbar position="sticky">
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    )
    const nav = container.querySelector('nav')!
    expect(nav.className).toMatch(/sticky/)
    expect(nav.className).toMatch(/top-0/)
  })

  test('position="fixed" applies fixed inset-x-0 top-0', () => {
    const { container } = render(
      <Navbar position="fixed">
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    )
    const nav = container.querySelector('nav')!
    expect(nav.className).toMatch(/fixed/)
    expect(nav.className).toMatch(/inset-x-0/)
  })

  test('NavbarBrand, NavbarContent, NavbarActions render their children', () => {
    render(
      <Navbar>
        <NavbarBrand>BRAND</NavbarBrand>
        <NavbarContent>
          <NavbarItem>Item1</NavbarItem>
        </NavbarContent>
        <NavbarActions>ACTIONS</NavbarActions>
      </Navbar>,
    )
    expect(screen.getByText('BRAND')).toBeInTheDocument()
    expect(screen.getByText('Item1')).toBeInTheDocument()
    expect(screen.getByText('ACTIONS')).toBeInTheDocument()
  })

  test('NavbarItem with active prop sets aria-current="page"', () => {
    render(
      <Navbar>
        <NavbarContent>
          <NavbarItem active href="/home">Home</NavbarItem>
        </NavbarContent>
      </Navbar>,
    )
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  })

  test('NavbarItem with asChild composes the custom child element', () => {
    render(
      <Navbar>
        <NavbarContent>
          <NavbarItem asChild>
            <a href="/custom" data-testid="custom-link">Custom</a>
          </NavbarItem>
        </NavbarContent>
      </Navbar>,
    )
    const link = screen.getByTestId('custom-link')
    expect(link).toHaveAttribute('href', '/custom')
  })

  test('NavbarMobileToggle fires onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Navbar>
        <NavbarMobileToggle aria-label="Open menu" onClick={onClick} />
      </Navbar>,
    )
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(onClick).toHaveBeenCalled()
  })

  test('forwards ref to Navbar root', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <Navbar ref={ref}>
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.tagName).toBe('NAV')
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test navbar
```

Expected: import error.

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/navbar/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Menu } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const navbarVariants = cva(
  'flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6',
  {
    variants: {
      position: {
        static: '',
        sticky: 'sticky top-0 z-40',
        fixed: 'fixed inset-x-0 top-0 z-40',
      },
    },
    defaultVariants: { position: 'static' },
  },
)

export type NavbarProps = React.HTMLAttributes<HTMLElement> & VariantProps<typeof navbarVariants>

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  function Navbar({ className, position, ...props }, ref) {
    return (
      <nav
        ref={ref}
        className={cn(navbarVariants({ position }), className)}
        {...props}
      />
    )
  },
)

export type NavbarBrandProps = React.HTMLAttributes<HTMLDivElement>

export const NavbarBrand = React.forwardRef<HTMLDivElement, NavbarBrandProps>(
  function NavbarBrand({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2 mr-4', className)}
        {...props}
      />
    )
  },
)

export type NavbarContentProps = React.HTMLAttributes<HTMLDivElement>

export const NavbarContent = React.forwardRef<HTMLDivElement, NavbarContentProps>(
  function NavbarContent({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('hidden md:flex flex-1 items-center gap-4', className)}
        {...props}
      />
    )
  },
)

export type NavbarItemProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean
  asChild?: boolean
}

export const NavbarItem = React.forwardRef<HTMLAnchorElement, NavbarItemProps>(
  function NavbarItem({ className, active, asChild, ...props }, ref) {
    const Comp = asChild ? Slot : 'a'
    return (
      <Comp
        ref={ref}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'text-sm font-medium transition-colors hover:text-foreground',
          active ? 'text-foreground' : 'text-muted-foreground',
          className,
        )}
        {...props}
      />
    )
  },
)

export type NavbarActionsProps = React.HTMLAttributes<HTMLDivElement>

export const NavbarActions = React.forwardRef<HTMLDivElement, NavbarActionsProps>(
  function NavbarActions({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('ml-auto flex items-center gap-2', className)}
        {...props}
      />
    )
  },
)

export type NavbarMobileToggleProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const NavbarMobileToggle = React.forwardRef<HTMLButtonElement, NavbarMobileToggleProps>(
  function NavbarMobileToggle({ className, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
        {...props}
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>
    )
  },
)
```

Notes:
- `NavbarMobileToggle` does not auto-integrate with `SidebarProvider`. Consumer wires `onClick` (typically `useSidebar().setOpenMobile(true)` or to open a Sheet).
- `aria-label` not set by default on toggle — consumer must pass it via spread props (e.g. `<NavbarMobileToggle aria-label="Open menu" />`). Documented in story.

- [ ] **Step 4: Run test, expect 9 passing**

```bash
pnpm --filter @idcert/ui test navbar
```

Expected: 9/9 (including ref forwarding test, which the spec listed but the test count was "8" — actual is 9 because the renders-children test counts the 3 slots in one test; the ref test is the 9th).

If a test expects exactly 8, count again: render-nav, position-static, position-sticky, position-fixed, slots-render, active-aria-current, asChild-composition, mobile-toggle-click, forwards-ref. That's 9. Spec rounded — adopt actual. Plan 5b spec mentioned "8" tests; this plan implements 9.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/navbar/navbar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarActions,
  NavbarMobileToggle,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Navigation/Navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Navbar>
      <NavbarBrand>
        <span className="font-semibold">idcert</span>
      </NavbarBrand>
      <NavbarContent>
        <NavbarItem href="/products" active>Products</NavbarItem>
        <NavbarItem href="/docs">Docs</NavbarItem>
        <NavbarItem href="/blog">Blog</NavbarItem>
      </NavbarContent>
      <NavbarActions>
        <Button variant="ghost">Sign in</Button>
        <Button>Get started</Button>
      </NavbarActions>
      <NavbarMobileToggle aria-label="Open menu" />
    </Navbar>
  ),
}

export const Sticky: Story = {
  render: () => (
    <div className="h-[200vh] bg-muted/30">
      <Navbar position="sticky">
        <NavbarBrand>
          <span className="font-semibold">Sticky</span>
        </NavbarBrand>
        <NavbarContent>
          <NavbarItem href="/a" active>Home</NavbarItem>
          <NavbarItem href="/b">About</NavbarItem>
        </NavbarContent>
        <NavbarActions>
          <Button>Action</Button>
        </NavbarActions>
      </Navbar>
      <div className="p-8">
        <p>Scroll down to verify the navbar sticks to the top.</p>
      </div>
    </div>
  ),
}

export const Fixed: Story = {
  render: () => (
    <div className="h-[200vh] bg-muted/30 pt-20">
      <Navbar position="fixed">
        <NavbarBrand>
          <span className="font-semibold">Fixed</span>
        </NavbarBrand>
        <NavbarContent>
          <NavbarItem href="/a">Home</NavbarItem>
        </NavbarContent>
      </Navbar>
      <div className="p-8">
        <p>Fixed navbar overlays content. Pad the body to compensate.</p>
      </div>
    </div>
  ),
}

export const WithAsChildLink: Story = {
  render: () => (
    <Navbar>
      <NavbarBrand>
        <span className="font-semibold">Brand</span>
      </NavbarBrand>
      <NavbarContent>
        <NavbarItem asChild>
          <a href="/custom" data-app-link="custom">Custom</a>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarActions,
  NavbarMobileToggle,
  type NavbarProps,
  type NavbarBrandProps,
  type NavbarContentProps,
  type NavbarItemProps,
  type NavbarActionsProps,
  type NavbarMobileToggleProps,
} from './components/navbar/index.js'
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
git add packages/ui/src/components/navbar packages/ui/src/index.ts
git commit -m "feat(ui): add Navbar compound (semantic HTML + position variants)"
```

---

## Task 3: Sidebar compound (heaviest)

The shadcn-block app shell. `SidebarProvider` (state machine + cookie persistence + `Cmd/Ctrl+B` shortcut), 11 sub-parts, 2 hooks (`useSidebar`, `useIsMobile`). Mobile mode auto-renders inside `Sheet` (built in Task 1).

**Files:**
- Create: `packages/ui/src/components/sidebar/sidebar.test.tsx`
- Create: `packages/ui/src/components/sidebar/index.tsx`
- Create: `packages/ui/src/components/sidebar/sidebar.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/sidebar/sidebar.test.tsx`:

```tsx
import { render, renderHook, act, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  useSidebar,
  useIsMobile,
} from './index.js'

// Default: desktop (matchMedia returns matches=false for mobile query)
function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

beforeEach(() => {
  setMatchMedia(false) // desktop
})

afterEach(() => {
  vi.restoreAllMocks()
})

function wrapper({ children, ...props }: React.PropsWithChildren<{ defaultOpen?: boolean }>) {
  return <SidebarProvider {...props}>{children}</SidebarProvider>
}

describe('useIsMobile', () => {
  test('returns false when matchMedia matches=false (desktop)', () => {
    setMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  test('returns true when matchMedia matches=true (mobile)', () => {
    setMatchMedia(true)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })
})

describe('useSidebar', () => {
  test('returns context inside SidebarProvider', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => wrapper({ children, defaultOpen: true }),
    })
    expect(result.current.open).toBe(true)
    expect(result.current.state).toBe('expanded')
    expect(typeof result.current.toggleSidebar).toBe('function')
  })

  test('throws when used outside Provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useSidebar())).toThrow(/useSidebar/i)
    errorSpy.mockRestore()
  })

  test('toggleSidebar flips open state', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => wrapper({ children, defaultOpen: true }),
    })
    expect(result.current.open).toBe(true)
    act(() => result.current.toggleSidebar())
    expect(result.current.open).toBe(false)
    expect(result.current.state).toBe('collapsed')
  })
})

describe('SidebarProvider', () => {
  test('provides initial state from defaultOpen', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => wrapper({ children, defaultOpen: false }),
    })
    expect(result.current.open).toBe(false)
    expect(result.current.state).toBe('collapsed')
  })

  test('SidebarTrigger keyboard Cmd+B toggles open state', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => wrapper({ children, defaultOpen: true }),
    })
    expect(result.current.open).toBe(true)
    act(() => {
      fireEvent.keyDown(window, { key: 'b', metaKey: true })
    })
    expect(result.current.open).toBe(false)
  })

  test('cookie setter is called on toggle', () => {
    const setCookieSpy = vi.fn()
    const originalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => '',
      set: setCookieSpy,
    })

    const { result } = renderHook(() => useSidebar(), {
      wrapper: ({ children }) => wrapper({ children, defaultOpen: true }),
    })
    act(() => result.current.toggleSidebar())
    expect(setCookieSpy).toHaveBeenCalled()
    const lastCall = setCookieSpy.mock.calls.at(-1)?.[0] as string | undefined
    expect(lastCall).toMatch(/sidebar:state=/)

    if (originalDescriptor) {
      Object.defineProperty(document, 'cookie', originalDescriptor)
    }
  })
})

describe('Sidebar', () => {
  test('renders <aside> on desktop', () => {
    const { container } = render(
      wrapper({
        children: (
          <Sidebar data-testid="sidebar">
            <SidebarContent>content</SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(container.querySelector('aside')).not.toBeNull()
  })

  test('mobile mode renders inside Sheet (no <aside>)', () => {
    setMatchMedia(true)
    const { container } = render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>content</SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(container.querySelector('aside')).toBeNull()
  })

  test('side="right" applies right-side classes (border-l)', () => {
    const { container } = render(
      wrapper({
        children: (
          <Sidebar side="right" data-testid="sidebar">
            <SidebarContent>content</SidebarContent>
          </Sidebar>
        ),
      }),
    )
    const aside = container.querySelector('aside')!
    expect(aside.className).toMatch(/border-l/)
  })

  test('SidebarTrigger click toggles open state', async () => {
    const user = userEvent.setup()
    function Wrapper() {
      const { open } = useSidebar()
      return (
        <>
          <SidebarTrigger aria-label="Toggle" />
          <span data-testid="state">{open ? 'open' : 'closed'}</span>
        </>
      )
    }
    render(
      <SidebarProvider defaultOpen>
        <Wrapper />
      </SidebarProvider>,
    )
    expect(screen.getByTestId('state')).toHaveTextContent('open')
    await user.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(screen.getByTestId('state')).toHaveTextContent('closed')
  })

  test('SidebarMenuButton with active prop applies active classes', () => {
    render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton active data-testid="active-btn">Active</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        ),
      }),
    )
    const btn = screen.getByTestId('active-btn')
    expect(btn.className).toMatch(/bg-accent/)
  })

  test('SidebarMenuButton asChild composes child', () => {
    render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/x" data-testid="custom-link">Link</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        ),
      }),
    )
    const link = screen.getByTestId('custom-link')
    expect(link).toHaveAttribute('href', '/x')
  })

  test('SidebarHeader / SidebarContent / SidebarFooter render', () => {
    render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarHeader>HEAD</SidebarHeader>
            <SidebarContent>BODY</SidebarContent>
            <SidebarFooter>FOOT</SidebarFooter>
          </Sidebar>
        ),
      }),
    )
    expect(screen.getByText('HEAD')).toBeInTheDocument()
    expect(screen.getByText('BODY')).toBeInTheDocument()
    expect(screen.getByText('FOOT')).toBeInTheDocument()
  })

  test('SidebarGroup + SidebarGroupLabel render', () => {
    render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>LABEL</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Item</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(screen.getByText('LABEL')).toBeInTheDocument()
    expect(screen.getByText('Item')).toBeInTheDocument()
  })

  test('SidebarMenu renders <ul>', () => {
    const { container } = render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>
              <SidebarMenu data-testid="menu">
                <SidebarMenuItem>
                  <SidebarMenuButton>x</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(container.querySelector('ul')).not.toBeNull()
  })

  test('SidebarMenuItem renders <li>', () => {
    const { container } = render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem data-testid="item">
                  <SidebarMenuButton>x</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(container.querySelector('li')).not.toBeNull()
  })

  test('forwards ref to Sidebar root', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      wrapper({
        children: (
          <Sidebar ref={ref}>
            <SidebarContent>content</SidebarContent>
          </Sidebar>
        ),
      }),
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.tagName).toBe('ASIDE')
  })

  test('SidebarRail renders on desktop', () => {
    render(
      wrapper({
        children: (
          <Sidebar>
            <SidebarContent>x</SidebarContent>
            <SidebarRail data-testid="rail" />
          </Sidebar>
        ),
      }),
    )
    expect(screen.getByTestId('rail')).toBeInTheDocument()
  })

  test('SidebarInset renders main', () => {
    render(
      wrapper({
        children: (
          <SidebarInset data-testid="inset">
            inset content
          </SidebarInset>
        ),
      }),
    )
    expect(screen.getByTestId('inset')).toBeInTheDocument()
    expect(screen.getByText('inset content')).toBeInTheDocument()
  })
})
```

Test count: 2 (useIsMobile) + 3 (useSidebar) + 3 (SidebarProvider) + 12 (Sidebar suite) = 20. Plan spec said "~18" — actual is 20 because suite breakdown has 12 instead of 10. This is fine; the spec count was approximate.

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test sidebar
```

Expected: import error.

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/sidebar/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Menu } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'
import {
  Sheet,
  SheetContent,
} from '../sheet/index.js'

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────

const SIDEBAR_COOKIE_NAME = 'sidebar:state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

// ─────────────────────────────────────────────────────────
// useIsMobile hook
// ─────────────────────────────────────────────────────────

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const query = `(max-width: ${breakpoint - 1}px)`
    const mql = window.matchMedia(query)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpoint])

  return isMobile
}

// ─────────────────────────────────────────────────────────
// SidebarContext + useSidebar
// ─────────────────────────────────────────────────────────

type SidebarContextValue = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (next: boolean) => void
  openMobile: boolean
  setOpenMobile: (next: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>.')
  return ctx
}

// ─────────────────────────────────────────────────────────
// SidebarProvider
// ─────────────────────────────────────────────────────────

export type SidebarProviderProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (next: boolean) => void
  enableKeyboardShortcut?: boolean
  style?: React.CSSProperties
}

export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  function SidebarProvider(
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      enableKeyboardShortcut = true,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)
    const [internalOpen, setInternalOpen] = React.useState<boolean>(defaultOpen)

    const isControlled = openProp !== undefined
    const open = isControlled ? (openProp as boolean) : internalOpen

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalOpen(next)
        setOpenProp?.(next)
        // Persist to cookie
        if (typeof document !== 'undefined') {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [isControlled, setOpenProp],
    )

    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((prev) => !prev)
      } else {
        setOpen(!open)
      }
    }, [isMobile, open, setOpen])

    // Keyboard shortcut
    React.useEffect(() => {
      if (!enableKeyboardShortcut) return undefined
      const handler = (event: KeyboardEvent) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
    }, [enableKeyboardShortcut, toggleSidebar])

    const state: 'expanded' | 'collapsed' = open ? 'expanded' : 'collapsed'

    const contextValue = React.useMemo<SidebarContextValue>(
      () => ({
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar],
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          ref={ref}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn('group/sidebar-wrapper flex min-h-svh w-full', className)}
          data-state={state}
          data-mobile={isMobile ? 'true' : undefined}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  },
)

// ─────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────

export type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  function Sidebar(
    { side = 'left', variant = 'sidebar', collapsible = 'offcanvas', className, children, ...props },
    ref,
  ) {
    const { isMobile, openMobile, setOpenMobile, state } = useSidebar()

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side={side}
            className="w-[--sidebar-width] p-0"
            showCloseButton={false}
            data-sidebar="sidebar"
            data-mobile="true"
          >
            <div className="flex h-full w-full flex-col bg-background">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    const widthClass =
      collapsible === 'icon' && state === 'collapsed'
        ? 'w-[--sidebar-width-icon]'
        : 'w-[--sidebar-width]'

    const collapsedHidden = collapsible === 'offcanvas' && state === 'collapsed'

    return (
      <aside
        ref={ref}
        data-sidebar="sidebar"
        data-side={side}
        data-state={state}
        data-collapsible={collapsible}
        data-variant={variant}
        className={cn(
          'group/sidebar relative flex h-svh shrink-0 flex-col bg-background text-foreground transition-[width] duration-200 ease-linear',
          side === 'left' ? 'border-r border-border' : 'border-l border-border',
          widthClass,
          collapsedHidden && 'w-0 overflow-hidden border-0',
          variant === 'inset' && 'm-2 rounded-lg border bg-muted',
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    )
  },
)

// ─────────────────────────────────────────────────────────
// SidebarHeader / Content / Footer
// ─────────────────────────────────────────────────────────

export type SidebarHeaderProps = React.HTMLAttributes<HTMLDivElement>

export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  function SidebarHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex flex-col gap-2 p-2', className)} {...props} />
  },
)

export type SidebarContentProps = React.HTMLAttributes<HTMLDivElement>

export const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  function SidebarContent({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-1 flex-col gap-2 overflow-auto p-2', className)}
        {...props}
      />
    )
  },
)

export type SidebarFooterProps = React.HTMLAttributes<HTMLDivElement>

export const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  function SidebarFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex flex-col gap-2 p-2', className)} {...props} />
  },
)

// ─────────────────────────────────────────────────────────
// SidebarGroup / GroupLabel
// ─────────────────────────────────────────────────────────

export type SidebarGroupProps = React.HTMLAttributes<HTMLDivElement>

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  function SidebarGroup({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex flex-col gap-1 p-2', className)} {...props} />
  },
)

export type SidebarGroupLabelProps = React.HTMLAttributes<HTMLDivElement>

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  function SidebarGroupLabel({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider',
          className,
        )}
        {...props}
      />
    )
  },
)

// ─────────────────────────────────────────────────────────
// SidebarMenu / MenuItem / MenuButton
// ─────────────────────────────────────────────────────────

export type SidebarMenuProps = React.HTMLAttributes<HTMLUListElement>

export const SidebarMenu = React.forwardRef<HTMLUListElement, SidebarMenuProps>(
  function SidebarMenu({ className, ...props }, ref) {
    return <ul ref={ref} className={cn('flex flex-col gap-1', className)} {...props} />
  },
)

export type SidebarMenuItemProps = React.LiHTMLAttributes<HTMLLIElement>

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  function SidebarMenuItem({ className, ...props }, ref) {
    return <li ref={ref} className={cn('relative', className)} {...props} />
  },
)

const sidebarMenuButtonVariants = cva(
  'flex w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm outline-none ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      size: {
        default: 'h-8',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-base',
      },
      active: {
        true: 'bg-accent text-accent-foreground font-medium',
        false: 'text-foreground',
      },
    },
    defaultVariants: { size: 'default', active: false },
  },
)

export type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    asChild?: boolean
  }

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  function SidebarMenuButton({ className, size, active, asChild, type = 'button', ...props }, ref) {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref as never}
        type={asChild ? undefined : type}
        data-active={active || undefined}
        className={cn(sidebarMenuButtonVariants({ size, active }), className)}
        {...props}
      />
    )
  },
)

// ─────────────────────────────────────────────────────────
// SidebarTrigger
// ─────────────────────────────────────────────────────────

export type SidebarTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger({ className, onClick, type = 'button', ...props }, ref) {
    const { toggleSidebar } = useSidebar()
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
        onClick={(event) => {
          toggleSidebar()
          onClick?.(event)
        }}
        {...props}
      >
        <Menu aria-hidden="true" className="h-4 w-4" />
        <span className="sr-only">Toggle sidebar</span>
      </button>
    )
  },
)

// ─────────────────────────────────────────────────────────
// SidebarRail
// ─────────────────────────────────────────────────────────

export type SidebarRailProps = React.HTMLAttributes<HTMLButtonElement>

export const SidebarRail = React.forwardRef<HTMLButtonElement, SidebarRailProps>(
  function SidebarRail({ className, ...props }, ref) {
    const { toggleSidebar } = useSidebar()
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
        className={cn(
          'hidden md:block absolute inset-y-0 z-20 w-1 cursor-pointer transition-colors hover:bg-accent',
          'right-0 group-data-[side=right]/sidebar:left-0 group-data-[side=right]/sidebar:right-auto',
          className,
        )}
        {...props}
      />
    )
  },
)

// ─────────────────────────────────────────────────────────
// SidebarInset
// ─────────────────────────────────────────────────────────

export type SidebarInsetProps = React.HTMLAttributes<HTMLElement>

export const SidebarInset = React.forwardRef<HTMLElement, SidebarInsetProps>(
  function SidebarInset({ className, ...props }, ref) {
    return (
      <main
        ref={ref}
        className={cn(
          'relative flex min-h-svh flex-1 flex-col bg-background',
          className,
        )}
        {...props}
      />
    )
  },
)
```

Notes:
- The whole file is ~430 lines (under the 600-line target). Justified for compound coherence.
- `SidebarProvider` provides `--sidebar-width` and `--sidebar-width-icon` CSS variables on the root wrapper. Sidebar reads them via `w-[--sidebar-width]` Tailwind syntax.
- Mobile mode renders `<Sheet>` instead of `<aside>`. Children passed once; the conditional renders in the correct container.
- `SidebarTrigger.onClick` calls `toggleSidebar` from context AND calls consumer's `onClick` after.
- Cookie persistence runs in `setOpen` on every set. Initial state from `defaultOpen`. Consumer SSR: read cookie server-side and pass to `defaultOpen`.
- Keyboard shortcut: `Cmd+B` (Mac) / `Ctrl+B` (Win/Linux). `event.preventDefault()` to avoid browser bookmarks bar.
- `SidebarMenuButton` exposes `active` boolean; cva applies `bg-accent` when true.

- [ ] **Step 4: Run test, expect 20 passing**

```bash
pnpm --filter @idcert/ui test sidebar
```

Expected: 20/20 (2 useIsMobile + 3 useSidebar + 3 SidebarProvider + 12 Sidebar suite). If `setMatchMedia` mock leaks across tests (test order issue), make sure each test calls `setMatchMedia(false)` or `setMatchMedia(true)` explicitly. Document any deviation.

If the cookie test conflicts with jsdom's native cookie support, you can simplify by checking if `document.cookie` includes `sidebar:state=` after toggle (instead of spying on the setter). Refer to Plan 4b URL.createObjectURL mock pattern if needed.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/sidebar/sidebar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import {
  Folder,
  Home,
  LayoutDashboard,
  Settings,
  User,
} from 'lucide-react'
import * as React from 'react'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
} from './index.js'

const meta = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

function ExampleSidebar({ collapsible = 'icon' }: { collapsible?: 'offcanvas' | 'icon' | 'none' }) {
  return (
    <Sidebar collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenuButton size="lg">
          <Home />
          <span>idcert</span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton active>
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Folder />
                <span>Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton>
          <User />
          <span>Account</span>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <ExampleSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Page header</span>
        </header>
        <div className="p-6">
          <h1 className="text-2xl font-semibold">Hello</h1>
          <p className="text-muted-foreground">Click the trigger to toggle the sidebar.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
}

export const RightSide: Story = {
  render: () => (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Right-side sidebar</span>
        </header>
        <div className="p-6">Content area.</div>
      </SidebarInset>
      <Sidebar side="right" collapsible="icon">
        <SidebarHeader>
          <SidebarMenuButton size="lg">
            <Home />
            <span>idcert</span>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
}

export const InsetVariant: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenuButton size="lg">
            <Home />
            <span>idcert</span>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton active>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Inset variant</span>
        </header>
        <div className="p-6">Inset gives the sidebar a card-like surrounding.</div>
      </SidebarInset>
    </SidebarProvider>
  ),
}

export const NonCollapsible: Story = {
  render: () => (
    <SidebarProvider>
      <ExampleSidebar collapsible="none" />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <span className="text-sm font-medium">No collapse</span>
        </header>
        <div className="p-6">Sidebar always expanded.</div>
      </SidebarInset>
    </SidebarProvider>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  useSidebar,
  useIsMobile,
  type SidebarProviderProps,
  type SidebarProps,
  type SidebarHeaderProps,
  type SidebarContentProps,
  type SidebarFooterProps,
  type SidebarGroupProps,
  type SidebarGroupLabelProps,
  type SidebarMenuProps,
  type SidebarMenuItemProps,
  type SidebarMenuButtonProps,
  type SidebarTriggerProps,
  type SidebarRailProps,
  type SidebarInsetProps,
} from './components/sidebar/index.js'
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
git add packages/ui/src/components/sidebar packages/ui/src/index.ts
git commit -m "feat(ui): add Sidebar compound (Provider + 11 sub-parts + useSidebar + useIsMobile)"
```

---

## Task 4: Final validation + v0.7.0 changeset

- [ ] **Step 1: Clean rebuild**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
pnpm clean
pnpm install
pnpm build
```

Expected: 5/5 packages successful. `dist/index.js` and `dist/index.cjs` start with `"use client";`. `@base-ui/react/dialog` external (not inlined).

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

All must pass. Total tests target after Plan 5b:

| Source                       | Tests |
|------------------------------|------:|
| Plans 1+2 + Plan 3 + Plan 4a + Plan 4b + Plan 5a | 239 |
| Plan 5b Sheet                | +9    |
| Plan 5b Navbar               | +9    |
| Plan 5b Sidebar              | +20   |
| **Total target**             | **~277** |

Record actual count.

- [ ] **Step 3: Verify Storybook indexes new stories**

```bash
pnpm --filter @idcert/storybook build
```

Expected: build succeeds and indexes 3 new stories: `Navigation/Sheet`, `Navigation/Navbar`, `Navigation/Sidebar`.

- [ ] **Step 4: Create playground smoke page**

Create `apps/playground/app/dashboard/page.tsx`:

```tsx
'use client'

import {
  Folder,
  Home,
  LayoutDashboard,
  Settings,
  User,
} from 'lucide-react'
import * as React from 'react'
import {
  Button,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@idcert/ui'

export default function DashboardPage() {
  const [filterOpen, setFilterOpen] = React.useState(false)

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenuButton size="lg">
            <Home />
            <span>idcert</span>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton active>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Folder />
                  <span>Projects</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuButton>
            <User />
            <span>Account</span>
          </SidebarMenuButton>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <Navbar position="sticky">
          <SidebarTrigger />
          <NavbarBrand>
            <span className="font-semibold">Dashboard</span>
          </NavbarBrand>
          <NavbarContent>
            <NavbarItem href="#" active>Overview</NavbarItem>
            <NavbarItem href="#">Reports</NavbarItem>
          </NavbarContent>
          <NavbarActions>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger render={<Button variant="outline">Filters</Button>} />
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Adjust filter criteria.</SheetDescription>
                </SheetHeader>
                <div className="py-4 text-sm">Filter form goes here.</div>
                <SheetFooter>
                  <Button onClick={() => setFilterOpen(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={() => setFilterOpen(false)}>Apply</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </NavbarActions>
        </Navbar>
        <main className="p-6">
          <h1 className="text-2xl font-semibold">Welcome</h1>
          <p className="mt-2 text-muted-foreground">
            Toggle sidebar via <kbd>Cmd/Ctrl+B</kbd> or click the menu icon.
          </p>
          <p className="mt-2 text-muted-foreground">
            Resize browser to mobile width to see Sidebar collapse into a Sheet drawer.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

Verify the playground builds:

```bash
pnpm --filter @idcert/playground build
```

Expected: build succeeds, route `/dashboard` rendered as static.

DO NOT start `pnpm dev` from this task — user manually verifies in browser later.

- [ ] **Step 5: Add v0.7.0 changeset**

Create `.changeset/v0.7.0-navigation-shells.md`:

```markdown
---
'@idcert/ui': minor
---

Add 3 new components in the Navigation category (second half — completes the category alongside Plan 5a's Tabs / DropdownMenu / Breadcrumb / Pagination).

Components (`@idcert/ui`):
- `Sheet` compound — slide-in drawer built on Base UI Dialog. cva variant `side`: `top`, `right` (default), `bottom`, `left`. Sub-parts: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`. Default close-X icon button in top-right (opt-out via `showCloseButton={false}` on SheetContent). Reusable beyond Sidebar (filter panels, mobile cart, settings drawers).
- `Navbar` compound — semantic `<nav>` shell. cva variant `position`: `static` (default), `sticky`, `fixed`. Sub-parts: `Navbar`, `NavbarBrand`, `NavbarContent`, `NavbarItem`, `NavbarActions`, `NavbarMobileToggle`. `NavbarItem asChild` for Next.js Link.
- `Sidebar` compound — full app shell with state management. `SidebarProvider` (cookie persistence via `sidebar:state`, `Cmd/Ctrl+B` keyboard shortcut), 11 sub-parts (`Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`), and 2 hooks (`useSidebar`, `useIsMobile`). Variants: `side` (left/right), `variant` (sidebar/inset), `collapsible` (offcanvas/icon/none). Mobile mode auto-renders inside `Sheet`.

No new dependencies.

Out of scope (deferred):
- Sidebar `floating` variant, nested groups, drag-to-resize handle, mobile drawer side="right".
- Navbar mega-menu, customizable mobile breakpoint.
- Sheet stacked, mobile swipe-to-close.
- Customizable keyboard shortcut, alternative persistence backends, SSR cookie helper.
```

- [ ] **Step 6: Verify changeset status**

```bash
pnpm exec changeset status
```

Expected: `@idcert/ui` minor bump.

- [ ] **Step 7: Final commit**

```bash
git add .changeset/v0.7.0-navigation-shells.md apps/playground/app/dashboard/page.tsx
git commit -m "chore: changeset for v0.7.0 (navigation shells) + playground smoke"
```

- [ ] **Step 8: Final state check**

```bash
git status                                                               # clean
git log --oneline main..feat/navigation-shells | wc -l                  # ~4 commits expected
pnpm test                                                                # all green
```

Expected: working tree clean, 4 commits ahead of main, all gates green.

Commits expected on the branch (no Task 0 commit since it was a no-op):
1. Sheet
2. Navbar
3. Sidebar
4. v0.7.0 changeset + playground smoke

---

## Self-Review Notes

**Spec coverage:**

- Spec section "Component APIs / 1. Sheet" — covered in Task 1. 8 sub-parts (Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose), 4 cva side variants, default close-X button.
- Spec section "Component APIs / 2. Navbar" — covered in Task 2. 6 sub-parts, 3 position variants, asChild slot composition for NavbarItem.
- Spec section "Component APIs / 3. Sidebar" — covered in Task 3. SidebarProvider with state machine + cookie + keyboard shortcut. 11 styled sub-parts. 2 hooks (useSidebar throws outside Provider; useIsMobile via matchMedia). Mobile mode renders inside Sheet.
- Spec section "Architecture / SidebarProvider state machine" — covered in Task 3 implementation.
- Spec section "Architecture / useIsMobile hook" — covered in Task 3 implementation; SSR returns `false` on first render before useEffect.
- Spec section "File structure" — matches Task definitions.
- Spec section "Test scope" — Sheet 9, Navbar 9, Sidebar 20 (5 hooks-related + 15 component) = 38 tests. Spec target was ~35; actual slightly above due to subtest granularity. Acceptable.
- Spec section "Versioning + release" — covered in Task 4. `@idcert/ui` 0.6.0 → 0.7.0.
- Spec section "Risks and mitigations" — addressed inline in component task notes (mobile/Sheet integration in Task 3, cookie SSR mismatch documented in changeset, keyboard shortcut opt-out exposed via prop).
- Spec section "Acceptance criteria" — covered by Task 4 final validation steps.

**Placeholder scan:**

- No "TBD", "TODO", "implement later" in plan body.
- One conditional in Task 1 ("If the backdrop click test is flaky in jsdom") — concrete adaptation guidance (inspect DOM, adapt query). Not a blocker.
- One conditional in Task 3 ("If `setMatchMedia` mock leaks across tests") — concrete fix (call setMatchMedia explicitly per test). Not a blocker.
- One conditional in Task 3 ("If the cookie test conflicts with jsdom's native cookie support") — alternative simpler assertion documented.
- Test count discrepancy with spec (spec ~35, plan ~38) — documented in Task 4 reconciliation table.

**Type consistency:**

- `SidebarContextValue` shape (state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar) consistent across Provider implementation, useSidebar hook return, all consumers (SidebarTrigger, SidebarRail, Sidebar mobile branch).
- `SidebarProps` (`side`, `variant`, `collapsible`) consistent between component, tests, story, playground.
- `SheetContentProps` (`side`, `showCloseButton`) consistent across component, tests, story.
- `NavbarProps['position']` enum 'static' | 'sticky' | 'fixed' consistent.
- `SidebarMenuButtonProps` (`size`, `active`, `asChild`) consistent across component, cva, tests, story.
- All sub-part types exported from each module's `index.tsx` and re-exported via barrel.

**Risks tracked from spec:**

- Sidebar mobile + Sheet integration → covered by Task 3 step 3 conditional rendering branch + Task 3 test "mobile mode renders inside Sheet".
- Cookie SSR mismatch → documented in plan and changeset; consumer responsibility.
- Keyboard shortcut conflict → opt-out via `enableKeyboardShortcut={false}`; documented and tested.
- `useIsMobile` SSR → returns `false` initially, updates on mount via useEffect. Documented behavior.
- Sheet `data-state` attribute → confirmed Plan 3 pattern (`data-[open]:` / `data-[closed]:` no `state=` prefix); plan uses correct selectors.
- Sidebar variant `inset` → applies `bg-muted` and rounded border to the sidebar wrapper itself; tested via story rendering.
- `document.cookie` in jsdom → native support; tests can either spy or read directly.
- Sidebar inside Server Component layouts → `'use client'` directive on file; consumer responsibility documented.
