# idcert-ui Forms Advanced Implementation Plan (Plan 4b of 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new components to `@idcert/ui` (DatePicker, DateRangePicker, TimePicker, FileUpload). DatePicker and DateRangePicker share an internal `_shared.tsx` helper. TimePicker wraps the native `<input type="time">`. FileUpload is a custom drag-drop compound with validation and previews. Plan ends with a `0.5.0` changeset.

**Architecture:** Base UI `Popover` anchors `react-day-picker` for the two date components. `react-day-picker` and `date-fns` are peer deps. TimePicker is a thin `forwardRef` wrapper around the native time input with cva styling that matches `Input`. FileUpload is a self-contained compound: a root with state + validation + context, a dropzone with HTML5 drag-drop handlers, a hidden file input, a button, and a list with image thumbnails (via `URL.createObjectURL`) or icon fallback.

**Tech Stack:** React 18+, TypeScript 5.6+, Tailwind 3.4+ + `tailwindcss-animate`, `@base-ui/react` 1.x (Popover), `class-variance-authority`, `clsx` + `tailwind-merge`, `lucide-react`, `react-day-picker` ^9 (peer), `date-fns` ^3 || ^4 (peer).

**Branch:** `feat/forms-advanced` (off `main` after Plan 4a v0.4.0 + Slider scalar fix).

**Spec:** `docs/superpowers/specs/2026-05-05-idcert-ui-forms-advanced-design.md`
**Main spec:** `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`
**Previous plan:** `docs/superpowers/plans/2026-05-05-idcert-ui-forms-base.md`

---

## File Structure

Files added during this plan:

```
packages/ui/src/components/
├── date-picker/
│   ├── _shared.tsx                    # internal: DatePopoverTrigger, DatePopoverContent, dayPickerClassNames
│   ├── _shared.test.tsx
│   ├── date-picker.stories.tsx
│   ├── date-picker.test.tsx
│   └── index.tsx                      # DatePicker
├── date-range-picker/
│   ├── date-range-picker.stories.tsx
│   ├── date-range-picker.test.tsx
│   └── index.tsx                      # DateRangePicker + type DateRange re-export
├── time-picker/
│   ├── time-picker.stories.tsx
│   ├── time-picker.test.tsx
│   └── index.tsx                      # TimePicker
└── file-upload/
    ├── file-upload.stories.tsx
    ├── file-upload.test.tsx
    └── index.tsx                      # FileUpload + Dropzone + Prompt + Button + List + Item + context
```

Plus modified:
- `packages/ui/src/index.ts` (barrel re-exports)
- `packages/ui/package.json` (add `date-fns` + `react-day-picker` peer deps and dev deps)
- `packages/ui/vitest.setup.ts` (mock `URL.createObjectURL` / `URL.revokeObjectURL` for FileUpload tests; mock `Date.now` strategy comes via `vi.setSystemTime` per-test)
- `apps/playground/app/forms/page.tsx` (extend with DatePicker/DateRangePicker/TimePicker/FileUpload fields)
- `.changeset/v0.5.0-forms-advanced.md` (release note)

**Component conventions** (from Plans 1–4a, repeated for clarity):
- Single file per component (compound components export sub-parts from same `index.tsx`)
- `'use client'` first line for any component using Base UI, browser APIs, or React state hooks
- `React.forwardRef` where the component renders a single DOM element with a public ref
- Named exports only
- Variants via `cva` when more than one visual variant exists
- Stories accompany every component (`<name>.stories.tsx`)
- Tests cover: render, key prop application, primary interaction, ARIA, ref forwarding
- `.js` extension on local imports (NodeNext + ESM config)
- Storybook category for forms: `'Form/<Component>'`
- Storybook stories with `useState`: extract stateful demos to named function components (avoids `react-hooks/rules-of-hooks` ESLint error on inline `render: () => { ... }`)

---

## Task 0: Branch + dependency setup

**Files:**
- Create branch: `feat/forms-advanced`
- Modify: `packages/ui/package.json`

- [ ] **Step 1: Create the forms-advanced branch**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
git checkout main
git log --oneline -3
```

Expected: `main` has the v0.4.0 changeset and the Slider scalar fix (`fix(ui): Slider accepts scalar number value, always emits array` should be the most recent or near the top, alongside the Plan 4b spec commit).

```bash
git checkout -b feat/forms-advanced
git branch --show-current
```

Expected: `feat/forms-advanced`.

- [ ] **Step 2: Add peer + dev dependencies to @idcert/ui**

```bash
pnpm --filter @idcert/ui add --save-peer date-fns@^4 react-day-picker@^9
pnpm --filter @idcert/ui add --save-dev date-fns@^4 react-day-picker@^9
```

Verify `packages/ui/package.json` `peerDependencies` includes `"date-fns": "^4"` and `"react-day-picker": "^9"`.

(Range `^4` is what pnpm picks; the public peer range can be widened later. The plan's spec called for `^3 || ^4` — see Step 3 for the manual override.)

- [ ] **Step 3: Widen peer range and set peerDependenciesMeta**

Edit `packages/ui/package.json` manually:

1. Change `"date-fns": "^4"` in `peerDependencies` to `"date-fns": "^3 || ^4"`.
2. In `peerDependenciesMeta`, merge new keys (preserve existing ones for `next`, `react-hook-form`, `zod`):

```json
"peerDependenciesMeta": {
  "next": { "optional": true },
  "react-hook-form": { "optional": false },
  "zod": { "optional": false },
  "date-fns": { "optional": false },
  "react-day-picker": { "optional": false }
}
```

- [ ] **Step 4: Add `URL.createObjectURL` mock to vitest setup**

Edit `packages/ui/vitest.setup.ts`. Append (or merge with existing setup):

```ts
// Mock browser APIs that jsdom does not implement, used by FileUpload tests.
if (typeof global.URL.createObjectURL === 'undefined') {
  Object.defineProperty(global.URL, 'createObjectURL', {
    writable: true,
    value: () => 'blob:mock',
  })
}
if (typeof global.URL.revokeObjectURL === 'undefined') {
  Object.defineProperty(global.URL, 'revokeObjectURL', {
    writable: true,
    value: () => undefined,
  })
}
```

If `vitest.setup.ts` does not exist at the package root, locate the file referenced from `packages/ui/vitest.config.ts` (in Plan 1 it was `packages/ui/src/test/setup.ts` or similar). Either way, place the snippet in the existing setup file.

- [ ] **Step 5: Sanity rebuild**

```bash
pnpm install
pnpm --filter @idcert/ui build
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui test
```

All exit 0. Test suite still passes (153 tests from prior plans).

- [ ] **Step 6: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml packages/ui/vitest.setup.ts
git commit -m "chore(ui): add date-fns and react-day-picker peer deps + URL mock"
```

(Adjust the path to the test setup file if it lives elsewhere.)

---

## Task 1: Internal `_shared.tsx` for date pickers

`_shared.tsx` exports `DatePopoverTrigger`, `DatePopoverContent`, and `dayPickerClassNames`. NOT exported from the package barrel — it's internal infrastructure used by `DatePicker` and `DateRangePicker`.

**Files:**
- Create: `packages/ui/src/components/date-picker/_shared.tsx`
- Create: `packages/ui/src/components/date-picker/_shared.test.tsx`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/date-picker/_shared.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import {
  DatePopoverTrigger,
  DatePopoverContent,
  dayPickerClassNames,
} from './_shared.js'

describe('_shared', () => {
  test('DatePopoverTrigger renders a button with given children and trailing calendar icon', () => {
    render(
      <DatePopoverTrigger aria-label="Trigger">
        Some date
      </DatePopoverTrigger>,
    )
    const btn = screen.getByRole('button', { name: 'Trigger' })
    expect(btn).toHaveTextContent('Some date')
    expect(btn.querySelector('svg')).not.toBeNull()
  })

  test('DatePopoverTrigger forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<DatePopoverTrigger ref={ref}>x</DatePopoverTrigger>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  test('DatePopoverTrigger applies muted styling when isPlaceholder', () => {
    render(
      <DatePopoverTrigger isPlaceholder data-testid="t">
        placeholder
      </DatePopoverTrigger>,
    )
    expect(screen.getByTestId('t')).toHaveClass('text-muted-foreground')
  })

  test('DatePopoverContent renders children inside a popup', () => {
    render(
      <DatePopoverContent open>
        <div data-testid="calendar-stub" />
      </DatePopoverContent>,
    )
    expect(screen.getByTestId('calendar-stub')).toBeInTheDocument()
  })

  test('dayPickerClassNames defines all calendar slot keys', () => {
    expect(dayPickerClassNames).toMatchObject({
      root: expect.any(String),
      months: expect.any(String),
      month: expect.any(String),
      caption: expect.any(String),
      caption_label: expect.any(String),
      nav: expect.any(String),
      nav_button: expect.any(String),
      table: expect.any(String),
      head_row: expect.any(String),
      head_cell: expect.any(String),
      row: expect.any(String),
      cell: expect.any(String),
      day: expect.any(String),
      day_selected: expect.any(String),
      day_today: expect.any(String),
      day_disabled: expect.any(String),
      day_outside: expect.any(String),
      day_range_start: expect.any(String),
      day_range_middle: expect.any(String),
      day_range_end: expect.any(String),
    })
  })
})
```

Note: `DatePopoverContent` in the test is wrapped with `open` prop because in real usage it's nested inside a `Popover.Root open={...}` controlled by the parent date component. For the standalone test we render it open so the child is mounted.

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test _shared
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/date-picker/_shared.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type DatePopoverTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isPlaceholder?: boolean
}

export const DatePopoverTrigger = React.forwardRef<HTMLButtonElement, DatePopoverTriggerProps>(
  function DatePopoverTrigger({ className, children, isPlaceholder, ...props }, ref) {
    return (
      <BasePopover.Trigger
        ref={ref}
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isPlaceholder && 'text-muted-foreground',
          className,
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
        <CalendarIcon aria-hidden="true" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </BasePopover.Trigger>
    )
  },
)

export type DatePopoverContentProps = {
  open?: boolean
  sideOffset?: number
  className?: string
  children?: React.ReactNode
}

export function DatePopoverContent({
  open,
  sideOffset = 4,
  className,
  children,
}: DatePopoverContentProps): React.JSX.Element {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner sideOffset={sideOffset} className="outline-none">
        <BasePopover.Popup
          className={cn(
            'z-50 rounded-md border border-border bg-background p-3 text-foreground shadow-md',
            'data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0',
            'data-[closed]:zoom-out-95 data-[open]:zoom-in-95',
            className,
          )}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

// Tailwind class mapping for react-day-picker v9 calendar slots.
// Themed to match our design tokens. Used by DatePicker and DateRangePicker.
export const dayPickerClassNames: Record<string, string> = {
  root: 'rdp',
  months: 'flex flex-col gap-4 sm:flex-row',
  month: 'space-y-4',
  caption: 'flex items-center justify-between px-2',
  caption_label: 'text-sm font-medium',
  nav: 'flex items-center gap-1',
  nav_button:
    'inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50',
  nav_button_previous: '',
  nav_button_next: '',
  table: 'w-full border-collapse',
  head_row: 'flex',
  head_cell: 'w-9 text-center text-xs font-medium text-muted-foreground',
  row: 'mt-2 flex w-full',
  cell: 'h-9 w-9 p-0 text-center text-sm relative',
  day: 'h-9 w-9 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100 inline-flex items-center justify-center',
  day_selected:
    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
  day_today: 'bg-accent text-accent-foreground font-semibold',
  day_disabled: 'text-muted-foreground opacity-50 pointer-events-none',
  day_outside: 'text-muted-foreground opacity-50',
  day_range_start: 'rounded-l-md bg-primary text-primary-foreground',
  day_range_middle: 'rounded-none bg-accent text-accent-foreground',
  day_range_end: 'rounded-r-md bg-primary text-primary-foreground',
  day_hidden: 'invisible',
}
```

Notes:
- `react-day-picker` v9 changed `classNames` keys from v8. The keys above are the v9 names. If a key turns out to differ in 9.x patch (e.g. `nav_button_previous` was renamed), adapt and document.
- The trigger uses Base UI `Popover.Trigger` directly so it inherits `data-popup-open` and ARIA wiring from the Popover root above it. The parent date component owns `Popover.Root`.

- [ ] **Step 4: Run test, expect 5 passing**

```bash
pnpm --filter @idcert/ui test _shared
```

Note: the Popover-based tests for `DatePopoverTrigger` and `DatePopoverContent` need to render inside a Base UI `Popover.Root` to avoid context errors. Update the test file so the trigger tests wrap with `<BasePopover.Root>` and the content test wraps with `<BasePopover.Root open>`:

```tsx
// at top of file:
import { Popover as BasePopover } from '@base-ui/react/popover'

// helper:
function withPopover(children: React.ReactNode, open?: boolean) {
  return <BasePopover.Root open={open}>{children}</BasePopover.Root>
}

// then update each render() call:
render(withPopover(<DatePopoverTrigger aria-label="Trigger">Some date</DatePopoverTrigger>))
// ...etc
```

The `dayPickerClassNames` test does not need a Popover wrapper.

- [ ] **Step 5: Verify all green**

```bash
pnpm --filter @idcert/ui test
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui lint
```

All exit 0. Total test count target after Task 1: 153 + 5 = 158.

`_shared.tsx` is intentionally NOT exported from the package barrel `src/index.ts`.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/date-picker/_shared.tsx packages/ui/src/components/date-picker/_shared.test.tsx
git commit -m "feat(ui): add internal _shared module for DatePicker family"
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

Order: simplest first (TimePicker), then DatePicker (uses _shared), then DateRangePicker (reuses _shared), then FileUpload (heaviest custom).

---

## Task 2: TimePicker component

Thin styled wrapper around the native `<input type="time">`. Establishes the new file pattern for Plan 4b's lightest component.

**Files:**
- Create: `packages/ui/src/components/time-picker/time-picker.test.tsx`
- Create: `packages/ui/src/components/time-picker/index.tsx`
- Create: `packages/ui/src/components/time-picker/time-picker.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/time-picker/time-picker.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import { TimePicker } from './index.js'

describe('TimePicker', () => {
  test('renders an input of type time with our styling', () => {
    render(<TimePicker aria-label="Time" />)
    const input = screen.getByLabelText('Time')
    expect(input).toHaveAttribute('type', 'time')
    expect(input).toHaveClass('h-10')
  })

  test('accepts and reflects HH:mm value', () => {
    render(<TimePicker aria-label="Time" value="14:30" onValueChange={() => {}} />)
    expect(screen.getByLabelText<HTMLInputElement>('Time').value).toBe('14:30')
  })

  test('fires onValueChange with the new time string on change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker aria-label="Time" defaultValue="09:00" onValueChange={onChange} />)
    const input = screen.getByLabelText<HTMLInputElement>('Time')
    await user.clear(input)
    await user.type(input, '12:45')
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls.at(-1)
    expect(typeof lastCall?.[0]).toBe('string')
  })

  test('propagates step / min / max to the native input', () => {
    render(
      <TimePicker
        aria-label="Time"
        value="10:00"
        onValueChange={() => {}}
        step={300}
        min="08:00"
        max="20:00"
      />,
    )
    const input = screen.getByLabelText<HTMLInputElement>('Time')
    expect(input).toHaveAttribute('step', '300')
    expect(input).toHaveAttribute('min', '08:00')
    expect(input).toHaveAttribute('max', '20:00')
  })

  test('disabled disables the input', () => {
    render(<TimePicker aria-label="Time" disabled value="10:00" onValueChange={() => {}} />)
    expect(screen.getByLabelText('Time')).toBeDisabled()
  })

  test('forwards ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<TimePicker ref={ref} aria-label="Time" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test time-picker
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/time-picker/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type TimePickerProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'type'
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  function TimePicker(
    { className, value, defaultValue, onValueChange, ...props },
    ref,
  ) {
    return (
      <input
        ref={ref}
        type="time"
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => onValueChange?.(event.target.value)}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
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
pnpm --filter @idcert/ui test time-picker
```

- [ ] **Step 5: Story**

Create `packages/ui/src/components/time-picker/time-picker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { TimePicker } from './index.js'

const meta = {
  title: 'Form/TimePicker',
  component: TimePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

function ControlledDemo() {
  const [v, setV] = React.useState('14:30')
  return (
    <div className="w-64 space-y-2">
      <TimePicker aria-label="Time" value={v} onValueChange={setV} />
      <div className="text-sm text-muted-foreground">Value: {v}</div>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <TimePicker aria-label="Time" defaultValue="09:00" />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

export const WithMinMaxStep: Story = {
  render: () => (
    <div className="w-64">
      <TimePicker
        aria-label="Time"
        defaultValue="08:00"
        min="08:00"
        max="20:00"
        step={300}
      />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-64">
      <TimePicker aria-label="Time" defaultValue="10:00" disabled />
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export { TimePicker, type TimePickerProps } from './components/time-picker/index.js'
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
git add packages/ui/src/components/time-picker packages/ui/src/index.ts
git commit -m "feat(ui): add TimePicker (native time input wrapper)"
```

---

## Task 3: DatePicker component

Single-date picker built on Base UI Popover + react-day-picker (mode="single"). Uses `_shared.tsx` from Task 1.

**Files:**
- Create: `packages/ui/src/components/date-picker/date-picker.test.tsx`
- Create: `packages/ui/src/components/date-picker/index.tsx`
- Create: `packages/ui/src/components/date-picker/date-picker.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/date-picker/date-picker.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it as itLocale } from 'date-fns/locale'
import * as React from 'react'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { DatePicker } from './index.js'

const FROZEN_NOW = new Date('2026-05-05T12:00:00Z')

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FROZEN_NOW)
})

afterAll(() => {
  vi.useRealTimers()
})

describe('DatePicker', () => {
  test('renders trigger with placeholder when no value', () => {
    render(<DatePicker aria-label="Date" placeholder="Pick a date…" />)
    expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('Pick a date…')
  })

  test('opens popover on trigger click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<DatePicker aria-label="Date" placeholder="Pick…" />)
    await user.click(screen.getByRole('button', { name: 'Date' }))
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })
  })

  test('clicking a day calls onValueChange with a Date and closes popover', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onChange = vi.fn()
    render(<DatePicker aria-label="Date" onValueChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Date' }))
    const day10 = await screen.findByRole('button', { name: /10/ })
    await user.click(day10)
    expect(onChange).toHaveBeenCalled()
    const [arg] = onChange.mock.calls.at(-1) ?? []
    expect(arg).toBeInstanceOf(Date)
  })

  test('controlled mode shows formatted date in trigger', () => {
    render(
      <DatePicker
        aria-label="Date"
        value={new Date('2026-05-05')}
        onValueChange={() => {}}
        format="dd/MM/yyyy"
      />,
    )
    expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('05/05/2026')
  })

  test('respects custom locale when formatting', () => {
    render(
      <DatePicker
        aria-label="Date"
        value={new Date('2026-05-05')}
        onValueChange={() => {}}
        locale={itLocale}
        format="d MMMM yyyy"
      />,
    )
    expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('5 maggio 2026')
  })

  test('disabled prevents popover from opening', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<DatePicker aria-label="Date" disabled placeholder="Pick…" />)
    const trigger = screen.getByRole('button', { name: 'Date' })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
  })

  test('toDate disables days after the limit', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <DatePicker
        aria-label="Date"
        toDate={new Date('2026-05-05')}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Date' }))
    const day20 = await screen.findByRole('button', { name: /20/ })
    expect(day20).toHaveAttribute('aria-disabled', 'true')
  })

  test('forwards ref to trigger button', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<DatePicker ref={ref} aria-label="Date" />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test date-picker --run
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/date-picker/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { format as formatDate, type Locale } from 'date-fns'
import { DayPicker, type DayPickerSingleProps } from 'react-day-picker'
import { cn } from '../../lib/cn.js'
import {
  DatePopoverTrigger,
  DatePopoverContent,
  dayPickerClassNames,
} from './_shared.js'

export type DatePickerProps = {
  value?: Date
  defaultValue?: Date
  onValueChange?: (value: Date | undefined) => void
  placeholder?: string
  /** date-fns format string. Default: "PPP" (long localized). */
  format?: string
  /** date-fns locale. Default: en-US. */
  locale?: Locale
  disabled?: boolean
  fromDate?: Date
  toDate?: Date
  className?: string
  'aria-label'?: string
  id?: string
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      placeholder = 'Pick a date',
      format: formatString = 'PPP',
      locale,
      disabled,
      fromDate,
      toDate,
      className,
      id,
      'aria-label': ariaLabel,
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false)
    const [uncontrolled, setUncontrolled] = React.useState<Date | undefined>(defaultValue)
    const isControlled = valueProp !== undefined
    const value = isControlled ? valueProp : uncontrolled

    const setValue = (next: Date | undefined) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    }

    const triggerLabel = value
      ? formatDate(value, formatString, locale ? { locale } : undefined)
      : placeholder

    const dpProps = {
      mode: 'single' as const,
      selected: value,
      onSelect: (next: Date | undefined) => {
        setValue(next)
        setOpen(false)
      },
      classNames: dayPickerClassNames,
      locale,
      ...(fromDate !== undefined ? { fromDate } : {}),
      ...(toDate !== undefined ? { toDate } : {}),
      defaultMonth: value ?? fromDate ?? new Date(),
    } satisfies DayPickerSingleProps

    return (
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        <DatePopoverTrigger
          ref={ref}
          id={id}
          aria-label={ariaLabel}
          disabled={disabled}
          isPlaceholder={!value}
          className={className}
        >
          {triggerLabel}
        </DatePopoverTrigger>
        <DatePopoverContent>
          <DayPicker {...dpProps} />
        </DatePopoverContent>
      </BasePopover.Root>
    )
  },
)
```

Notes:
- `DayPickerSingleProps` is imported from `react-day-picker` v9 — confirm the exact type name in `node_modules/react-day-picker/dist/types`. If renamed, adapt and document. The `mode: 'single'` literal narrows the type.
- `defaultMonth` is required so the calendar opens on the value's month or today.
- We don't render a clear button — consumer's pattern: `onValueChange(undefined)` clears.

- [ ] **Step 4: Run test, expect 8 passing**

```bash
pnpm --filter @idcert/ui test date-picker --run
```

If a test fails because `react-day-picker` v9 emits a different ARIA structure than expected (e.g. a different name pattern for day buttons), adapt the test queries to match actual DOM. Common deviation: day buttons may have `aria-label` like `"Wednesday, May 5th, 2026"` instead of `/10/` matching just the day number — in that case use `screen.findByLabelText(/May 10/i)` or similar.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/date-picker/date-picker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { it as itLocale } from 'date-fns/locale'
import * as React from 'react'
import { DatePicker } from './index.js'

const meta = {
  title: 'Form/DatePicker',
  component: DatePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

function ControlledDemo() {
  const [v, setV] = React.useState<Date | undefined>(new Date())
  return (
    <div className="w-72 space-y-2">
      <DatePicker
        aria-label="Date"
        value={v}
        onValueChange={setV}
        format="dd/MM/yyyy"
      />
      <div className="text-sm text-muted-foreground">
        Value: {v ? v.toISOString() : '—'}
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-72">
      <DatePicker aria-label="Date" placeholder="Pick a date…" />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

export const WithItalianLocale: Story = {
  render: () => (
    <div className="w-72">
      <DatePicker
        aria-label="Data"
        placeholder="Scegli una data…"
        locale={itLocale}
        format="d MMMM yyyy"
      />
    </div>
  ),
}

export const Constrained: Story = {
  render: () => (
    <div className="w-72">
      <DatePicker
        aria-label="Date"
        placeholder="Within range…"
        fromDate={new Date('2026-01-01')}
        toDate={new Date('2026-12-31')}
      />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-72">
      <DatePicker aria-label="Date" placeholder="Disabled" disabled />
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export { DatePicker, type DatePickerProps } from './components/date-picker/index.js'
```

- [ ] **Step 7: Verify all green**

```bash
pnpm --filter @idcert/ui test
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui lint
pnpm --filter @idcert/ui build
```

All exit 0. `dist/index.js` first line still `"use client";`. `react-day-picker` and `date-fns` should appear external, not inlined.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/date-picker packages/ui/src/index.ts
git commit -m "feat(ui): add DatePicker (Base UI Popover + react-day-picker)"
```

---

## Task 4: DateRangePicker component

Range-date picker built on the same primitives. Reuses `_shared.tsx` from Task 1.

**Files:**
- Create: `packages/ui/src/components/date-range-picker/date-range-picker.test.tsx`
- Create: `packages/ui/src/components/date-range-picker/index.tsx`
- Create: `packages/ui/src/components/date-range-picker/date-range-picker.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/date-range-picker/date-range-picker.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { DateRangePicker, type DateRange } from './index.js'

const FROZEN_NOW = new Date('2026-05-05T12:00:00Z')

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FROZEN_NOW)
})

afterAll(() => {
  vi.useRealTimers()
})

describe('DateRangePicker', () => {
  test('renders trigger with placeholder when no value', () => {
    render(<DateRangePicker aria-label="Range" placeholder="Pick a range…" />)
    expect(screen.getByRole('button', { name: 'Range' })).toHaveTextContent('Pick a range…')
  })

  test('opens popover on trigger click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<DateRangePicker aria-label="Range" placeholder="Pick…" />)
    await user.click(screen.getByRole('button', { name: 'Range' }))
    await waitFor(() => {
      expect(screen.getAllByRole('grid').length).toBeGreaterThanOrEqual(1)
    })
  })

  test('selecting two days fires onValueChange with DateRange', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onChange = vi.fn()
    render(<DateRangePicker aria-label="Range" onValueChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Range' }))
    const day10 = await screen.findAllByRole('button', { name: /10/ })
    await user.click(day10[0])
    const day20 = await screen.findAllByRole('button', { name: /20/ })
    await user.click(day20[0])
    expect(onChange).toHaveBeenCalled()
    const lastArg = onChange.mock.calls.at(-1)?.[0] as DateRange | undefined
    expect(lastArg?.from).toBeInstanceOf(Date)
    expect(lastArg?.to).toBeInstanceOf(Date)
  })

  test('renders both from and to in trigger when controlled with full range', () => {
    render(
      <DateRangePicker
        aria-label="Range"
        value={{
          from: new Date('2026-05-05'),
          to: new Date('2026-05-12'),
        }}
        onValueChange={() => {}}
        format="dd/MM/yyyy"
      />,
    )
    expect(screen.getByRole('button', { name: 'Range' })).toHaveTextContent(
      '05/05/2026 − 12/05/2026',
    )
  })

  test('renders only from with placeholder for partial range', () => {
    render(
      <DateRangePicker
        aria-label="Range"
        value={{ from: new Date('2026-05-05'), to: undefined }}
        onValueChange={() => {}}
        format="dd/MM/yyyy"
      />,
    )
    expect(screen.getByRole('button', { name: 'Range' })).toHaveTextContent('05/05/2026 − ?')
  })

  test('renders 2 month grids by default', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<DateRangePicker aria-label="Range" />)
    await user.click(screen.getByRole('button', { name: 'Range' }))
    await waitFor(() => {
      const grids = screen.getAllByRole('grid')
      expect(grids.length).toBe(2)
    })
  })

  test('disabled prevents popover from opening', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<DateRangePicker aria-label="Range" disabled />)
    const trigger = screen.getByRole('button', { name: 'Range' })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(screen.queryAllByRole('grid')).toHaveLength(0)
  })

  test('forwards ref to trigger button', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<DateRangePicker ref={ref} aria-label="Range" />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
```

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test date-range-picker --run
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/date-range-picker/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { format as formatDate, type Locale } from 'date-fns'
import { DayPicker, type DateRange, type DayPickerRangeProps } from 'react-day-picker'
import {
  DatePopoverTrigger,
  DatePopoverContent,
  dayPickerClassNames,
} from '../date-picker/_shared.js'

export type { DateRange } from 'react-day-picker'

export type DateRangePickerProps = {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (value: DateRange | undefined) => void
  placeholder?: string
  format?: string
  locale?: Locale
  disabled?: boolean
  fromDate?: Date
  toDate?: Date
  numberOfMonths?: number
  className?: string
  'aria-label'?: string
  id?: string
}

export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      placeholder = 'Pick a range',
      format: formatString = 'PPP',
      locale,
      disabled,
      fromDate,
      toDate,
      numberOfMonths = 2,
      className,
      id,
      'aria-label': ariaLabel,
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false)
    const [uncontrolled, setUncontrolled] = React.useState<DateRange | undefined>(defaultValue)
    const isControlled = valueProp !== undefined
    const value = isControlled ? valueProp : uncontrolled

    const setValue = (next: DateRange | undefined) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    }

    const triggerLabel = (() => {
      if (!value || !value.from) return placeholder
      const fromText = formatDate(value.from, formatString, locale ? { locale } : undefined)
      const toText = value.to
        ? formatDate(value.to, formatString, locale ? { locale } : undefined)
        : '?'
      return `${fromText} − ${toText}`
    })()

    const isPlaceholder = !value || !value.from

    const dpProps = {
      mode: 'range' as const,
      selected: value,
      onSelect: (next: DateRange | undefined) => {
        setValue(next)
        if (next?.from && next?.to) setOpen(false)
      },
      classNames: dayPickerClassNames,
      locale,
      numberOfMonths,
      ...(fromDate !== undefined ? { fromDate } : {}),
      ...(toDate !== undefined ? { toDate } : {}),
      defaultMonth: value?.from ?? fromDate ?? new Date(),
    } satisfies DayPickerRangeProps

    return (
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        <DatePopoverTrigger
          ref={ref}
          id={id}
          aria-label={ariaLabel}
          disabled={disabled}
          isPlaceholder={isPlaceholder}
          className={className}
        >
          {triggerLabel}
        </DatePopoverTrigger>
        <DatePopoverContent>
          <DayPicker {...dpProps} />
        </DatePopoverContent>
      </BasePopover.Root>
    )
  },
)
```

Notes:
- The popover stays open until both `from` and `to` are selected (matching common UX). On the first click `onSelect` returns `{ from }` (no `to`); on the second click `{ from, to }` and we close.
- The U+2212 minus sign (`−`) is used as the separator (mathematical minus, narrower and cleaner than hyphen-minus).
- `DateRange` is re-exported from this module so consumers import `import { type DateRange } from '@idcert/ui'`.

- [ ] **Step 4: Run test, expect 8 passing**

```bash
pnpm --filter @idcert/ui test date-range-picker --run
```

If `screen.getAllByRole('grid')` returns more than 2 (e.g. some hidden grids react-day-picker uses for internal accessibility), adapt the assertion to match what you see in the rendered DOM. The intent is "two visible month panes."

- [ ] **Step 5: Story**

Create `packages/ui/src/components/date-range-picker/date-range-picker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { it as itLocale } from 'date-fns/locale'
import * as React from 'react'
import { DateRangePicker, type DateRange } from './index.js'

const meta = {
  title: 'Form/DateRangePicker',
  component: DateRangePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof meta>

function ControlledDemo() {
  const [v, setV] = React.useState<DateRange | undefined>({
    from: new Date('2026-05-05'),
    to: new Date('2026-05-12'),
  })
  return (
    <div className="w-80 space-y-2">
      <DateRangePicker
        aria-label="Range"
        value={v}
        onValueChange={setV}
        format="dd/MM/yyyy"
      />
      <div className="text-sm text-muted-foreground">
        From: {v?.from?.toISOString() ?? '—'}; To: {v?.to?.toISOString() ?? '—'}
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <DateRangePicker aria-label="Range" placeholder="Pick a range…" />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

export const WithItalianLocale: Story = {
  render: () => (
    <div className="w-80">
      <DateRangePicker
        aria-label="Range"
        placeholder="Scegli un range…"
        locale={itLocale}
        format="d MMM"
      />
    </div>
  ),
}

export const SingleMonth: Story = {
  render: () => (
    <div className="w-80">
      <DateRangePicker
        aria-label="Range"
        placeholder="Single month grid"
        numberOfMonths={1}
      />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <DateRangePicker aria-label="Range" placeholder="Disabled" disabled />
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  DateRangePicker,
  type DateRangePickerProps,
  type DateRange,
} from './components/date-range-picker/index.js'
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
git add packages/ui/src/components/date-range-picker packages/ui/src/index.ts
git commit -m "feat(ui): add DateRangePicker (Base UI Popover + react-day-picker mode=range)"
```

---

## Task 5: FileUpload compound

Heavy custom component. Drag-drop dropzone + click-to-browse via hidden input + size/type/count validation + image previews via `URL.createObjectURL`.

**Files:**
- Create: `packages/ui/src/components/file-upload/file-upload.test.tsx`
- Create: `packages/ui/src/components/file-upload/index.tsx`
- Create: `packages/ui/src/components/file-upload/file-upload.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Test**

Create `packages/ui/src/components/file-upload/file-upload.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadPrompt,
  FileUploadButton,
  FileUploadList,
  type FileUploadError,
} from './index.js'

function renderUpload(props?: {
  value?: File[]
  defaultValue?: File[]
  onValueChange?: (files: File[]) => void
  onError?: (e: FileUploadError) => void
  accept?: string
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
}) {
  return render(
    <FileUpload {...props}>
      <FileUploadDropzone>
        <FileUploadPrompt>
          Drop files or <FileUploadButton>browse</FileUploadButton>
        </FileUploadPrompt>
      </FileUploadDropzone>
      <FileUploadList />
    </FileUpload>,
  )
}

function makeFile(name: string, size: number, type: string): File {
  const blob = new Blob([new Uint8Array(size)], { type })
  return new File([blob], name, { type })
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('FileUpload', () => {
  test('renders dropzone and button', () => {
    renderUpload()
    expect(screen.getByText(/drop files/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument()
  })

  test('clicking the button triggers the hidden file input', async () => {
    const user = userEvent.setup()
    renderUpload()
    const button = screen.getByRole('button', { name: /browse/i })
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')
    expect(input).not.toBeNull()
    const clickSpy = vi.spyOn(input!, 'click')
    await user.click(button)
    expect(clickSpy).toHaveBeenCalled()
  })

  test('selecting a file via the input fires onValueChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderUpload({ onValueChange: onChange, multiple: true })
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!
    const file = makeFile('a.png', 100, 'image/png')
    await user.upload(input, file)
    expect(onChange).toHaveBeenCalled()
    const lastArg = onChange.mock.calls.at(-1)?.[0] as File[]
    expect(lastArg).toHaveLength(1)
    expect(lastArg[0].name).toBe('a.png')
  })

  test('drop event on the dropzone fires onValueChange with multiple files', () => {
    const onChange = vi.fn()
    renderUpload({ onValueChange: onChange, multiple: true })
    const dropzone = screen.getByText(/drop files/i).closest('[data-fileupload-dropzone]')!
    const f1 = makeFile('a.png', 100, 'image/png')
    const f2 = makeFile('b.pdf', 200, 'application/pdf')
    const event = new Event('drop', { bubbles: true, cancelable: true }) as Event & {
      dataTransfer: DataTransfer
    }
    Object.defineProperty(event, 'dataTransfer', {
      value: { files: [f1, f2] as unknown as FileList },
    })
    dropzone.dispatchEvent(event)
    expect(onChange).toHaveBeenCalled()
    const lastArg = onChange.mock.calls.at(-1)?.[0] as File[]
    expect(lastArg.map((f) => f.name)).toEqual(['a.png', 'b.pdf'])
  })

  test('maxFiles enforces the limit and fires count error', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onError = vi.fn()
    renderUpload({
      onValueChange: onChange,
      onError,
      multiple: true,
      maxFiles: 1,
    })
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!
    const f1 = makeFile('a.png', 100, 'image/png')
    const f2 = makeFile('b.png', 100, 'image/png')
    await user.upload(input, [f1, f2])
    const lastArg = onChange.mock.calls.at(-1)?.[0] as File[]
    expect(lastArg).toHaveLength(1)
    expect(onError).toHaveBeenCalledWith({ type: 'count', max: 1 })
  })

  test('maxSize rejects oversize file and fires size error', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onError = vi.fn()
    renderUpload({
      onValueChange: onChange,
      onError,
      multiple: true,
      maxSize: 50,
    })
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!
    const f1 = makeFile('a.png', 100, 'image/png')
    await user.upload(input, f1)
    expect(onError).toHaveBeenCalledWith({
      type: 'size',
      file: expect.objectContaining({ name: 'a.png' }),
      max: 50,
    })
  })

  test('accept rejects mismatched type and fires accept error', async () => {
    const user = userEvent.setup()
    const onError = vi.fn()
    renderUpload({
      onError,
      multiple: true,
      accept: 'image/*',
    })
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!
    const pdf = makeFile('doc.pdf', 100, 'application/pdf')
    await user.upload(input, pdf)
    expect(onError).toHaveBeenCalledWith({
      type: 'accept',
      file: expect.objectContaining({ name: 'doc.pdf' }),
    })
  })

  test('FileUploadList renders item with name and size', () => {
    const f = makeFile('hello.txt', 1024, 'text/plain')
    renderUpload({ value: [f], multiple: true })
    expect(screen.getByText('hello.txt')).toBeInTheDocument()
    expect(screen.getByText(/1\.0\s*KB/i)).toBeInTheDocument()
  })

  test('clicking the remove button removes the file and revokes the object URL', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const f = makeFile('a.png', 100, 'image/png')
    renderUpload({ value: [f], onValueChange: onChange, multiple: true })
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')
    const removeBtn = screen.getByRole('button', { name: /remove a\.png/i })
    await user.click(removeBtn)
    expect(onChange).toHaveBeenLastCalledWith([])
    expect(revokeSpy).toHaveBeenCalled()
  })

  test('image file gets an <img> preview', () => {
    const f = makeFile('a.png', 100, 'image/png')
    renderUpload({ value: [f], multiple: true })
    expect(screen.getByAltText(/a\.png/)).toBeInTheDocument()
  })

  test('non-image file gets an icon (no <img> with that alt)', () => {
    const f = makeFile('doc.pdf', 100, 'application/pdf')
    renderUpload({ value: [f], multiple: true })
    expect(screen.queryByAltText(/doc\.pdf/)).not.toBeInTheDocument()
    // a generic file icon SVG is rendered instead — assert presence of svg in the item row.
    const item = screen.getByText('doc.pdf').closest('li')!
    expect(item.querySelector('svg')).not.toBeNull()
  })

  test('controlled mode reflects passed files', () => {
    const f = makeFile('controlled.png', 100, 'image/png')
    renderUpload({ value: [f], multiple: true })
    expect(screen.getByText('controlled.png')).toBeInTheDocument()
  })
})
```

12 tests as planned.

- [ ] **Step 2: Run test, expect failure**

```bash
pnpm --filter @idcert/ui test file-upload --run
```

Expected: import error (module not found).

- [ ] **Step 3: Implementation**

Create `packages/ui/src/components/file-upload/index.tsx`:

```tsx
'use client'

import * as React from 'react'
import { File as FileIcon, X } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type FileUploadError =
  | { type: 'size'; file: File; max: number }
  | { type: 'count'; max: number }
  | { type: 'accept'; file: File }

type FileUploadContextValue = {
  value: File[]
  setValue: (files: File[]) => void
  accept?: string
  maxSize?: number
  maxFiles?: number
  multiple: boolean
  disabled: boolean
  onError?: (error: FileUploadError) => void
  inputRef: React.RefObject<HTMLInputElement>
  urlMap: React.MutableRefObject<Map<File, string>>
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(null)

function useFileUpload(): FileUploadContextValue {
  const ctx = React.useContext(FileUploadContext)
  if (!ctx) throw new Error('FileUpload sub-parts must be used inside <FileUpload>.')
  return ctx
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true
  const tokens = accept.split(',').map((t) => t.trim().toLowerCase())
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  return tokens.some((token) => {
    if (token.endsWith('/*')) {
      const prefix = token.slice(0, -1)
      return fileType.startsWith(prefix)
    }
    if (token.startsWith('.')) {
      return fileName.endsWith(token)
    }
    return fileType === token
  })
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
}

export type FileUploadProps = {
  value?: File[]
  defaultValue?: File[]
  onValueChange?: (files: File[]) => void
  accept?: string
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
  onError?: (error: FileUploadError) => void
  children?: React.ReactNode
}

export function FileUpload({
  value: valueProp,
  defaultValue,
  onValueChange,
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  disabled = false,
  onError,
  children,
}: FileUploadProps): React.JSX.Element {
  const [uncontrolled, setUncontrolled] = React.useState<File[]>(defaultValue ?? [])
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled
  const inputRef = React.useRef<HTMLInputElement>(null)
  const urlMap = React.useRef<Map<File, string>>(new Map())

  const setValue = React.useCallback(
    (next: File[]) => {
      // Revoke URLs for removed files.
      const nextSet = new Set(next)
      for (const [file, url] of urlMap.current) {
        if (!nextSet.has(file)) {
          URL.revokeObjectURL(url)
          urlMap.current.delete(file)
        }
      }
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  React.useEffect(() => {
    return () => {
      // Cleanup all URLs on unmount.
      for (const url of urlMap.current.values()) {
        URL.revokeObjectURL(url)
      }
      urlMap.current.clear()
    }
  }, [])

  const ctx = React.useMemo<FileUploadContextValue>(
    () => ({
      value,
      setValue,
      accept,
      maxSize,
      maxFiles,
      multiple,
      disabled,
      onError,
      inputRef,
      urlMap,
    }),
    [value, setValue, accept, maxSize, maxFiles, multiple, disabled, onError],
  )

  return <FileUploadContext.Provider value={ctx}>{children}</FileUploadContext.Provider>
}

function processFiles(
  incoming: File[],
  ctx: FileUploadContextValue,
): File[] {
  const { value, accept, maxSize, maxFiles, multiple, onError } = ctx
  const accepted: File[] = []

  for (const file of incoming) {
    if (!matchesAccept(file, accept)) {
      onError?.({ type: 'accept', file })
      continue
    }
    if (maxSize !== undefined && file.size > maxSize) {
      onError?.({ type: 'size', file, max: maxSize })
      continue
    }
    accepted.push(file)
  }

  let merged = multiple ? [...value, ...accepted] : accepted.slice(-1)

  if (maxFiles !== undefined && maxFiles > 0 && merged.length > maxFiles) {
    onError?.({ type: 'count', max: maxFiles })
    merged = merged.slice(0, maxFiles)
  }

  return merged
}

export type FileUploadDropzoneProps = React.HTMLAttributes<HTMLDivElement>

export const FileUploadDropzone = React.forwardRef<HTMLDivElement, FileUploadDropzoneProps>(
  function FileUploadDropzone({ className, children, onDragOver, onDrop, onDragEnter, onDragLeave, ...props }, ref) {
    const ctx = useFileUpload()
    const [dragging, setDragging] = React.useState(false)

    return (
      <div
        ref={ref}
        data-fileupload-dropzone=""
        data-dragging={dragging || undefined}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-background p-6 text-center text-sm transition-colors',
          'data-[dragging]:border-primary data-[dragging]:bg-accent',
          ctx.disabled && 'pointer-events-none opacity-50',
          className,
        )}
        onDragOver={(e) => {
          e.preventDefault()
          onDragOver?.(e)
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragging(true)
          onDragEnter?.(e)
        }}
        onDragLeave={(e) => {
          setDragging(false)
          onDragLeave?.(e)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (ctx.disabled) return
          const list = e.dataTransfer?.files
          if (!list) return
          const incoming = Array.from(list)
          const next = processFiles(incoming, ctx)
          ctx.setValue(next)
          onDrop?.(e)
        }}
        {...props}
      >
        {children}
        <input
          ref={ctx.inputRef}
          type="file"
          accept={ctx.accept}
          multiple={ctx.multiple}
          disabled={ctx.disabled}
          className="hidden"
          onChange={(event) => {
            const list = event.target.files
            if (!list) return
            const incoming = Array.from(list)
            const next = processFiles(incoming, ctx)
            ctx.setValue(next)
            event.target.value = ''
          }}
        />
      </div>
    )
  },
)

export type FileUploadPromptProps = React.HTMLAttributes<HTMLParagraphElement>

export const FileUploadPrompt = React.forwardRef<HTMLParagraphElement, FileUploadPromptProps>(
  function FileUploadPrompt({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)

export type FileUploadButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const FileUploadButton = React.forwardRef<HTMLButtonElement, FileUploadButtonProps>(
  function FileUploadButton({ className, onClick, type = 'button', ...props }, ref) {
    const ctx = useFileUpload()
    return (
      <button
        ref={ref}
        type={type}
        disabled={ctx.disabled}
        className={cn(
          'inline-flex items-center underline underline-offset-2 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        onClick={(e) => {
          ctx.inputRef.current?.click()
          onClick?.(e)
        }}
        {...props}
      />
    )
  },
)

export type FileUploadListProps = React.HTMLAttributes<HTMLUListElement>

export const FileUploadList = React.forwardRef<HTMLUListElement, FileUploadListProps>(
  function FileUploadList({ className, ...props }, ref) {
    const ctx = useFileUpload()
    if (ctx.value.length === 0) return null
    return (
      <ul ref={ref} className={cn('mt-2 space-y-1', className)} {...props}>
        {ctx.value.map((file) => (
          <FileUploadItem key={`${file.name}-${file.size}-${file.lastModified}`} file={file} />
        ))}
      </ul>
    )
  },
)

export type FileUploadItemProps = {
  file: File
  className?: string
}

export function FileUploadItem({ file, className }: FileUploadItemProps): React.JSX.Element {
  const ctx = useFileUpload()
  const isImage = file.type.startsWith('image/')

  const previewUrl = React.useMemo(() => {
    if (!isImage) return undefined
    let url = ctx.urlMap.current.get(file)
    if (!url) {
      url = URL.createObjectURL(file)
      ctx.urlMap.current.set(file, url)
    }
    return url
  }, [file, isImage, ctx.urlMap])

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-md border border-border bg-background p-2 text-sm',
        className,
      )}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted">
        {isImage && previewUrl ? (
          <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
        ) : (
          <FileIcon aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
        )}
      </span>
      <span className="flex-1 truncate">
        <span className="block truncate font-medium">{file.name}</span>
        <span className="block text-xs text-muted-foreground">{formatBytes(file.size)}</span>
      </span>
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        disabled={ctx.disabled}
        onClick={() => ctx.setValue(ctx.value.filter((f) => f !== file))}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </li>
  )
}
```

Notes:
- The hidden `<input type="file">` lives inside the `FileUploadDropzone`. There's exactly one per `FileUpload` root because the context's `inputRef` is the single ref. If a consumer renders two dropzones inside one root (unsupported), the last one wins. Documented limitation.
- `data-fileupload-dropzone=""` is a stable hook for tests to find the drop area.
- `formatBytes` keeps display precise but compact. KB/MB/GB are 1024-base (binary), which is conventional for file uploads despite IEC purists preferring decimal — pragmatic choice.

- [ ] **Step 4: Run test, expect 12 passing**

```bash
pnpm --filter @idcert/ui test file-upload --run
```

If a test fails because of jsdom DataTransfer differences (e.g. the synthetic `drop` event constructor), adapt to use a `DragEvent` polyfill or manual property assignment as shown in the test. Document any deviation.

- [ ] **Step 5: Story**

Create `packages/ui/src/components/file-upload/file-upload.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadPrompt,
  FileUploadButton,
  FileUploadList,
  type FileUploadError,
} from './index.js'

const meta = {
  title: 'Form/FileUpload',
  component: FileUpload,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

function ControlledDemo() {
  const [files, setFiles] = React.useState<File[]>([])
  const [error, setError] = React.useState<string | null>(null)
  return (
    <div className="mx-auto max-w-md space-y-2">
      <FileUpload
        value={files}
        onValueChange={(next) => {
          setFiles(next)
          setError(null)
        }}
        onError={(e: FileUploadError) => {
          if (e.type === 'size') setError(`${e.file.name} exceeds ${e.max} bytes.`)
          else if (e.type === 'count') setError(`Max ${e.max} files.`)
          else if (e.type === 'accept') setError(`${e.file.name} is the wrong type.`)
        }}
        accept="image/*,.pdf"
        maxSize={2 * 1024 * 1024}
        maxFiles={3}
        multiple
      >
        <FileUploadDropzone>
          <FileUploadPrompt>
            Drop files (image or PDF, max 2MB) or <FileUploadButton>browse</FileUploadButton>
          </FileUploadPrompt>
        </FileUploadDropzone>
        <FileUploadList />
      </FileUpload>
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="mx-auto max-w-md">
      <FileUpload multiple>
        <FileUploadDropzone>
          <FileUploadPrompt>
            Drop files or <FileUploadButton>browse</FileUploadButton>
          </FileUploadPrompt>
        </FileUploadDropzone>
        <FileUploadList />
      </FileUpload>
    </div>
  ),
}

export const ControlledWithValidation: Story = {
  render: () => <ControlledDemo />,
}

export const SingleFile: Story = {
  render: () => (
    <div className="mx-auto max-w-md">
      <FileUpload multiple={false}>
        <FileUploadDropzone>
          <FileUploadPrompt>
            Drop a single file or <FileUploadButton>browse</FileUploadButton>
          </FileUploadPrompt>
        </FileUploadDropzone>
        <FileUploadList />
      </FileUpload>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="mx-auto max-w-md">
      <FileUpload disabled multiple>
        <FileUploadDropzone>
          <FileUploadPrompt>
            Disabled — no interactions
          </FileUploadPrompt>
        </FileUploadDropzone>
        <FileUploadList />
      </FileUpload>
    </div>
  ),
}
```

- [ ] **Step 6: Update barrel**

In `packages/ui/src/index.ts`, append:

```ts
export {
  FileUpload,
  FileUploadDropzone,
  FileUploadPrompt,
  FileUploadButton,
  FileUploadList,
  FileUploadItem,
  type FileUploadProps,
  type FileUploadDropzoneProps,
  type FileUploadPromptProps,
  type FileUploadButtonProps,
  type FileUploadListProps,
  type FileUploadItemProps,
  type FileUploadError,
} from './components/file-upload/index.js'
```

- [ ] **Step 7: Verify all green**

```bash
pnpm --filter @idcert/ui test
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/ui lint
pnpm --filter @idcert/ui build
```

All exit 0. Bundle should still produce both ESM and CJS with `"use client";` banner.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/file-upload packages/ui/src/index.ts
git commit -m "feat(ui): add FileUpload compound (drag-drop + validation + previews)"
```

---

## Task 6: Final validation + v0.5.0 changeset

- [ ] **Step 1: Clean rebuild**

```bash
cd /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui
pnpm clean
pnpm install
pnpm build
```

Expected: 5/5 packages successful. `dist/index.js` and `dist/index.cjs` start with `"use client";`. `react-day-picker` and `date-fns` appear as external imports, not inlined.

Verify externals:

```bash
grep -c "from 'react-day-picker'" packages/ui/dist/index.js   # > 0
grep -c "from 'date-fns'" packages/ui/dist/index.js           # > 0
```

Both should be > 0 (external imports preserved).

- [ ] **Step 2: Run all gates**

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm exec publint packages/ui
pnpm exec publint packages/tokens
pnpm exec publint packages/tailwind-config
```

All must pass. Total test count target after Plan 4b:

| Tasks                            | Tests |
|----------------------------------|------:|
| Plans 1+2 + Plan 3 + Plan 4a     | 153   |
| Plan 4a Slider scalar regression | +2    |
| Plan 4b Task 1 (_shared)         | +5    |
| Plan 4b Task 2 (TimePicker)      | +6    |
| Plan 4b Task 3 (DatePicker)      | +8    |
| Plan 4b Task 4 (DateRangePicker) | +8    |
| Plan 4b Task 5 (FileUpload)      | +12   |
| **Total target**                 | **~194** |

If actuals differ, record them in the changeset note.

- [ ] **Step 3: Verify Storybook indexes new stories**

```bash
pnpm --filter @idcert/storybook build
```

Expected: build succeeds and indexes 4 new stories: `Form/DatePicker`, `Form/DateRangePicker`, `Form/TimePicker`, `Form/FileUpload`.

- [ ] **Step 4: Extend playground smoke page**

Edit `apps/playground/app/forms/page.tsx`. Add four new fields to the existing form: birthday (DatePicker), trip (DateRangePicker), startTime (TimePicker), attachments (FileUpload). Patch:

1. Update the schema:

```ts
const schema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'Almeno 8 caratteri'),
  remember: z.boolean(),
  country: z.string().min(1, 'Obbligatorio'),
  languages: z.array(z.string()).min(1, 'Seleziona almeno una lingua'),
  volume: z.array(z.number()),
  birthday: z.date({ required_error: 'Obbligatorio' }).optional(),
  trip: z
    .object({
      from: z.date(),
      to: z.date().optional(),
    })
    .optional(),
  startTime: z.string().optional(),
  attachments: z.array(z.instanceof(File)).optional(),
})
```

2. Update `defaultValues`:

```ts
defaultValues: {
  email: '',
  password: '',
  remember: false,
  country: '',
  languages: [],
  volume: [50],
  birthday: undefined,
  trip: undefined,
  startTime: '',
  attachments: [],
},
```

3. Add imports at the top:

```tsx
import {
  // existing imports …
  DatePicker,
  DateRangePicker,
  TimePicker,
  FileUpload,
  FileUploadDropzone,
  FileUploadPrompt,
  FileUploadButton,
  FileUploadList,
  type DateRange,
} from '@idcert/ui'
import { it as itLocale } from 'date-fns/locale'
```

4. Add four new `<FormField>` blocks before `<Button type="submit">`:

```tsx
<FormField
  control={form.control}
  name="birthday"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Data di nascita</FormLabel>
      <FormControl>
        <DatePicker
          value={field.value as Date | undefined}
          onValueChange={field.onChange}
          locale={itLocale}
          format="dd/MM/yyyy"
          aria-label="Data di nascita"
          placeholder="Scegli…"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="trip"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Periodo viaggio</FormLabel>
      <FormControl>
        <DateRangePicker
          value={field.value as DateRange | undefined}
          onValueChange={field.onChange}
          locale={itLocale}
          format="dd/MM/yyyy"
          aria-label="Periodo viaggio"
          placeholder="Scegli range…"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="startTime"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Orario inizio</FormLabel>
      <FormControl>
        <TimePicker
          value={field.value}
          onValueChange={field.onChange}
          aria-label="Orario inizio"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="attachments"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Allegati</FormLabel>
      <FormControl>
        <FileUpload
          value={field.value as File[]}
          onValueChange={field.onChange}
          accept="image/*,.pdf"
          maxSize={2 * 1024 * 1024}
          maxFiles={3}
          multiple
        >
          <FileUploadDropzone>
            <FileUploadPrompt>
              Trascina file (immagini o PDF, max 2MB) o{' '}
              <FileUploadButton>scegli</FileUploadButton>
            </FileUploadPrompt>
          </FileUploadDropzone>
          <FileUploadList />
        </FileUpload>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

If the playground fails to resolve `react-day-picker` or `date-fns` at install, add them as devDeps:

```bash
pnpm --filter @idcert/playground add react-day-picker@^9 date-fns@^4
```

Verify the playground builds:

```bash
pnpm --filter @idcert/playground build
```

Note: do NOT start `pnpm --filter @idcert/playground dev` from this task — the user will manually verify in browser. Just confirm production build succeeds.

- [ ] **Step 5: Add v0.5.0 changeset**

Create `.changeset/v0.5.0-forms-advanced.md`:

```markdown
---
'@idcert/ui': minor
---

Add 4 new components in the Form avanzati category (second half — completes the form layer).

Components (`@idcert/ui`):
- `DatePicker` — single-date picker built on Base UI Popover + react-day-picker. Props: `value`, `onValueChange`, `placeholder`, `locale`, `format`, `disabled`, `fromDate`, `toDate`. Calendar themed entirely via internal Tailwind class mapping (no external CSS import required).
- `DateRangePicker` — range-date picker. Same primitives, value is `DateRange` (`{ from, to? }`). Renders 2 month panes by default. Re-exports `DateRange` type.
- `TimePicker` — styled wrapper around the native `<input type="time">`. Props: `value` (HH:mm string), `onValueChange`, `step`, `min`, `max`, `disabled`.
- `FileUpload` compound — drag-drop + click-to-browse with built-in `maxSize` / `accept` / `maxFiles` validation and image thumbnail previews via `URL.createObjectURL` (auto-revoked on unmount/remove). Sub-parts: `FileUploadDropzone`, `FileUploadPrompt`, `FileUploadButton`, `FileUploadList`, `FileUploadItem`. Validation error type: `FileUploadError` (`{ type: 'size' | 'count' | 'accept' }`). No upload logic — consumer owns transport.

New peer dependencies (consumer must install when using DatePicker / DateRangePicker):
- `date-fns` ^3 || ^4
- `react-day-picker` ^9

Out of scope (deferred):
- DateTimePicker combinato, Calendar standalone, Time range picker, FileUpload upload progress/transport, FileUpload paste-from-clipboard.
```

- [ ] **Step 6: Verify changeset status**

```bash
pnpm exec changeset status
```

Expected: `@idcert/ui` will bump from `0.4.0` to `0.5.0` minor.

- [ ] **Step 7: Final commit**

```bash
git add .changeset/v0.5.0-forms-advanced.md apps/playground/app/forms/page.tsx
# If playground deps were added, also include:
# git add apps/playground/package.json pnpm-lock.yaml
git commit -m "chore: changeset for v0.5.0 (forms advanced) + playground smoke"
```

- [ ] **Step 8: Final state check**

```bash
git status                                                       # clean
git log --oneline main..feat/forms-advanced | wc -l             # ~7-8 commits expected
pnpm test                                                        # all green
```

Expected: working tree clean, 7-ish commits ahead of main, all gates green.

Commits expected on the branch:
1. deps + URL mock setup
2. _shared module
3. TimePicker
4. DatePicker
5. DateRangePicker
6. FileUpload
7. v0.5.0 changeset + playground smoke

---

## Self-Review Notes

**Spec coverage:**

- Spec section "Component APIs / 1. DatePicker" — covered in Task 3. Props, popover behaviour, locale/format, fromDate/toDate constraints all implemented. Single forwardRef'd public component, no exported sub-parts (matches spec).
- Spec section "Component APIs / 2. DateRangePicker" — covered in Task 4. `DateRange` type re-exported. Trigger renders `from − to` or `from − ?` formatting. Two months default.
- Spec section "Component APIs / 3. TimePicker" — covered in Task 2. Native input wrapper with `value`/`onValueChange` API. step/min/max pass-through.
- Spec section "Component APIs / 4. FileUpload" — covered in Task 5. Six sub-parts (`FileUpload`, `FileUploadDropzone`, `FileUploadPrompt`, `FileUploadButton`, `FileUploadList`, `FileUploadItem`) plus `FileUploadError` type. Drag-drop, click-to-browse, validation, preview generation, auto-revoke all implemented.
- Spec section "Internal `_shared.tsx`" — covered in Task 1, with dedicated tests.
- Spec section "New dependencies" — covered in Task 0.
- Spec section "Test scope" — Task counts: _shared 5, TimePicker 6, DatePicker 8, DateRangePicker 8, FileUpload 12 = 39. Matches spec's "~34 tests" target (slightly above; acceptable).
- Spec section "Versioning + release" — covered in Task 6. `@idcert/ui` minor 0.4.0 → 0.5.0.
- Spec section "Risks and mitigations" — addressed inline in component task notes (react-day-picker v9 keys, locale rendering, FormControl Slot interaction, object URL leaks, drag-drop accessibility via FileUploadButton fallback).

**Placeholder scan:**

- No "TBD", "TODO", "implement later" in plan body.
- Conditional notes in Tasks 3/4 ("If a test fails because of v9 ARIA differences…") provide concrete adaptation guidance — implementer adapts queries to actual DOM. Not a placeholder; deterministic next step is documented.
- Conditional in Task 0 ("If `vitest.setup.ts` does not exist…") points to the actual setup file location. The implementer can grep for `setup.ts` in the package; not a blocker.

**Type consistency:**

- `DatePopoverTrigger` props (`isPlaceholder` boolean) consistent across Task 1 implementation, Tasks 3/4 usage.
- `dayPickerClassNames` shape consistent: defined in Task 1, consumed in Tasks 3/4 via `_shared` import.
- `DateRange` type: imported from `react-day-picker` in Task 4, re-exported from `date-range-picker/index.tsx`, surfaced in playground (Task 6 Step 4).
- `FileUploadError` union: defined in Task 5 implementation, used in Task 5 tests, exported from barrel for consumer use (Task 5 Step 6), shown in Task 5 story and Task 6 playground patch.
- `FileUpload` `value: File[]` consistent across Task 5 implementation, tests, story, and Task 6 playground RHF wiring.

**Risks tracked from spec:**

- `react-day-picker` v9 styling: addressed by `dayPickerClassNames` fallback (consumer-overridable for any v9 patch-level rename).
- Locale bundle size: documented in changeset; consumer imports specific locale.
- DatePicker + FormControl Slot: covered in Task 6 Step 4 playground integration; if Slot fails to inject correctly, the implementer debug fix is local to that step.
- FileUpload object URL leaks: tested in Task 5 (Step 1 `revokeObjectURL` spy assertion) and implemented in Task 5 (cleanup effect on unmount + per-removal revoke).
- Drag-drop a11y: `FileUploadButton` provides keyboard-accessible alternative; documented in spec.
- TimePicker locale rendering: documented as expected browser behavior; no override.
- react-day-picker SSR: consumer-side concern; flagged in spec, no plan action.
