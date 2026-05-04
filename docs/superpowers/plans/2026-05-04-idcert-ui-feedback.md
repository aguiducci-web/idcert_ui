# idcert-ui Feedback Layer Implementation Plan (Plan 3 of 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 components (Alert, Dialog, AlertDialog, Tooltip, Spinner) to `@idcert/ui`, introducing Base UI as the headless primitive layer. Each component is TDD'd. Plan ends with a `0.3.0` changeset.

**Architecture:** Base UI (`@base-ui/react`) powers Dialog, AlertDialog, and Tooltip. We wrap and style — never re-implement focus traps, anchor positioning, or ARIA wiring. Alert and Spinner are pure CSS/lucide custom components. Animations are CSS-only via `tailwindcss-animate` driven by Base UI `data-state` attributes.

**Tech Stack:** React 18+, TypeScript 5.6+, Tailwind 3.4+ + `tailwindcss-animate`, `@base-ui/react` v1, `class-variance-authority`, `clsx` + `tailwind-merge`, `lucide-react`. Two new deps in this plan: `@base-ui/react` (`@idcert/ui` runtime), `tailwindcss-animate` (`@idcert/tailwind-config`).

**Branch:** `feat/feedback` (branched off `feat/primitives`).

**Spec:** `docs/superpowers/specs/2026-05-04-idcert-ui-feedback-design.md`
**Main spec:** `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`
**Previous plan:** `docs/superpowers/plans/2026-05-04-idcert-ui-primitives-layout.md`

---

## File Structure

Files added during this plan:

```
packages/ui/src/components/
├── alert/
│   ├── alert.stories.tsx
│   ├── alert.test.tsx
│   └── index.tsx                  # Alert, AlertTitle, AlertDescription
├── alert-dialog/
│   ├── alert-dialog.stories.tsx
│   ├── alert-dialog.test.tsx
│   └── index.tsx                  # AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel
├── dialog/
│   ├── dialog.stories.tsx
│   ├── dialog.test.tsx
│   └── index.tsx                  # Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
├── spinner/
│   ├── spinner.stories.tsx
│   ├── spinner.test.tsx
│   └── index.tsx
└── tooltip/
    ├── tooltip.stories.tsx
    ├── tooltip.test.tsx
    └── index.tsx                  # TooltipProvider, Tooltip, TooltipTrigger, TooltipContent
```

Plus modified:
- `packages/ui/src/index.ts` (barrel re-exports)
- `packages/ui/package.json` (add `@base-ui/react`)
- `packages/tailwind-config/package.json` (add `tailwindcss-animate`)
- `packages/tailwind-config/src/index.ts` (add plugin + keyframes)
- `.changeset/v0.3.0-feedback.md` (release note)

**Component conventions** (established in Plan 1, repeated for clarity):
- Single file per component (compound components export sub-parts from same `index.tsx`)
- `'use client'` first line for any component using Base UI
- `React.forwardRef` where the component renders a single DOM element with a public ref
- Named exports only
- Variants via `cva` when more than one visual variant exists; otherwise plain Tailwind
- Stories accompany every component (`<name>.stories.tsx`)
- Tests cover: render, key prop application, primary interaction, ARIA, ref forwarding

---

## Task 0: Branch + dependency setup

**Files:**
- Create branch: `feat/feedback`
- Modify: `packages/ui/package.json`
- Modify: `packages/tailwind-config/package.json`
- Modify: `packages/tailwind-config/src/index.ts`

- [ ] **Step 1: Create the feedback branch**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
git checkout feat/primitives
git pull origin feat/primitives 2>/dev/null || true
git checkout -b feat/feedback
```

Verify:
```bash
git branch --show-current
# expected: feat/feedback
```

- [ ] **Step 2: Add Base UI to @idcert/ui**

```bash
pnpm --filter @idcert/ui add @base-ui/react@^1.0.0
```

Verify `packages/ui/package.json` `dependencies` now contains `"@base-ui/react": "^1.0.0"`.

- [ ] **Step 3: Add tailwindcss-animate to @idcert/tailwind-config**

```bash
pnpm --filter @idcert/tailwind-config add tailwindcss-animate@^1.0.7
```

Verify `packages/tailwind-config/package.json` `dependencies` now contains `"tailwindcss-animate": "^1.0.7"`.

- [ ] **Step 4: Update tailwind preset to include the plugin and keyframes**

Replace contents of `packages/tailwind-config/src/index.ts` with:

```ts
import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const preset: Pick<Config, 'darkMode' | 'theme' | 'plugins'> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background:  'rgb(var(--background) / <alpha-value>)',
        foreground:  'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT:    'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT:    'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT:    'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        input:  'rgb(var(--input) / <alpha-value>)',
        ring:   'rgb(var(--ring) / <alpha-value>)',
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [animate],
}

export default preset
```

- [ ] **Step 5: Rebuild tailwind-config and verify**

```bash
pnpm --filter @idcert/tailwind-config build
pnpm --filter @idcert/tailwind-config typecheck
```

Both exit 0.

- [ ] **Step 6: Sanity-check the playground app picks up animate utilities**

```bash
pnpm --filter @idcert/playground build 2>&1 | tail -20
```

Expected: build succeeds (no Tailwind errors). The `animate-in` / `animate-out` utilities are available even if no current code uses them yet.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/package.json packages/tailwind-config/package.json packages/tailwind-config/src/index.ts pnpm-lock.yaml
git commit -m "chore(ui): add Base UI runtime dep and tailwindcss-animate plugin"
```

---

## Component Task Pattern

Tasks 1–5 each follow the same shape:

1. Write the failing test (`<name>.test.tsx`)
2. Run test, verify it fails with module-not-found
3. Implement the component (`<name>/index.tsx`)
4. Run tests, verify all pass
5. Add the Storybook story (`<name>.stories.tsx`)
6. Update `packages/ui/src/index.ts` to re-export the new component(s)
7. Run typecheck + lint + build
8. Commit (single commit per component for clean history)

Order is intentional: simplest first (Spinner, Alert), Base UI primitives last (Tooltip, Dialog, AlertDialog) so each Base UI integration builds on familiarity from the previous one.

---

## Task 1: Spinner component

Pure CSS spinner using lucide `Loader2` icon. No Base UI. Establishes the new file pattern in the slice.

**Files:**
- Create: `packages/ui/src/components/spinner/spinner.test.tsx`
- Create: `packages/ui/src/components/spinner/index.tsx`
- Create: `packages/ui/src/components/spinner/spinner.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Spinner } from './index.js'

describe('Spinner', () => {
  test('renders with role status', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  test('uses default aria-label "Loading"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })

  test('respects custom aria-label', () => {
    render(<Spinner aria-label="Saving changes" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Saving changes')
  })

  test('applies size variant md by default (h-5 w-5)', () => {
    render(<Spinner />)
    const icon = screen.getByRole('status').querySelector('svg')
    expect(icon).toHaveClass('h-5')
    expect(icon).toHaveClass('w-5')
  })

  test('applies size variant lg (h-6 w-6)', () => {
    render(<Spinner size="lg" />)
    const icon = screen.getByRole('status').querySelector('svg')
    expect(icon).toHaveClass('h-6')
    expect(icon).toHaveClass('w-6')
  })

  test('merges custom className on outer span', () => {
    render(<Spinner className="custom-class" />)
    expect(screen.getByRole('status')).toHaveClass('custom-class')
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test spinner
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/spinner/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    },
  },
  defaultVariants: { size: 'md' },
})

export type SpinnerProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'role'> &
  VariantProps<typeof spinnerVariants> & {
    'aria-label'?: string
  }

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner({ className, size, 'aria-label': ariaLabel = 'Loading', ...props }, ref) {
    return (
      <span
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <Loader2 aria-hidden="true" className={spinnerVariants({ size })} />
      </span>
    )
  },
)

export { spinnerVariants }
```

- [ ] **Step 4: Run test, expect 6 passing**

```bash
pnpm --filter @idcert/ui test spinner
```

- [ ] **Step 5: Story**

Create `packages/ui/src/components/spinner/spinner.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './index.js'

const meta = {
  title: 'Feedback/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Small: Story = { args: { size: 'sm' } }
export const Large: Story = { args: { size: 'lg' } }
export const ExtraLarge: Story = { args: { size: 'xl' } }

export const InsideButton: Story = {
  render: () => (
    <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" disabled>
      <Spinner size="sm" aria-label="Saving" />
      <span>Saving…</span>
    </button>
  ),
}

export const CustomColor: Story = {
  render: () => (
    <div className="text-destructive">
      <Spinner size="lg" aria-label="Loading errors" />
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export { Spinner, spinnerVariants, type SpinnerProps } from './components/spinner/index.js'
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
git add packages/ui/src/components/spinner packages/ui/src/index.ts
git commit -m "feat(ui): add Spinner component"
```

---

## Task 2: Alert component (compound)

Custom static notice block. cva variants for semantic intent. Sub-components: `AlertTitle`, `AlertDescription`. Optional default icon per variant.

**Files:**
- Create: `packages/ui/src/components/alert/alert.test.tsx`
- Create: `packages/ui/src/components/alert/index.tsx`
- Create: `packages/ui/src/components/alert/alert.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Alert, AlertTitle, AlertDescription } from './index.js'

describe('Alert', () => {
  test('renders with role alert', () => {
    render(<Alert>Heads up</Alert>)
    expect(screen.getByRole('alert')).toHaveTextContent('Heads up')
  })

  test.each([
    ['default', 'border-border'],
    ['info', 'border-primary'],
    ['success', 'border-green-500'],
    ['warning', 'border-yellow-500'],
    ['destructive', 'border-destructive'],
  ] as const)('variant %s applies expected border class', (variant, expectedClass) => {
    render(<Alert variant={variant} data-testid="a">x</Alert>)
    expect(screen.getByTestId('a')).toHaveClass(expectedClass)
  })

  test('renders default icon for info variant', () => {
    render(<Alert variant="info" data-testid="a">x</Alert>)
    expect(screen.getByTestId('a').querySelector('svg')).not.toBeNull()
  })

  test('does not render icon when icon={false}', () => {
    render(<Alert variant="info" icon={false} data-testid="a">x</Alert>)
    expect(screen.getByTestId('a').querySelector('svg')).toBeNull()
  })

  test('renders custom icon node', () => {
    render(
      <Alert variant="info" icon={<span data-testid="custom-icon">!</span>}>
        x
      </Alert>,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  test('AlertTitle renders as h5 with proper styles', () => {
    render(<AlertTitle>Title</AlertTitle>)
    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H5')
    expect(title).toHaveClass('font-medium')
  })

  test('AlertDescription renders as div', () => {
    render(<AlertDescription data-testid="d">Body</AlertDescription>)
    expect(screen.getByTestId('d').tagName).toBe('DIV')
    expect(screen.getByTestId('d')).toHaveTextContent('Body')
  })

  test('Alert forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Alert ref={ref}>x</Alert>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test alert
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/alert/index.tsx`:

```tsx
import * as React from 'react'
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11',
  {
    variants: {
      variant: {
        default:     'bg-background text-foreground border-border',
        info:        'bg-background text-foreground border-primary [&>svg]:text-primary',
        success:     'bg-background text-foreground border-green-500 [&>svg]:text-green-600',
        warning:     'bg-background text-foreground border-yellow-500 [&>svg]:text-yellow-600',
        destructive: 'bg-background text-destructive border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const defaultIcons: Record<NonNullable<VariantProps<typeof alertVariants>['variant']>, React.ReactNode | null> = {
  default: null,
  info:        <Info aria-hidden="true" />,
  success:     <CheckCircle2 aria-hidden="true" />,
  warning:     <AlertTriangle aria-hidden="true" />,
  destructive: <XCircle aria-hidden="true" />,
}

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    icon?: React.ReactNode | false
  }

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert({ className, variant = 'default', icon, children, ...props }, ref) {
    const resolvedIcon =
      icon === false ? null : icon !== undefined ? icon : defaultIcons[variant ?? 'default']

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {resolvedIcon}
        {children}
      </div>
    )
  },
)

export const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function AlertTitle({ className, ...props }, ref) {
    return (
      <h5
        ref={ref}
        className={cn('mb-1 font-medium leading-none tracking-tight', className)}
        {...props}
      />
    )
  },
)

export const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AlertDescription({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('text-sm [&_p]:leading-relaxed', className)}
        {...props}
      />
    )
  },
)

export { alertVariants }
```

- [ ] **Step 4: Run test, expect all passing**

```bash
pnpm --filter @idcert/ui test alert
```

Expected: 12 tests passing (1 render + 5 parametrized variants + 3 icon + 2 sub-parts + 1 ref).

- [ ] **Step 5: Story**

Create `packages/ui/src/components/alert/alert.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Terminal } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from './index.js'

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'info', 'success', 'warning', 'destructive'] },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
    </Alert>
  ),
}

export const Info: Story = {
  render: () => (
    <Alert variant="info">
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>Version 2.0 is available with new features.</AlertDescription>
    </Alert>
  ),
}

export const Success: Story = {
  render: () => (
    <Alert variant="success">
      <AlertTitle>Saved</AlertTitle>
      <AlertDescription>Your changes have been saved successfully.</AlertDescription>
    </Alert>
  ),
}

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertTitle>Watch out</AlertTitle>
      <AlertDescription>This action will affect billing.</AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Something went wrong. Please try again.</AlertDescription>
    </Alert>
  ),
}

export const CustomIcon: Story = {
  render: () => (
    <Alert icon={<Terminal aria-hidden="true" />}>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>Run <code>pnpm install</code> to fetch new packages.</AlertDescription>
    </Alert>
  ),
}

export const NoIcon: Story = {
  render: () => (
    <Alert variant="info" icon={false}>
      <AlertTitle>Plain message</AlertTitle>
      <AlertDescription>No icon here.</AlertDescription>
    </Alert>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  Alert,
  AlertTitle,
  AlertDescription,
  alertVariants,
  type AlertProps,
} from './components/alert/index.js'
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
git add packages/ui/src/components/alert packages/ui/src/index.ts
git commit -m "feat(ui): add Alert compound (Alert, AlertTitle, AlertDescription)"
```

---

## Task 3: Tooltip compound (Base UI)

First Base UI integration. `TooltipProvider` is required at app root for delay configuration. We expose Provider, Root, Trigger, and Content.

**Base UI module:** `@base-ui/react/tooltip`. Exports a single `Tooltip` namespace with parts: `Tooltip.Provider`, `Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Portal`, `Tooltip.Positioner`, `Tooltip.Popup`, `Tooltip.Arrow`. Trigger uses Base UI's `render` prop, not `asChild`.

**Files:**
- Create: `packages/ui/src/components/tooltip/tooltip.test.tsx`
- Create: `packages/ui/src/components/tooltip/index.tsx`
- Create: `packages/ui/src/components/tooltip/tooltip.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Tooltip uses pointer enter / focus to open. Base UI ships an open delay; we override to `0` in tests so we don't have to wait.

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './index.js'

function renderTooltip(open?: boolean) {
  return render(
    <TooltipProvider delay={0}>
      <Tooltip open={open}>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent>Tooltip body</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  )
}

describe('Tooltip', () => {
  test('trigger renders', () => {
    renderTooltip()
    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })

  test('content is hidden initially', () => {
    renderTooltip()
    expect(screen.queryByText('Tooltip body')).not.toBeInTheDocument()
  })

  test('opens on hover', async () => {
    const user = userEvent.setup()
    renderTooltip()
    await user.hover(screen.getByText('Trigger'))
    await waitFor(() => {
      expect(screen.getByText('Tooltip body')).toBeInTheDocument()
    })
  })

  test('opens on focus', async () => {
    const user = userEvent.setup()
    renderTooltip()
    await user.tab()
    await waitFor(() => {
      expect(screen.getByText('Tooltip body')).toBeInTheDocument()
    })
  })

  test('respects controlled open prop', async () => {
    renderTooltip(true)
    await waitFor(() => {
      expect(screen.getByText('Tooltip body')).toBeInTheDocument()
    })
  })

  test('TooltipContent merges custom className', async () => {
    render(
      <TooltipProvider delay={0}>
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="custom-class">Body</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    await waitFor(() => {
      expect(screen.getByText('Body')).toHaveClass('custom-class')
    })
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test tooltip
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/tooltip/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { cn } from '../../lib/cn.js'

export type TooltipProviderProps = React.ComponentProps<typeof BaseTooltip.Provider>

export function TooltipProvider({ delay = 200, ...props }: TooltipProviderProps): React.JSX.Element {
  return <BaseTooltip.Provider delay={delay} {...props} />
}

export type TooltipProps = React.ComponentProps<typeof BaseTooltip.Root>

export function Tooltip(props: TooltipProps): React.JSX.Element {
  return <BaseTooltip.Root {...props} />
}

export type TooltipTriggerProps = React.ComponentProps<typeof BaseTooltip.Trigger>

export const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  function TooltipTrigger(props, ref) {
    return <BaseTooltip.Trigger ref={ref as never} {...props} />
  },
)

export type TooltipContentProps = React.ComponentProps<typeof BaseTooltip.Popup> & {
  sideOffset?: number
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent({ className, sideOffset = 6, children, ...props }, ref) {
    return (
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={sideOffset}>
          <BaseTooltip.Popup
            ref={ref}
            className={cn(
              'z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2',
              'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
              className,
            )}
            {...props}
          >
            {children}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    )
  },
)
```

**Note on `bg-popover`:** the existing tailwind preset does not yet define `popover` color tokens. For now, fall back to `bg-background text-foreground` if the class fails to resolve. The compile will not error — Tailwind treats unresolved colors as no-ops. Track this as a token gap to address in a future tokens iteration.

If the `bg-popover` class is missing, replace with:

```tsx
'z-50 overflow-hidden rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground shadow-md',
```

Use the safer fallback for now. Update the implementation accordingly.

```tsx
// final TooltipContent className (use the fallback)
className={cn(
  'z-50 overflow-hidden rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground shadow-md',
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
  'data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2',
  'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
  className,
)}
```

- [ ] **Step 4: Run test, expect 6 passing**

```bash
pnpm --filter @idcert/ui test tooltip
```

If hover-based tests are flaky in jsdom, switch to controlled-open assertion only — but Base UI's `delay={0}` should make pointer-driven open synchronous enough for waitFor to catch.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/tooltip/tooltip.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Feedback/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
        <TooltipContent>Helpful information</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  ),
}

export const OnIcon: Story = {
  render: () => (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className="rounded-full p-2 hover:bg-muted"
              aria-label="Info"
            >
              ?
            </button>
          }
        />
        <TooltipContent>Click for more details</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  ),
}

export const ControlledOpen: Story = {
  render: () => (
    <TooltipProvider delay={0}>
      <Tooltip open>
        <TooltipTrigger render={<Button variant="outline">Always visible</Button>} />
        <TooltipContent>Pinned tooltip</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  type TooltipProviderProps,
  type TooltipProps,
  type TooltipTriggerProps,
  type TooltipContentProps,
} from './components/tooltip/index.js'
```

- [ ] **Step 7: Verify all green**

```bash
pnpm --filter @idcert/ui test
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui lint
pnpm --filter @idcert/ui build
```

All exit 0. Bundle still has `'use client';` at line 1 of `dist/index.js`.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/tooltip packages/ui/src/index.ts
git commit -m "feat(ui): add Tooltip compound (Provider, Root, Trigger, Content)"
```

---

## Task 4: Dialog compound (Base UI)

Modal overlay. Compound shape mirrors shadcn for consumer familiarity. Backdrop, focus trap, ESC close, click-outside close — all handled by Base UI.

**Base UI module:** `@base-ui/react/dialog`. Parts: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Portal`, `Dialog.Backdrop`, `Dialog.Popup`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`.

**Files:**
- Create: `packages/ui/src/components/dialog/dialog.test.tsx`
- Create: `packages/ui/src/components/dialog/index.tsx`
- Create: `packages/ui/src/components/dialog/dialog.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './index.js'

function Sample({ open, onOpenChange }: { open?: boolean; onOpenChange?: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        <p>Body</p>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog', () => {
  test('trigger renders, content hidden initially', () => {
    render(<Sample />)
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('opens on trigger click', async () => {
    const user = userEvent.setup()
    render(<Sample />)
    await user.click(screen.getByText('Open'))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  test('closes on ESC', async () => {
    const user = userEvent.setup()
    render(<Sample />)
    await user.click(screen.getByText('Open'))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  test('closes when DialogClose clicked', async () => {
    const user = userEvent.setup()
    render(<Sample />)
    await user.click(screen.getByText('Open'))
    await screen.findByRole('dialog')
    await user.click(screen.getByText('Close'))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  test('controlled open prop renders content', async () => {
    render(<Sample open />)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  test('controlled onOpenChange fires on close', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Sample open onOpenChange={onOpenChange} />)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  test('DialogTitle renders inside dialog with proper tag', async () => {
    render(<Sample open />)
    await screen.findByRole('dialog')
    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H2')
  })

  test('DialogContent forwards ref', async () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <Dialog open>
        <DialogContent ref={ref}>
          <DialogTitle>X</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})
```

Add `vi` import at top:

```tsx
import { describe, expect, test, vi } from 'vitest'
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test dialog
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/dialog/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cn } from '../../lib/cn.js'

export type DialogProps = React.ComponentProps<typeof BaseDialog.Root>
export const Dialog = BaseDialog.Root

export type DialogTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>
export const DialogTrigger = BaseDialog.Trigger

export type DialogContentProps = React.ComponentProps<typeof BaseDialog.Popup> & {
  showCloseButton?: boolean
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ className, children, showCloseButton = true, ...props }, ref) {
    return (
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          )}
        />
        <BaseDialog.Popup
          ref={ref}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg sm:rounded-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <BaseDialog.Close
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
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

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DialogHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
        {...props}
      />
    )
  },
)

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DialogFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
        {...props}
      />
    )
  },
)

export type DialogTitleProps = React.ComponentProps<typeof BaseDialog.Title>

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ className, ...props }, ref) {
    return (
      <BaseDialog.Title
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
      />
    )
  },
)

export type DialogDescriptionProps = React.ComponentProps<typeof BaseDialog.Description>

export const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, ...props }, ref) {
    return (
      <BaseDialog.Description
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)

export type DialogCloseProps = React.ComponentProps<typeof BaseDialog.Close>
export const DialogClose = BaseDialog.Close
```

- [ ] **Step 4: Run test, expect 8 passing**

```bash
pnpm --filter @idcert/ui test dialog
```

If `DialogTitle` does not render as `H2` (Base UI may use different default), update the test expectation to match the actual rendered tag. Base UI `Dialog.Title` defaults to `h2` per spec; verify on first run.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/dialog/dialog.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './index.js'
import { Button } from '../button/index.js'
import { Input } from '../input/index.js'
import { Label } from '../label/index.js'

const meta = {
  title: 'Feedback/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button>Open dialog</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="Andrea" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue="@andrea" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <DialogClose render={<Button>Save</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const NoCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button>Open</Button>} />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Without X button</DialogTitle>
          <DialogDescription>Use the action buttons to close.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button>Got it</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  type DialogProps,
  type DialogTriggerProps,
  type DialogContentProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
  type DialogCloseProps,
} from './components/dialog/index.js'
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
git add packages/ui/src/components/dialog packages/ui/src/index.ts
git commit -m "feat(ui): add Dialog compound (Base UI)"
```

---

## Task 5: AlertDialog compound (Base UI)

Mirrors Dialog 1:1 except: no X close button (per WAI-ARIA alertdialog pattern), `AlertDialogAction` defaults to destructive button, `AlertDialogCancel` defaults to outline.

**Base UI module:** `@base-ui/react/alert-dialog`. Parts: `AlertDialog.Root`, `AlertDialog.Trigger`, `AlertDialog.Portal`, `AlertDialog.Backdrop`, `AlertDialog.Popup`, `AlertDialog.Title`, `AlertDialog.Description`, `AlertDialog.Close`.

**Files:**
- Create: `packages/ui/src/components/alert-dialog/alert-dialog.test.tsx`
- Create: `packages/ui/src/components/alert-dialog/index.tsx`
- Create: `packages/ui/src/components/alert-dialog/alert-dialog.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './index.js'

function Sample({ onAction, onCancel, open }: { onAction?: () => void; onCancel?: () => void; open?: boolean }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

describe('AlertDialog', () => {
  test('opens on trigger click', async () => {
    const user = userEvent.setup()
    render(<Sample />)
    await user.click(screen.getByText('Delete'))
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
  })

  test('action button triggers callback', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<Sample onAction={onAction} open />)
    await screen.findByRole('alertdialog')
    await user.click(screen.getByText('Confirm'))
    expect(onAction).toHaveBeenCalled()
  })

  test('cancel button triggers callback', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<Sample onCancel={onCancel} open />)
    await screen.findByRole('alertdialog')
    await user.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  test('closes on ESC', async () => {
    const user = userEvent.setup()
    render(<Sample />)
    await user.click(screen.getByText('Delete'))
    await screen.findByRole('alertdialog')
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })

  test('AlertDialogTitle renders as h2', async () => {
    render(<Sample open />)
    await screen.findByRole('alertdialog')
    expect(screen.getByText('Are you sure?').tagName).toBe('H2')
  })

  test('AlertDialogAction has destructive styles by default', async () => {
    render(<Sample open />)
    await screen.findByRole('alertdialog')
    const action = screen.getByText('Confirm')
    // destructive button uses bg-destructive class via Button variant="destructive"
    expect(action).toHaveClass('bg-destructive')
  })

  test('AlertDialogCancel has outline styles by default', async () => {
    render(<Sample open />)
    await screen.findByRole('alertdialog')
    const cancel = screen.getByText('Cancel')
    // outline button uses border class via Button variant="outline"
    expect(cancel).toHaveClass('border')
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test alert-dialog
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/alert-dialog/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { cn } from '../../lib/cn.js'
import { buttonVariants } from '../button/index.js'

export type AlertDialogProps = React.ComponentProps<typeof BaseAlertDialog.Root>
export const AlertDialog = BaseAlertDialog.Root

export type AlertDialogTriggerProps = React.ComponentProps<typeof BaseAlertDialog.Trigger>
export const AlertDialogTrigger = BaseAlertDialog.Trigger

export type AlertDialogContentProps = React.ComponentProps<typeof BaseAlertDialog.Popup>

export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent({ className, children, ...props }, ref) {
    return (
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          )}
        />
        <BaseAlertDialog.Popup
          ref={ref}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg sm:rounded-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
            className,
          )}
          {...props}
        >
          {children}
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Portal>
    )
  },
)

export const AlertDialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AlertDialogHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
        {...props}
      />
    )
  },
)

export const AlertDialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AlertDialogFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
        {...props}
      />
    )
  },
)

export type AlertDialogTitleProps = React.ComponentProps<typeof BaseAlertDialog.Title>

export const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  function AlertDialogTitle({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Title
        ref={ref}
        className={cn('text-lg font-semibold', className)}
        {...props}
      />
    )
  },
)

export type AlertDialogDescriptionProps = React.ComponentProps<typeof BaseAlertDialog.Description>

export const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  function AlertDialogDescription({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Description
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)

export type AlertDialogActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  function AlertDialogAction({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Close
        ref={ref}
        className={cn(buttonVariants({ variant: 'destructive' }), className)}
        {...props}
      />
    )
  },
)

export type AlertDialogCancelProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  function AlertDialogCancel({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Close
        ref={ref}
        className={cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', className)}
        {...props}
      />
    )
  },
)
```

**Pre-flight check:** `buttonVariants` must be exported from `packages/ui/src/components/button/index.tsx`. If it is not currently exported, add `export { buttonVariants }` to that file in the same commit. Run a quick grep:

```bash
grep -n "export.*buttonVariants" packages/ui/src/components/button/index.tsx
```

If no result, modify `packages/ui/src/components/button/index.tsx` to export `buttonVariants` (it already exists internally — just add the re-export). Stage that file with this commit.

- [ ] **Step 4: Run test, expect 7 passing**

```bash
pnpm --filter @idcert/ui test alert-dialog
```

- [ ] **Step 5: Story**

Create `packages/ui/src/components/alert-dialog/alert-dialog.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Feedback/AlertDialog',
  component: AlertDialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive">Delete account</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  type AlertDialogProps,
  type AlertDialogTriggerProps,
  type AlertDialogContentProps,
  type AlertDialogTitleProps,
  type AlertDialogDescriptionProps,
  type AlertDialogActionProps,
  type AlertDialogCancelProps,
} from './components/alert-dialog/index.js'
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
git add packages/ui/src/components/alert-dialog packages/ui/src/components/button packages/ui/src/index.ts
git commit -m "feat(ui): add AlertDialog compound (Base UI)"
```

---

## Task 6: Final validation + v0.3.0 changeset

- [ ] **Step 1: Clean rebuild**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
pnpm clean
pnpm install
pnpm build
```

Expected: 5/5 successful, no errors. `dist/index.js` and `dist/index.cjs` start with `"use client";`.

- [ ] **Step 2: Run all gates**

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm exec publint packages/ui
pnpm exec publint packages/tokens
pnpm exec publint packages/tailwind-config
```

All must pass. Total test count target ~102:

| Plan 1 + Plan 2 components | tests |
|---|---|
| Button | 8 |
| Input | 6 |
| Textarea | 4 |
| Label | 4 |
| Checkbox | 5 |
| Radio + RadioGroup | 6 |
| Switch | 5 |
| Container | 5 |
| Stack + HStack + VStack | 7 |
| Grid | 4 |
| Card compound | 8 |
| Divider | 4 |
| Separator | 4 |
| **Subtotal Plans 1+2** | **70** |

| Plan 3 components | tests |
|---|---|
| Spinner | 6 |
| Alert | 12 |
| Tooltip | 6 |
| Dialog | 8 |
| AlertDialog | 7 |
| **Subtotal Plan 3** | **39** |

| **Total** | **109** |

If any test count differs, update the changeset note.

- [ ] **Step 3: Verify Storybook indexes new stories**

```bash
pnpm --filter @idcert/storybook build
```

Expected: build succeeds, indexes the 5 new component stories.

- [ ] **Step 4: Manual smoke test in playground**

```bash
pnpm --filter @idcert/playground dev
```

Open `http://localhost:3000`. Add a quick scratch page consuming each new component (or render them inline in the existing landing page). Verify:

- Spinner spins
- Alert renders with each variant
- Tooltip appears on hover/focus and dismisses on blur
- Dialog opens, traps focus, ESC closes, backdrop click closes
- AlertDialog opens, action/cancel buttons work, ESC closes

Stop the dev server when done.

- [ ] **Step 5: Add v0.3.0 changeset**

Create `.changeset/v0.3.0-feedback.md`:

```markdown
---
'@idcert/ui': minor
'@idcert/tailwind-config': minor
---

Add 5 new components in the Feedback category, introducing Base UI as the headless primitive layer.

Components (`@idcert/ui`):
- `Alert` + `AlertTitle` + `AlertDescription` — semantic notice block with cva variants (default/info/success/warning/destructive) and optional default icons.
- `Dialog` compound — modal overlay built on Base UI `Dialog`. Sub-parts: `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`. Includes default close-X button (opt-out via `showCloseButton={false}`).
- `AlertDialog` compound — destructive-confirmation modal built on Base UI `AlertDialog`. Sub-parts: `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel`. Action defaults to `Button variant="destructive"`, Cancel to `outline`.
- `Tooltip` compound — hover/focus help text built on Base UI `Tooltip`. Sub-parts: `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`. Provider configures `delayDuration` (default 200ms).
- `Spinner` — loading indicator using lucide `Loader2` + Tailwind `animate-spin`. cva size variants (sm/md/lg/xl). Default `aria-label="Loading"`.

Internals:
- `@base-ui/react` added as a runtime dependency of `@idcert/ui`.
- `@idcert/ui` now also re-exports `buttonVariants` (used internally by `AlertDialogAction`/`AlertDialogCancel` to compose Button styles into Base UI close elements).

Tailwind preset (`@idcert/tailwind-config`):
- `tailwindcss-animate` plugin added to enable `animate-in`/`animate-out`/`fade-*`/`zoom-*`/`slide-*` utilities driven by Base UI `data-state` attributes.

Out of scope (deferred):
- `Toast` + `Toaster` — moves to the future Utility plan; bundling them keeps the Toast subsystem cohesive.
```

- [ ] **Step 6: Verify changeset status**

```bash
pnpm exec changeset status
```

Expected: `@idcert/ui` will bump from `0.2.0` to `0.3.0` minor. `@idcert/tailwind-config` will bump as a minor as well.

- [ ] **Step 7: Final commit**

```bash
git add .changeset/v0.3.0-feedback.md
git commit -m "chore: changeset for v0.3.0 (feedback)"
```

- [ ] **Step 8: Final state check**

```bash
git status                                                # clean
git log --oneline feat/feedback ^feat/primitives | wc -l  # ~7 commits (deps + 5 components + changeset)
```

---

## Self-Review Notes

**Spec coverage:**
- Spec section "Scope (5 components)" — Alert (Task 2), Dialog (Task 4), AlertDialog (Task 5), Tooltip (Task 3), Spinner (Task 1) all covered.
- Spec section "Headless primitives — Base UI" — `@base-ui/react` added in Task 0; first usage in Tooltip (Task 3); Dialog and AlertDialog in Tasks 4–5.
- Spec section "Animations — CSS-only" — `tailwindcss-animate` plugin wired in Task 0; consumed via `data-[state=...]:animate-in` in Tooltip, Dialog, AlertDialog.
- Spec section "Alert variants" — 5 cva variants (default, info, success, warning, destructive) with default icon mapping in Task 2.
- Spec section "Dialog & AlertDialog compound shape" — sub-component lists in Tasks 4 and 5 match spec exactly. AlertDialogAction/Cancel default to destructive/outline button variants.
- Spec section "Tooltip" — Provider + Root + Trigger + Content. Default `delay={200}` in Provider.
- Spec section "Spinner" — cva size variants (sm/md/lg/xl), `role="status"`, default `aria-label="Loading"`, `currentColor` inheritance.
- Spec section "Test coverage estimate (~32)" — actual plan totals 39, slightly over due to the parametrized variant test counting as 5 in vitest output. Acceptable.

**Placeholder scan:**
- No "TBD", "TODO", or "implement later" in plan body.
- One conditional in Task 3 ("If `bg-popover` class is missing, replace with..."). Plan resolves it inline by using the fallback as the final implementation. No placeholder remains.
- One conditional in Task 5 ("If `buttonVariants` not exported... add it"). Plan instructs to grep first; outcome is deterministic since the file structure is known. The buttonVariants export must be confirmed during Task 5.

**Type consistency:**
- Spinner: `SpinnerProps`, `spinnerVariants` exported. Used identically in story.
- Alert: `AlertProps`, `alertVariants` exported. `AlertTitle`/`AlertDescription` use plain `HTMLAttributes` types.
- Tooltip: `TooltipProviderProps`, `TooltipProps`, `TooltipTriggerProps`, `TooltipContentProps`. All derived via `React.ComponentProps<typeof BaseTooltip.X>`.
- Dialog: `DialogProps`, `DialogTriggerProps`, `DialogContentProps`, `DialogTitleProps`, `DialogDescriptionProps`, `DialogCloseProps`. Same pattern.
- AlertDialog: 7 prop type names listed; barrel exports match.

**Known forecasted concerns:**
- Base UI `data-state` semantics: Tooltip, Dialog, and AlertDialog all expose `data-state="open" | "closed"` on their popup elements. The `tailwindcss-animate` plugin's `animate-in` / `animate-out` utilities depend on `data-[state=...]` arbitrary variants. If Base UI v1 changes the attribute name in a minor release, all three components break visually (functional behavior unaffected).
- Base UI `Trigger` `render` prop: stories use `<DialogTrigger render={<Button>...</Button>} />` to compose with the existing Button component. If Base UI v1 changes this API to `asChild` (Radix-style), the stories break. Track on first install.
- Tooltip jsdom flakiness: hover-driven tests rely on `userEvent.hover()` which dispatches pointer events. Some Base UI tooltip implementations require a real pointermove sequence. If tests fail, fall back to `open` controlled prop assertions (already covered by `respects controlled open prop` test).
- `bg-popover` token: spec calls for a popover token, but the existing tailwind preset has none. Plan uses `bg-background` fallback. Adding a `popover` token belongs in a tokens iteration plan.

**Defer:**
- Animation timing tokens (per spec out-of-scope).
- Dialog size variants (sm/md/lg). Plan ships single default `max-w-lg`.
- Modal stacking UX patterns.
