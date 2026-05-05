# idcert-ui Forms Base Implementation Plan (Plan 4a of 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 components (Select, MultiSelect, Slider, Form/FormField) to `@idcert/ui`, introducing `react-hook-form` + `zod` as the form integration layer. Each component is TDD'd. Plan ends with a `0.4.0` changeset.

**Architecture:** Base UI (`@base-ui/react`) supplies the headless primitives for Select, Combobox (multi), and Slider. The Form layer wraps `react-hook-form` `FormProvider` + `Controller` and exposes the canonical shadcn-style sub-parts (`FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`). An internal `Slot` helper (Radix-style, ~30 lines) backs `FormControl`'s child cloning. RHF and zod are peer dependencies, not bundled.

**Tech Stack:** React 18+, TypeScript 5.6+, Tailwind 3.4+ + `tailwindcss-animate`, `@base-ui/react` v1, `class-variance-authority`, `clsx` + `tailwind-merge`, `lucide-react`, `react-hook-form` ^7 (peer), `zod` ^3 (peer), `@hookform/resolvers` ^3 (devDep, tests/stories only).

**Branch:** `feat/forms-base` (branched off `main` after `feat/feedback` v0.3.0 is merged).

**Spec:** `docs/superpowers/specs/2026-05-05-idcert-ui-forms-base-design.md`
**Main spec:** `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`
**Previous plan:** `docs/superpowers/plans/2026-05-04-idcert-ui-feedback.md`

---

## File Structure

Files added during this plan:

```
packages/ui/src/
├── components/
│   ├── select/
│   │   ├── select.stories.tsx
│   │   ├── select.test.tsx
│   │   └── index.tsx                  # Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator
│   ├── multi-select/
│   │   ├── multi-select.stories.tsx
│   │   ├── multi-select.test.tsx
│   │   └── index.tsx                  # MultiSelect, MultiSelectTrigger, MultiSelectChips, MultiSelectContent, MultiSelectList, MultiSelectItem, MultiSelectEmpty, MultiSelectOption type
│   ├── slider/
│   │   ├── slider.stories.tsx
│   │   ├── slider.test.tsx
│   │   └── index.tsx                  # Slider monolithic
│   └── form/
│       ├── form.stories.tsx
│       ├── form.test.tsx
│       └── index.tsx                  # Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormField
└── lib/
    ├── slot.tsx                       # internal Slot helper, NOT exported from package barrel
    └── slot.test.tsx                  # Slot unit tests
```

Plus modified:
- `packages/ui/src/index.ts` (barrel re-exports for the 4 new modules)
- `packages/ui/package.json` (add `react-hook-form` + `zod` peer deps; add `@hookform/resolvers` + `react-hook-form` + `zod` devDeps)
- `apps/playground/app/forms/page.tsx` (smoke test page — optional, manual verification only)
- `.changeset/v0.4.0-forms-base.md` (release note)

**Component conventions** (established in Plan 1, repeated for clarity):
- Single file per component (compound components export sub-parts from same `index.tsx`)
- `'use client'` first line for any component using Base UI, RHF, or React state hooks
- `React.forwardRef` where the component renders a single DOM element with a public ref
- Named exports only
- Variants via `cva` when more than one visual variant exists; otherwise plain Tailwind
- Stories accompany every component (`<name>.stories.tsx`)
- Tests cover: render, key prop application, primary interaction, ARIA, ref forwarding

---

## Task 0: Branch + dependency setup

**Files:**
- Create branch: `feat/forms-base`
- Modify: `packages/ui/package.json`

- [ ] **Step 1: Verify feedback merged + create the forms-base branch**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
git checkout main
git pull origin main
git log --oneline -1
```

Expected: latest commit on `main` is the merge of `feat/feedback` (v0.3.0). If not yet merged, stop and merge feedback first.

```bash
git checkout -b feat/forms-base
git branch --show-current
```

Expected: `feat/forms-base`.

- [ ] **Step 2: Add peer + dev dependencies to @idcert/ui**

```bash
pnpm --filter @idcert/ui add --save-peer react-hook-form@^7 zod@^3
pnpm --filter @idcert/ui add --save-dev react-hook-form@^7 zod@^3 @hookform/resolvers@^3
```

This adds RHF and zod as both peer (declared interface) and dev (resolved at the workspace level for tests and stories). `@hookform/resolvers` is dev-only.

Verify `packages/ui/package.json`:

```json
{
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19",
    "react-hook-form": "^7",
    "zod": "^3"
  },
  "devDependencies": {
    "@hookform/resolvers": "^3",
    "react-hook-form": "^7",
    "zod": "^3"
  }
}
```

- [ ] **Step 3: Set peerDependenciesMeta**

The previous step does not write `peerDependenciesMeta`. Edit `packages/ui/package.json` manually to add (or merge with the existing block if React already has metadata):

```json
"peerDependenciesMeta": {
  "react-hook-form": { "optional": false },
  "zod": { "optional": false }
}
```

If `peerDependenciesMeta` already exists for React, merge the new keys into it. Make `react-hook-form` and `zod` non-optional so consumers get a clear warning if they install `@idcert/ui` without them.

- [ ] **Step 4: Sanity rebuild**

```bash
pnpm install
pnpm --filter @idcert/ui build
pnpm --filter @idcert/ui typecheck
```

All exit 0. The build step still emits `dist/index.js` and `dist/index.cjs` starting with `"use client";`.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml
git commit -m "chore(ui): add react-hook-form and zod as peer dependencies"
```

---

## Task 1: Internal `Slot` helper

`Slot` clones a single child element and merges injected props (with proper `className` and `ref` handling). Used by `FormControl` in Task 5. Built and tested first because it's foundational.

**Files:**
- Create: `packages/ui/src/lib/slot.tsx`
- Create: `packages/ui/src/lib/slot.test.tsx`

- [ ] **Step 1: Test**

Create `packages/ui/src/lib/slot.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { Slot } from './slot.js'

describe('Slot', () => {
  test('renders the single child element', () => {
    render(
      <Slot data-testid="slot">
        <button type="button">Click</button>
      </Slot>,
    )
    expect(screen.getByRole('button')).toHaveTextContent('Click')
  })

  test('forwards injected props to the child', () => {
    render(
      <Slot id="injected-id" aria-invalid="true">
        <input data-testid="input" />
      </Slot>,
    )
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('id', 'injected-id')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  test('merges className with the child className', () => {
    render(
      <Slot className="injected">
        <span data-testid="span" className="own">x</span>
      </Slot>,
    )
    expect(screen.getByTestId('span')).toHaveClass('own')
    expect(screen.getByTestId('span')).toHaveClass('injected')
  })

  test('forwards ref to the child', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(
      <Slot ref={ref}>
        <input />
      </Slot>,
    )
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  test('child props win over Slot props on collision', () => {
    render(
      <Slot id="slot-id" data-testid="span">
        <span id="child-id">x</span>
      </Slot>,
    )
    expect(screen.getByTestId('span')).toHaveAttribute('id', 'child-id')
  })

  test('throws when given non-element children', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(
        // @ts-expect-error testing runtime guard
        <Slot>not-an-element</Slot>,
      ),
    ).toThrow(/single React element/i)
    spy.mockRestore()
  })
})
```

Add the `vi` import at the top:

```tsx
import { describe, expect, test, vi } from 'vitest'
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test slot
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/lib/slot.tsx`:

```tsx
'use client'

import * as React from 'react'
import { cn } from './cn.js'

export type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  function Slot({ children, className, ...slotProps }, forwardedRef) {
    if (!React.isValidElement(children)) {
      throw new Error('Slot expected a single React element as child.')
    }

    const child = children as React.ReactElement<Record<string, unknown>>
    const childProps = child.props ?? {}

    const mergedProps: Record<string, unknown> = { ...slotProps, ...childProps }

    if (className || childProps.className) {
      mergedProps.className = cn(
        className,
        childProps.className as string | undefined,
      )
    }

    const childRef = (child as unknown as { ref?: React.Ref<unknown> }).ref
    mergedProps.ref = composeRefs(forwardedRef, childRef)

    return React.cloneElement(child, mergedProps)
  },
)

function composeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref != null) (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}
```

Notes:
- `Slot` does NOT render its own DOM. It clones the single child and passes through merged props.
- Child props win on collision (so a child `id` is preserved when Slot also passes `id` — matches Radix semantics).
- `className` is the documented exception: Slot's `className` is merged with child's via `cn()`.
- The `ref` is composed: both Slot's forwarded ref and the child's existing ref receive the node.

- [ ] **Step 4: Run test, expect 6 passing**

```bash
pnpm --filter @idcert/ui test slot
```

Expected: `Test Files 1 passed (1) | Tests 6 passed (6)`.

- [ ] **Step 5: Verify all green**

```bash
pnpm --filter @idcert/ui test
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui lint
```

All exit 0. Note: Slot is intentionally NOT exported from the package barrel `src/index.ts`. It is internal infrastructure.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/lib/slot.tsx packages/ui/src/lib/slot.test.tsx
git commit -m "feat(ui): add internal Slot helper for FormControl child cloning"
```

---

## Component Task Pattern

Tasks 2–5 each follow the same shape:

1. Write the failing test (`<name>.test.tsx`)
2. Run test, verify it fails with module-not-found
3. Implement the component (`<name>/index.tsx`)
4. Run tests, verify all pass
5. Add the Storybook story (`<name>.stories.tsx`)
6. Update `packages/ui/src/index.ts` to re-export the new component(s)
7. Run typecheck + lint + build
8. Commit (single commit per component for clean history)

Order is intentional: Slider (simplest Base UI primitive, no popup) → Select (Base UI Select with popup) → MultiSelect (Combobox with chip render logic) → Form/FormField (depends on Slot, integrates RHF). Each step builds on familiarity from the previous.

---

## Task 2: Slider component

Monolithic component wrapping Base UI `Slider.*`. Always accepts `value: number[]`. Number of thumbs = array length.

**Base UI module:** `@base-ui/react/slider`. Exports a `Slider` namespace with `Slider.Root`, `Slider.Control`, `Slider.Track`, `Slider.Indicator`, `Slider.Thumb`, `Slider.Value`. The `Indicator` is the colored fill that reflects the current value.

**Files:**
- Create: `packages/ui/src/components/slider/slider.test.tsx`
- Create: `packages/ui/src/components/slider/index.tsx`
- Create: `packages/ui/src/components/slider/slider.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/slider/slider.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import { Slider } from './index.js'

describe('Slider', () => {
  test('renders a single thumb when value has one entry', () => {
    render(<Slider value={[20]} aria-label="Volume" />)
    expect(screen.getAllByRole('slider')).toHaveLength(1)
  })

  test('renders two thumbs when value has two entries', () => {
    render(<Slider value={[20, 80]} aria-label="Range" />)
    expect(screen.getAllByRole('slider')).toHaveLength(2)
  })

  test('thumb reflects current value via aria-valuenow', () => {
    render(<Slider value={[42]} aria-label="Volume" min={0} max={100} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '42')
  })

  test('arrow key updates value via onValueChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Slider
        defaultValue={[50]}
        onValueChange={onChange}
        min={0}
        max={100}
        step={1}
        aria-label="Volume"
      />,
    )
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls.at(-1)
    expect(Array.isArray(lastCall?.[0])).toBe(true)
    expect(lastCall?.[0][0]).toBeGreaterThan(50)
  })

  test('disabled disables thumb interaction', () => {
    render(<Slider value={[50]} disabled aria-label="Volume" />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-disabled', 'true')
  })

  test('forwards ref to root element', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Slider ref={ref} value={[50]} aria-label="Volume" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test slider
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/slider/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Slider as BaseSlider } from '@base-ui/react/slider'
import { cn } from '../../lib/cn.js'

export type SliderProps = Omit<
  React.ComponentProps<typeof BaseSlider.Root>,
  'value' | 'defaultValue' | 'onValueChange'
> & {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  function Slider(
    { className, value, defaultValue, onValueChange, disabled, ...props },
    ref,
  ) {
    const thumbs = value ?? defaultValue ?? [0]

    return (
      <BaseSlider.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          disabled && 'opacity-50',
          className,
        )}
        {...props}
      >
        <BaseSlider.Control className="relative flex h-5 w-full items-center">
          <BaseSlider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <BaseSlider.Indicator className="absolute h-full bg-primary" />
          </BaseSlider.Track>
          {thumbs.map((_, index) => (
            <BaseSlider.Thumb
              key={index}
              index={index}
              className={cn(
                'block h-5 w-5 rounded-full border-2 border-primary bg-background shadow',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'data-[disabled]:pointer-events-none',
              )}
            />
          ))}
        </BaseSlider.Control>
      </BaseSlider.Root>
    )
  },
)
```

Notes:
- The `thumbs` array length determines how many `Slider.Thumb` elements to render. Base UI handles the value-mapping per index.
- `Slider.Indicator` is the colored range fill; it lives inside `Slider.Track`.
- Single API; consumer always passes `number[]`.

- [ ] **Step 4: Run test, expect 6 passing**

```bash
pnpm --filter @idcert/ui test slider
```

If keyboard-driven test is flaky in jsdom, an alternative is to use `fireEvent.keyDown` on the thumb directly — but `userEvent.keyboard` should work because Base UI Slider listens for native keyboard events.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/slider/slider.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Slider } from './index.js'

const meta = {
  title: 'Form/Slider',
  component: Slider,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [v, setV] = React.useState([50])
    return (
      <div className="w-80 space-y-2">
        <Slider value={v} onValueChange={setV} aria-label="Volume" />
        <div className="text-sm text-muted-foreground">Value: {v[0]}</div>
      </div>
    )
  },
}

export const Range: Story = {
  render: () => {
    const [v, setV] = React.useState([20, 80])
    return (
      <div className="w-80 space-y-2">
        <Slider value={v} onValueChange={setV} aria-label="Range" />
        <div className="text-sm text-muted-foreground">
          Min: {v[0]} — Max: {v[1]}
        </div>
      </div>
    )
  },
}

export const Stepped: Story = {
  render: () => {
    const [v, setV] = React.useState([5])
    return (
      <div className="w-80 space-y-2">
        <Slider
          value={v}
          onValueChange={setV}
          min={0}
          max={10}
          step={1}
          aria-label="Stepped"
        />
        <div className="text-sm text-muted-foreground">Step 1: {v[0]}</div>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <Slider value={[40]} disabled aria-label="Disabled" />
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export { Slider, type SliderProps } from './components/slider/index.js'
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
git add packages/ui/src/components/slider packages/ui/src/index.ts
git commit -m "feat(ui): add Slider component (single + range)"
```

---

## Task 3: Select compound (Base UI)

Composition-style API on top of Base UI `Select.*`. Sub-parts: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`. Reuses the existing `Separator` primitive internally.

**Base UI module:** `@base-ui/react/select`. Exports a `Select` namespace with `Select.Root`, `Select.Trigger`, `Select.Value`, `Select.Icon`, `Select.Portal`, `Select.Backdrop`, `Select.Positioner`, `Select.Popup`, `Select.Item`, `Select.ItemText`, `Select.ItemIndicator`, `Select.Group`, `Select.GroupLabel`, `Select.Separator`. The `Trigger` uses `render` prop for asChild-like composition.

**Note on `bg-popover`:** the existing tailwind preset still does not define `popover` color tokens (Plan 3 used `bg-background text-foreground` as a fallback). We continue that fallback here.

**Files:**
- Create: `packages/ui/src/components/select/select.test.tsx`
- Create: `packages/ui/src/components/select/index.tsx`
- Create: `packages/ui/src/components/select/select.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/select/select.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './index.js'

function renderSelect(props?: {
  value?: string
  onValueChange?: (v: string) => void
  defaultValue?: string
  disabled?: boolean
}) {
  return render(
    <Select {...props}>
      <SelectTrigger aria-label="Country">
        <SelectValue placeholder="Choose…" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="it">Italy</SelectItem>
          <SelectItem value="fr">France</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="us">USA</SelectItem>
      </SelectContent>
    </Select>,
  )
}

describe('Select', () => {
  test('renders trigger with placeholder when no value', () => {
    renderSelect()
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveTextContent(
      'Choose…',
    )
  })

  test('opens on click and shows items', async () => {
    const user = userEvent.setup()
    renderSelect()
    await user.click(screen.getByRole('combobox', { name: 'Country' }))
    await waitFor(() => {
      expect(screen.getByText('Italy')).toBeInTheDocument()
      expect(screen.getByText('France')).toBeInTheDocument()
      expect(screen.getByText('USA')).toBeInTheDocument()
    })
  })

  test('selecting an item updates value via onValueChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderSelect({ onValueChange: onChange })
    await user.click(screen.getByRole('combobox', { name: 'Country' }))
    await user.click(await screen.findByText('Italy'))
    expect(onChange).toHaveBeenCalledWith('it')
  })

  test('controlled mode reflects passed value', async () => {
    renderSelect({ value: 'fr' })
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Country' }),
      ).toHaveTextContent('France')
    })
  })

  test('disabled prevents opening', async () => {
    const user = userEvent.setup()
    renderSelect({ disabled: true })
    const trigger = screen.getByRole('combobox', { name: 'Country' })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(screen.queryByText('Italy')).not.toBeInTheDocument()
  })

  test('placeholder shown when value is empty string', () => {
    renderSelect({ value: '' })
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveTextContent(
      'Choose…',
    )
  })

  test('forwards ref to trigger', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Select>
        <SelectTrigger ref={ref} aria-label="Country">
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">X</SelectItem>
        </SelectContent>
      </Select>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  test('group label and separator render', async () => {
    const user = userEvent.setup()
    renderSelect()
    await user.click(screen.getByRole('combobox', { name: 'Country' }))
    await waitFor(() => {
      expect(screen.getByText('Europe')).toBeInTheDocument()
    })
    // separator has role="separator" via Base UI
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test select
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/select/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Select as BaseSelect } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type SelectProps = React.ComponentProps<typeof BaseSelect.Root>

export function Select(props: SelectProps): React.JSX.Element {
  return <BaseSelect.Root {...props} />
}

export type SelectTriggerProps = React.ComponentProps<typeof BaseSelect.Trigger>

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger({ className, children, ...props }, ref) {
    return (
      <BaseSelect.Trigger
        ref={ref}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[popup-open]:ring-2 data-[popup-open]:ring-ring',
          className,
        )}
        {...props}
      >
        {children}
        <BaseSelect.Icon>
          <ChevronDown aria-hidden="true" className="h-4 w-4 opacity-50" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
    )
  },
)

export type SelectValueProps = React.ComponentProps<typeof BaseSelect.Value>

export function SelectValue(props: SelectValueProps): React.JSX.Element {
  return <BaseSelect.Value {...props} />
}

export type SelectContentProps = React.ComponentProps<typeof BaseSelect.Popup> & {
  sideOffset?: number
}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent({ className, children, sideOffset = 4, ...props }, ref) {
    return (
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={sideOffset} className="outline-none">
          <BaseSelect.Popup
            ref={ref}
            className={cn(
              'z-50 max-h-96 min-w-32 overflow-y-auto rounded-md border border-border bg-background p-1 text-foreground shadow-md',
              'data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0',
              'data-[closed]:zoom-out-95 data-[open]:zoom-in-95',
              className,
            )}
            {...props}
          >
            {children}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    )
  },
)

export type SelectItemProps = React.ComponentProps<typeof BaseSelect.Item>

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  function SelectItem({ className, children, ...props }, ref) {
    return (
      <BaseSelect.Item
        ref={ref}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
          'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className,
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <BaseSelect.ItemIndicator>
            <Check aria-hidden="true" className="h-4 w-4" />
          </BaseSelect.ItemIndicator>
        </span>
        <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      </BaseSelect.Item>
    )
  },
)

export type SelectGroupProps = React.ComponentProps<typeof BaseSelect.Group>

export function SelectGroup(props: SelectGroupProps): React.JSX.Element {
  return <BaseSelect.Group {...props} />
}

export type SelectLabelProps = React.ComponentProps<typeof BaseSelect.GroupLabel>

export const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  function SelectLabel({ className, ...props }, ref) {
    return (
      <BaseSelect.GroupLabel
        ref={ref}
        className={cn(
          'px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
          className,
        )}
        {...props}
      />
    )
  },
)

export type SelectSeparatorProps = React.ComponentProps<typeof BaseSelect.Separator>

export const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  function SelectSeparator({ className, ...props }, ref) {
    return (
      <BaseSelect.Separator
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-border', className)}
        {...props}
      />
    )
  },
)
```

Notes:
- `Select.Root` accepts `value`, `defaultValue`, `onValueChange`, `disabled`, `name` natively from Base UI; we pass through unchanged.
- `Select.Trigger` renders an HTML button by default with role `combobox` (Base UI standard for select triggers).
- `Select.Item` exposes `data-highlighted` (keyboard/hover focus) and `data-disabled` for styling.
- The check icon uses `Select.ItemIndicator`, which Base UI auto-renders only when the item is the current value.

- [ ] **Step 4: Run test, expect 8 passing**

```bash
pnpm --filter @idcert/ui test select
```

- [ ] **Step 5: Story**

Create `packages/ui/src/components/select/select.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './index.js'

const meta = {
  title: 'Form/Select',
  component: Select,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <Select>
        <SelectTrigger aria-label="Country">
          <SelectValue placeholder="Choose a country…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="it">Italy</SelectItem>
          <SelectItem value="fr">France</SelectItem>
          <SelectItem value="es">Spain</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const WithGroups: Story = {
  render: () => (
    <div className="w-64">
      <Select>
        <SelectTrigger aria-label="Country">
          <SelectValue placeholder="Choose a country…" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="it">Italy</SelectItem>
            <SelectItem value="fr">France</SelectItem>
            <SelectItem value="es">Spain</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Americas</SelectLabel>
            <SelectItem value="us">USA</SelectItem>
            <SelectItem value="br">Brazil</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [v, setV] = React.useState<string>('fr')
    return (
      <div className="w-64 space-y-2">
        <Select value={v} onValueChange={setV}>
          <SelectTrigger aria-label="Country">
            <SelectValue placeholder="Choose…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="it">Italy</SelectItem>
            <SelectItem value="fr">France</SelectItem>
            <SelectItem value="es">Spain</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">Value: {v}</div>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="w-64">
      <Select disabled defaultValue="it">
        <SelectTrigger aria-label="Country">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="it">Italy</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  type SelectProps,
  type SelectTriggerProps,
  type SelectValueProps,
  type SelectContentProps,
  type SelectItemProps,
  type SelectGroupProps,
  type SelectLabelProps,
  type SelectSeparatorProps,
} from './components/select/index.js'
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
git add packages/ui/src/components/select packages/ui/src/index.ts
git commit -m "feat(ui): add Select compound (Base UI)"
```

---

## Task 4: MultiSelect compound (Base UI Combobox)

Data-driven multi-value combobox. Consumer supplies `items: MultiSelectOption[]`; rendered list uses a render-prop on `MultiSelectList`. Trigger hosts removable chips + inline filter input. Backspace on empty input removes the last chip.

**Base UI module:** `@base-ui/react/combobox`. Exports a `Combobox` namespace with `Combobox.Root`, `Combobox.Input`, `Combobox.Trigger`, `Combobox.Value`, `Combobox.Portal`, `Combobox.Positioner`, `Combobox.Popup`, `Combobox.List`, `Combobox.Item`, `Combobox.ItemIndicator`, `Combobox.Empty`. `Root` accepts `multiple` (boolean) and `items` (array).

**Files:**
- Create: `packages/ui/src/components/multi-select/multi-select.test.tsx`
- Create: `packages/ui/src/components/multi-select/index.tsx`
- Create: `packages/ui/src/components/multi-select/multi-select.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/multi-select/multi-select.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectChips,
  MultiSelectContent,
  MultiSelectList,
  MultiSelectItem,
  MultiSelectEmpty,
  type MultiSelectOption,
} from './index.js'

const items: MultiSelectOption[] = [
  { value: 'it', label: 'Italy' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
]

function renderMS(props?: {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (v: string[]) => void
  disabled?: boolean
}) {
  return render(
    <MultiSelect items={items} placeholder="Pick…" {...props}>
      <MultiSelectTrigger aria-label="Countries">
        <MultiSelectChips />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectEmpty>No results</MultiSelectEmpty>
        <MultiSelectList>
          {(item) => (
            <MultiSelectItem value={item.value}>{item.label}</MultiSelectItem>
          )}
        </MultiSelectList>
      </MultiSelectContent>
    </MultiSelect>,
  )
}

describe('MultiSelect', () => {
  test('renders trigger with placeholder when empty', () => {
    renderMS()
    expect(screen.getByPlaceholderText('Pick…')).toBeInTheDocument()
  })

  test('opens on click and shows items', async () => {
    const user = userEvent.setup()
    renderMS()
    await user.click(screen.getByPlaceholderText('Pick…'))
    await waitFor(() => {
      expect(screen.getByText('Italy')).toBeInTheDocument()
      expect(screen.getByText('France')).toBeInTheDocument()
    })
  })

  test('selecting items adds them to the value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderMS({ onValueChange: onChange })
    await user.click(screen.getByPlaceholderText('Pick…'))
    await user.click(await screen.findByText('Italy'))
    expect(onChange).toHaveBeenLastCalledWith(['it'])
    await user.click(await screen.findByText('France'))
    expect(onChange).toHaveBeenLastCalledWith(['it', 'fr'])
  })

  test('chip remove button removes the value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderMS({ defaultValue: ['it', 'fr'], onValueChange: onChange })
    const removeItalyBtn = screen.getByRole('button', { name: 'Remove Italy' })
    await user.click(removeItalyBtn)
    expect(onChange).toHaveBeenLastCalledWith(['fr'])
  })

  test('backspace on empty input removes last chip', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderMS({ defaultValue: ['it', 'fr'], onValueChange: onChange })
    const input = screen.getByPlaceholderText('Pick…')
    await user.click(input)
    await user.keyboard('{Backspace}')
    expect(onChange).toHaveBeenLastCalledWith(['it'])
  })

  test('filter input narrows visible items', async () => {
    const user = userEvent.setup()
    renderMS()
    const input = screen.getByPlaceholderText('Pick…')
    await user.click(input)
    await user.type(input, 'fra')
    await waitFor(() => {
      expect(screen.getByText('France')).toBeInTheDocument()
      expect(screen.queryByText('Italy')).not.toBeInTheDocument()
    })
  })

  test('empty state visible when filter matches nothing', async () => {
    const user = userEvent.setup()
    renderMS()
    const input = screen.getByPlaceholderText('Pick…')
    await user.click(input)
    await user.type(input, 'zzz')
    await waitFor(() => {
      expect(screen.getByText('No results')).toBeInTheDocument()
    })
  })

  test('controlled mode reflects passed value as chips', () => {
    renderMS({ value: ['it'] })
    expect(screen.getByText('Italy')).toBeInTheDocument()
  })

  test('disabled prevents interactions', async () => {
    const user = userEvent.setup()
    renderMS({ disabled: true })
    const input = screen.getByPlaceholderText('Pick…')
    expect(input).toBeDisabled()
    await user.click(input)
    expect(screen.queryByText('Italy')).not.toBeInTheDocument()
  })

  test('forwards ref to trigger root', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <MultiSelect items={items}>
        <MultiSelectTrigger ref={ref} aria-label="Countries">
          <MultiSelectChips />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectList>
            {(item) => (
              <MultiSelectItem value={item.value}>{item.label}</MultiSelectItem>
            )}
          </MultiSelectList>
        </MultiSelectContent>
      </MultiSelect>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test multi-select
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/multi-select/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { Check, X } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type MultiSelectOption<TValue extends string = string> = {
  value: TValue
  label: React.ReactNode
  disabled?: boolean
}

type MultiSelectContextValue = {
  items: MultiSelectOption[]
  value: string[]
  setValue: (v: string[]) => void
  disabled?: boolean
  placeholder?: string
}

const MultiSelectContext = React.createContext<MultiSelectContextValue | null>(null)

function useMultiSelect(): MultiSelectContextValue {
  const ctx = React.useContext(MultiSelectContext)
  if (!ctx) throw new Error('MultiSelect sub-parts must be used inside <MultiSelect>.')
  return ctx
}

export type MultiSelectProps = {
  items: MultiSelectOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  disabled?: boolean
  placeholder?: string
  children?: React.ReactNode
}

export function MultiSelect({
  items,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled,
  placeholder,
  children,
}: MultiSelectProps): React.JSX.Element {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(defaultValue ?? [])
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled

  const setValue = React.useCallback(
    (next: string[]) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  const ctx = React.useMemo<MultiSelectContextValue>(
    () => ({ items, value, setValue, disabled, placeholder }),
    [items, value, setValue, disabled, placeholder],
  )

  return (
    <MultiSelectContext.Provider value={ctx}>
      <BaseCombobox.Root
        items={items}
        multiple
        value={value}
        onValueChange={setValue as (v: string[]) => void}
        disabled={disabled}
        itemToStringLabel={(item: MultiSelectOption) =>
          typeof item.label === 'string' ? item.label : item.value
        }
        itemToStringValue={(item: MultiSelectOption) => item.value}
      >
        {children}
      </BaseCombobox.Root>
    </MultiSelectContext.Provider>
  )
}

export type MultiSelectTriggerProps = React.HTMLAttributes<HTMLDivElement>

export const MultiSelectTrigger = React.forwardRef<HTMLDivElement, MultiSelectTriggerProps>(
  function MultiSelectTrigger({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          'max-h-32 overflow-y-auto',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

export type MultiSelectChipsProps = {
  className?: string
}

export function MultiSelectChips({ className }: MultiSelectChipsProps): React.JSX.Element {
  const { items, value, setValue, disabled, placeholder } = useMultiSelect()

  const labelFor = React.useCallback(
    (val: string) => items.find((i) => i.value === val)?.label ?? val,
    [items],
  )

  return (
    <>
      {value.map((val) => (
        <span
          key={val}
          className={cn(
            'inline-flex items-center gap-1 rounded-sm bg-secondary px-2 py-0.5 text-xs text-secondary-foreground',
            className,
          )}
        >
          <span>{labelFor(val)}</span>
          <button
            type="button"
            aria-label={`Remove ${typeof labelFor(val) === 'string' ? labelFor(val) : val}`}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              setValue(value.filter((v) => v !== val))
            }}
            className="inline-flex h-3 w-3 items-center justify-center rounded-sm hover:bg-muted-foreground/20"
          >
            <X aria-hidden="true" className="h-3 w-3" />
          </button>
        </span>
      ))}
      <BaseCombobox.Input
        placeholder={value.length === 0 ? placeholder : undefined}
        disabled={disabled}
        className="flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Backspace' && e.currentTarget.value === '' && value.length > 0) {
            e.preventDefault()
            setValue(value.slice(0, -1))
          }
        }}
      />
    </>
  )
}

export type MultiSelectContentProps = React.ComponentProps<typeof BaseCombobox.Popup> & {
  sideOffset?: number
}

export const MultiSelectContent = React.forwardRef<HTMLDivElement, MultiSelectContentProps>(
  function MultiSelectContent({ className, children, sideOffset = 4, ...props }, ref) {
    return (
      <BaseCombobox.Portal>
        <BaseCombobox.Positioner sideOffset={sideOffset} className="outline-none">
          <BaseCombobox.Popup
            ref={ref}
            className={cn(
              'z-50 max-h-72 min-w-[var(--anchor-width)] overflow-y-auto rounded-md border border-border bg-background p-1 text-foreground shadow-md',
              'data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0',
              'data-[closed]:zoom-out-95 data-[open]:zoom-in-95',
              className,
            )}
            {...props}
          >
            {children}
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    )
  },
)

export type MultiSelectListProps = {
  children: (item: MultiSelectOption) => React.ReactNode
}

export function MultiSelectList({ children }: MultiSelectListProps): React.JSX.Element {
  return (
    <BaseCombobox.List>
      {(item: MultiSelectOption) => children(item)}
    </BaseCombobox.List>
  )
}

export type MultiSelectItemProps = React.ComponentProps<typeof BaseCombobox.Item>

export const MultiSelectItem = React.forwardRef<HTMLDivElement, MultiSelectItemProps>(
  function MultiSelectItem({ className, children, ...props }, ref) {
    return (
      <BaseCombobox.Item
        ref={ref}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
          'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className,
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <BaseCombobox.ItemIndicator>
            <Check aria-hidden="true" className="h-4 w-4" />
          </BaseCombobox.ItemIndicator>
        </span>
        {children}
      </BaseCombobox.Item>
    )
  },
)

export type MultiSelectEmptyProps = React.ComponentProps<typeof BaseCombobox.Empty>

export function MultiSelectEmpty({
  className,
  ...props
}: MultiSelectEmptyProps): React.JSX.Element {
  return (
    <BaseCombobox.Empty
      className={cn('px-3 py-2 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
```

Notes:
- The component is a thin wrapper around Base UI Combobox `Root` (`multiple`). Internal context exposes `items` and `value` to `MultiSelectChips` for chip rendering and removal.
- We track `value` ourselves (controlled/uncontrolled bridge) so `MultiSelectChips` can render and remove without going through Base UI's internal state. Base UI Combobox `Root` is also given the same `value`/`onValueChange`, keeping the two in sync.
- `BaseCombobox.Input` handles filtering. We add a custom `onKeyDown` to intercept Backspace on empty input and remove the last chip.
- The `Remove ${label}` aria-label assumes string labels for accessibility. If the label is not a string, the aria-label falls back to the value. Documented in the spec.

- [ ] **Step 4: Run test, expect 10 passing**

```bash
pnpm --filter @idcert/ui test multi-select
```

If chip-remove or backspace tests have timing issues, consider wrapping assertions in `waitFor`. Filter tests rely on Base UI Combobox's built-in label matching.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/multi-select/multi-select.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectChips,
  MultiSelectContent,
  MultiSelectList,
  MultiSelectItem,
  MultiSelectEmpty,
  type MultiSelectOption,
} from './index.js'

const countries: MultiSelectOption[] = [
  { value: 'it', label: 'Italy' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'de', label: 'Germany' },
  { value: 'pt', label: 'Portugal' },
  { value: 'us', label: 'USA' },
  { value: 'br', label: 'Brazil' },
  { value: 'jp', label: 'Japan' },
]

const meta = {
  title: 'Form/MultiSelect',
  component: MultiSelect,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof MultiSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <MultiSelect items={countries} placeholder="Pick countries…">
        <MultiSelectTrigger aria-label="Countries">
          <MultiSelectChips />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectEmpty>No results</MultiSelectEmpty>
          <MultiSelectList>
            {(item) => (
              <MultiSelectItem value={item.value}>{item.label}</MultiSelectItem>
            )}
          </MultiSelectList>
        </MultiSelectContent>
      </MultiSelect>
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [v, setV] = React.useState<string[]>(['it', 'fr'])
    return (
      <div className="w-80 space-y-2">
        <MultiSelect
          items={countries}
          value={v}
          onValueChange={setV}
          placeholder="Pick…"
        >
          <MultiSelectTrigger aria-label="Countries">
            <MultiSelectChips />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectEmpty>No results</MultiSelectEmpty>
            <MultiSelectList>
              {(item) => (
                <MultiSelectItem value={item.value}>{item.label}</MultiSelectItem>
              )}
            </MultiSelectList>
          </MultiSelectContent>
        </MultiSelect>
        <div className="text-sm text-muted-foreground">Value: {v.join(', ') || '—'}</div>
      </div>
    )
  },
}

export const ManyOptions: Story = {
  render: () => {
    const many: MultiSelectOption[] = Array.from({ length: 30 }).map((_, i) => ({
      value: `opt-${i}`,
      label: `Option ${i + 1}`,
    }))
    return (
      <div className="w-80">
        <MultiSelect items={many} placeholder="Search 30 options…">
          <MultiSelectTrigger aria-label="Options">
            <MultiSelectChips />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectEmpty>No results</MultiSelectEmpty>
            <MultiSelectList>
              {(item) => (
                <MultiSelectItem value={item.value}>{item.label}</MultiSelectItem>
              )}
            </MultiSelectList>
          </MultiSelectContent>
        </MultiSelect>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <MultiSelect items={countries} defaultValue={['it']} disabled>
        <MultiSelectTrigger aria-label="Countries">
          <MultiSelectChips />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectList>
            {(item) => (
              <MultiSelectItem value={item.value}>{item.label}</MultiSelectItem>
            )}
          </MultiSelectList>
        </MultiSelectContent>
      </MultiSelect>
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectChips,
  MultiSelectContent,
  MultiSelectList,
  MultiSelectItem,
  MultiSelectEmpty,
  type MultiSelectProps,
  type MultiSelectTriggerProps,
  type MultiSelectChipsProps,
  type MultiSelectContentProps,
  type MultiSelectListProps,
  type MultiSelectItemProps,
  type MultiSelectEmptyProps,
  type MultiSelectOption,
} from './components/multi-select/index.js'
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
git add packages/ui/src/components/multi-select packages/ui/src/index.ts
git commit -m "feat(ui): add MultiSelect compound (Base UI Combobox)"
```

---

## Task 5: Form + FormField compound (RHF + zod)

Shadcn-style integration. `Form` is the `FormProvider` wrapper. `FormField` wraps RHF `Controller` and provides a `FormFieldContext`. Five sub-parts (`FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`) work together via two contexts and the `useFormField()` hook.

**Files:**
- Create: `packages/ui/src/components/form/form.test.tsx`
- Create: `packages/ui/src/components/form/index.tsx`
- Create: `packages/ui/src/components/form/form.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/form/form.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'
import { z } from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from './index.js'
import { Input } from '../input/index.js'

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Required'),
})

type Values = z.infer<typeof schema>

function TestForm({
  onSubmit = () => {},
  defaultValues,
}: {
  onSubmit?: (v: Values) => void
  defaultValues?: Partial<Values>
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '', ...defaultValues },
  })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormDescription>We never share your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}

describe('Form', () => {
  test('renders FormProvider context (children visible)', () => {
    render(<TestForm />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  test('handleSubmit fires with values when form is valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TestForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Name'), 'Andrea')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'a@b.com', name: 'Andrea' },
        expect.anything(),
      )
    })
  })
})

describe('FormField', () => {
  test('FormItem and FormLabel auto-link via htmlFor / id', () => {
    render(<TestForm />)
    const label = screen.getByText('Email')
    const input = screen.getByLabelText('Email')
    expect(label).toHaveAttribute('for', input.getAttribute('id'))
  })

  test('FormControl propagates aria-describedby and aria-invalid after invalid submit', async () => {
    const user = userEvent.setup()
    render(<TestForm />)
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    const input = screen.getByLabelText('Email')
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
    expect(input.getAttribute('aria-describedby')).toBeTruthy()
  })

  test('FormMessage shows zod error after invalid submit', async () => {
    const user = userEvent.setup()
    render(<TestForm />)
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })

  test('FormDescription rendered with id linked via aria-describedby', () => {
    render(<TestForm />)
    const description = screen.getByText('We never share your email.')
    const input = screen.getByLabelText('Email')
    expect(input.getAttribute('aria-describedby')).toContain(description.id)
  })

  test('useFormField throws when used outside FormField', () => {
    function Bad() {
      useFormField()
      return null
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Bad />)).toThrow(/useFormField/i)
    spy.mockRestore()
  })

  test('field default value populates input', () => {
    render(<TestForm defaultValues={{ email: 'preset@x.com' }} />)
    expect(screen.getByLabelText('Email')).toHaveValue('preset@x.com')
  })

  test('controlled value via field updates on user input', async () => {
    const user = userEvent.setup()
    render(<TestForm />)
    const input = screen.getByLabelText('Email') as HTMLInputElement
    await user.type(input, 'x@y.com')
    expect(input.value).toBe('x@y.com')
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test form
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/form/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'
import { cn } from '../../lib/cn.js'
import { Slot } from '../../lib/slot.js'
import { Label } from '../label/index.js'

type FormFieldContextValue = {
  name: string
}
const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

type FormItemContextValue = {
  id: string
}
const FormItemContext = React.createContext<FormItemContextValue | null>(null)

export type FormProps<TValues extends FieldValues = FieldValues> = UseFormReturn<TValues> & {
  children?: React.ReactNode
}

export function Form<TValues extends FieldValues = FieldValues>({
  children,
  ...form
}: FormProps<TValues>): React.JSX.Element {
  return <FormProvider {...form}>{children}</FormProvider>
}

export type FormFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>,
> = ControllerProps<TValues, TName>

export function FormField<
  TValues extends FieldValues = FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>,
>(props: FormFieldProps<TValues, TName>): React.JSX.Element {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller<TValues, TName> {...props} />
    </FormFieldContext.Provider>
  )
}

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const formContext = useFormContext()

  if (!fieldContext) {
    throw new Error('useFormField must be used inside <FormField>.')
  }
  if (!itemContext) {
    throw new Error('useFormField must be used inside <FormItem>.')
  }
  if (!formContext) {
    throw new Error('useFormField must be used inside <Form>.')
  }

  const { id } = itemContext
  const fieldState = formContext.getFieldState(fieldContext.name, formContext.formState)

  return {
    id,
    name: fieldContext.name,
    formItemId: id,
    formDescriptionId: `${id}-description`,
    formMessageId: `${id}-message`,
    error: fieldState.error,
    invalid: fieldState.invalid,
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
  }
}

export type FormItemProps = React.HTMLAttributes<HTMLDivElement>

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  function FormItem({ className, ...props }, ref) {
    const generatedId = React.useId()
    return (
      <FormItemContext.Provider value={{ id: generatedId }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    )
  },
)

export type FormLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  function FormLabel({ className, ...props }, ref) {
    const { error, formItemId } = useFormField()
    return (
      <Label
        ref={ref}
        htmlFor={formItemId}
        className={cn(error && 'text-destructive', className)}
        {...props}
      />
    )
  },
)

export type FormControlProps = React.HTMLAttributes<HTMLElement>

export const FormControl = React.forwardRef<HTMLElement, FormControlProps>(
  function FormControl(props, ref) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={
          error
            ? `${formDescriptionId} ${formMessageId}`
            : `${formDescriptionId}`
        }
        aria-invalid={error ? true : undefined}
        {...props}
      />
    )
  },
)

export type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  function FormDescription({ className, ...props }, ref) {
    const { formDescriptionId } = useFormField()
    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)

export type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  function FormMessage({ className, children, ...props }, ref) {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message ?? '') : children
    if (!body) return null
    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn('text-sm font-medium text-destructive', className)}
        {...props}
      >
        {body}
      </p>
    )
  },
)
```

Notes:
- `Form` is a generic component because it accepts the typed `UseFormReturn<TValues>`. Consumer spreads `...form` directly: `<Form {...form}>`. The `FormProvider` from RHF stores the form instance for any descendant `useFormContext()` call.
- `FormField` is also generic; it forwards directly to `Controller<TValues, TName>`. The render-prop signature mirrors RHF Controller exactly.
- `FormItem` generates a per-item id with `React.useId()` and provides it to descendants.
- `useFormField()` reads both contexts and the RHF form context, then returns a stable shape with derived ids and the current field state.
- `FormControl` uses the internal `Slot` helper to inject `id`, `aria-describedby`, and `aria-invalid` into its child without rendering an extra DOM node. Compatible with any `forwardRef` input.

- [ ] **Step 4: Run test, expect 8 passing**

```bash
pnpm --filter @idcert/ui test form
```

If `useFormField throws when used outside FormField` test produces noise (RHF prints to console on context-missing), the `vi.spyOn(console, 'error')` mock suppresses it.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/form/form.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from './index.js'
import { Input } from '../input/index.js'
import { Button } from '../button/index.js'
import { Switch } from '../switch/index.js'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  remember: z.boolean(),
})

type Values = z.infer<typeof schema>

const meta = {
  title: 'Form/Form',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Form>

export default meta
type Story = StoryObj<typeof meta>

export const LoginForm: Story = {
  render: () => {
    const form = useForm<Values>({
      resolver: zodResolver(schema),
      defaultValues: { email: '', password: '', remember: false },
    })
    const [submitted, setSubmitted] = React.useState<Values | null>(null)
    return (
      <div className="mx-auto max-w-md">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => setSubmitted(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormDescription>We never share your email.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Remember me</FormLabel>
                </FormItem>
              )}
            />
            <Button type="submit">Sign in</Button>
          </form>
        </Form>
        {submitted && (
          <pre className="mt-4 rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        )}
      </div>
    )
  },
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
  type FormProps,
  type FormFieldProps,
  type FormItemProps,
  type FormLabelProps,
  type FormControlProps,
  type FormDescriptionProps,
  type FormMessageProps,
} from './components/form/index.js'
```

- [ ] **Step 7: Verify all green**

```bash
pnpm --filter @idcert/ui test
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui lint
pnpm --filter @idcert/ui build
```

All exit 0. `dist/index.js` first line still `"use client";`. `react-hook-form` and `zod` should appear as `external` in tsup output (peer-dep behaviour).

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/form packages/ui/src/index.ts
git commit -m "feat(ui): add Form + FormField compound (RHF + zod, shadcn pattern)"
```

---

## Task 6: Final validation + v0.4.0 changeset

- [ ] **Step 1: Clean rebuild**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
pnpm clean
pnpm install
pnpm build
```

Expected: 5/5 successful, no errors. `dist/index.js` and `dist/index.cjs` start with `"use client";`. RHF and zod do NOT appear inlined in the build (they're external).

- [ ] **Step 2: Run all gates**

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm exec publint packages/ui
pnpm exec publint packages/tokens
pnpm exec publint packages/tailwind-config
```

All must pass. Total test count target ~152 (the actual existing total is 118 from the `feat/feedback` branch — Plan 4a adds 38 new tests):

| Plans 1+2 components | tests |
|---|---|
| Subtotal Plans 1+2 | 70 |

| Plan 3 components | tests |
|---|---|
| Subtotal Plan 3 (Spinner + Alert + Tooltip + Dialog + AlertDialog) | 48 (per `feat/feedback` final state) |

| Plan 4a components | tests |
|---|---|
| Slot helper | 6 |
| Slider | 6 |
| Select | 8 |
| MultiSelect | 10 |
| Form | 2 |
| FormField | 8 |
| **Subtotal Plan 4a** | **40** |

| **Total target** | **~158** |

Reconcile actual counts with the changeset note before committing. The exact test count goes in the changeset summary.

- [ ] **Step 3: Verify Storybook indexes new stories**

```bash
pnpm --filter @idcert/storybook build
```

Expected: build succeeds and indexes the 4 new component stories under `Form/Slider`, `Form/Select`, `Form/MultiSelect`, `Form/Form`.

- [ ] **Step 4: Manual smoke test in playground**

Create `apps/playground/app/forms/page.tsx`:

```tsx
'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Input,
  Button,
  Switch,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectChips,
  MultiSelectContent,
  MultiSelectList,
  MultiSelectItem,
  MultiSelectEmpty,
  Slider,
  type MultiSelectOption,
} from '@idcert/ui'

const schema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'Almeno 8 caratteri'),
  remember: z.boolean(),
  country: z.string().min(1, 'Obbligatorio'),
  languages: z.array(z.string()).min(1, 'Seleziona almeno una lingua'),
  volume: z.array(z.number()),
})

type Values = z.infer<typeof schema>

const countries = [
  { value: 'it', label: 'Italia' },
  { value: 'fr', label: 'Francia' },
  { value: 'es', label: 'Spagna' },
]

const languages: MultiSelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'it', label: 'Italiano' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
]

export default function FormsPage() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
      country: '',
      languages: [],
      volume: [50],
    },
  })

  const [submitted, setSubmitted] = React.useState<Values | null>(null)

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-semibold">Forms smoke test</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => setSubmitted(v))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormDescription>Mai condivisa.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Ricordami</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paese</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Paese">
                      <SelectValue placeholder="Scegli…" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="languages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lingue</FormLabel>
                <FormControl>
                  <MultiSelect
                    items={languages}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Seleziona…"
                  >
                    <MultiSelectTrigger aria-label="Lingue">
                      <MultiSelectChips />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      <MultiSelectEmpty>Nessun risultato</MultiSelectEmpty>
                      <MultiSelectList>
                        {(item) => (
                          <MultiSelectItem value={item.value}>
                            {item.label}
                          </MultiSelectItem>
                        )}
                      </MultiSelectList>
                    </MultiSelectContent>
                  </MultiSelect>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume: {field.value[0]}</FormLabel>
                <FormControl>
                  <Slider
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-label="Volume"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Invia</Button>
        </form>
      </Form>
      {submitted && (
        <pre className="mt-6 rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </main>
  )
}
```

The playground app already has `react-hook-form`, `zod`, and `@hookform/resolvers` available as workspace devDeps via `@idcert/ui` resolution. If the playground app fails to find these at install time, add them as dependencies of the playground:

```bash
pnpm --filter @idcert/playground add react-hook-form@^7 zod@^3 @hookform/resolvers@^3
```

Then run:

```bash
pnpm --filter @idcert/playground dev
```

Open `http://localhost:3000/forms`. Verify:

- Email field shows description and required-error message after empty submit.
- Password shows min-length error.
- Remember-me Switch toggles.
- Country Select opens, items pick, value updates.
- Languages MultiSelect opens, multiple selections render as chips, X button removes a chip, Backspace on empty input removes the last chip, filter narrows results.
- Volume Slider is draggable; value reflects in the label live.
- Submit produces a JSON dump under the form when valid; nothing happens (or errors stay) when invalid.

Stop the dev server when done.

- [ ] **Step 5: Add v0.4.0 changeset**

Create `.changeset/v0.4.0-forms-base.md`:

```markdown
---
'@idcert/ui': minor
---

Add 4 new components in the Form avanzati category (first half of the form layer).

Components (`@idcert/ui`):
- `Select` compound — single-value dropdown built on Base UI Select. Sub-parts: `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`.
- `MultiSelect` compound — multi-value combobox with chip-style trigger and search filter, built on Base UI Combobox (`multiple`). Data-driven: consumer supplies `items` array; rendered list via `MultiSelectList` render-prop. Sub-parts: `MultiSelectTrigger`, `MultiSelectChips`, `MultiSelectContent`, `MultiSelectList`, `MultiSelectItem`, `MultiSelectEmpty`. Type: `MultiSelectOption`.
- `Slider` — numeric input with single-thumb or range support (array `value`), built on Base UI Slider.
- `Form` + `FormField` compound — `react-hook-form` + `zod` integration following the shadcn pattern. Sub-parts: `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`. Hook: `useFormField()`.

Internals:
- New internal `Slot` helper (`src/lib/slot.tsx`, NOT exported) backs `FormControl` child cloning.

New peer dependencies (consumer must install when using the form module):
- `react-hook-form` ^7
- `zod` ^3

Out of scope (deferred to Plan 4b):
- DatePicker, DateRangePicker, TimePicker, FileUpload.
```

- [ ] **Step 6: Verify changeset status**

```bash
pnpm exec changeset status
```

Expected: `@idcert/ui` will bump from `0.3.0` to `0.4.0` minor.

- [ ] **Step 7: Final commit**

```bash
git add .changeset/v0.4.0-forms-base.md apps/playground/app/forms/page.tsx
git commit -m "chore: changeset for v0.4.0 (forms base)"
```

If the playground page was added later by manual smoke test, include it in the same commit. If the playground required new deps, also include `apps/playground/package.json` and `pnpm-lock.yaml`.

- [ ] **Step 8: Final state check**

```bash
git status                                                  # clean
git log --oneline feat/forms-base ^main | wc -l            # ~7 commits (deps + Slot + Slider + Select + MultiSelect + Form + changeset)
pnpm test                                                   # all green
```

Expected: working tree clean, 7-ish commits ahead of main, all gates green.

---

## Self-Review Notes

**Spec coverage:**

- Spec section "Component APIs / 1. Select" — covered in Task 3. All 8 sub-parts (`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`) implemented and exported.
- Spec section "Component APIs / 2. MultiSelect" — covered in Task 4. All 7 sub-parts (`MultiSelect`, `MultiSelectTrigger`, `MultiSelectChips`, `MultiSelectContent`, `MultiSelectList`, `MultiSelectItem`, `MultiSelectEmpty`) implemented and exported, with the `MultiSelectOption` type. Render-prop on `MultiSelectList` matches spec exactly.
- Spec section "Component APIs / 3. Slider" — covered in Task 2. Single API accepting `number[]`; range and single thumb supported via array length.
- Spec section "Component APIs / 4. Form / FormField" — covered in Task 5. All 7 exports (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`) plus `useFormField` hook. Slot used by `FormControl`.
- Spec section "Internal Slot helper" — covered in Task 1, including unit tests.
- Spec section "New dependencies" — covered in Task 0; peer deps + dev deps for RHF and zod, plus `peerDependenciesMeta` setting them as non-optional.
- Spec section "Test scope" — covered. Cumulative count ~40 (slightly above the 34 in the spec because the Slot helper unit tests are extra; spec's "~34" referred only to component-level tests).
- Spec section "Versioning + release" — covered in Task 6. v0.4.0 changeset; only `@idcert/ui` bumps.

**Placeholder scan:**

- No "TBD", "TODO", "implement later" in plan body.
- One conditional in Task 6 ("If the playground app fails to find these at install time…"). Plan resolves it inline by giving the exact command. No placeholder remains.
- One conditional in Task 4 ("If chip-remove or backspace tests have timing issues…") suggests `waitFor` wrapping. The base implementation should pass; the `waitFor` note is a known fallback, not a missing step.
- The test count target in Task 6 is "approximately 158" — the actual reconciliation step is documented; the changeset note will record the real number.

**Type consistency:**

- `MultiSelectOption` defined in Task 4, referenced in Task 6 playground page — same shape (`{ value, label, disabled? }`).
- `useFormField()` defined in Task 5 returning `{ id, name, formItemId, formDescriptionId, formMessageId, error, invalid, isDirty, isTouched }`. All sub-parts in Task 5 reference fields from this exact shape.
- `Slider` `value: number[]` consistent across Task 2 implementation, tests, and Task 6 playground usage.
- `Select` controlled API uses `value: string` + `onValueChange: (v: string) => void` consistent across Task 3 and Task 6 playground.

**Risks tracked from spec:**

- Slot pattern complexity — Slot's runtime guard test (`throws when given non-element children`) covers it.
- Combobox + chip overflow — `max-h-32 overflow-y-auto` applied in `MultiSelectTrigger`; demonstrated in `ManyOptions` story.
- RHF version drift — peer dep `^7` documented; no specific mitigation in the plan beyond the standard CI gate.
- Tree-shaking of form module — verified in Task 6 Step 1 ("RHF and zod do NOT appear inlined in the build").
- FormControl + existing primitives — covered by integration in Task 5 tests (Input via `field` spread) and Task 6 playground (Input, Switch, Select, MultiSelect, Slider all wrapped in FormControl).
