# idcert-ui Primitives + Layout Implementation Plan (Plan 2 of 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 13 components (6 primitives + 6 layout + 1 compound Card) to `@idcert/ui`, following the Button pattern established in Plan 1. Each component is TDD'd (failing test first, then implementation, then Storybook story). Plan ends with a `0.2.0` changeset.

**Architecture:** Reuse all foundation infrastructure from Plan 1. Each component lives in `packages/ui/src/components/<name>/index.tsx` with co-located `<name>.test.tsx` and `<name>.stories.tsx`. Components use Tailwind utility classes and `cn()` for class merging. Variants use `class-variance-authority` (cva). Compound components export sub-components as named exports from the same module.

**Tech Stack:** React 18+, TypeScript 5.6+, Tailwind 3.4+, `class-variance-authority`, `clsx` + `tailwind-merge` (already installed). No new runtime deps for this plan — pure CSS + native HTML elements.

**Branch:** Implement on `feat/primitives` (already branched off `feat/foundation`).

**Spec:** `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`
**Foundation plan:** `docs/superpowers/plans/2026-05-04-idcert-ui-foundation.md`

---

## File Structure

Files added during this plan:

```
packages/ui/src/components/
├── card/
│   ├── card.stories.tsx
│   ├── card.test.tsx
│   └── index.tsx                  # Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
├── checkbox/
│   ├── checkbox.stories.tsx
│   ├── checkbox.test.tsx
│   └── index.tsx
├── container/
│   ├── container.stories.tsx
│   ├── container.test.tsx
│   └── index.tsx
├── divider/
│   ├── divider.stories.tsx
│   ├── divider.test.tsx
│   └── index.tsx
├── grid/
│   ├── grid.stories.tsx
│   ├── grid.test.tsx
│   └── index.tsx
├── input/
│   ├── input.stories.tsx
│   ├── input.test.tsx
│   └── index.tsx
├── label/
│   ├── label.stories.tsx
│   ├── label.test.tsx
│   └── index.tsx
├── radio/
│   ├── radio.stories.tsx
│   ├── radio.test.tsx
│   └── index.tsx                  # Radio, RadioGroup
├── separator/
│   ├── separator.stories.tsx
│   ├── separator.test.tsx
│   └── index.tsx
├── stack/
│   ├── stack.stories.tsx
│   ├── stack.test.tsx
│   └── index.tsx                  # Stack (default vertical), HStack helper
├── switch/
│   ├── switch.stories.tsx
│   ├── switch.test.tsx
│   └── index.tsx
└── textarea/
    ├── textarea.stories.tsx
    ├── textarea.test.tsx
    └── index.tsx
```

Plus modified: `packages/ui/src/index.ts` (barrel re-exports), `.changeset/v0.2.0.md` (release note).

**Component conventions** (established in Plan 1, repeated here for clarity):
- Single file per component (compound components export sub-parts from same `index.tsx`)
- `'use client'` first line
- `React.forwardRef` where the component renders a single DOM element with a public ref
- Named exports only
- Variants via `cva` when more than one visual variant exists; otherwise plain Tailwind
- Stories accompany every component (`<name>.stories.tsx`)
- Tests cover: render, key prop application, primary interaction, ARIA where relevant, ref forwarding

---

## Task 0: Cleanup deferred from foundation review

This is a small bundle of fixes called out as Important / Minor in the foundation final review but punted forward. Doing them first removes friction.

**Files:**
- Modify: `packages/ui/src/components/theme-provider/index.tsx`

- [ ] **Step 1: Replace `next-themes/dist/types` deep import with locally derived type**

The current import points at a private path that may move in next-themes 0.4. Derive the prop type from the component itself.

Replace contents of `packages/ui/src/components/theme-provider/index.tsx` with:

```tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps): React.JSX.Element {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { useTheme } from 'next-themes'
```

- [ ] **Step 2: Verify**

```bash
cd /Users/andreaalunniguiducci/progetti/idcert-ui
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui test
pnpm --filter @idcert/ui build
```

All three exit 0. Bundle still has `'use client';` at line 1.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/theme-provider/index.tsx
git commit -m "refactor(ui): derive ThemeProvider props locally instead of next-themes deep import"
```

---

## Component Task Pattern

Tasks 1–13 each follow the same shape:

1. Write the failing test (`<name>.test.tsx`)
2. Run test, verify it fails with module-not-found
3. Implement the component (`<name>/index.tsx`)
4. Run tests, verify all pass
5. Add the Storybook story (`<name>.stories.tsx`)
6. Update `packages/ui/src/index.ts` to re-export the new component(s)
7. Run typecheck + lint
8. Commit (single commit per component for clean history; combine TDD red+green since the failing test is one line of dispatch context, not a separate session)

For each component below, the task description gives:
- Test file (verbatim)
- Implementation file (verbatim)
- Story file (verbatim)
- Index update line(s)
- Commit message

---

## Task 1: Input component

**Files:**
- Create: `packages/ui/src/components/input/input.test.tsx`
- Create: `packages/ui/src/components/input/index.tsx`
- Create: `packages/ui/src/components/input/input.stories.tsx`
- Modify: `packages/ui/src/index.ts` (add export)

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Input } from './index.js'

describe('Input', () => {
  test('renders with placeholder', () => {
    render(<Input placeholder="Email" />)
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
  })

  test('accepts user typing', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} placeholder="Type here" />)
    await userEvent.type(screen.getByPlaceholderText('Type here'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  test('respects disabled', () => {
    render(<Input disabled placeholder="X" />)
    expect(screen.getByPlaceholderText('X')).toBeDisabled()
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  test('merges custom className with base classes', () => {
    render(<Input className="custom-class" placeholder="X" />)
    expect(screen.getByPlaceholderText('X')).toHaveClass('custom-class')
  })

  test('respects type prop', () => {
    render(<Input type="password" placeholder="Pass" />)
    expect(screen.getByPlaceholderText('Pass')).toHaveAttribute('type', 'password')
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, type, ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
```

- [ ] **Step 4: Run test, expect 6 passing**

```bash
pnpm --filter @idcert/ui test
```

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './index.js'

const meta = {
  title: 'Primitives/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { placeholder: 'Type something...' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: 'Hello' } }
export const Disabled: Story = { args: { disabled: true } }
export const Password: Story = { args: { type: 'password', placeholder: 'Password' } }
export const Email: Story = { args: { type: 'email', placeholder: 'name@example.com' } }
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:
```ts
export { Input, type InputProps } from './components/input/index.js'
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
git add packages/ui/src/components/input packages/ui/src/index.ts
git commit -m "feat(ui): add Input component"
```

---

## Task 2: Textarea component

**Files:**
- Create: `packages/ui/src/components/textarea/textarea.test.tsx`
- Create: `packages/ui/src/components/textarea/index.tsx`
- Create: `packages/ui/src/components/textarea/textarea.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Textarea } from './index.js'

describe('Textarea', () => {
  test('renders with placeholder', () => {
    render(<Textarea placeholder="Write here" />)
    expect(screen.getByPlaceholderText('Write here')).toBeInTheDocument()
  })

  test('accepts multi-line typing', async () => {
    const onChange = vi.fn()
    render(<Textarea onChange={onChange} placeholder="X" />)
    await userEvent.type(screen.getByPlaceholderText('X'), 'line1{Enter}line2')
    expect(onChange).toHaveBeenCalled()
  })

  test('respects disabled', () => {
    render(<Textarea disabled placeholder="X" />)
    expect(screen.getByPlaceholderText('X')).toBeDisabled()
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

- [ ] **Step 3: Implementation**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
```

- [ ] **Step 4: Run test, expect 4 passing**

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './index.js'

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { placeholder: 'Write a message...' },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: 'Some longer text\nspanning multiple\nlines.' } }
export const Disabled: Story = { args: { disabled: true } }
```

- [ ] **Step 6: Update barrel**

```ts
export { Textarea, type TextareaProps } from './components/textarea/index.js'
```

- [ ] **Step 7: Verify all green**

- [ ] **Step 8: Commit**

```
feat(ui): add Textarea component
```

---

## Task 3: Label component

**Files:** `packages/ui/src/components/label/{label.test.tsx, index.tsx, label.stories.tsx}` + barrel.

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Label } from './index.js'

describe('Label', () => {
  test('renders with text', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  test('associates with htmlFor', () => {
    render(<Label htmlFor="email-input">Email</Label>)
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email-input')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLLabelElement | null }
    render(<Label ref={ref}>X</Label>)
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })

  test('merges custom className', () => {
    render(<Label className="custom-class">X</Label>)
    expect(screen.getByText('X')).toHaveClass('custom-class')
  })
})
```

- [ ] **Step 2: Run test, expect failure**

- [ ] **Step 3: Implementation**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  function Label({ className, ...props }, ref) {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className,
        )}
        {...props}
      />
    )
  },
)
```

- [ ] **Step 4: Run test, expect 4 passing**

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './index.js'
import { Input } from '../input/index.js'

const meta = {
  title: 'Primitives/Label',
  component: Label,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { children: 'Email' },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2 w-64">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

```ts
export { Label, type LabelProps } from './components/label/index.js'
```

- [ ] **Step 7: Verify all green**

- [ ] **Step 8: Commit**

```
feat(ui): add Label component
```

---

## Task 4: Checkbox component

**Files:** `packages/ui/src/components/checkbox/{checkbox.test.tsx, index.tsx, checkbox.stories.tsx}` + barrel.

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Checkbox } from './index.js'

describe('Checkbox', () => {
  test('renders unchecked by default', () => {
    render(<Checkbox aria-label="Accept" />)
    expect(screen.getByRole('checkbox', { name: 'Accept' })).not.toBeChecked()
  })

  test('toggles on click', async () => {
    const onChange = vi.fn()
    render(<Checkbox aria-label="Accept" onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalled()
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  test('respects disabled', async () => {
    const onChange = vi.fn()
    render(<Checkbox disabled aria-label="X" onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  test('respects defaultChecked', () => {
    render(<Checkbox defaultChecked aria-label="X" />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Checkbox ref={ref} aria-label="X" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

- [ ] **Step 3: Implementation**

```tsx
'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <span className="relative inline-flex">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            'peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-primary bg-background',
            'ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'checked:bg-primary checked:text-primary-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        <Check
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-4 w-4 text-primary-foreground opacity-0 peer-checked:opacity-100"
        />
      </span>
    )
  },
)
```

**Note on `lucide-react`:** this is the first component to import an icon. Add `lucide-react` to `@idcert/ui` dependencies as part of this task:

```bash
pnpm --filter @idcert/ui add lucide-react
```

- [ ] **Step 4: Run test, expect 5 passing**

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './index.js'
import { Label } from '../label/index.js'

const meta = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { 'aria-label': 'Accept' } }
export const Checked: Story = { args: { 'aria-label': 'Accept', defaultChecked: true } }
export const Disabled: Story = { args: { 'aria-label': 'Disabled', disabled: true } }
export const DisabledChecked: Story = { args: { 'aria-label': 'X', disabled: true, defaultChecked: true } }

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

```ts
export { Checkbox, type CheckboxProps } from './components/checkbox/index.js'
```

- [ ] **Step 7: Verify all green**

- [ ] **Step 8: Commit**

```
feat(ui): add Checkbox component
```

---

## Task 5: Radio + RadioGroup compound

**Files:** `packages/ui/src/components/radio/{radio.test.tsx, index.tsx, radio.stories.tsx}` + barrel.

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Radio, RadioGroup } from './index.js'

describe('Radio', () => {
  test('renders with label', () => {
    render(<Radio name="g" value="a" aria-label="Option A" />)
    expect(screen.getByRole('radio', { name: 'Option A' })).toBeInTheDocument()
  })

  test('toggles on click', async () => {
    const onChange = vi.fn()
    render(<Radio name="g" value="a" aria-label="A" onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio'))
    expect(onChange).toHaveBeenCalled()
    expect(screen.getByRole('radio')).toBeChecked()
  })

  test('respects disabled', () => {
    render(<Radio name="g" value="a" disabled aria-label="X" />)
    expect(screen.getByRole('radio')).toBeDisabled()
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Radio ref={ref} name="g" value="a" aria-label="X" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})

describe('RadioGroup', () => {
  test('renders children with role radiogroup', () => {
    render(
      <RadioGroup aria-label="Choose">
        <Radio name="g" value="a" aria-label="A" />
        <Radio name="g" value="b" aria-label="B" />
      </RadioGroup>,
    )
    expect(screen.getByRole('radiogroup', { name: 'Choose' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
  })

  test('only one radio in group can be checked', async () => {
    render(
      <RadioGroup aria-label="Choose">
        <Radio name="grp" value="a" aria-label="A" />
        <Radio name="grp" value="b" aria-label="B" />
      </RadioGroup>,
    )
    const a = screen.getByRole('radio', { name: 'A' })
    const b = screen.getByRole('radio', { name: 'B' })
    await userEvent.click(a)
    expect(a).toBeChecked()
    expect(b).not.toBeChecked()
    await userEvent.click(b)
    expect(b).toBeChecked()
    expect(a).not.toBeChecked()
  })
})
```

- [ ] **Step 2: Run test, expect failure**

- [ ] **Step 3: Implementation**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="radio"
        className={cn(
          'h-4 w-4 shrink-0 appearance-none rounded-full border border-primary bg-background',
          'ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'checked:border-[5px] checked:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)

export type RadioGroupProps = React.HTMLAttributes<HTMLDivElement>

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn('flex flex-col gap-2', className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
```

- [ ] **Step 4: Run test, expect 6 passing**

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Radio, RadioGroup } from './index.js'
import { Label } from '../label/index.js'

const meta = {
  title: 'Primitives/Radio',
  component: Radio,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = { args: { name: 'g', value: 'a', 'aria-label': 'Option' } }

export const Group: Story = {
  render: () => (
    <RadioGroup aria-label="Pick one">
      <div className="flex items-center gap-2">
        <Radio id="r1" name="grp" value="a" />
        <Label htmlFor="r1">Option A</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio id="r2" name="grp" value="b" />
        <Label htmlFor="r2">Option B</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio id="r3" name="grp" value="c" />
        <Label htmlFor="r3">Option C</Label>
      </div>
    </RadioGroup>
  ),
}
```

- [ ] **Step 6: Update barrel**

```ts
export { Radio, RadioGroup, type RadioProps, type RadioGroupProps } from './components/radio/index.js'
```

- [ ] **Step 7: Verify all green**

- [ ] **Step 8: Commit**

```
feat(ui): add Radio and RadioGroup components
```

---

## Task 6: Switch component

**Files:** `packages/ui/src/components/switch/{switch.test.tsx, index.tsx, switch.stories.tsx}` + barrel.

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Switch } from './index.js'

describe('Switch', () => {
  test('renders with role switch', () => {
    render(<Switch aria-label="Toggle" />)
    expect(screen.getByRole('switch', { name: 'Toggle' })).toBeInTheDocument()
  })

  test('toggles on click', async () => {
    const onChange = vi.fn()
    render(<Switch aria-label="X" onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalled()
  })

  test('respects defaultChecked', () => {
    render(<Switch defaultChecked aria-label="X" />)
    expect(screen.getByRole('switch')).toBeChecked()
  })

  test('respects disabled', async () => {
    const onChange = vi.fn()
    render(<Switch disabled aria-label="X" onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).not.toHaveBeenCalled()
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Switch ref={ref} aria-label="X" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

- [ ] **Step 3: Implementation**

```tsx
'use client'

import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'>

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className={cn(
          'relative h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-input',
          'transition-colors',
          'before:absolute before:left-0.5 before:top-0.5 before:h-5 before:w-5 before:rounded-full before:bg-background before:transition-transform before:content-[\'\']',
          'checked:bg-primary checked:before:translate-x-5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
```

- [ ] **Step 4: Run test, expect 5 passing**

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './index.js'
import { Label } from '../label/index.js'

const meta = {
  title: 'Primitives/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { 'aria-label': 'Toggle' } }
export const Checked: Story = { args: { 'aria-label': 'Toggle', defaultChecked: true } }
export const Disabled: Story = { args: { 'aria-label': 'Toggle', disabled: true } }

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane Mode</Label>
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

```ts
export { Switch, type SwitchProps } from './components/switch/index.js'
```

- [ ] **Step 7: Verify all green**

- [ ] **Step 8: Commit**

```
feat(ui): add Switch component
```

---

## Task 7: Container component

**Files:** `packages/ui/src/components/container/{container.test.tsx, index.tsx, container.stories.tsx}` + barrel.

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Container } from './index.js'

describe('Container', () => {
  test('renders children', () => {
    render(<Container>Hello</Container>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  test('applies max-width class for default size', () => {
    render(<Container data-testid="c">Content</Container>)
    expect(screen.getByTestId('c')).toHaveClass('max-w-screen-xl')
  })

  test('applies size variant', () => {
    render(<Container size="sm" data-testid="c">X</Container>)
    expect(screen.getByTestId('c')).toHaveClass('max-w-screen-sm')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Container ref={ref}>X</Container>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  test('merges custom className', () => {
    render(<Container className="custom-class" data-testid="c">X</Container>)
    expect(screen.getByTestId('c')).toHaveClass('custom-class')
  })
})
```

- [ ] **Step 2: Run test, expect failure**

- [ ] **Step 3: Implementation**

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: { size: 'xl' },
})

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants>

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ className, size, ...props }, ref) {
    return <div ref={ref} className={cn(containerVariants({ size, className }))} {...props} />
  },
)

export { containerVariants }
```

- [ ] **Step 4: Run test, expect 5 passing**

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Container } from './index.js'

const meta = {
  title: 'Layout/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'] },
  },
  args: {
    children: (
      <div className="rounded-md bg-muted p-8 text-center text-sm">
        Container content
      </div>
    ),
  },
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Small: Story = { args: { size: 'sm' } }
export const Large: Story = { args: { size: 'lg' } }
export const Full: Story = { args: { size: 'full' } }
```

- [ ] **Step 6: Update barrel**

```ts
export { Container, containerVariants, type ContainerProps } from './components/container/index.js'
```

- [ ] **Step 7: Verify all green**

- [ ] **Step 8: Commit**

```
feat(ui): add Container component
```

---

## Task 8: Stack component

**Files:** `packages/ui/src/components/stack/{stack.test.tsx, index.tsx, stack.stories.tsx}` + barrel.

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Stack, HStack, VStack } from './index.js'

describe('Stack', () => {
  test('renders children', () => {
    render(<Stack data-testid="s"><span>A</span><span>B</span></Stack>)
    expect(screen.getByTestId('s')).toBeInTheDocument()
  })

  test('defaults to vertical (flex-col)', () => {
    render(<Stack data-testid="s">X</Stack>)
    expect(screen.getByTestId('s')).toHaveClass('flex-col')
  })

  test('horizontal direction applies flex-row', () => {
    render(<Stack direction="horizontal" data-testid="s">X</Stack>)
    expect(screen.getByTestId('s')).toHaveClass('flex-row')
  })

  test('gap prop applies gap class', () => {
    render(<Stack gap={4} data-testid="s">X</Stack>)
    expect(screen.getByTestId('s')).toHaveClass('gap-4')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Stack ref={ref}>X</Stack>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('HStack', () => {
  test('renders with horizontal direction', () => {
    render(<HStack data-testid="h">X</HStack>)
    expect(screen.getByTestId('h')).toHaveClass('flex-row')
  })
})

describe('VStack', () => {
  test('renders with vertical direction', () => {
    render(<VStack data-testid="v">X</VStack>)
    expect(screen.getByTestId('v')).toHaveClass('flex-col')
  })
})
```

- [ ] **Step 2: Run test, expect failure**

- [ ] **Step 3: Implementation**

```tsx
import * as React from 'react'
import { cn } from '../../lib/cn.js'

type GapValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24

export type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  direction?: 'vertical' | 'horizontal'
  gap?: GapValue
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
}

const gapClasses: Record<GapValue, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
  5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12',
  16: 'gap-16', 20: 'gap-20', 24: 'gap-24',
}

const alignClasses = {
  start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch',
} as const

const justifyClasses = {
  start: 'justify-start', center: 'justify-center', end: 'justify-end',
  between: 'justify-between', around: 'justify-around',
} as const

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  function Stack({ className, direction = 'vertical', gap = 4, align, justify, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'horizontal' ? 'flex-row' : 'flex-col',
          gapClasses[gap],
          align && alignClasses[align],
          justify && justifyClasses[justify],
          className,
        )}
        {...props}
      />
    )
  },
)

export const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  function HStack(props, ref) {
    return <Stack ref={ref} direction="horizontal" {...props} />
  },
)

export const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  function VStack(props, ref) {
    return <Stack ref={ref} direction="vertical" {...props} />
  },
)
```

- [ ] **Step 4: Run test, expect 7 passing**

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Stack, HStack, VStack } from './index.js'

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md bg-muted px-4 py-2 text-sm">{children}</div>
)

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: () => (
    <Stack gap={2}>
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Stack>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <Stack direction="horizontal" gap={4}>
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Stack>
  ),
}

export const HStackHelper: Story = {
  render: () => (
    <HStack gap={3}>
      <Box>A</Box>
      <Box>B</Box>
      <Box>C</Box>
    </HStack>
  ),
}

export const VStackHelper: Story = {
  render: () => (
    <VStack gap={3}>
      <Box>A</Box>
      <Box>B</Box>
      <Box>C</Box>
    </VStack>
  ),
}
```

- [ ] **Step 6: Update barrel**

```ts
export { Stack, HStack, VStack, type StackProps } from './components/stack/index.js'
```

- [ ] **Step 7: Verify all green**

- [ ] **Step 8: Commit**

```
feat(ui): add Stack, HStack, VStack components
```

---

## Task 9: Grid component

**Files:** `packages/ui/src/components/grid/{grid.test.tsx, index.tsx, grid.stories.tsx}` + barrel.

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Grid } from './index.js'

describe('Grid', () => {
  test('renders children with grid display', () => {
    render(<Grid data-testid="g">X</Grid>)
    expect(screen.getByTestId('g')).toHaveClass('grid')
  })

  test('cols prop applies grid-cols class', () => {
    render(<Grid cols={3} data-testid="g">X</Grid>)
    expect(screen.getByTestId('g')).toHaveClass('grid-cols-3')
  })

  test('gap prop applies gap class', () => {
    render(<Grid gap={6} data-testid="g">X</Grid>)
    expect(screen.getByTestId('g')).toHaveClass('gap-6')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Grid ref={ref}>X</Grid>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

- [ ] **Step 3: Implementation**

```tsx
import * as React from 'react'
import { cn } from '../../lib/cn.js'

type ColsValue = 1 | 2 | 3 | 4 | 5 | 6 | 12
type GapValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12

const colsClasses: Record<ColsValue, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3',
  4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6', 12: 'grid-cols-12',
}

const gapClasses: Record<GapValue, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
  5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12',
}

export type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  cols?: ColsValue
  gap?: GapValue
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  function Grid({ className, cols = 1, gap = 4, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('grid', colsClasses[cols], gapClasses[gap], className)}
        {...props}
      />
    )
  },
)
```

- [ ] **Step 4: Run test, expect 4 passing**

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Grid } from './index.js'

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md bg-muted p-4 text-center text-sm">{children}</div>
)

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Grid>

export default meta
type Story = StoryObj<typeof meta>

export const TwoColumns: Story = {
  render: () => (
    <Grid cols={2} gap={4}>
      <Cell>1</Cell><Cell>2</Cell>
      <Cell>3</Cell><Cell>4</Cell>
    </Grid>
  ),
}

export const ThreeColumns: Story = {
  render: () => (
    <Grid cols={3} gap={4}>
      {Array.from({ length: 9 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
    </Grid>
  ),
}

export const TwelveColumns: Story = {
  render: () => (
    <Grid cols={12} gap={2}>
      {Array.from({ length: 12 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
    </Grid>
  ),
}
```

- [ ] **Step 6: Update barrel**

```ts
export { Grid, type GridProps } from './components/grid/index.js'
```

- [ ] **Step 7: Verify all green**

- [ ] **Step 8: Commit**

```
feat(ui): add Grid component
```

---

## Task 10: Card compound (+ Header/Title/Description/Content/Footer)

**Files:** `packages/ui/src/components/card/{card.test.tsx, index.tsx, card.stories.tsx}` + barrel.

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from './index.js'

describe('Card compound', () => {
  test('Card renders with rounded border', () => {
    render(<Card data-testid="card">X</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('rounded-lg')
    expect(card).toHaveClass('border')
  })

  test('CardHeader renders', () => {
    render(<CardHeader data-testid="h">X</CardHeader>)
    expect(screen.getByTestId('h')).toBeInTheDocument()
  })

  test('CardTitle renders as h3 with proper styles', () => {
    render(<CardTitle>My Title</CardTitle>)
    const title = screen.getByText('My Title')
    expect(title.tagName).toBe('H3')
    expect(title).toHaveClass('font-semibold')
  })

  test('CardDescription renders', () => {
    render(<CardDescription>Some text</CardDescription>)
    expect(screen.getByText('Some text')).toBeInTheDocument()
  })

  test('CardContent renders', () => {
    render(<CardContent data-testid="c">X</CardContent>)
    expect(screen.getByTestId('c')).toBeInTheDocument()
  })

  test('CardFooter renders', () => {
    render(<CardFooter data-testid="f">X</CardFooter>)
    expect(screen.getByTestId('f')).toBeInTheDocument()
  })

  test('full composition renders all parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  test('Card forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Card ref={ref}>X</Card>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

- [ ] **Step 3: Implementation**

```tsx
import * as React from 'react'
import { cn } from '../../lib/cn.js'

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Card({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
          className,
        )}
        {...props}
      />
    )
  },
)

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  },
)

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
        {...props}
      />
    )
  },
)

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  },
)

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  },
)

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  },
)
```

- [ ] **Step 4: Run test, expect 8 passing**

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Layout/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Simple: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Latest: incident report from oncall.</p>
      </CardContent>
      <CardFooter>
        <Button>Mark all read</Button>
      </CardFooter>
    </Card>
  ),
}

export const HeaderOnly: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Just a title</CardTitle>
      </CardHeader>
    </Card>
  ),
}
```

- [ ] **Step 6: Update barrel**

```ts
export {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from './components/card/index.js'
```

- [ ] **Step 7: Verify all green**

- [ ] **Step 8: Commit**

```
feat(ui): add Card compound (Header, Title, Description, Content, Footer)
```

---

## Task 11: Divider component

**Files:** `packages/ui/src/components/divider/{divider.test.tsx, index.tsx, divider.stories.tsx}` + barrel.

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Divider } from './index.js'

describe('Divider', () => {
  test('renders with role separator by default', () => {
    render(<Divider />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  test('horizontal orientation by default', () => {
    render(<Divider data-testid="d" />)
    expect(screen.getByTestId('d')).toHaveClass('h-px')
  })

  test('vertical orientation applies w-px', () => {
    render(<Divider orientation="vertical" data-testid="d" />)
    expect(screen.getByTestId('d')).toHaveClass('w-px')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Divider ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

- [ ] **Step 3: Implementation**

```tsx
import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type DividerProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical'
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  function Divider({ className, orientation = 'horizontal', ...props }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={cn(
          'shrink-0 bg-border',
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
          className,
        )}
        {...props}
      />
    )
  },
)
```

- [ ] **Step 4: Run test, expect 4 passing**

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Divider } from './index.js'

const meta = {
  title: 'Layout/Divider',
  component: Divider,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm">Content above</p>
      <Divider className="my-4" />
      <p className="text-sm">Content below</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-16 items-center gap-4">
      <span className="text-sm">Left</span>
      <Divider orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

```ts
export { Divider, type DividerProps } from './components/divider/index.js'
```

- [ ] **Step 7: Verify all green**

- [ ] **Step 8: Commit**

```
feat(ui): add Divider component
```

---

## Task 12: Separator component

**Files:** `packages/ui/src/components/separator/{separator.test.tsx, index.tsx, separator.stories.tsx}` + barrel.

**Note:** Separator is semantically similar to Divider but uses an `<hr>` element under the hood and is intended for "section break" semantics rather than visual divider. This is the shadcn/ui convention.

- [ ] **Step 1: Test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Separator } from './index.js'

describe('Separator', () => {
  test('renders as hr element', () => {
    render(<Separator data-testid="s" />)
    expect(screen.getByTestId('s').tagName).toBe('HR')
  })

  test('has separator role implicit from hr', () => {
    render(<Separator />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  test('applies muted background', () => {
    render(<Separator data-testid="s" />)
    expect(screen.getByTestId('s')).toHaveClass('bg-border')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLHRElement | null }
    render(<Separator ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLHRElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

- [ ] **Step 3: Implementation**

```tsx
import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type SeparatorProps = React.HTMLAttributes<HTMLHRElement>

export const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  function Separator({ className, ...props }, ref) {
    return (
      <hr
        ref={ref}
        className={cn('h-px w-full shrink-0 border-0 bg-border', className)}
        {...props}
      />
    )
  },
)
```

- [ ] **Step 4: Run test, expect 4 passing**

- [ ] **Step 5: Story**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './index.js'

const meta = {
  title: 'Layout/Separator',
  component: Separator,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <h4 className="text-sm font-semibold">Section A</h4>
      <p className="text-sm text-muted-foreground">Content for section A.</p>
      <Separator className="my-4" />
      <h4 className="text-sm font-semibold">Section B</h4>
      <p className="text-sm text-muted-foreground">Content for section B.</p>
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

```ts
export { Separator, type SeparatorProps } from './components/separator/index.js'
```

- [ ] **Step 7: Verify all green**

- [ ] **Step 8: Commit**

```
feat(ui): add Separator component
```

---

## Task 13: Final validation + v0.2.0 changeset

- [ ] **Step 1: Clean rebuild**

```bash
cd /Users/andreaalunniguiducci/progetti/idcert-ui
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

All must pass. Test count should be approximately:
- Button: 8
- Input: 6
- Textarea: 4
- Label: 4
- Checkbox: 5
- Radio + RadioGroup: 6
- Switch: 5
- Container: 5
- Stack + HStack + VStack: 7
- Grid: 4
- Card compound: 8
- Divider: 4
- Separator: 4
- **Total ~70 tests**

- [ ] **Step 3: Verify Storybook indexes new stories**

```bash
pnpm --filter @idcert/storybook build
```

Expected: build succeeds, indexes ~13 new component stories alongside Button.

- [ ] **Step 4: Add v0.2.0 changeset**

Create `.changeset/v0.2.0-primitives-layout.md`:

```markdown
---
'@idcert/ui': minor
---

Add 13 new components in the primitives + layout categories.

Primitives:
- `Input` — text input with disabled, type, ref forwarding
- `Textarea` — multi-line input with auto-styling
- `Label` — htmlFor-aware label primitive
- `Checkbox` — native checkbox styled with peer/checked states; uses `lucide-react` Check icon
- `Radio` + `RadioGroup` — grouped radio inputs
- `Switch` — toggle styled as iOS-style pill

Layout:
- `Container` — responsive max-width wrapper (sm/md/lg/xl/2xl/full)
- `Stack` + `HStack` + `VStack` — flex stacks with gap/align/justify
- `Grid` — CSS grid with cols (1–12) and gap
- `Card` compound — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Divider` — visual separator (horizontal/vertical)
- `Separator` — semantic `hr` separator

Internals:
- ThemeProvider props now derived locally instead of importing `next-themes/dist/types` deep path.
- `lucide-react` added to `@idcert/ui` runtime dependencies (used by `Checkbox`).
```

- [ ] **Step 5: Verify changeset status**

```bash
pnpm exec changeset status
```

Expected: `@idcert/ui` will bump from `0.1.0` to `0.2.0` minor.

- [ ] **Step 6: Final commit**

```bash
git add .changeset/v0.2.0-primitives-layout.md
git commit -m "chore: changeset for v0.2.0 (primitives + layout)"
```

- [ ] **Step 7: Final state check**

```bash
git status                                            # clean
git log --oneline feat/primitives ^feat/foundation | wc -l   # ~14 commits
```

---

## Self-Review Notes

**Spec coverage:**
- Spec section "Primitives (7)" — Input, Textarea, Label, Checkbox, Radio, RadioGroup, Switch all covered (7/7).
- Spec section "Layout (6)" — Container, Stack, Grid, Card (compound), Divider, Separator all covered (6/6 — Card compound counts as one).
- Spec section "Component conventions" — every component follows: single file, `forwardRef` where applicable, `cva` for variants (Container, Button), Storybook story, test file, named exports only, `'use client'` where needed.

**Placeholder scan:** none.

**Type consistency:**
- `cn` consistent across all components.
- `forwardRef` element types match the rendered tag (HTMLInputElement, HTMLTextAreaElement, HTMLLabelElement, HTMLDivElement, HTMLHRElement, HTMLHeadingElement, HTMLParagraphElement).
- Compound components (`Card`, `Radio`+`RadioGroup`, `Stack`+`HStack`+`VStack`) export their parts as named exports from a single file.

**Known forecasted concerns:**
- `Checkbox` uses an inline overlay strategy (parent `<span>` with absolutely positioned check icon over an `<input>`). This works but the styling is fragile. If issues arise during accessibility review or visual polish, consider switching to a Base UI primitive in a future plan (Plan 3+).
- `Switch` uses `::before` pseudo-element for the thumb. Tailwind 3.4 supports the arbitrary `before:content-['']` syntax used here — verify it compiles correctly in the playground.
- `Stack`/`Grid` use string-keyed lookup tables for gap/cols. This is intentional (allows JIT compilation of the right Tailwind classes) but limits the API to a fixed enum. Documenting this in component JSDoc is a Plan 3+ polish item.

**Defer:**
- The `M*` items from foundation review (eslint-plugin-import, security audit, Dependabot, attw cleanup) remain deferred. Pick up opportunistically.
