# Plan 5a — Navigation Base (Tabs, DropdownMenu, Breadcrumb, Pagination)

**Status**: Design approved
**Date**: 2026-05-05
**Author**: Andrea Alunni Guiducci
**Target version**: `@idcert/ui` v0.6.0
**Branch**: `feat/navigation-base` (off `main` after Plan 4b v0.5.0 + Plan 4b integration fixes)
**Predecessor**: Plan 4b — Forms Advanced (`feat/forms-advanced`, v0.5.0)

---

## Overview

Plan 5a is the first half of the Navigation category from the master spec. It covers four components that together unlock typical site navigation and interaction patterns:

- **Tabs** — Base UI Tabs wrapper with `default` (underline) and `pills` (rounded segment) variants, horizontal and vertical orientation support.
- **DropdownMenu** — Base UI Menu wrapper exposing 12 sub-parts: trigger, content, item, group, label, separator, checkbox item, radio group + radio item, sub-menu (sub + sub-trigger + sub-content). Full shadcn-pattern feature parity.
- **Breadcrumb** — Semantic HTML compound (`<nav><ol><li>`). Manual separator composition. `asChild` slot integration for Next.js `Link`.
- **Pagination** — Smart data-driven component with auto range calculation (siblings + ellipsis). Public `getPaginationRange` helper export for advanced custom layouts.

Plan 5b (separate, future) will cover Navbar and Sidebar — the heavier layout shells with responsive breakpoints, mobile drawer, and brand area concerns.

---

## Goals

- Provide composition-style Tabs and DropdownMenu compounds consistent with Dialog/AlertDialog/Select API style from Plans 3 and 4a.
- Ship full DropdownMenu feature parity with shadcn (12 sub-parts including nested submenus, checkbox items, radio items) so consumer apps can copy-paste shadcn examples without adaptation.
- Offer a Breadcrumb compound with proper HTML semantics and `asChild` slot for Next.js Link, matching the shadcn shape.
- Ship a Pagination component that handles the common "prev / 1 / … / 4 / [5] / 6 / … / 20 / next" pattern out of the box, with sibling-count tunable, while exporting the underlying range helper for advanced consumers.
- Reuse all existing dependencies — no new peer or runtime deps.

## Non-goals (out of scope for Plan 5a)

- **Navbar / Sidebar** (Plan 5b — heavier layout shells).
- Tabs underline + boxed variants beyond default + pills.
- Tabs animated indicator (slide motion on tab change).
- Tabs lazy-mounting of panels.
- `DropdownMenuShortcut` keyboard hint display.
- ContextMenu (right-click trigger) — separate component, future plan.
- CommandPalette (search-driven menu) — separate utility plan.
- Pagination items-per-page selector.
- Pagination route-driven state (consumer wires `useSearchParams`).
- Pagination jump-to-page input field.
- Breadcrumb collapsed sub-menu — composable via `BreadcrumbEllipsis` + `DropdownMenu`; documented in stories.

---

## Architecture

### Dependencies

**No new dependencies.** All four components consume primitives already installed:

- `@base-ui/react/tabs` (Base UI v1.4.1, never used before in our codebase)
- `@base-ui/react/menu` (Base UI v1.4.1, never used before)
- `@radix-ui/react-slot` (already a runtime dep, used by `BreadcrumbLink asChild` and `DropdownMenuTrigger asChild`)
- `lucide-react` (already a runtime dep): `ChevronRight`, `ChevronLeft`, `MoreHorizontal`, `Check`, `Circle`

`tailwindcss-animate` plugin (Plan 3) supplies the `animate-in` / `animate-out` utilities used by `DropdownMenuContent` and `DropdownMenuSubContent`.

### Base primitive mapping

| Component       | Base primitive           | Custom logic |
|-----------------|--------------------------|--------------|
| Tabs            | `Base UI Tabs.*`         | `TabsVariantContext` propagates `variant` from `Tabs` root to descendant `TabsList` and `TabsTrigger`; cva variants on List + Trigger; orientation pass-through |
| DropdownMenu    | `Base UI Menu.*`         | 12 thin styled wrappers; CheckboxItem renders `Check` inside `Menu.ItemIndicator`; RadioItem renders `Circle` filled dot; SubTrigger renders trailing `ChevronRight`; `asChild` prop on Trigger and SubTrigger translates to Base UI's `render` prop |
| Breadcrumb      | Pure semantic HTML       | `<nav><ol><li>` structure; `BreadcrumbLink` uses `@radix-ui/react-slot` for `asChild` composition; `BreadcrumbSeparator` defaults to `ChevronRight` lucide icon, `children` prop overrides |
| Pagination      | Custom rendering         | `getPaginationRange(currentPage, totalPages, siblingCount)` helper returns `Array<number \| 'ellipsis-left' \| 'ellipsis-right'>`; Pagination renders that range plus prev/next buttons; uses our existing `Button` component for visuals |

### Internal context for Tabs

`TabsVariantContext` is a React context that holds `{ variant: 'default' | 'pills' }`. The root `Tabs` component provides it; `TabsList` and `TabsTrigger` consume it via `useContext` (with a fallback to `'default'` if missing). This avoids forcing the consumer to repeat `variant` on each sub-part.

### `getPaginationRange` algorithm

The exported helper computes which page numbers and ellipsis markers to render given:
- `currentPage` (1-indexed)
- `totalPages`
- `siblingCount` (default 1)

Rules:
- If `totalPages <= 7` (configurable threshold derived from `siblingCount * 2 + 5`): show all pages, no ellipsis.
- Otherwise: always show first page + last page; show `siblingCount` neighbors on each side of `currentPage`; render `'ellipsis-left'` between first page and left neighbor when there's a gap > 1; render `'ellipsis-right'` between right neighbor and last page when there's a gap > 1.

Edge cases:
- `currentPage <= siblingCount + 2`: no left ellipsis, dense range from page 1.
- `currentPage >= totalPages - siblingCount - 1`: no right ellipsis, dense range to last page.
- `siblingCount = 0`: minimal `[1] [...] [current] [...] [N]`.

The helper is pure (no React) and unit-testable in isolation.

---

## Component APIs

### 1. Tabs

```tsx
<Tabs
  value={tab}
  onValueChange={setTab}
  defaultValue="account"
  orientation="horizontal"        // or "vertical"
  variant="default"               // or "pills"
>
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
    <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger>
  </TabsList>
  <TabsContent value="account">…account body…</TabsContent>
  <TabsContent value="password">…password body…</TabsContent>
  <TabsContent value="notifications">…notifications body…</TabsContent>
</Tabs>
```

**Sub-parts** (all exported):

- `Tabs` — wraps `Tabs.Root`. Provides `TabsVariantContext`. Accepts `value`, `defaultValue`, `onValueChange`, `orientation`, `variant`, plus pass-through props.
- `TabsList` — wraps `Tabs.List`. cva variants:
  - `default`: `inline-flex h-10 items-center justify-start border-b border-border w-full`.
  - `pills`: `inline-flex h-10 items-center justify-start rounded-md bg-muted p-1`.
  - Vertical orientation: `flex-col` + border-right (default) or column rounded segment (pills).
- `TabsTrigger` — wraps `Tabs.Tab`. cva variants react to active state via `data-active`:
  - `default`: inactive `text-muted-foreground hover:text-foreground border-b-2 border-transparent`. Active `text-foreground border-primary`.
  - `pills`: inactive `text-muted-foreground rounded-sm px-3 py-1.5`. Active `bg-background text-foreground shadow-sm`.
  - Disabled state: `opacity-50 cursor-not-allowed`.
- `TabsContent` — wraps `Tabs.Panel`. Default `mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.

**Variant propagation**: `Tabs` reads `variant` prop, default `'default'`. Provides via context to descendants. `TabsList` and `TabsTrigger` consume to apply correct cva config.

### 2. DropdownMenu (12 sub-parts)

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" sideOffset={4}>
    <DropdownMenuLabel>Account</DropdownMenuLabel>
    <DropdownMenuItem onSelect={() => …}>Profile</DropdownMenuItem>
    <DropdownMenuItem disabled>Billing</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuCheckboxItem
        checked={notifications}
        onCheckedChange={setNotifications}
      >
        Notifications
      </DropdownMenuCheckboxItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuRadioGroup value={view} onValueChange={setView}>
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
  </DropdownMenuContent>
</DropdownMenu>
```

**12 sub-parts** (all exported):

- `DropdownMenu` — `Menu.Root`. Pass-through props (`open`, `defaultOpen`, `onOpenChange`, `modal`).
- `DropdownMenuTrigger` — wraps `Menu.Trigger`. Accepts `asChild?: boolean` (translates to Base UI `render={children}`).
- `DropdownMenuContent` — `Menu.Portal` + `Menu.Positioner` + `Menu.Popup`. Standard popup styling matching Select/MultiSelect (z-50, animate-in/out, rounded-md, bg-background, border, shadow-md, min-width). Accepts `sideOffset`, `align`, etc. as pass-through to Positioner.
- `DropdownMenuItem` — `Menu.Item`. Default styling with `data-highlighted` accent background, `data-disabled` opacity. Accepts `disabled`, `onSelect`.
- `DropdownMenuGroup` — `Menu.Group`. Wrapper for grouped items.
- `DropdownMenuLabel` — `Menu.GroupLabel` (or simple `<div>` if used outside a Group). Small caps muted-foreground style.
- `DropdownMenuSeparator` — `Menu.Separator`. `-mx-1 my-1 h-px bg-border`.
- `DropdownMenuCheckboxItem` — `Menu.CheckboxItem`. Renders `Check` icon inside `Menu.ItemIndicator` (auto-renders only when checked). Accepts `checked`, `onCheckedChange`.
- `DropdownMenuRadioGroup` — `Menu.RadioGroup`. Accepts `value`, `onValueChange`.
- `DropdownMenuRadioItem` — `Menu.RadioItem`. Renders `Circle` filled dot inside `Menu.ItemIndicator`.
- `DropdownMenuSub` — `Menu.SubmenuRoot`.
- `DropdownMenuSubTrigger` — `Menu.SubmenuTrigger`. Renders trailing `ChevronRight` icon.
- `DropdownMenuSubContent` — `Menu.Portal` + `Menu.Positioner` + `Menu.Popup` for submenu. Same popup styling.

**Important Plan 4a lesson — Select.List**: Base UI Menu may have a similar `Menu.List` requirement (composite list registration). During implementation, verify with `node_modules/@base-ui/react/menu/list/MenuList.js` or equivalent and wrap items in `Menu.List` inside the popup if needed. Document in implementation.

**Important Plan 4a lesson — StrictMode**: the playground has `reactStrictMode: false` already (Plan 4a fix). Other Base UI popup components share this workaround; Plan 5a doesn't change it.

### 3. Breadcrumb (7 sub-parts)

```tsx
import Link from 'next/link'

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link href="/docs">Docs</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbEllipsis />
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

**7 sub-parts** (all exported):

- `Breadcrumb` — `<nav>` with `aria-label="breadcrumb"`. Accepts standard `nav` HTML attrs.
- `BreadcrumbList` — `<ol>` with `flex items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5`.
- `BreadcrumbItem` — `<li>` with `inline-flex items-center gap-1.5`.
- `BreadcrumbLink` — `<a>` with `transition-colors hover:text-foreground`. When `asChild`: uses `@radix-ui/react-slot` to clone the child (e.g. Next.js `<Link>`). Accepts `href`, `asChild?: boolean`.
- `BreadcrumbPage` — `<span>` with `aria-current="page"`, `aria-disabled="true"`, `font-normal text-foreground`.
- `BreadcrumbSeparator` — `<li role="presentation" aria-hidden="true">` with `[&>svg]:size-3.5`. Renders `children` (allows custom separator) or default `ChevronRight` lucide icon.
- `BreadcrumbEllipsis` — `<span role="presentation" aria-hidden="true" className="flex h-9 w-9 items-center justify-center">` rendering `MoreHorizontal` icon. Optional `<span class="sr-only">More</span>` for accessibility.

### 4. Pagination (smart data-driven)

```tsx
const [page, setPage] = useState(5)

<Pagination
  currentPage={page}
  totalPages={20}
  onPageChange={setPage}
  siblingCount={1}                  // optional, default 1
  showPrevNext                      // optional, default true
  className                         // optional, applied to nav
/>
```

**Public API** (props):
- `currentPage: number` — 1-indexed.
- `totalPages: number` — total page count, ≥ 1.
- `onPageChange: (page: number) => void` — fired on user click.
- `siblingCount?: number` — number of pages shown around currentPage. Default `1`.
- `showPrevNext?: boolean` — show previous/next buttons. Default `true`.
- `className?: string` — applied to the `<nav>` wrapper.
- `aria-label?: string` — accessibility label. Default `"Pagination"`.

**Rendered structure**:

```html
<nav aria-label="Pagination" class="mx-auto flex w-full justify-center">
  <ul class="flex flex-row items-center gap-1">
    <li><button [prev]>...</button></li>
    <li><button [page-1]>1</button></li>
    <li><span [ellipsis-left]><MoreHorizontal /></span></li>
    <li><button [page-4]>4</button></li>
    <li><button [page-5 active]>5</button></li>
    <li><button [page-6]>6</button></li>
    <li><span [ellipsis-right]><MoreHorizontal /></span></li>
    <li><button [page-20]>20</button></li>
    <li><button [next]>...</button></li>
  </ul>
</nav>
```

**Button styling**: uses our existing `Button` component (or `buttonVariants` cva). Active page: `variant="default"` (primary bg + primary-foreground text). Inactive: `variant="ghost"` (transparent, hover bg-accent). Prev/Next: `variant="ghost"` with `size="icon"`-like square shape and `ChevronLeft`/`ChevronRight` icon. `aria-label="Previous page"` / `"Next page"`.

**Disabled state**:
- Prev button has `disabled` when `currentPage === 1`.
- Next button has `disabled` when `currentPage === totalPages`.

**Helper export**:
```ts
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount?: number,
): Array<number | 'ellipsis-left' | 'ellipsis-right'>
```

Pure function, no React, fully unit-testable. Exported from `pagination/index.tsx` for advanced consumers who want to render their own custom layout.

---

## File structure

```
packages/ui/src/components/
├── tabs/
│   ├── index.tsx                       # Tabs, TabsList, TabsTrigger, TabsContent + TabsVariantContext
│   ├── tabs.test.tsx
│   └── tabs.stories.tsx
├── dropdown-menu/
│   ├── index.tsx                       # 12 sub-parts wrapping Base UI Menu
│   ├── dropdown-menu.test.tsx
│   └── dropdown-menu.stories.tsx
├── breadcrumb/
│   ├── index.tsx                       # 7 sub-parts (semantic HTML + lucide icons + Slot)
│   ├── breadcrumb.test.tsx
│   └── breadcrumb.stories.tsx
└── pagination/
    ├── index.tsx                       # Pagination monolithic + getPaginationRange helper export
    ├── pagination.test.tsx
    └── pagination.stories.tsx
```

The barrel `packages/ui/src/index.ts` adds:

```ts
export * from './components/tabs/index.js'
export * from './components/dropdown-menu/index.js'
export * from './components/breadcrumb/index.js'
export * from './components/pagination/index.js'
```

**Storybook**: 4 new categories — `Navigation/Tabs`, `Navigation/DropdownMenu`, `Navigation/Breadcrumb`, `Navigation/Pagination`. Auto-indexed via existing glob pattern.

**Playground smoke**: create a new page `apps/playground/app/navigation/page.tsx` that renders all four components in realistic scenarios:
- A `Tabs` settings panel (Account / Password / Notifications) with both `default` and `pills` variants demoed.
- A `DropdownMenu` "Actions" button with all sub-part types: items, checkbox toggle, radio group, nested submenu.
- A `Breadcrumb` path simulating a documentation site (Home / Docs / Components / Button).
- A `Pagination` controlling a mock list with `totalPages={20}`, demonstrating range edge cases.

This keeps the existing `apps/playground/app/forms/page.tsx` untouched (forms domain) and gives Navigation its own scratch space.

No CSS imports required.

---

## Test scope

Stack unchanged: `vitest` + `@testing-library/react` + `@testing-library/user-event`. Same setup as Plans 1–4b.

| Component       | Tests | Coverage |
|-----------------|------:|----------|
| Tabs            | 9     | render trigger + content, click trigger switches active panel, controlled mode, defaultValue, vertical orientation applies vertical classes, default variant trigger styling, pills variant trigger styling, disabled trigger ignored on click, ref forwarding on TabsTrigger |
| DropdownMenu    | 14    | render trigger, open on click, close on item click, Item disabled prevents activation, Separator renders, Label renders, Group renders, CheckboxItem toggle fires onCheckedChange + Check indicator visible when checked, RadioGroup mutual exclusion (only one item indicator at a time), RadioItem renders Circle indicator when selected, Sub opens on hover/click, SubTrigger renders trailing ChevronRight, asChild trigger composition (Button as trigger), ref forwarding on DropdownMenuTrigger |
| Breadcrumb      | 8     | renders `<nav>` with `aria-label="breadcrumb"`, BreadcrumbList renders `<ol>`, BreadcrumbItem renders `<li>`, BreadcrumbLink renders `<a>` with href, BreadcrumbLink with asChild renders custom child element, BreadcrumbPage has `aria-current="page"`, BreadcrumbSeparator default ChevronRight icon, BreadcrumbEllipsis renders MoreHorizontal icon |
| Pagination      | 12    | range helper unit (5 sub-tests covering: short totalPages no ellipsis, currentPage near start (no left ellipsis), currentPage near end (no right ellipsis), middle currentPage (both ellipsis), siblingCount=0 minimal range), renders prev + next + numbers, click number fires onPageChange, click prev fires onPageChange(currentPage-1), click next fires onPageChange(currentPage+1), prev disabled at currentPage=1, next disabled at last page, currentPage button has active variant style, ellipsis renders MoreHorizontal, showPrevNext={false} hides prev/next |

**Plan 5a total**: ~43 tests.

**Test setup notes**:
- DropdownMenu tests inherit Plan 4a Select lessons: use `vi.useFakeTimers({ toFake: ['Date'] })` if the test needs fake time without hanging Base UI popups; default config is real timers and async `waitFor` for popup open assertions.
- DropdownMenu Sub test uses `userEvent.pointer({ target: subTrigger })` to simulate hover-to-open behavior. Some Base UI submenus require pointer enter; if that's flaky, fall back to controlled `open` state on the SubmenuRoot for the test.
- Pagination range helper tests are pure-function tests (no rendering).
- Breadcrumb tests verify HTML semantics directly (querySelector for `nav`, `ol`, `li`, attribute checks for `aria-current`, `aria-label`).

Coverage target: 100% public API. No visual regression in this plan.

---

## Versioning + release

Single changeset `.changeset/v0.6.0-navigation-base.md`:

```markdown
---
'@idcert/ui': minor
---

Add 4 new components in the Navigation category (first half — second half is Plan 5b: Navbar + Sidebar).

Components (`@idcert/ui`):
- `Tabs` compound — Base UI Tabs wrapper. Sub-parts: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. cva variants: `default` (underline) and `pills` (rounded segment). Horizontal and vertical orientation.
- `DropdownMenu` compound — Base UI Menu wrapper. 12 sub-parts: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`. `asChild` prop on `DropdownMenuTrigger` for composition with `Button` etc.
- `Breadcrumb` compound — semantic HTML (`<nav><ol><li>`). 7 sub-parts: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`. `BreadcrumbLink asChild` for Next.js Link integration.
- `Pagination` — smart data-driven component with auto range calculation. Props: `currentPage`, `totalPages`, `onPageChange`, `siblingCount`, `showPrevNext`. Helper `getPaginationRange` exported for advanced custom layouts.

No new dependencies.

Out of scope (deferred):
- Navbar + Sidebar → Plan 5b layout shells.
- Tabs underline+boxed variants, animated indicator, lazy mount panels.
- DropdownMenuShortcut display, ContextMenu, CommandPalette.
- Pagination items-per-page selector, route integration, jump-to-page input.
```

`@idcert/tokens` and `@idcert/tailwind-config` do not bump.

Plan 5a is fully self-contained: any consumer who only uses Tabs / Breadcrumb / Pagination doesn't pay the bundle cost of Base UI Menu (tree-shakable per-component imports).

---

## Risks and mitigations

- **Base UI Menu sub-part naming**: Plan 5a assumes Base UI 1.4.1 exposes `Menu.Root`, `Menu.Trigger`, `Menu.Portal`, `Menu.Positioner`, `Menu.Popup`, `Menu.Item`, `Menu.Group`, `Menu.GroupLabel`, `Menu.Separator`, `Menu.CheckboxItem`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.SubmenuRoot`, `Menu.SubmenuTrigger`, `Menu.ItemIndicator`. Implementation must verify these exist in `node_modules/@base-ui/react/menu/index.parts.d.ts` first; if any name has been renamed (e.g. `SubmenuRoot` → `Sub`), adapt and document per the Plan 4b precedent (react-day-picker v9 type renames).
- **Base UI Menu composite list registration**: like `Select.List` discovered in Plan 4a (Select items refused to register as composite list members without an explicit `Select.List` wrapper inside the popup), Base UI Menu may also require `Menu.List`. The implementation task for DropdownMenu must read the Base UI Menu source / docs, render items inside the canonical wrapper if required, and document. Detection symptom in playground: items don't register highlight on hover, click handler short-circuits silently.
- **DropdownMenu `asChild` translation**: Base UI 1.4 uses `render={<Component />}` instead of Radix's `asChild`. We expose `asChild?: boolean` on `DropdownMenuTrigger` and `DropdownMenuSubTrigger` for ergonomics; internally we translate to `render={children}` when `asChild` is true. Same wrapper pattern Plan 3 / Plan 4a established for Dialog and Select triggers.
- **Tabs variant context**: providing `variant` via context means descendants depend on the root `Tabs`. If a consumer renders `TabsList` outside `Tabs` (unsupported but possible), the context fallback returns `'default'` silently. Acceptable — same defensive pattern as `useFormField` from Plan 4a (which throws). For Tabs we don't throw because the sub-parts are looser-coupled; a fallback is friendlier.
- **Pagination range helper semantics**: edge cases for `siblingCount=0` and very small `totalPages` (e.g. 1 or 2). Helper unit tests cover these. Documented in story.
- **Breadcrumb + Next.js Link**: `BreadcrumbLink asChild` wraps a Next `<Link>`. Internal `Slot` clones the child and injects `className` / `data-*`. Ref composition via Radix Slot's `useComposedRefs`. Matches Plan 4a's `FormControl` pattern.
- **DropdownMenu trigger inside FormControl / Slot**: same Plan 4a Select issue may apply if a consumer puts `<FormControl><DropdownMenuTrigger /></FormControl>`. Documented as limitation. For now, `DropdownMenuTrigger asChild` is the recommended composition path; FormControl wrap is not in any expected use case.

---

## Acceptance criteria

- All 4 new components pass `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` from the monorepo root.
- `publint` passes for `@idcert/ui`.
- Storybook builds; 4 new component stories visible under `Navigation/*` categories.
- Playground app `apps/playground/app/navigation/page.tsx` builds and renders all 4 components in browser; manual smoke test verifies:
  - Tabs default + pills variants both work; vertical orientation works.
  - DropdownMenu opens, items click, checkbox toggle persists, radio group works, submenu opens.
  - Breadcrumb path navigable; Next.js `Link` composition via `asChild` works.
  - Pagination renders correct range for various `currentPage` / `totalPages`; prev/next disabled at edges.
- Bundle analysis confirms tree-shakability: a consumer importing only `Tabs` should not pull `@base-ui/react/menu`, etc.
- Changeset added; `pnpm exec changeset status` shows `@idcert/ui` minor bump 0.5.0 → 0.6.0.
- Branch `feat/navigation-base` clean, ~7 commits (deps verify + 4 components + final validation/changeset).
