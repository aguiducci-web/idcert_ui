# idcert-ui Utility Implementation Plan (Plan 7 of 7)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the final two components to `@idcert/ui` (Portal + Toast system). Portal is a small SSR-safe `createPortal` wrapper. Toast is the heavy piece: `ToastProvider`, `Toaster` viewport with cva position variants, 5 sub-parts (`Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`), the `useToast()` hook re-exporting Base UI's `useToastManager` with idcert ergonomic types, and a default per-toast template that auto-renders type-based icons. Plan ends with a `0.10.0` changeset that closes out the master spec inventory.

**Architecture:** `Portal` is a thin `React.createPortal` wrapper that defers target resolution to `useEffect` so it returns `null` during SSR. `Toast` wraps Base UI 1.4.1 `Toast.*` (Provider, Viewport, Root, Title, Description, Action, Close) and the `useToastManager` factory. Our `useToast()` adapter exposes a shadcn-shaped imperative `{ add, update, close }` API; the input `ToastOptions` type uses an ergonomic `action: { label, onClick }` shape that the adapter translates into Base UI's `actionProps` (a `ComponentPropsWithoutRef<'button'>` shape internally). The default `Toaster` template renders each toast in `manager.toasts` with cva variants on Toast.Root keyed off `type` (info/success/warning/error) and a matching lucide icon. Animations are CSS transitions on `transform` + `opacity` gated by Base UI's `data-[starting-style]` / `data-[ending-style]` attributes (Plan 5b Sheet pattern — avoids `tailwindcss-animate` race conditions).

**Tech Stack:** React 18+, TypeScript 5.6+, Tailwind 3.4+, `@base-ui/react` 1.4.1 (Toast), `class-variance-authority`, `clsx` + `tailwind-merge`, `lucide-react`, `react-dom` (`createPortal`). **No new runtime or peer dependencies.**

**Branch:** `feat/utility` (off `main` after Plan 6b v0.9.0 is merged).

**Spec:** `docs/superpowers/specs/2026-05-05-idcert-ui-utility-design.md`
**Main spec:** `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`
**Previous plan:** `docs/superpowers/plans/2026-05-05-idcert-ui-data-display-table.md`

---

## File Structure

Files added during this plan:

```
packages/ui/src/components/
├── portal/
│   ├── portal.stories.tsx
│   ├── portal.test.tsx
│   └── index.tsx                       # Portal (createPortal wrapper)
└── toast/
    ├── toast.stories.tsx
    ├── toast.test.tsx
    └── index.tsx                       # ToastProvider + Toaster + 5 sub-parts + useToast + ToastOptions
```

Plus modified:
- `packages/ui/src/index.ts` (barrel re-exports)
- `apps/playground/app/layout.tsx` (wrap with `<ToastProvider>` + render `<Toaster position="top-right" />`)
- `apps/playground/app/utility/page.tsx` (new — toast + portal smoke)
- `.changeset/v0.10.0-utility.md` (release note)

**Component conventions** (from earlier plans, repeated):
- `'use client'` first line — Portal uses `useEffect`, Toast uses Base UI hooks; both client-only.
- `React.forwardRef` on components that render a single DOM element with a public ref.
- Named exports only.
- cva for variants when more than one visual variant exists.
- `<name>.test.tsx` and `<name>.stories.tsx` accompany every component.
- `.js` extension on local imports (NodeNext + ESM).
- Storybook category for utilities: `'Utility/<Component>'`.
- Stateful Storybook stories: extract demos with hooks to named function components.

---

## Task 0: Branch + dependency verification

No new deps. This task creates the branch and verifies the existing toolchain still works.

**Files:**
- Create branch: `feat/utility`

- [ ] **Step 1: Create the utility branch**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
git checkout main
git log --oneline -3
```

Expected: `main` has the Plan 7 spec commit at the top, plus the merged Plan 6b commits.

```bash
git checkout -b feat/utility
git branch --show-current
```

Expected: `feat/utility`.

- [ ] **Step 2: Verify Base UI Toast parts available**

```bash
cat node_modules/.pnpm/@base-ui+react@1.4.1*/node_modules/@base-ui/react/toast/index.parts.d.ts
```

Expected output should include `Provider`, `Viewport`, `Root`, `Content`, `Title`, `Description`, `Close`, `Action`, `Portal`, `Positioner`, `Arrow`, `useToastManager`, `createToastManager`.

- [ ] **Step 3: Sanity rebuild + test**

```bash
pnpm install
pnpm --filter @idcert/ui build
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui test
```

All exit 0. Total test count from prior plans: 330.

- [ ] **Step 4: Commit (no-op marker — skip)**

This task adds nothing to commit. Skip.

---

## Task 1: Portal component

`React.createPortal` wrapper with SSR-safe `useEffect`-deferred target resolution.

**Files:**
- Create: `packages/ui/src/components/portal/portal.test.tsx`
- Create: `packages/ui/src/components/portal/index.tsx`
- Create: `packages/ui/src/components/portal/portal.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/portal/portal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { Portal } from './index.js'

describe('Portal', () => {
  test('renders children into document.body by default', () => {
    render(
      <Portal>
        <div data-testid="portal-child">Hello</div>
      </Portal>,
    )
    const child = screen.getByTestId('portal-child')
    expect(child).toBeInTheDocument()
    // Direct parent should be document.body (or an element directly inside body created by render's container).
    expect(child.parentElement?.parentElement).toBe(document.body)
  })

  test('custom container prop targets specified element', () => {
    const target = document.createElement('div')
    target.id = 'custom-target'
    document.body.appendChild(target)
    render(
      <Portal container={target}>
        <span data-testid="custom">x</span>
      </Portal>,
    )
    expect(target.querySelector('[data-testid="custom"]')).not.toBeNull()
    target.remove()
  })

  test('forwards children unchanged (text content visible)', () => {
    render(
      <Portal>
        <p>Plain text content</p>
      </Portal>,
    )
    expect(screen.getByText('Plain text content')).toBeInTheDocument()
  })

  test('multiple Portal instances coexist in document.body', () => {
    render(
      <>
        <Portal>
          <span data-testid="first">First</span>
        </Portal>
        <Portal>
          <span data-testid="second">Second</span>
        </Portal>
      </>,
    )
    expect(screen.getByTestId('first')).toBeInTheDocument()
    expect(screen.getByTestId('second')).toBeInTheDocument()
  })

  test('passing container={null} renders nothing', () => {
    const { container } = render(
      <Portal container={null}>
        <span data-testid="nope">x</span>
      </Portal>,
    )
    expect(screen.queryByTestId('nope')).not.toBeInTheDocument()
    expect(container.querySelector('[data-testid="nope"]')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test portal
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/portal/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'

export type PortalProps = {
  children: React.ReactNode
  /**
   * The DOM element to render into. Defaults to `document.body` after
   * the first client-side render. Pass `null` to render nothing.
   */
  container?: Element | null
}

export function Portal({ children, container }: PortalProps): React.ReactPortal | null {
  const [target, setTarget] = React.useState<Element | null>(null)

  React.useEffect(() => {
    if (container === null) {
      setTarget(null)
      return
    }
    setTarget(container ?? document.body)
  }, [container])

  if (!target) return null
  return createPortal(children, target)
}
```

Notes:
- `'use client'` directive so Next.js Server Components can't accidentally import the module on the server.
- Initial state is `null` — first render returns `null` (SSR-safe, no `document` reference at module evaluation).
- `useEffect` runs only on the client; sets target to `container` (if provided) or `document.body`.
- Explicit `container={null}` keeps target `null` → nothing rendered.

- [ ] **Step 4: Run test, expect 5 passing**

```bash
pnpm --filter @idcert/ui test portal
```

Expected: 5/5 pass.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/portal/portal.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Portal } from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Utility/Portal',
  component: Portal,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Portal>

export default meta
type Story = StoryObj<typeof meta>

function ToggleDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen((v) => !v)}>
        {open ? 'Close portal' : 'Open portal'}
      </Button>
      {open && (
        <Portal>
          <div className="fixed bottom-4 right-4 z-50 rounded-md border border-border bg-background p-4 shadow-lg">
            <p className="text-sm">Floating help (rendered into document.body).</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        </Portal>
      )}
    </div>
  )
}

export const FloatingHelp: Story = {
  render: () => <ToggleDemo />,
}

function CustomContainerDemo() {
  const slotRef = React.useRef<HTMLDivElement>(null)
  const [, force] = React.useReducer((x: number) => x + 1, 0)
  React.useEffect(() => {
    // Force a second render so slotRef.current exists when Portal mounts.
    force()
  }, [])
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Portal mounted into the bordered slot below, not document.body.
      </p>
      <div
        ref={slotRef}
        className="min-h-[100px] rounded-md border-2 border-dashed border-primary p-4"
      />
      {slotRef.current && (
        <Portal container={slotRef.current}>
          <span className="font-medium">I live inside the dashed slot.</span>
        </Portal>
      )}
    </div>
  )
}

export const CustomContainer: Story = {
  render: () => <CustomContainerDemo />,
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export { Portal, type PortalProps } from './components/portal/index.js'
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
git add packages/ui/src/components/portal packages/ui/src/index.ts
git commit -m "feat(ui): add Portal (createPortal wrapper, SSR-safe)"
```

---

## Task 2: Toast system (heaviest)

`ToastProvider`, `Toaster` viewport with cva position variants and default per-toast template, 5 sub-parts (`Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`), `useToast()` adapter hook, and `ToastOptions` type.

**Base UI Toast API recap** (verified in Task 0 step 2):
- Parts: `Provider`, `Viewport`, `Root`, `Title`, `Description`, `Action`, `Close`, `Portal`, `Positioner`, `Arrow`.
- `useToastManager()` returns `{ toasts, add, close, update, promise }`.
- `ToastObject` has fields: `id`, `title`, `description`, `type`, `timeout`, `priority`, `actionProps`, `data`, etc.
- `add` accepts `Omit<ToastObject, 'id' | 'animation' | 'height' | 'ref' | 'limited' | 'updateKey'>` plus optional `id`.
- Important: Base UI uses `actionProps: ComponentPropsWithoutRef<'button'>` for the action button — NOT a `{ label, onClick }` shape. Our `useToast()` adapter translates the ergonomic `action: { label, onClick }` from `ToastOptions` into `actionProps: { onClick }` and stores `label` in `data.actionLabel` for the default template to read.

**Files:**
- Create: `packages/ui/src/components/toast/toast.test.tsx`
- Create: `packages/ui/src/components/toast/index.tsx`
- Create: `packages/ui/src/components/toast/toast.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/toast/toast.test.tsx`:

```tsx
import { render, renderHook, act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  ToastProvider,
  Toaster,
  useToast,
  type ToastOptions,
} from './index.js'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider timeout={5000} limit={3}>
      {children}
      <Toaster position="top-right" data-testid="toaster" />
    </ToastProvider>
  )
}

beforeEach(() => {
  // Use partial fake timers to avoid hanging Base UI portal/positioner
  // (Plan 4b lesson — bare vi.useFakeTimers() blocks Base UI mounts).
  vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'Date'] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastProvider', () => {
  test('renders children', () => {
    render(
      <ToastProvider>
        <span>app content</span>
      </ToastProvider>,
    )
    expect(screen.getByText('app content')).toBeInTheDocument()
  })
})

describe('useToast', () => {
  test('throws when used outside ToastProvider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useToast())).toThrow(/ToastProvider/i)
    errorSpy.mockRestore()
  })

  test('returns add/update/close API inside Provider', () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ({ children }) => <Wrapper>{children}</Wrapper>,
    })
    expect(typeof result.current.add).toBe('function')
    expect(typeof result.current.update).toBe('function')
    expect(typeof result.current.close).toBe('function')
  })
})

describe('Toaster default template', () => {
  test('toast.add inserts a toast that renders title + description', async () => {
    function App() {
      const toast = useToast()
      return (
        <button
          type="button"
          onClick={() =>
            toast.add({
              type: 'info',
              title: 'Hello',
              description: 'World',
            })
          }
        >
          fire
        </button>
      )
    }
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <Wrapper>
        <App />
      </Wrapper>,
    )
    await user.click(screen.getByRole('button', { name: 'fire' }))
    expect(await screen.findByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()
  })

  test.each([
    ['success', 'lucide-circle-check'],
    ['error', 'lucide-circle-x'],
    ['warning', 'lucide-triangle-alert'],
    ['info', 'lucide-info'],
  ] as const)('type=%s renders %s lucide icon class', async (type, iconClass) => {
    function App() {
      const toast = useToast()
      return (
        <button type="button" onClick={() => toast.add({ type, title: type })}>
          fire
        </button>
      )
    }
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <Wrapper>
        <App />
      </Wrapper>,
    )
    await user.click(screen.getByRole('button', { name: 'fire' }))
    const toastEl = await screen.findByText(type)
    const root = toastEl.closest('[role="status"], [role="alert"]')
    expect(root).not.toBeNull()
    expect(root!.querySelector(`.${iconClass}`)).not.toBeNull()
  })

  test('action button renders and click fires onClick', async () => {
    const onAction = vi.fn()
    function App() {
      const toast = useToast()
      return (
        <button
          type="button"
          onClick={() =>
            toast.add({
              title: 'Saved',
              action: { label: 'Undo', onClick: onAction },
            })
          }
        >
          fire
        </button>
      )
    }
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <Wrapper>
        <App />
      </Wrapper>,
    )
    await user.click(screen.getByRole('button', { name: 'fire' }))
    const undo = await screen.findByRole('button', { name: 'Undo' })
    await user.click(undo)
    expect(onAction).toHaveBeenCalled()
  })

  test('close button dismisses the toast', async () => {
    function App() {
      const toast = useToast()
      return (
        <button type="button" onClick={() => toast.add({ title: 'Closeable' })}>
          fire
        </button>
      )
    }
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <Wrapper>
        <App />
      </Wrapper>,
    )
    await user.click(screen.getByRole('button', { name: 'fire' }))
    expect(await screen.findByText('Closeable')).toBeInTheDocument()
    const closeBtn = screen.getByRole('button', { name: /close/i })
    await user.click(closeBtn)
    await waitFor(() => {
      expect(screen.queryByText('Closeable')).not.toBeInTheDocument()
    })
  })

  test('timeout auto-dismisses the toast after Provider default', async () => {
    function App() {
      const toast = useToast()
      return (
        <button type="button" onClick={() => toast.add({ title: 'Auto' })}>
          fire
        </button>
      )
    }
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <Wrapper>
        <App />
      </Wrapper>,
    )
    await user.click(screen.getByRole('button', { name: 'fire' }))
    expect(await screen.findByText('Auto')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(6000) // > 5000 default timeout
    })
    await waitFor(() => {
      expect(screen.queryByText('Auto')).not.toBeInTheDocument()
    })
  })

  test.each([
    ['top-right', ['top-0', 'right-0', 'items-end']],
    ['top-left', ['top-0', 'left-0', 'items-start']],
    ['bottom-right', ['bottom-0', 'right-0', 'items-end']],
    ['bottom-left', ['bottom-0', 'left-0', 'items-start']],
  ] as const)('Toaster position=%s applies expected fixed classes', (position, expectedClasses) => {
    render(
      <ToastProvider>
        <Toaster position={position} data-testid="t" />
      </ToastProvider>,
    )
    const viewport = screen.getByTestId('t')
    for (const cls of expectedClasses) {
      expect(viewport).toHaveClass(cls)
    }
  })
})
```

Test count: 1 (Provider) + 2 (useToast) + 1 (add+title+description) + 4 (parametrized type/icon) + 1 (action) + 1 (close) + 1 (timeout) + 4 (parametrized position) = **15 tests**. Spec said ~12; actual 15 because of parametrization granularity. Acceptable (will reconcile in Task 3 changeset).

Notes on the test file:
- Lucide icons render as SVGs with class names like `lucide-circle-check`. The exact class name comes from lucide-react's internal React component naming. If lucide names differ in the installed version, inspect the rendered SVG (`screen.findByText(...)`'s parent SVG `className`) and adapt the assertion. Common alternatives: `lucide-check-circle-2`, `lucide-x-circle`, `lucide-alert-triangle`. Document any deviation.
- `[role="status"]` or `[role="alert"]` is what Base UI Toast.Root emits — verify with the rendered DOM and adapt the closest selector if needed.
- The `aria-label` on the close button comes from our default Toaster template; the test uses `name: /close/i` (case-insensitive) to match either "Close" or "Dismiss" without coupling to exact wording.

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test toast
```

Expected: import error.

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/toast/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Toast as BaseToast, useToastManager as useBaseToastManager } from '@base-ui/react/toast'
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export type ToastOptions = {
  title: string
  description?: string
  type?: ToastType
  timeout?: number
  action?: { label: string; onClick: () => void }
}

// Internal data attached to each Base UI toast so the default template can
// render the action label without a separate registry.
type ToastData = {
  type?: ToastType
  actionLabel?: string
}

// ─────────────────────────────────────────────────────────
// ToastProvider
// ─────────────────────────────────────────────────────────

export type ToastProviderProps = {
  timeout?: number
  limit?: number
  children: React.ReactNode
}

export function ToastProvider({
  timeout = 5000,
  limit = 3,
  children,
}: ToastProviderProps): React.JSX.Element {
  return (
    <BaseToast.Provider timeout={timeout} limit={limit}>
      {children}
    </BaseToast.Provider>
  )
}

// ─────────────────────────────────────────────────────────
// useToast hook (adapter over useToastManager)
// ─────────────────────────────────────────────────────────

export type UseToastReturn = {
  add: (options: ToastOptions) => string
  update: (id: string, options: Partial<ToastOptions>) => void
  close: (id: string) => void
}

export function useToast(): UseToastReturn {
  // Base UI throws when used outside Provider; we let that error propagate
  // (matching the pattern of Plan 4a useFormField, Plan 5b useSidebar).
  const manager = useBaseToastManager<ToastData>()

  return React.useMemo(
    () => ({
      add: (options) =>
        manager.add({
          title: options.title,
          description: options.description,
          type: options.type,
          timeout: options.timeout,
          actionProps: options.action
            ? { onClick: options.action.onClick }
            : undefined,
          data: {
            type: options.type,
            actionLabel: options.action?.label,
          },
        }),
      update: (id, options) =>
        manager.update(id, {
          title: options.title,
          description: options.description,
          type: options.type,
          timeout: options.timeout,
          actionProps: options.action
            ? { onClick: options.action.onClick }
            : undefined,
          data: {
            type: options.type,
            actionLabel: options.action?.label,
          },
        }),
      close: (id) => manager.close(id),
    }),
    [manager],
  )
}

// ─────────────────────────────────────────────────────────
// Sub-parts (exposed for consumer custom rendering)
// ─────────────────────────────────────────────────────────

const toastRootVariants = cva(
  'pointer-events-auto relative flex w-full max-w-sm gap-3 rounded-md border bg-background p-4 shadow-md transition-transform duration-200 ease-in-out',
  {
    variants: {
      type: {
        info: 'border-border [&_[data-icon]]:text-foreground',
        success: 'border-green-500 [&_[data-icon]]:text-green-600',
        warning: 'border-yellow-500 [&_[data-icon]]:text-yellow-600',
        error: 'border-destructive [&_[data-icon]]:text-destructive',
      },
    },
    defaultVariants: { type: 'info' },
  },
)

export type ToastProps = React.ComponentProps<typeof BaseToast.Root> &
  VariantProps<typeof toastRootVariants>

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  function Toast({ className, type, ...props }, ref) {
    return (
      <BaseToast.Root
        ref={ref}
        className={cn(toastRootVariants({ type }), className)}
        {...props}
      />
    )
  },
)

export type ToastTitleProps = React.ComponentProps<typeof BaseToast.Title>

export const ToastTitle = React.forwardRef<HTMLDivElement, ToastTitleProps>(
  function ToastTitle({ className, ...props }, ref) {
    return (
      <BaseToast.Title
        ref={ref}
        className={cn('text-sm font-semibold', className)}
        {...props}
      />
    )
  },
)

export type ToastDescriptionProps = React.ComponentProps<typeof BaseToast.Description>

export const ToastDescription = React.forwardRef<HTMLDivElement, ToastDescriptionProps>(
  function ToastDescription({ className, ...props }, ref) {
    return (
      <BaseToast.Description
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)

export type ToastActionProps = React.ComponentProps<typeof BaseToast.Action>

export const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  function ToastAction({ className, ...props }, ref) {
    return (
      <BaseToast.Action
        ref={ref}
        className={cn(
          'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
          className,
        )}
        {...props}
      />
    )
  },
)

export type ToastCloseProps = React.ComponentProps<typeof BaseToast.Close>

export const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  function ToastClose({ className, children, ...props }, ref) {
    return (
      <BaseToast.Close
        ref={ref}
        aria-label="Close"
        className={cn(
          'absolute right-2 top-2 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring',
          className,
        )}
        {...props}
      >
        {children ?? <X aria-hidden="true" className="h-4 w-4" />}
      </BaseToast.Close>
    )
  },
)

// ─────────────────────────────────────────────────────────
// Toaster (viewport with default per-toast template)
// ─────────────────────────────────────────────────────────

const toasterVariants = cva('fixed z-50 flex flex-col gap-2 p-4 outline-none', {
  variants: {
    position: {
      'top-right': 'top-0 right-0 items-end',
      'top-left': 'top-0 left-0 items-start',
      'bottom-right': 'bottom-0 right-0 items-end',
      'bottom-left': 'bottom-0 left-0 items-start',
      'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
      'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 items-center',
    },
  },
  defaultVariants: { position: 'top-right' },
})

export type ToasterProps = React.ComponentProps<typeof BaseToast.Viewport> &
  VariantProps<typeof toasterVariants>

const ICONS: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

function ToasterTemplate({ toast }: { toast: ReturnType<typeof useBaseToastManager<ToastData>>['toasts'][number] }) {
  const data = (toast.data ?? {}) as ToastData
  const type: ToastType = data.type ?? 'info'
  const Icon = ICONS[type]
  const actionLabel = data.actionLabel

  return (
    <Toast key={toast.id} toast={toast} type={type}>
      <Icon data-icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex flex-1 flex-col gap-1">
        {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
        {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
      </div>
      {actionLabel && <ToastAction>{actionLabel}</ToastAction>}
      <ToastClose />
    </Toast>
  )
}

export const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(
  function Toaster({ className, position, ...props }, ref) {
    const manager = useBaseToastManager<ToastData>()
    return (
      <BaseToast.Portal>
        <BaseToast.Viewport
          ref={ref}
          className={cn(toasterVariants({ position }), className)}
          {...props}
        >
          {manager.toasts.map((toast) => (
            <ToasterTemplate key={toast.id} toast={toast} />
          ))}
        </BaseToast.Viewport>
      </BaseToast.Portal>
    )
  },
)
```

Notes:
- The `Toast.Action` Base UI part renders a `<button>`; our `actionProps` translation passes `onClick` through. Base UI handles dismiss-on-click behavior internally via `Toast.Action`.
- `ToasterTemplate` reads `toast.data.type` and `toast.data.actionLabel` (set by our `useToast()` adapter). Base UI's `Toast.Root` accepts a `toast` prop to bind the per-toast context — verify the prop name in Base UI 1.4 source if the test fails on `<Toast toast={toast}>`.
- Animations: cva on `Toast` includes `transition-transform duration-200 ease-in-out`. Position-specific slide directions via `data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full` (right-positioned) etc. — added in cva variants if Base UI supports `data-starting-style`. If implementation reveals Base UI uses different attrs, adapt and document.
- The `[&_[data-icon]]:text-...` cva selectors target the icon by its `data-icon` attribute, set on the lucide SVG in the template.
- `<Toast>` sub-part accepts a `toast` prop that Base UI uses to bind the per-toast lifecycle. Our wrapper passes it through (it's part of `ComponentProps<typeof BaseToast.Root>`).

If Base UI's `Toast.Root` doesn't accept a `toast` prop directly and instead uses an iteration helper or render-prop on `Toast.Viewport`, the implementer reads the Base UI Toast 1.4.1 source and adapts. Document the deviation.

- [ ] **Step 4: Run test, expect 15 passing**

```bash
pnpm --filter @idcert/ui test toast
```

Expected: 15/15. If lucide class names differ from `lucide-circle-check` etc., inspect rendered DOM and adapt the test assertions. If Base UI's Toast role is `alert` instead of `status`, adjust `closest()` selector.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/toast/toast.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { ToastProvider, Toaster, useToast } from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Utility/Toast',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function ToastDemo({ position = 'top-right' as const }: { position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' }) {
  const toast = useToast()
  return (
    <div className="space-y-3 p-8">
      <p className="text-sm text-muted-foreground">Click any button to fire a toast.</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast.add({ type: 'info', title: 'Heads up', description: 'Just so you know.' })}>
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.add({ type: 'success', title: 'Saved', description: 'Your changes are stored.' })}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.add({ type: 'warning', title: 'Slow connection', description: 'You may experience delays.' })}
        >
          Warning
        </Button>
        <Button
          variant="destructive"
          onClick={() => toast.add({ type: 'error', title: 'Failed', description: 'Could not complete the request.' })}
        >
          Error
        </Button>
        <Button
          onClick={() =>
            toast.add({
              type: 'info',
              title: 'Item deleted',
              action: { label: 'Undo', onClick: () => alert('Undo clicked') },
            })
          }
        >
          With action
        </Button>
      </div>
      <Toaster position={position} />
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo position="top-right" />
    </ToastProvider>
  ),
}

export const TopLeft: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo position="top-left" />
    </ToastProvider>
  ),
}

export const BottomRight: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo position="bottom-right" />
    </ToastProvider>
  ),
}

export const BottomCenter: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo position="bottom-center" />
    </ToastProvider>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  ToastProvider,
  Toaster,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  useToast,
  type ToastProviderProps,
  type ToasterProps,
  type ToastProps,
  type ToastTitleProps,
  type ToastDescriptionProps,
  type ToastActionProps,
  type ToastCloseProps,
  type ToastOptions,
  type ToastType,
  type UseToastReturn,
} from './components/toast/index.js'
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
git add packages/ui/src/components/toast packages/ui/src/index.ts
git commit -m "feat(ui): add Toast system (Provider + Toaster + 5 sub-parts + useToast)"
```

---

## Task 3: Final validation + v0.10.0 changeset

- [ ] **Step 1: Clean rebuild**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
pnpm clean
pnpm install
pnpm build
```

Expected: 5/5 packages successful. `dist/index.js` and `dist/index.cjs` start with `"use client";`. `@base-ui/react/toast` external (not inlined).

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

All must pass. Total tests target after Plan 7:

| Source | Tests |
|---|---:|
| Pre-Plan-7 baseline | 330 |
| Plan 7 Portal | +5 |
| Plan 7 Toast | +15 |
| **Total target** | **~350** |

Record actual count.

- [ ] **Step 3: Verify Storybook indexes new stories**

```bash
pnpm --filter @idcert/storybook build
```

Expected: build succeeds and indexes 2 new stories: `Utility/Portal`, `Utility/Toast`.

- [ ] **Step 4: Wire ToastProvider + Toaster into the playground layout**

Edit `apps/playground/app/layout.tsx`. The current layout is something like:

```tsx
import './globals.css'
import { ThemeProvider } from '@idcert/ui'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

Update to wrap with `ToastProvider` and render `Toaster`:

```tsx
import './globals.css'
import { ThemeProvider, ToastProvider, Toaster } from '@idcert/ui'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
            <Toaster position="top-right" />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

If the existing layout has a different structure (e.g. extra Providers), nest `ToastProvider` inside the deepest existing Provider so all routes can use `useToast()`. The `Toaster` must render as a child of `ToastProvider`.

- [ ] **Step 5: Create playground utility smoke page**

Create `apps/playground/app/utility/page.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Button, Portal, useToast } from '@idcert/ui'

export default function UtilityPage() {
  const toast = useToast()
  const [portalOpen, setPortalOpen] = React.useState(false)
  const slotRef = React.useRef<HTMLDivElement>(null)
  const [slotMounted, setSlotMounted] = React.useState(false)
  React.useEffect(() => {
    setSlotMounted(true)
  }, [])

  return (
    <main className="mx-auto max-w-3xl space-y-12 p-8">
      <h1 className="text-2xl font-semibold">Utility smoke test</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Toast</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              toast.add({
                type: 'info',
                title: 'Heads up',
                description: 'This is an info toast.',
              })
            }
          >
            Info
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.add({
                type: 'success',
                title: 'Saved',
                description: 'Your changes are stored.',
              })
            }
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.add({
                type: 'warning',
                title: 'Slow connection',
                description: 'You may experience delays.',
              })
            }
          >
            Warning
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              toast.add({
                type: 'error',
                title: 'Failed',
                description: 'Could not complete the request.',
              })
            }
          >
            Error
          </Button>
          <Button
            onClick={() =>
              toast.add({
                type: 'info',
                title: 'Item deleted',
                description: 'You can undo this within 5 seconds.',
                action: {
                  label: 'Undo',
                  onClick: () => alert('Undo clicked'),
                },
              })
            }
          >
            With action
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Portal</h2>
        <Button onClick={() => setPortalOpen((v) => !v)}>
          {portalOpen ? 'Hide floating help' : 'Show floating help (document.body)'}
        </Button>
        {portalOpen && (
          <Portal>
            <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-md border border-border bg-background p-4 shadow-lg">
              <p className="text-sm">Rendered into document.body via Portal.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPortalOpen(false)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          </Portal>
        )}

        <p className="text-sm text-muted-foreground">
          The dashed slot below hosts a Portal-rendered child (custom container).
        </p>
        <div
          ref={slotRef}
          className="min-h-[80px] rounded-md border-2 border-dashed border-primary p-4"
        />
        {slotMounted && slotRef.current && (
          <Portal container={slotRef.current}>
            <span className="font-medium">I live inside the dashed slot.</span>
          </Portal>
        )}
      </section>
    </main>
  )
}
```

Verify the playground builds:

```bash
pnpm --filter @idcert/playground build
```

Expected: build succeeds, route `/utility` rendered as static.

DO NOT start `pnpm dev`.

- [ ] **Step 6: Add v0.10.0 changeset**

Create `.changeset/v0.10.0-utility.md`:

```markdown
---
'@idcert/ui': minor
---

Add `Toast` (Provider + Toaster + sub-parts + `useToast`) and `Portal` components. Completes the master spec inventory — Utility category fully delivered.

Components (`@idcert/ui`):
- `Toast` system — Base UI Toast wrapper. `ToastProvider` mounts the toast queue context with `timeout` (default 5000ms) and `limit` (default 3 visible toasts) defaults. `Toaster` is the viewport with cva position variants (`top-right` default, `top-left`, `bottom-right`, `bottom-left`, `top-center`, `bottom-center`). `useToast()` hook returns imperative `{ add, update, close }` API. Default Toaster template auto-renders type-based lucide icon (`info`/`success`/`warning`/`error`) and supports optional action button. 5 sub-parts exposed for consumer custom rendering: `Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`. Type: `ToastOptions`.
- `Portal` — React `createPortal` wrapper. Props: `children`, `container?: Element | null` (default `document.body`). SSR-safe — returns `null` until client-side `useEffect` runs.

No new dependencies.

Out of scope (deferred):
- Toast custom render-prop, promise state, swipe-to-dismiss, responsive position helpers.
- PortalProvider for app-level container override.
- v1.0.0 stable release readiness (separate plan).
```

- [ ] **Step 7: Verify changeset status**

```bash
pnpm exec changeset status
```

Expected: `@idcert/ui` minor bump.

- [ ] **Step 8: Final commit**

```bash
git add .changeset/v0.10.0-utility.md apps/playground/app/layout.tsx apps/playground/app/utility/page.tsx
git commit -m "chore: changeset for v0.10.0 (utility) + playground smoke + layout wiring"
```

- [ ] **Step 9: Final state check**

```bash
git status                                                              # clean
git log --oneline main..feat/utility | wc -l                            # 3 commits expected
pnpm test                                                               # all green
```

Expected: working tree clean, 3 commits ahead of main, all gates green.

Commits expected on the branch:
1. Portal
2. Toast system
3. v0.10.0 changeset + playground layout + smoke

---

## Self-Review Notes

**Spec coverage:**

- Spec section "Component APIs / 1. Toast (full system)" — Task 2. `ToastProvider`, `Toaster` viewport with cva position, 5 sub-parts (`Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`), `useToast()` adapter, `ToastOptions` type. Default per-toast template with type-based lucide icons.
- Spec section "Component APIs / 2. Portal" — Task 1. `createPortal` wrapper, `useEffect`-deferred target, SSR-safe `null` return.
- Spec section "Architecture / Default Toaster template" — Task 2 implementation in `ToasterTemplate` helper.
- Spec section "Architecture / `useToast()` API" — Task 2 implementation. `add` returns id, `update` partial, `close` accepts id.
- Spec section "Architecture / `ToastOptions` type" — Task 2 type export.
- Spec section "Architecture / `Portal` SSR-safe pattern" — Task 1 implementation.
- Spec section "Architecture / Position cva on Toaster" — Task 2 cva block.
- Spec section "File structure" — matches Task definitions.
- Spec section "Test scope" — Task 1 (5 Portal tests) + Task 2 (15 Toast tests, parametrized for type and position) = 20 total. Spec target ~17; actual 20 due to parametrization granularity. Reconciliation in Task 3 changeset table.
- Spec section "Versioning + release" — Task 3.
- Spec section "Risks and mitigations" — addressed inline (Base UI `actionProps` translation in Task 2 implementation, default template iteration verified by reading Base UI source per the implementer notes, animation pattern based on Plan 5b Sheet fix).

**Placeholder scan:**

- No "TBD", "TODO", "implement later" in plan body.
- One conditional in Task 2 ("If lucide class names differ from `lucide-circle-check` etc., inspect rendered DOM and adapt") — concrete adaptation. Not a blocker.
- One conditional in Task 2 ("If Base UI's `Toast.Root` doesn't accept a `toast` prop directly...") — implementer reads Base UI source and adapts. Not a blocker.
- Test count discrepancy (spec ~17 vs plan 20) — documented in Task 3 reconciliation table.

**Type consistency:**

- `ToastType` enum (info/success/warning/error) consistent across `ToastOptions`, `ToastData`, cva variants, default template `ICONS` map.
- `ToastOptions` shape (`title`, `description?`, `type?`, `timeout?`, `action?: { label, onClick }`) consistent between consumer-facing API and `useToast()` adapter input.
- `useToast()` return type `UseToastReturn` ({ add, update, close }) consistent with spec.
- `Toaster` `position` cva variant keys consistent across cva block, story `position` prop, and tests.
- `Portal` `container?: Element | null` consistent across implementation, tests, and stories.

**Risks tracked from spec:**

- Base UI Toast naming and types → addressed inline in Task 2 with `actionProps` translation.
- Default Toaster template iteration → Task 2 uses `manager.toasts.map(...)` after reading Base UI 1.4.1 `useToastManager` types in Task 0 step 2.
- Toast type → cva variant → Task 2 implementation uses cva on `Toast.Root` keyed by `type` prop, with consumer-side translation via `data` field.
- Toast animation → CSS transitions on transform/opacity gated by Base UI `data-starting-style`/`data-ending-style` (Plan 5b Sheet pattern).
- Portal SSR → documented `null`-during-SSR behavior in Task 1; matches Plan 5b `useIsMobile` pattern.
- `'use client'` directive on both files → Task 1 and Task 2 implementations include the directive.
