# Playground Docs Scaffold + Search + E2E + README — Plan C

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the playground docs MVP — scaffold the 38 non-pilot components, wire Cmd+K search to the build-time index, add Playwright e2e tests for three representative routes, and update the root README.

**Architecture:** Each non-pilot component gets a minimal `<name>.examples.tsx` exposing a `Default` export, plus an MDX page with `status: in-progress` frontmatter showing `<Hero><Default /></Hero>` + `<PropsTable />`. `theme-provider` is special (no visual render) and uses a code snippet instead. Search wires the existing `CommandMenu` UI shell to `public/search-index.json` using cmdk's built-in fuzzy match, grouping results by `category`. Playwright e2e covers the three routes called out in the spec testing strategy. README points consumers at `/docs`.

**Tech Stack:** TypeScript, React 18, MDX (`@next/mdx`), `cmdk`, `@playwright/test`, `lucide-react`, Next.js 14, `tsup`, Vitest.

**References:**
- Spec: `docs/superpowers/specs/2026-05-06-playground-component-docs-design.md`
- Plan A (infra, merged): `docs/superpowers/plans/2026-05-06-playground-docs-infra.md`
- Plan B (pilot content + foundations + recipes, merged): `docs/superpowers/plans/2026-05-06-playground-docs-pilot-content.md`

**Component scope (38 components, by category):**
- Primitives (3): badge, avatar, divider
- Forms (12): textarea, label, select, multi-select, checkbox, radio, switch, slider, date-picker, date-range-picker, time-picker, file-upload
- Overlays (6): alert-dialog, sheet, dropdown-menu, tooltip, toast, portal
- Layout (4): container, grid, stack, separator
- Navigation (5): navbar, sidebar, breadcrumb, tabs, pagination
- Data (2): list, card
- Feedback (5): alert, progress, skeleton, spinner, empty-state
- Utility (1): theme-provider

**Conventions used in every scaffold task:**

1. `packages/ui/src/components/<slug>/<slug>.examples.tsx`
   - Imports the component from `./index.js`.
   - Exports a single named `Default` JSX component.
   - No Storybook imports, no `Meta`, no `StoryObj`.
   - Lives next to existing `<slug>.stories.tsx`; the story file is **not modified** in Plan C (Phase 4 keeps stories untouched per spec).
   - Uses `'use client'` only when the example uses React state, refs, or browser APIs.

2. `apps/playground/content/docs/components/<slug>.mdx`
   - Frontmatter: `status: in-progress` + canonical fields (`title`, `description`, `component`, `package: '@idcert/ui'`, `category`).
   - Body: `<Hero><Default /></Hero>` + `## API Reference` + `<PropsTable component="<DisplayName>" />`. Nothing else.
   - Imports `Default` from `@idcert/ui/components/<slug>/examples`.

3. After every batch of files, run `pnpm --filter @idcert/ui build` to confirm tsup emits the new `*.examples.js` artifacts under `dist/components/<slug>/`. Plan A Task 21 already updated tsup to glob `*.examples.tsx`, so no config change is needed.

4. After each task, commit with `docs(playground): scaffold <category> (<slugs>)`.

5. The `<DisplayName>` for `<PropsTable component="X" />` must match what `react-docgen-typescript` emits as `displayName` for the root export. For all components below, `<DisplayName>` is the PascalCase form of the slug (`alert-dialog` → `AlertDialog`). Compound sub-components are not added to the scaffold MDX — they show up in `props.json` regardless and can be documented incrementally once prose lands.

---

## Task 1: Scaffold primitives (badge, avatar, divider)

**Files:**
- Create: `packages/ui/src/components/badge/badge.examples.tsx`
- Create: `packages/ui/src/components/avatar/avatar.examples.tsx`
- Create: `packages/ui/src/components/divider/divider.examples.tsx`
- Create: `apps/playground/content/docs/components/badge.mdx`
- Create: `apps/playground/content/docs/components/avatar.mdx`
- Create: `apps/playground/content/docs/components/divider.mdx`

- [ ] **Step 1: Write `badge.examples.tsx`**

```tsx
import { Badge } from './index.js'

export const Default = () => (
  <div className="flex flex-wrap gap-2">
    <Badge>Default</Badge>
    <Badge variant="secondary">Beta</Badge>
    <Badge variant="success">Active</Badge>
  </div>
)
```

- [ ] **Step 2: Write `avatar.examples.tsx`**

```tsx
import { Avatar, AvatarImage, AvatarFallback } from './index.js'

export const Default = () => (
  <Avatar>
    <AvatarImage src="https://i.pravatar.cc/100?img=1" alt="User one" />
    <AvatarFallback>U1</AvatarFallback>
  </Avatar>
)
```

- [ ] **Step 3: Write `divider.examples.tsx`**

```tsx
import { Divider } from './index.js'

export const Default = () => (
  <div className="w-64">
    <p className="text-sm">Content above</p>
    <Divider className="my-4" />
    <p className="text-sm">Content below</p>
  </div>
)
```

- [ ] **Step 4: Write `badge.mdx`**

```mdx
---
title: Badge
description: Compact label for status, counts, and tags.
component: Badge
package: '@idcert/ui'
category: primitives
status: in-progress
---

import { Default } from '@idcert/ui/components/badge/examples'

<Hero>
  <Default />
</Hero>

## API Reference

<PropsTable component="Badge" />
```

- [ ] **Step 5: Write `avatar.mdx`**

```mdx
---
title: Avatar
description: User profile image with fallback initials.
component: Avatar
package: '@idcert/ui'
category: primitives
status: in-progress
---

import { Default } from '@idcert/ui/components/avatar/examples'

<Hero>
  <Default />
</Hero>

## API Reference

<PropsTable component="Avatar" />
```

- [ ] **Step 6: Write `divider.mdx`**

```mdx
---
title: Divider
description: Thin rule that visually separates content.
component: Divider
package: '@idcert/ui'
category: primitives
status: in-progress
---

import { Default } from '@idcert/ui/components/divider/examples'

<Hero>
  <Default />
</Hero>

## API Reference

<PropsTable component="Divider" />
```

- [ ] **Step 7: Build the UI package**

Run: `pnpm --filter @idcert/ui build`
Expected: success, and these files exist:
- `packages/ui/dist/components/badge/badge.examples.js`
- `packages/ui/dist/components/avatar/avatar.examples.js`
- `packages/ui/dist/components/divider/divider.examples.js`

Verify: `ls packages/ui/dist/components/{badge,avatar,divider}/*.examples.js`

- [ ] **Step 8: Run the playground prebuild**

Run: `pnpm --filter @idcert/playground prebuild`
Expected: success. `apps/playground/public/props.json` contains keys `Badge`, `Avatar`, `Divider`. `public/search-index.json` contains slugs `components/badge`, `components/avatar`, `components/divider`.

Verify: `jq 'keys | map(select(. == "Badge" or . == "Avatar" or . == "Divider"))' apps/playground/public/props.json`
Expected output: `["Avatar", "Badge", "Divider"]`

- [ ] **Step 9: Commit**

```bash
git add \
  packages/ui/src/components/badge/badge.examples.tsx \
  packages/ui/src/components/avatar/avatar.examples.tsx \
  packages/ui/src/components/divider/divider.examples.tsx \
  apps/playground/content/docs/components/badge.mdx \
  apps/playground/content/docs/components/avatar.mdx \
  apps/playground/content/docs/components/divider.mdx
git commit -m "docs(playground): scaffold primitives (badge, avatar, divider)"
```

---

## Task 2: Scaffold forms part 1 (textarea, label, select, multi-select, checkbox, radio)

**Files:**
- Create: `packages/ui/src/components/textarea/textarea.examples.tsx`
- Create: `packages/ui/src/components/label/label.examples.tsx`
- Create: `packages/ui/src/components/select/select.examples.tsx`
- Create: `packages/ui/src/components/multi-select/multi-select.examples.tsx`
- Create: `packages/ui/src/components/checkbox/checkbox.examples.tsx`
- Create: `packages/ui/src/components/radio/radio.examples.tsx`
- Create: `apps/playground/content/docs/components/textarea.mdx`
- Create: `apps/playground/content/docs/components/label.mdx`
- Create: `apps/playground/content/docs/components/select.mdx`
- Create: `apps/playground/content/docs/components/multi-select.mdx`
- Create: `apps/playground/content/docs/components/checkbox.mdx`
- Create: `apps/playground/content/docs/components/radio.mdx`

- [ ] **Step 1: Write `textarea.examples.tsx`**

```tsx
'use client'
import { Textarea } from './index.js'

export const Default = () => (
  <div className="w-80">
    <Textarea placeholder="Type your message…" />
  </div>
)
```

- [ ] **Step 2: Write `label.examples.tsx`**

```tsx
'use client'
import { Label } from './index.js'
import { Input } from '../input/index.js'

export const Default = () => (
  <div className="w-64 space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="name@example.com" />
  </div>
)
```

- [ ] **Step 3: Write `select.examples.tsx`**

```tsx
'use client'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './index.js'

export const Default = () => (
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
)
```

- [ ] **Step 4: Write `multi-select.examples.tsx`**

```tsx
'use client'
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
]

export const Default = () => (
  <div className="w-80">
    <MultiSelect items={countries} placeholder="Pick countries…">
      <MultiSelectTrigger aria-label="Countries">
        <MultiSelectChips />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectEmpty>No results</MultiSelectEmpty>
        <MultiSelectList>
          {(item) => (
            <MultiSelectItem key={item.value} value={item.value}>
              {item.label}
            </MultiSelectItem>
          )}
        </MultiSelectList>
      </MultiSelectContent>
    </MultiSelect>
  </div>
)
```

- [ ] **Step 5: Write `checkbox.examples.tsx`**

```tsx
'use client'
import { Checkbox } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
  <div className="flex items-center space-x-2">
    <Checkbox id="terms" />
    <Label htmlFor="terms">Accept terms and conditions</Label>
  </div>
)
```

- [ ] **Step 6: Write `radio.examples.tsx`**

```tsx
'use client'
import { Radio, RadioGroup } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
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
)
```

- [ ] **Step 7: Write the six MDX files**

Each follows the same template. Substitution table:

| File | title | description | component |
|---|---|---|---|
| `textarea.mdx` | Textarea | Multi-line text input. | Textarea |
| `label.mdx` | Label | Accessible label associated with a form control. | Label |
| `select.mdx` | Select | Single-value dropdown selector. | Select |
| `multi-select.mdx` | MultiSelect | Multi-value selector with chips and search. | MultiSelect |
| `checkbox.mdx` | Checkbox | Binary toggle for opt-in / opt-out. | Checkbox |
| `radio.mdx` | Radio | Single-choice option within a group. | Radio |

Template (substitute `<TITLE>`, `<DESCRIPTION>`, `<COMPONENT>`, `<SLUG>` per row):

```mdx
---
title: <TITLE>
description: <DESCRIPTION>
component: <COMPONENT>
package: '@idcert/ui'
category: forms
status: in-progress
---

import { Default } from '@idcert/ui/components/<SLUG>/examples'

<Hero>
  <Default />
</Hero>

## API Reference

<PropsTable component="<COMPONENT>" />
```

- [ ] **Step 8: Build + prebuild + verify**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground prebuild
```
Expected: both succeed. `props.json` contains `Textarea`, `Label`, `Select`, `MultiSelect`, `Checkbox`, `Radio`.

- [ ] **Step 9: Commit**

```bash
git add \
  packages/ui/src/components/{textarea,label,select,multi-select,checkbox,radio}/*.examples.tsx \
  apps/playground/content/docs/components/{textarea,label,select,multi-select,checkbox,radio}.mdx
git commit -m "docs(playground): scaffold forms (textarea, label, select, multi-select, checkbox, radio)"
```

---

## Task 3: Scaffold forms part 2 (switch, slider, date-picker, date-range-picker, time-picker, file-upload)

**Files:**
- Create: `packages/ui/src/components/switch/switch.examples.tsx`
- Create: `packages/ui/src/components/slider/slider.examples.tsx`
- Create: `packages/ui/src/components/date-picker/date-picker.examples.tsx`
- Create: `packages/ui/src/components/date-range-picker/date-range-picker.examples.tsx`
- Create: `packages/ui/src/components/time-picker/time-picker.examples.tsx`
- Create: `packages/ui/src/components/file-upload/file-upload.examples.tsx`
- Create: `apps/playground/content/docs/components/{switch,slider,date-picker,date-range-picker,time-picker,file-upload}.mdx`

- [ ] **Step 1: Write `switch.examples.tsx`**

```tsx
'use client'
import { Switch } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
  <div className="flex items-center gap-2">
    <Switch id="airplane" />
    <Label htmlFor="airplane">Airplane Mode</Label>
  </div>
)
```

- [ ] **Step 2: Write `slider.examples.tsx`**

```tsx
'use client'
import * as React from 'react'
import { Slider } from './index.js'

export const Default = () => {
  const [v, setV] = React.useState([50])
  return (
    <div className="w-80 space-y-2">
      <Slider value={v} onValueChange={setV} aria-label="Volume" />
      <div className="text-sm text-muted-foreground">Value: {v[0]}</div>
    </div>
  )
}
```

- [ ] **Step 3: Write `date-picker.examples.tsx`**

```tsx
'use client'
import { DatePicker } from './index.js'

export const Default = () => (
  <div className="w-72">
    <DatePicker aria-label="Date" placeholder="Pick a date…" />
  </div>
)
```

- [ ] **Step 4: Write `date-range-picker.examples.tsx`**

```tsx
'use client'
import { DateRangePicker } from './index.js'

export const Default = () => (
  <div className="w-80">
    <DateRangePicker aria-label="Range" placeholder="Pick a range…" />
  </div>
)
```

- [ ] **Step 5: Write `time-picker.examples.tsx`**

```tsx
'use client'
import { TimePicker } from './index.js'

export const Default = () => (
  <div className="w-64">
    <TimePicker aria-label="Time" defaultValue="09:00" />
  </div>
)
```

- [ ] **Step 6: Write `file-upload.examples.tsx`**

```tsx
'use client'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadPrompt,
  FileUploadButton,
  FileUploadList,
} from './index.js'

export const Default = () => (
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
)
```

- [ ] **Step 7: Write the six MDX files**

Same template as Task 2 Step 7 (`category: forms`, `status: in-progress`). Substitution table:

| File | title | description | component |
|---|---|---|---|
| `switch.mdx` | Switch | Toggle between two states. | Switch |
| `slider.mdx` | Slider | Pick a numeric value (or range) on a continuum. | Slider |
| `date-picker.mdx` | DatePicker | Calendar-based single date selector. | DatePicker |
| `date-range-picker.mdx` | DateRangePicker | Calendar-based date range selector. | DateRangePicker |
| `time-picker.mdx` | TimePicker | Hour and minute selector. | TimePicker |
| `file-upload.mdx` | FileUpload | Drag-and-drop file picker with progress list. | FileUpload |

Concrete template (substitute `<TITLE>`, `<DESCRIPTION>`, `<COMPONENT>`, `<SLUG>`):

```mdx
---
title: <TITLE>
description: <DESCRIPTION>
component: <COMPONENT>
package: '@idcert/ui'
category: forms
status: in-progress
---

import { Default } from '@idcert/ui/components/<SLUG>/examples'

<Hero>
  <Default />
</Hero>

## API Reference

<PropsTable component="<COMPONENT>" />
```

- [ ] **Step 8: Build + prebuild + verify**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground prebuild
```
Expected: success. `props.json` contains `Switch`, `Slider`, `DatePicker`, `DateRangePicker`, `TimePicker`, `FileUpload`.

- [ ] **Step 9: Commit**

```bash
git add \
  packages/ui/src/components/{switch,slider,date-picker,date-range-picker,time-picker,file-upload}/*.examples.tsx \
  apps/playground/content/docs/components/{switch,slider,date-picker,date-range-picker,time-picker,file-upload}.mdx
git commit -m "docs(playground): scaffold forms (switch, slider, date pickers, file upload)"
```

---

## Task 4: Scaffold overlays (alert-dialog, sheet, dropdown-menu, tooltip, toast, portal)

**Files:**
- Create: `packages/ui/src/components/{alert-dialog,sheet,dropdown-menu,tooltip,toast,portal}/<slug>.examples.tsx`
- Create: `apps/playground/content/docs/components/{alert-dialog,sheet,dropdown-menu,tooltip,toast,portal}.mdx`

- [ ] **Step 1: Write `alert-dialog.examples.tsx`**

```tsx
'use client'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
  <AlertDialog>
    <AlertDialogTrigger render={<Button variant="destructive">Delete account</Button>} />
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your account.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
```

- [ ] **Step 2: Write `sheet.examples.tsx`**

```tsx
'use client'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
  <Sheet>
    <SheetTrigger render={<Button>Open sheet</Button>} />
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
        <SheetDescription>Adjust the active settings here.</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        <p className="text-sm">Body content goes here.</p>
      </div>
      <SheetFooter>
        <SheetClose render={<Button variant="outline">Cancel</Button>} />
        <Button>Save</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)
```

- [ ] **Step 3: Write `dropdown-menu.examples.tsx`**

```tsx
'use client'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
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
)
```

- [ ] **Step 4: Write `tooltip.examples.tsx`**

```tsx
'use client'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
  <TooltipProvider delay={150}>
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
      <TooltipContent>Helpful information</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
```

- [ ] **Step 5: Write `toast.examples.tsx`**

```tsx
'use client'
import { ToastProvider, useToast } from './index.js'
import { Button } from '../button/index.js'

function Trigger() {
  const toast = useToast()
  return (
    <Button
      onClick={() =>
        toast.add({ type: 'success', title: 'Saved', description: 'Your changes are stored.' })
      }
    >
      Show toast
    </Button>
  )
}

export const Default = () => (
  <ToastProvider>
    <div className="p-4">
      <Trigger />
    </div>
  </ToastProvider>
)
```

- [ ] **Step 6: Write `portal.examples.tsx`**

```tsx
'use client'
import * as React from 'react'
import { Portal } from './index.js'
import { Button } from '../button/index.js'

export const Default = () => {
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
```

- [ ] **Step 7: Write the six MDX files**

`category: overlays`. Substitution table:

| File | title | description | component |
|---|---|---|---|
| `alert-dialog.mdx` | AlertDialog | Modal confirmation for destructive or irreversible actions. | AlertDialog |
| `sheet.mdx` | Sheet | Slide-in panel anchored to a viewport edge. | Sheet |
| `dropdown-menu.mdx` | DropdownMenu | Contextual menu of actions or options. | DropdownMenu |
| `tooltip.mdx` | Tooltip | Hover- or focus-revealed inline help text. | Tooltip |
| `toast.mdx` | Toast | Transient, non-blocking notification. | ToastProvider |
| `portal.mdx` | Portal | Render children into a different DOM subtree. | Portal |

(`toast.mdx` uses `component: ToastProvider` because that is the public surface — the `useToast` hook is documented separately when prose lands.)

Concrete template:

```mdx
---
title: <TITLE>
description: <DESCRIPTION>
component: <COMPONENT>
package: '@idcert/ui'
category: overlays
status: in-progress
---

import { Default } from '@idcert/ui/components/<SLUG>/examples'

<Hero>
  <Default />
</Hero>

## API Reference

<PropsTable component="<COMPONENT>" />
```

- [ ] **Step 8: Build + prebuild + verify**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground prebuild
```
Expected: success. `props.json` contains `AlertDialog`, `Sheet`, `DropdownMenu`, `Tooltip`, `ToastProvider`, `Portal`.

- [ ] **Step 9: Commit**

```bash
git add \
  packages/ui/src/components/{alert-dialog,sheet,dropdown-menu,tooltip,toast,portal}/*.examples.tsx \
  apps/playground/content/docs/components/{alert-dialog,sheet,dropdown-menu,tooltip,toast,portal}.mdx
git commit -m "docs(playground): scaffold overlays (alert-dialog, sheet, dropdown, tooltip, toast, portal)"
```

---

## Task 5: Scaffold layout (container, grid, stack, separator)

**Files:**
- Create: `packages/ui/src/components/{container,grid,stack,separator}/<slug>.examples.tsx`
- Create: `apps/playground/content/docs/components/{container,grid,stack,separator}.mdx`

- [ ] **Step 1: Write `container.examples.tsx`**

```tsx
import { Container } from './index.js'

export const Default = () => (
  <Container>
    <div className="rounded-md bg-muted p-8 text-center text-sm">
      Container content
    </div>
  </Container>
)
```

- [ ] **Step 2: Write `grid.examples.tsx`**

```tsx
import * as React from 'react'
import { Grid } from './index.js'

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md bg-muted p-4 text-center text-sm">{children}</div>
)

export const Default = () => (
  <Grid cols={3} gap={4}>
    {Array.from({ length: 6 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
  </Grid>
)
```

- [ ] **Step 3: Write `stack.examples.tsx`**

```tsx
import * as React from 'react'
import { Stack } from './index.js'

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md bg-muted px-4 py-2 text-sm">{children}</div>
)

export const Default = () => (
  <Stack gap={2}>
    <Box>One</Box>
    <Box>Two</Box>
    <Box>Three</Box>
  </Stack>
)
```

- [ ] **Step 4: Write `separator.examples.tsx`**

```tsx
import { Separator } from './index.js'

export const Default = () => (
  <div className="w-64">
    <h4 className="text-sm font-semibold">Section A</h4>
    <p className="text-sm text-muted-foreground">Content for section A.</p>
    <Separator className="my-4" />
    <h4 className="text-sm font-semibold">Section B</h4>
    <p className="text-sm text-muted-foreground">Content for section B.</p>
  </div>
)
```

- [ ] **Step 5: Write the four MDX files**

`category: layout`. Substitution table:

| File | title | description | component |
|---|---|---|---|
| `container.mdx` | Container | Fixed-max-width wrapper that centers content. | Container |
| `grid.mdx` | Grid | Responsive CSS grid wrapper with column and gap props. | Grid |
| `stack.mdx` | Stack | Flexbox helper for vertical or horizontal spacing. | Stack |
| `separator.mdx` | Separator | Horizontal or vertical dividing line. | Separator |

Template:

```mdx
---
title: <TITLE>
description: <DESCRIPTION>
component: <COMPONENT>
package: '@idcert/ui'
category: layout
status: in-progress
---

import { Default } from '@idcert/ui/components/<SLUG>/examples'

<Hero>
  <Default />
</Hero>

## API Reference

<PropsTable component="<COMPONENT>" />
```

- [ ] **Step 6: Build + prebuild + verify**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground prebuild
```
Expected: success. `props.json` contains `Container`, `Grid`, `Stack`, `Separator`.

- [ ] **Step 7: Commit**

```bash
git add \
  packages/ui/src/components/{container,grid,stack,separator}/*.examples.tsx \
  apps/playground/content/docs/components/{container,grid,stack,separator}.mdx
git commit -m "docs(playground): scaffold layout (container, grid, stack, separator)"
```

---

## Task 6: Scaffold navigation (navbar, sidebar, breadcrumb, tabs, pagination)

**Files:**
- Create: `packages/ui/src/components/{navbar,sidebar,breadcrumb,tabs,pagination}/<slug>.examples.tsx`
- Create: `apps/playground/content/docs/components/{navbar,sidebar,breadcrumb,tabs,pagination}.mdx`

- [ ] **Step 1: Write `navbar.examples.tsx`**

```tsx
'use client'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarActions,
  NavbarMobileToggle,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
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
)
```

- [ ] **Step 2: Write `sidebar.examples.tsx`**

```tsx
'use client'
import { Folder, Home, LayoutDashboard, Settings } from 'lucide-react'
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
  SidebarInset,
} from './index.js'

export const Default = () => (
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
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton>
          <Settings />
          <span>Settings</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
    <SidebarInset>
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <span className="text-sm font-medium">Page header</span>
      </header>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Hello</h1>
        <p className="text-muted-foreground">
          Click the trigger to toggle the sidebar.
        </p>
      </div>
    </SidebarInset>
  </SidebarProvider>
)
```

- [ ] **Step 3: Write `breadcrumb.examples.tsx`**

```tsx
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './index.js'

export const Default = () => (
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
)
```

- [ ] **Step 4: Write `tabs.examples.tsx`**

```tsx
'use client'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './index.js'

export const Default = () => (
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
)
```

- [ ] **Step 5: Write `pagination.examples.tsx`**

```tsx
'use client'
import * as React from 'react'
import { Pagination } from './index.js'

export const Default = () => {
  const [page, setPage] = React.useState(5)
  return (
    <div className="space-y-2">
      <Pagination currentPage={page} totalPages={20} onPageChange={setPage} />
      <div className="text-center text-sm text-muted-foreground">
        Page {page} of 20
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Write the five MDX files**

`category: navigation`. Substitution table:

| File | title | description | component |
|---|---|---|---|
| `navbar.mdx` | Navbar | Top-level horizontal navigation bar. | Navbar |
| `sidebar.mdx` | Sidebar | Collapsible vertical navigation panel. | Sidebar |
| `breadcrumb.mdx` | Breadcrumb | Hierarchical trail showing the current page's location. | Breadcrumb |
| `tabs.mdx` | Tabs | Switch between related panels of content. | Tabs |
| `pagination.mdx` | Pagination | Navigate large data sets one page at a time. | Pagination |

Template:

```mdx
---
title: <TITLE>
description: <DESCRIPTION>
component: <COMPONENT>
package: '@idcert/ui'
category: navigation
status: in-progress
---

import { Default } from '@idcert/ui/components/<SLUG>/examples'

<Hero>
  <Default />
</Hero>

## API Reference

<PropsTable component="<COMPONENT>" />
```

- [ ] **Step 7: Build + prebuild + verify**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground prebuild
```
Expected: success. `props.json` contains `Navbar`, `Sidebar`, `Breadcrumb`, `Tabs`, `Pagination`.

- [ ] **Step 8: Commit**

```bash
git add \
  packages/ui/src/components/{navbar,sidebar,breadcrumb,tabs,pagination}/*.examples.tsx \
  apps/playground/content/docs/components/{navbar,sidebar,breadcrumb,tabs,pagination}.mdx
git commit -m "docs(playground): scaffold navigation (navbar, sidebar, breadcrumb, tabs, pagination)"
```

---

## Task 7: Scaffold data (list, card)

**Files:**
- Create: `packages/ui/src/components/{list,card}/<slug>.examples.tsx`
- Create: `apps/playground/content/docs/components/{list,card}.mdx`

- [ ] **Step 1: Write `list.examples.tsx`**

```tsx
import { List, ListItem } from './index.js'

export const Default = () => (
  <List className="w-64">
    <ListItem>First item</ListItem>
    <ListItem>Second item</ListItem>
    <ListItem>Third item</ListItem>
  </List>
)
```

- [ ] **Step 2: Write `card.examples.tsx`**

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
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
)
```

- [ ] **Step 3: Write the two MDX files**

`category: data`. Substitution table:

| File | title | description | component |
|---|---|---|---|
| `list.mdx` | List | Vertical, semantic list of items. | List |
| `card.mdx` | Card | Container for grouped content with optional header, body, and footer. | Card |

Template:

```mdx
---
title: <TITLE>
description: <DESCRIPTION>
component: <COMPONENT>
package: '@idcert/ui'
category: data
status: in-progress
---

import { Default } from '@idcert/ui/components/<SLUG>/examples'

<Hero>
  <Default />
</Hero>

## API Reference

<PropsTable component="<COMPONENT>" />
```

- [ ] **Step 4: Build + prebuild + verify**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground prebuild
```
Expected: success. `props.json` contains `List`, `Card`.

- [ ] **Step 5: Commit**

```bash
git add \
  packages/ui/src/components/{list,card}/*.examples.tsx \
  apps/playground/content/docs/components/{list,card}.mdx
git commit -m "docs(playground): scaffold data (list, card)"
```

---

## Task 8: Scaffold feedback (alert, progress, skeleton, spinner, empty-state)

**Files:**
- Create: `packages/ui/src/components/{alert,progress,skeleton,spinner,empty-state}/<slug>.examples.tsx`
- Create: `apps/playground/content/docs/components/{alert,progress,skeleton,spinner,empty-state}.mdx`

- [ ] **Step 1: Write `alert.examples.tsx`**

```tsx
import { Alert, AlertTitle, AlertDescription } from './index.js'

export const Default = () => (
  <Alert>
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription>
      You can add components to your app using the CLI.
    </AlertDescription>
  </Alert>
)
```

- [ ] **Step 2: Write `progress.examples.tsx`**

```tsx
import { Progress } from './index.js'

export const Default = () => (
  <div className="w-80">
    <Progress value={60} />
  </div>
)
```

- [ ] **Step 3: Write `skeleton.examples.tsx`**

```tsx
import { Skeleton } from './index.js'

export const Default = () => (
  <div className="flex items-center gap-4">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
)
```

- [ ] **Step 4: Write `spinner.examples.tsx`**

```tsx
import { Spinner } from './index.js'

export const Default = () => (
  <div className="flex items-center gap-4">
    <Spinner aria-label="Loading" />
    <Spinner size="lg" aria-label="Loading" />
  </div>
)
```

- [ ] **Step 5: Write `empty-state.examples.tsx`**

```tsx
import { Inbox } from 'lucide-react'
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
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
)
```

- [ ] **Step 6: Write the five MDX files**

`category: feedback`. Substitution table:

| File | title | description | component |
|---|---|---|---|
| `alert.mdx` | Alert | Persistent inline message highlighting status or info. | Alert |
| `progress.mdx` | Progress | Linear bar showing completion of a task. | Progress |
| `skeleton.mdx` | Skeleton | Placeholder shimmer for loading content. | Skeleton |
| `spinner.mdx` | Spinner | Indeterminate loading indicator. | Spinner |
| `empty-state.mdx` | EmptyState | Centered illustration, copy, and action for empty data views. | EmptyState |

Template:

```mdx
---
title: <TITLE>
description: <DESCRIPTION>
component: <COMPONENT>
package: '@idcert/ui'
category: feedback
status: in-progress
---

import { Default } from '@idcert/ui/components/<SLUG>/examples'

<Hero>
  <Default />
</Hero>

## API Reference

<PropsTable component="<COMPONENT>" />
```

- [ ] **Step 7: Build + prebuild + verify**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground prebuild
```
Expected: success. `props.json` contains `Alert`, `Progress`, `Skeleton`, `Spinner`, `EmptyState`.

- [ ] **Step 8: Commit**

```bash
git add \
  packages/ui/src/components/{alert,progress,skeleton,spinner,empty-state}/*.examples.tsx \
  apps/playground/content/docs/components/{alert,progress,skeleton,spinner,empty-state}.mdx
git commit -m "docs(playground): scaffold feedback (alert, progress, skeleton, spinner, empty-state)"
```

---

## Task 9: Scaffold theme-provider (utility, no examples file)

**Rationale:** `ThemeProvider` is a context provider with no visual render of its own. A `<Hero>` rendering it would show nothing. The scaffold MDX uses a code snippet via `<CodeBlock>` instead of importing an examples module. No `theme-provider.examples.tsx` is created.

**Files:**
- Create: `apps/playground/content/docs/components/theme-provider.mdx`

- [ ] **Step 1: Write `theme-provider.mdx`**

```mdx
---
title: ThemeProvider
description: Wraps the app with light/dark theme context.
component: ThemeProvider
package: '@idcert/ui'
category: utility
status: in-progress
---

`ThemeProvider` exposes the active theme to descendants via React context. Place it
near the root layout so every component has access to the resolved theme.

<CodeBlock language="tsx">{`import { ThemeProvider } from '@idcert/ui'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}`}</CodeBlock>

## API Reference

<PropsTable component="ThemeProvider" />
```

- [ ] **Step 2: Verify the page resolves**

Run: `pnpm --filter @idcert/playground prebuild`
Expected: `public/search-index.json` contains an entry with `slug: "components/theme-provider"`.

Run: `jq '.[] | select(.slug == "components/theme-provider") | .title' apps/playground/public/search-index.json`
Expected: `"ThemeProvider"`

- [ ] **Step 3: Commit**

```bash
git add apps/playground/content/docs/components/theme-provider.mdx
git commit -m "docs(playground): scaffold theme-provider (utility)"
```

---

## Task 10: Verify nav cross-check passes after scaffold

**Goal:** Plan A Task 6 added a vitest test that fails if `nav.ts` and `content/docs/**/*.mdx` disagree. Confirm the 38 newly created MDX files match the existing nav entries.

**Files:**
- No code changes. Verification only.

- [ ] **Step 1: Run the nav cross-check test**

Run: `pnpm --filter @idcert/playground test tests/lib/nav.test.ts`
Expected: PASS (no orphan slugs in either direction).

If FAIL: the test reports either an MDX file with no nav entry or a nav entry with no MDX file. Fix by adding the missing file or removing the stale nav entry, then re-run.

- [ ] **Step 2: Run the full unit test suite**

Run: `pnpm --filter @idcert/playground test`
Expected: all green.

- [ ] **Step 3: Spot-check three pages render in dev**

In one terminal: `pnpm --filter @idcert/ui build && pnpm --filter @idcert/playground dev`

In another:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/docs/components/badge
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/docs/components/sidebar
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/docs/components/theme-provider
```
Expected: each returns `200`.

Stop the dev server (`Ctrl-C`) before continuing.

- [ ] **Step 4: No-commit task** — verification only.

---

## Task 11: Wire CommandMenu search to `public/search-index.json`

**Files:**
- Modify: `apps/playground/components/docs/CommandMenu.tsx` (replace placeholder body, current source: `apps/playground/components/docs/CommandMenu.tsx:1-39`)
- Create: `apps/playground/components/docs/__tests__/CommandMenu.test.tsx`

**Behavior to implement** (from spec):
- Lazy-load `/search-index.json` on first open.
- cmdk fuzzy match weighted: `title` (3×) > `description` (2×) > headings (1×). cmdk's built-in scorer respects the `keywords` array on `Command.Item`. Weighting is achieved by repeating high-priority terms in `keywords`.
- Group results by `category`.
- On select: `router.push('/docs/' + slug)`. If a heading was selected, append `#<headingId>`.
- Keyboard: Cmd+K / Ctrl+K toggle, Esc close (already wired).

- [ ] **Step 1: Write the failing component test**

```tsx
// apps/playground/components/docs/__tests__/CommandMenu.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

import { CommandMenu } from '../CommandMenu'

const fixtureIndex = [
  {
    slug: 'components/button',
    title: 'Button',
    description: 'Trigger primary actions',
    category: 'primitives',
    headings: [{ id: 'examples', text: 'Examples', level: 2 }],
  },
  {
    slug: 'foundations/colors',
    title: 'Colors',
    description: 'Semantic and primitive color tokens',
    category: 'foundations',
    headings: [],
  },
]

beforeEach(() => {
  pushMock.mockReset()
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(fixtureIndex),
    } as unknown as Response),
  )
})

afterEach(() => {
  cleanup()
})

describe('CommandMenu', () => {
  it('opens with Cmd+K and lists grouped entries', async () => {
    render(<CommandMenu />)
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    await waitFor(() => expect(screen.getByPlaceholderText(/search docs/i)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('Button')).toBeInTheDocument())
    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText(/primitives/i)).toBeInTheDocument()
    expect(screen.getByText(/foundations/i)).toBeInTheDocument()
  })

  it('filters by query and navigates on select', async () => {
    const user = userEvent.setup()
    render(<CommandMenu />)
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    const input = await screen.findByPlaceholderText(/search docs/i)
    await user.type(input, 'butt')
    await user.click(await screen.findByText('Button'))
    expect(pushMock).toHaveBeenCalledWith('/docs/components/button')
  })

  it('navigates to a heading anchor when a heading entry is selected', async () => {
    const user = userEvent.setup()
    render(<CommandMenu />)
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    const input = await screen.findByPlaceholderText(/search docs/i)
    await user.type(input, 'examples')
    await user.click(await screen.findByText(/examples/i))
    expect(pushMock).toHaveBeenCalledWith('/docs/components/button#examples')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @idcert/playground test components/docs/__tests__/CommandMenu.test.tsx`
Expected: FAIL — current `CommandMenu` shows the "Plan C wires the index" placeholder; it does not call `fetch`, navigate, or render results.

- [ ] **Step 3: Implement `CommandMenu`**

Replace the entire body of `apps/playground/components/docs/CommandMenu.tsx`:

```tsx
'use client'

import * as React from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'

type SearchEntry = {
  slug: string
  title: string
  description: string
  category: string
  headings: { id: string; text: string; level: 2 | 3 }[]
}

type Result = {
  key: string
  label: string
  subtitle?: string
  category: string
  href: string
  keywords: string[]
}

const CATEGORY_LABELS: Record<string, string> = {
  'getting-started': 'Getting Started',
  foundations: 'Foundations',
  primitives: 'Components · Primitives',
  forms: 'Components · Forms',
  overlays: 'Components · Overlays',
  layout: 'Components · Layout',
  navigation: 'Components · Navigation',
  data: 'Components · Data',
  feedback: 'Components · Feedback',
  utility: 'Components · Utility',
  recipes: 'Recipes',
}

function entryToResults(entry: SearchEntry): Result[] {
  const base: Result = {
    key: entry.slug,
    label: entry.title,
    subtitle: entry.description,
    category: entry.category,
    href: `/docs/${entry.slug}`,
    // weight: title 3×, description 2×, category 1×
    keywords: [
      entry.title, entry.title, entry.title,
      entry.description, entry.description,
      entry.category,
    ],
  }
  const headingResults: Result[] = entry.headings.map((h) => ({
    key: `${entry.slug}#${h.id}`,
    label: h.text,
    subtitle: entry.title,
    category: entry.category,
    href: `/docs/${entry.slug}#${h.id}`,
    // weight: heading 1×, parent title 1× (so heading-only matches still surface)
    keywords: [h.text, entry.title],
  }))
  return [base, ...headingResults]
}

function groupByCategory(results: Result[]): Map<string, Result[]> {
  const map = new Map<string, Result[]>()
  for (const r of results) {
    const list = map.get(r.category) ?? []
    list.push(r)
    map.set(r.category, list)
  }
  return map
}

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [entries, setEntries] = React.useState<SearchEntry[] | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  React.useEffect(() => {
    if (!open || entries) return
    fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SearchEntry[]) => setEntries(data))
      .catch(() => setEntries([]))
  }, [open, entries])

  const grouped = React.useMemo(() => {
    if (!entries) return new Map<string, Result[]>()
    const all = entries.flatMap(entryToResults)
    return groupByCategory(all)
  }, [entries])

  const handleSelect = React.useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      className="fixed left-1/2 top-1/4 w-[600px] max-w-[90vw] -translate-x-1/2 rounded-md border border-border bg-background p-2 shadow-lg"
    >
      <Command.Input
        placeholder="Search docs…"
        className="w-full border-b border-border px-3 py-2 outline-none"
      />
      <Command.List className="max-h-[400px] overflow-y-auto p-2">
        <Command.Empty className="p-4 text-sm text-muted-foreground">
          No results.
        </Command.Empty>
        {Array.from(grouped.entries()).map(([category, items]) => (
          <Command.Group
            key={category}
            heading={CATEGORY_LABELS[category] ?? category}
          >
            {items.map((item) => (
              <Command.Item
                key={item.key}
                value={item.key}
                keywords={item.keywords}
                onSelect={() => handleSelect(item.href)}
                className="flex cursor-pointer flex-col rounded-sm px-3 py-2 text-sm aria-selected:bg-accent"
              >
                <span className="font-medium">{item.label}</span>
                {item.subtitle ? (
                  <span className="text-xs text-muted-foreground">
                    {item.subtitle}
                  </span>
                ) : null}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @idcert/playground test components/docs/__tests__/CommandMenu.test.tsx`
Expected: all 3 tests PASS.

If a `userEvent` import fails, ensure the playground devDeps include `@testing-library/user-event`. Plan A added it; if missing, add it: `pnpm --filter @idcert/playground add -D @testing-library/user-event`.

- [ ] **Step 5: Manual smoke**

Run: `pnpm --filter @idcert/ui build && pnpm --filter @idcert/playground dev`
In a browser open `http://localhost:3000/docs/components/button`. Press Cmd+K (or Ctrl+K). Type `colo`. Expect a "Colors" result under the "Foundations" group. Click it. Expect navigation to `/docs/foundations/colors`. Press Cmd+K again, type `theming`, expect the Theming page entry. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add \
  apps/playground/components/docs/CommandMenu.tsx \
  apps/playground/components/docs/__tests__/CommandMenu.test.tsx
git commit -m "feat(playground): wire CommandMenu Cmd+K search to build-time index"
```

---

## Task 12: Add Playwright config and dependencies

**Files:**
- Modify: `apps/playground/package.json` (add `@playwright/test` dev dep + `e2e` scripts)
- Create: `apps/playground/playwright.config.ts`
- Create: `apps/playground/e2e/.gitkeep` (placeholder so the directory exists before specs land)

- [ ] **Step 1: Add Playwright as a dev dependency**

Run: `pnpm --filter @idcert/playground add -D @playwright/test`
Expected: `@playwright/test` appears under `devDependencies` in `apps/playground/package.json`.

- [ ] **Step 2: Install browser binaries**

Run: `pnpm --filter @idcert/playground exec playwright install chromium`
Expected: chromium downloaded. (Other browsers are skipped; the spec calls for a single representative engine.)

- [ ] **Step 3: Create `apps/playground/playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command:
      'pnpm --filter @idcert/playground build && pnpm --filter @idcert/playground start --port 3100',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
```

- [ ] **Step 4: Add the `e2e` scripts to `apps/playground/package.json`**

In the `scripts` block, add two entries:

```json
"e2e": "playwright test",
"e2e:ui": "playwright test --ui"
```

- [ ] **Step 5: Create the e2e directory placeholder**

```bash
mkdir -p apps/playground/e2e
touch apps/playground/e2e/.gitkeep
```

- [ ] **Step 6: Commit**

```bash
git add \
  apps/playground/package.json \
  apps/playground/playwright.config.ts \
  apps/playground/e2e/.gitkeep \
  pnpm-lock.yaml
git commit -m "build(playground): add Playwright config and dev dependency"
```

---

## Task 13: Write Playwright e2e specs

**Files:**
- Create: `apps/playground/e2e/docs-installation.spec.ts`
- Create: `apps/playground/e2e/docs-button.spec.ts`
- Create: `apps/playground/e2e/docs-foundations-colors.spec.ts`
- Delete: `apps/playground/e2e/.gitkeep`

Coverage per spec testing strategy: rendering, sidebar nav click, ToC anchor scroll, Cmd+K open + result navigation, theme toggle.

- [ ] **Step 1: Write `docs-installation.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test.describe('docs/getting-started/installation', () => {
  test('renders hero and ToC', async ({ page }) => {
    await page.goto('/docs/getting-started/installation')
    await expect(
      page.getByRole('heading', { name: /installation/i, level: 1 }),
    ).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: /on this page/i }),
    ).toBeVisible()
  })

  test('sidebar link navigates to Theming', async ({ page }) => {
    await page.goto('/docs/getting-started/installation')
    await page.getByRole('link', { name: 'Theming' }).first().click()
    await expect(page).toHaveURL(/\/docs\/getting-started\/theming$/)
    await expect(
      page.getByRole('heading', { name: /theming/i, level: 1 }),
    ).toBeVisible()
  })

  test('theme toggle flips the html class', async ({ page }) => {
    await page.goto('/docs/getting-started/installation')
    const html = page.locator('html')
    const initial = await html.getAttribute('class')
    await page.getByRole('button', { name: /toggle theme/i }).click()
    await expect(async () => {
      const next = await html.getAttribute('class')
      expect(next).not.toBe(initial)
    }).toPass()
  })
})
```

- [ ] **Step 2: Write `docs-button.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test.describe('docs/components/button', () => {
  test('renders hero and props table', async ({ page }) => {
    await page.goto('/docs/components/button')
    await expect(
      page.getByRole('heading', { name: /^button$/i, level: 1 }),
    ).toBeVisible()
    // Hero example renders the Default button labelled "Click me"
    await expect(
      page.getByRole('button', { name: 'Click me' }).first(),
    ).toBeVisible()
    // PropsTable rows
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('cell', { name: 'variant' }).first()).toBeVisible()
  })

  test('ToC anchor scrolls to API Reference', async ({ page }) => {
    await page.goto('/docs/components/button')
    await page.getByRole('link', { name: /api reference/i }).first().click()
    await expect(page).toHaveURL(/#api-reference$/)
    await expect(
      page.getByRole('heading', { name: /api reference/i }),
    ).toBeInViewport()
  })

  test('Cmd+K opens search and navigates', async ({ page }) => {
    await page.goto('/docs/components/button')
    await page.keyboard.press('Meta+K')
    const input = page.getByPlaceholder(/search docs/i)
    await expect(input).toBeVisible()
    await input.fill('colors')
    await page.getByRole('option', { name: /colors/i }).first().click()
    await expect(page).toHaveURL(/\/docs\/foundations\/colors$/)
  })
})
```

- [ ] **Step 3: Write `docs-foundations-colors.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test.describe('docs/foundations/colors', () => {
  test('renders semantic token grid and primitive ramps', async ({ page }) => {
    await page.goto('/docs/foundations/colors')
    await expect(
      page.getByRole('heading', { name: /^colors$/i, level: 1 }),
    ).toBeVisible()
    await expect(page.getByText('--color-background').first()).toBeVisible()
    await expect(page.getByText('--color-foreground').first()).toBeVisible()
    const swatches = page.locator('[data-color-step]')
    await expect(swatches.first()).toBeVisible()
    expect(await swatches.count()).toBeGreaterThanOrEqual(11)
  })

  test('clicking a ramp swatch copies the hex to clipboard', async ({
    page,
    browserName,
    context,
  }) => {
    test.skip(browserName !== 'chromium', 'Clipboard read requires chromium grant')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/docs/foundations/colors')
    const firstSwatch = page.locator('[data-color-step]').first()
    await firstSwatch.click()
    const clip = await page.evaluate(() => navigator.clipboard.readText())
    expect(clip).toMatch(/^#[0-9a-f]{6}$/i)
  })
})
```

- [ ] **Step 4: Remove the placeholder gitkeep**

```bash
rm apps/playground/e2e/.gitkeep
```

- [ ] **Step 5: Run the specs**

Run: `pnpm --filter @idcert/playground e2e`
Expected: all three spec files pass against the production build started by Playwright's `webServer`. First run takes ~3-4 minutes (Next build + Chromium launch).

If a selector fails, inspect the rendered HTML by running `pnpm --filter @idcert/playground build && pnpm --filter @idcert/playground start --port 3100` manually and adjust selectors. Common adjustments:
- The theme toggle button's accessible name comes from the `aria-label` Plan A set in `ThemeToggle.tsx`. Match it exactly (case-insensitive via `/.../i`).
- `[data-color-step]` requires `<PrimitiveColorRamp>` to set that attribute on each swatch button. Plan B's PrimitiveColorRamp wires this; if missing, add `data-color-step={step}` to the swatch element.
- The `Command.Item` rendered role in cmdk is `option` — selectors above use `getByRole('option', …)` accordingly.

- [ ] **Step 6: Commit**

```bash
git add apps/playground/e2e
git commit -m "test(playground): add Playwright e2e for installation, button, and colors"
```

---

## Task 14: Update root README

**Files:**
- Modify: `README.md` (project root)

**Goal:** Point new contributors at `/docs`, explain the docs vs Storybook split, and document the local dev flow for the docs site.

- [ ] **Step 1: Read the current README**

Run: `cat README.md`
Note section structure so the patch slots in cleanly.

- [ ] **Step 2: Add a "Documentation" section after the install / quickstart block**

Insert after any existing "Install" or "Quickstart" heading. Match the surrounding heading level (likely `##`).

````markdown
## Documentation

Component docs live in `apps/playground/content/docs` and are served by the playground Next app.

```bash
pnpm --filter @idcert/ui build           # ensure dist/* exists for examples imports
pnpm --filter @idcert/playground dev     # http://localhost:3000/docs
```

Browse:

- `http://localhost:3000/docs/getting-started/installation` — install + theming guide
- `http://localhost:3000/docs/foundations/colors` — design tokens
- `http://localhost:3000/docs/components/<slug>` — every `@idcert/ui` component

### Docs vs Storybook

- **Docs (`/docs`)** — consumer-facing reference: prose, anatomy, accessibility, tokens, composed examples.
- **Storybook (`pnpm --filter @idcert/ui storybook`)** — isolated component dev playground: every story in isolation, controls panel, autodocs.

Pages with a blue "Documentation in progress" badge are scaffolded only — Hero + props table — and prose is being filled in incrementally.
````

- [ ] **Step 3: Add a "Search" mention in any "Tips" or "Local development" section that already exists**

If such a section is present, append:

> Press **Cmd+K** (Ctrl+K on Windows/Linux) anywhere in `/docs` to search component docs, foundations, and recipes. Results are grouped by category.

If no such section exists, skip — the Documentation section above is sufficient.

- [ ] **Step 4: Verify markdown renders**

Run: `pnpm --filter @idcert/playground exec markdownlint README.md` if the repo has markdownlint configured. Otherwise visually skim the rendered file in any markdown previewer.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: point README at the playground docs site"
```

---

## Task 15: Final smoke + plan completion check

**Goal:** Confirm the full MVP from spec is reachable and green before merging.

**Files:**
- No code changes. Verification only.

- [ ] **Step 1: Clean and rebuild from scratch**

```bash
pnpm --filter @idcert/ui clean
pnpm --filter @idcert/playground exec rm -rf .next public/props.json public/search-index.json public/examples-source.json
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground prebuild
pnpm --filter @idcert/playground build
```
Expected: every step exits 0.

- [ ] **Step 2: Verify search index covers all 43 components + 4 foundations + recipes + getting-started**

```bash
jq 'length' apps/playground/public/search-index.json
```
Expected: `>= 53` (43 components + 4 foundations + 2 getting-started + ≥4 recipes).

```bash
jq '[.[] | select(.slug | startswith("components/"))] | length' apps/playground/public/search-index.json
```
Expected: `43`.

- [ ] **Step 3: Verify props.json has no missing component**

```bash
jq 'keys | length' apps/playground/public/props.json
```
Expected: `>= 43` (43 displayName roots; sub-components add more).

```bash
jq '.Avatar.props | keys' apps/playground/public/props.json
```
Expected: a non-empty array.

- [ ] **Step 4: Run the full test matrix**

```bash
pnpm --filter @idcert/playground test
pnpm --filter @idcert/ui test
pnpm --filter @idcert/playground typecheck 2>/dev/null || pnpm --filter @idcert/playground exec tsc --noEmit
pnpm --filter @idcert/ui typecheck
pnpm --filter @idcert/playground e2e
```
Expected: all green.

- [ ] **Step 5: Visual smoke of three scaffolded pages**

Run: `pnpm --filter @idcert/playground dev`
Open in a browser:
- `http://localhost:3000/docs/components/avatar` — Hero shows the pravatar image, props table lists Avatar props, sidebar entry has the `in-progress` badge.
- `http://localhost:3000/docs/components/sidebar` — Hero shows the collapsible sidebar example, sidebar entry has the badge.
- `http://localhost:3000/docs/components/theme-provider` — Code snippet renders, props table lists the provider props, sidebar entry has the badge.

Stop the dev server.

- [ ] **Step 6: Commit (only if smoke surfaced fixups)**

```bash
git status
git diff --quiet || {
  git add -p
  git commit -m "docs(playground): smoke-test fixups"
}
```

- [ ] **Step 7: Confirm against the spec rollout plan**

`docs/superpowers/specs/2026-05-06-playground-component-docs-design.md` § Rollout plan:

- Phase 1 — Infrastructure → done in Plan A.
- Phase 2 — Pilot 5 components → done in Plan B.
- Phase 3 — Foundations + Recipes → done in Plan B.
- **Phase 4 — Scaffold remaining 38 components → completed by Tasks 1–9.**
- **Phase 5 — Polish (search wiring, e2e, README) → completed by Tasks 11–14.**

Plan C is complete when every task above is checked, every commit is on the branch, and `pnpm --filter @idcert/playground e2e` is green.

---

## Self-Review

**Spec coverage check (against `docs/superpowers/specs/2026-05-06-playground-component-docs-design.md`):**

- [x] Scaffold 38 components — Tasks 1–9 (38 components × 1 examples + 1 mdx, with `theme-provider` carved out as mdx-only with rationale).
- [x] `<name>.examples.tsx` with `Default` export — every scaffold task creates one (theme-provider exempt, justified inline).
- [x] MDX with `status: in-progress` + Hero + PropsTable only — every MDX template enforces this.
- [x] Search wiring — Task 11 connects CommandMenu UI shell to `public/search-index.json` with cmdk fuzzy match, category grouping, router navigation, heading anchors.
- [x] Search weighting (title 3× > description 2× > headings 1×) — implemented via `keywords` repetition in `entryToResults`.
- [x] E2E coverage of three routes (`installation`, `components/button`, `foundations/colors`) — Tasks 12–13.
- [x] E2E behaviors (rendering, sidebar nav, ToC scroll, Cmd+K, theme toggle) — covered across the three specs.
- [x] README update — Task 14 documents `/docs` and the docs vs Storybook split per spec § Cleanup.
- [x] Nav cross-check — Task 10 runs the existing `nav.test.ts` after scaffold to catch orphans.

**Placeholder scan:** No "TBD", "implement later", "similar to" references. Every step contains the actual content.

**Type / name consistency:** `SearchEntry` shape in `CommandMenu` matches the one emitted by `apps/playground/scripts/generate-search-index.ts:13`. `entryToResults` returns the same `Result` shape used by `groupByCategory` and the JSX. Test fixture matches the runtime shape.

**Known gaps deliberately deferred (out of MVP per spec):**
- Visual regression — explicitly out of scope.
- Storybook refactor for the 38 scaffolded components — spec Phase 4 only requires `*.examples.tsx`. Stories continue to import from `./index.js` and keep working.
- Prose for scaffolded components — incremental follow-up after MVP, hence the `in-progress` badge.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-07-playground-docs-scaffold-search-e2e.md`. Two execution options:

1. **Subagent-Driven (recommended)** — main thread dispatches a fresh subagent per task, reviews between tasks, fast iteration. Use `superpowers:subagent-driven-development`.
2. **Inline Execution** — execute tasks in the current session using `superpowers:executing-plans`, batched with checkpoints for review.

Which approach?
