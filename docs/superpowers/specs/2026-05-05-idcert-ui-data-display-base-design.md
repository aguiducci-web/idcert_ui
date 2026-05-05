# Plan 6a — Data Display Base (Badge, Skeleton, Progress, List, EmptyState, Avatar)

**Status**: Design approved
**Date**: 2026-05-05
**Author**: Andrea Alunni Guiducci
**Target version**: `@idcert/ui` v0.8.0
**Branch**: `feat/data-display-base` (off `main` after Plan 5b v0.7.0)
**Predecessor**: Plan 5b — Navigation Shells (`feat/navigation-shells`, v0.7.0)

---

## Overview

Plan 6a is the first half of the Data Display category from the master spec. It covers the six lightweight presentational primitives that consumer apps need to render information: badges, skeleton loaders, progress bars, simple lists, empty-state placeholders, and user avatars (with grouping). Plan 6b will cover Table (heavyweight: sorting + row selection + generic typing).

Components shipped:

- **Badge** — pill `<span>` with 6 cva variants (default, secondary, destructive, outline, success, warning).
- **Skeleton** — single styled `<div>` with `animate-pulse` background; consumer dimensions via className.
- **Progress** — Base UI Progress wrapper. Linear bar. Accepts `value` (0–max) or `null` for indeterminate.
- **List** + **ListItem** — semantic `<ul>` / `<li>` compound with optional `divider` prop.
- **EmptyState** compound (5 sub-parts) — root + icon + title + description + action slots.
- **Avatar** + **AvatarImage** + **AvatarFallback** + **AvatarGroup** — Base UI Avatar wrapper with cva size variants and a custom group component that stacks children and truncates with a `+N` fallback.

After Plan 6a ships, Plan 6b can land Table independently without changing any of these surfaces.

---

## Goals

- Provide six small, focused primitives that match shadcn/ui shape so consumer apps can copy-paste examples without adaptation.
- Keep heavyweight Table out of this plan to avoid coupling release timing of the simple primitives to Table's complexity.
- Reuse Base UI Avatar and Base UI Progress (already installed via `@base-ui/react`); no new runtime or peer dependencies.
- Default Skeleton to `animate-pulse` (Tailwind-built-in) — no new keyframe definitions needed.
- AvatarGroup ships as a custom layout helper (no Base UI primitive); it stacks children with negative left margin and ring offset, and truncates to `max` with a numeric fallback.

## Non-goals (out of scope for Plan 6a)

- **Table** → Plan 6b. Sorting, row selection, generic typing, optional pagination integration.
- Badge **dot variant** (small dot without text) — future additive.
- Badge **removable** (X-close button) — consumer composes Badge + Button.
- Skeleton **shimmer animation** (gradient sweep) — future additive.
- Skeleton **shape presets** (`variant="text"`, `variant="circular"`) — consumer overrides via className.
- Progress **circular variant** (radial) — future additive.
- Progress **label inline** (`60%` text) — consumer composes; future `showValue` prop possible.
- List **ordered `<ol>`** — future `ordered?: boolean` prop.
- List **interactive hover/click states** — consumer overrides ListItem className.
- EmptyState **illustration presets** — consumer wires lucide icon or custom SVG into `EmptyStateIcon`.
- Avatar **status indicator** (online/offline dot) — consumer composes with Badge dot.
- AvatarGroup **hover-expand popover** — future additive.
- AvatarGroup **vertical orientation** — fixed horizontal stack.

---

## Architecture

### Dependencies

**No new dependencies.** All six components consume primitives already installed:

- `@base-ui/react/avatar` (Base UI 1.4.1, never used before)
- `@base-ui/react/progress` (Base UI 1.4.1, never used before)
- `lucide-react` (already runtime; used for default icons in EmptyState stories and for Avatar fallback icon stories)

`tailwindcss-animate` (Plan 3) is **not** required for these components — Skeleton uses Tailwind's built-in `animate-pulse`, Progress uses CSS transitions on width.

### Base primitive mapping

| Component | Base primitive | Custom logic |
|---|---|---|
| Badge | Pure HTML `<span>` | cva 6 variants; `badgeVariants` exported for consumer to apply Badge styling to other elements |
| Skeleton | Pure HTML `<div>` | `animate-pulse rounded-md bg-muted` defaults; consumer styles via className |
| Progress | `Base UI Progress.*` (Root, Track, Indicator) | Encapsulated in single public `Progress` component; linear bar via inline width transition |
| List | Pure HTML `<ul>` / `<li>` | 2 sub-parts (List, ListItem); `divider?: boolean` adds `divide-y divide-border` style |
| EmptyState | Pure HTML | 5 styled compound parts; consumer composes content |
| Avatar | `Base UI Avatar.*` (Root, Image, Fallback) + custom AvatarGroup | Base UI handles image-load fallback automatically; AvatarGroup stacks via negative margin + ring offset, truncates with `+N` count fallback |

### Avatar size variants

cva on `Avatar`:

```ts
const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
  variants: {
    size: {
      sm: 'h-6 w-6 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    },
  },
  defaultVariants: { size: 'md' },
})
```

The text size variant cascades to `AvatarFallback` content (initials sized appropriately).

### AvatarGroup truncation logic

```tsx
const childrenArr = React.Children.toArray(children)
const visible = max ? childrenArr.slice(0, max) : childrenArr
const overflow = max && childrenArr.length > max ? childrenArr.length - max : 0
```

Renders `visible` children, then if `overflow > 0` renders one extra `<Avatar><AvatarFallback>+{overflow}</AvatarFallback></Avatar>` sized to match siblings (size prop forwarded).

---

## Component APIs

### 1. Badge

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Beta</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outlined</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
```

Monolithic `<span>` with cva.

```ts
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
```

**Public exports**: `Badge`, `badgeVariants`.

### 2. Skeleton

```tsx
<Skeleton className="h-4 w-24" />
<Skeleton className="h-12 w-12 rounded-full" />
<Skeleton className="h-32 w-full" />
```

Monolithic `<div>`. Default classes: `animate-pulse rounded-md bg-muted`. Consumer dimensions and overrides shape entirely via `className`.

**Public exports**: `Skeleton`.

### 3. Progress

```tsx
<Progress value={60} />                    {/* 0-100, default max=100 */}
<Progress value={120} max={200} />          {/* custom max */}
<Progress value={null} />                    {/* indeterminate */}
```

Encapsulates Base UI `Progress.Root` + `Progress.Track` + `Progress.Indicator`. Track styling: `relative h-2 w-full overflow-hidden rounded-full bg-secondary`. Indicator styling: `h-full w-full flex-1 bg-primary transition-transform`. Indicator width is set via `transform: translateX(-(100 - percentage)%)` (Base UI standard pattern), so transition smoothly animates.

Indeterminate state (`value={null}`): Base UI handles the data attribute; we add `data-[state=indeterminate]:animate-pulse` for a subtle visual cue.

**Public exports**: `Progress`. Sub-parts (Track/Indicator/Value/Label) are NOT exposed publicly — encapsulated for opinionated default look.

### 4. List + ListItem

```tsx
<List>
  <ListItem>First</ListItem>
  <ListItem>Second</ListItem>
  <ListItem>Third</ListItem>
</List>

<List divider>
  <ListItem>A</ListItem>
  <ListItem>B</ListItem>
  <ListItem>C</ListItem>
</List>
```

**Sub-parts**: `List` (`<ul>`), `ListItem` (`<li>`).

`List` props:
- `divider?: boolean` — when true, applies `divide-y divide-border` to the list.

Default styles:
- `List` (no divider): `flex flex-col gap-2 text-sm`.
- `List` (divider): `flex flex-col text-sm divide-y divide-border [&>li]:py-2 [&>li:first-child]:pt-0 [&>li:last-child]:pb-0`.
- `ListItem`: `text-foreground`. Consumer composes children freely (icon + text via flex).

**Public exports**: `List`, `ListItem`.

### 5. EmptyState compound

```tsx
import { Inbox } from 'lucide-react'

<EmptyState>
  <EmptyStateIcon><Inbox /></EmptyStateIcon>
  <EmptyStateTitle>No messages</EmptyStateTitle>
  <EmptyStateDescription>Your inbox is empty. Compose to start.</EmptyStateDescription>
  <EmptyStateAction>
    <Button>New message</Button>
  </EmptyStateAction>
</EmptyState>
```

**Sub-parts** (5):
- `EmptyState` — root `<div>`. `flex flex-col items-center justify-center text-center gap-3 py-12 px-6`.
- `EmptyStateIcon` — wrapper `<div>` for a lucide icon. `flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:h-6 [&>svg]:w-6`.
- `EmptyStateTitle` — `<h3>` with `text-lg font-semibold text-foreground`.
- `EmptyStateDescription` — `<p>` with `text-sm text-muted-foreground max-w-sm`.
- `EmptyStateAction` — `<div>` slot for CTA buttons. `mt-2 flex gap-2`.

All sub-parts exported. Consumer composes content order freely.

### 6. Avatar + AvatarImage + AvatarFallback + AvatarGroup

```tsx
<Avatar>
  <AvatarImage src="/user.jpg" alt="User" />
  <AvatarFallback>AG</AvatarFallback>
</Avatar>

<Avatar size="lg">
  <AvatarImage src="/admin.jpg" alt="Admin" />
  <AvatarFallback><User /></AvatarFallback>
</Avatar>

<AvatarGroup max={3} size="md">
  <Avatar><AvatarImage src="/u1.jpg" /><AvatarFallback>U1</AvatarFallback></Avatar>
  <Avatar><AvatarImage src="/u2.jpg" /><AvatarFallback>U2</AvatarFallback></Avatar>
  <Avatar><AvatarImage src="/u3.jpg" /><AvatarFallback>U3</AvatarFallback></Avatar>
  <Avatar><AvatarImage src="/u4.jpg" /><AvatarFallback>U4</AvatarFallback></Avatar>
  <Avatar><AvatarImage src="/u5.jpg" /><AvatarFallback>U5</AvatarFallback></Avatar>
</AvatarGroup>
```

Renders: 3 avatars + one extra `<Avatar><AvatarFallback>+2</AvatarFallback></Avatar>`.

**Sub-parts** (4):
- `Avatar` — wraps `Base UI Avatar.Root`. cva size variants `sm` / `md` (default) / `lg` / `xl`. Base classes: `relative flex shrink-0 overflow-hidden rounded-full`.
- `AvatarImage` — wraps `Base UI Avatar.Image`. `aspect-square h-full w-full object-cover`.
- `AvatarFallback` — wraps `Base UI Avatar.Fallback`. `flex h-full w-full items-center justify-center bg-muted text-muted-foreground font-medium`. Base UI auto-renders fallback when image is loading or errored.
- `AvatarGroup` — custom `<div>` (no Base UI primitive). `inline-flex` + applies `[&>*:not(:first-child)]:-ml-2 [&>*]:ring-2 [&>*]:ring-background` to children. Props: `max?: number`, `size?: 'sm' | 'md' | 'lg' | 'xl'` (forwarded to overflow Avatar).

`AvatarGroup` truncation: when `children.length > max`, render first `max` children + one extra Avatar with `<AvatarFallback>+{count}</AvatarFallback>`.

**Public exports**: `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup`, `avatarVariants`.

---

## File structure

```
packages/ui/src/components/
├── badge/
│   ├── badge.stories.tsx
│   ├── badge.test.tsx
│   └── index.tsx                       # Badge + badgeVariants
├── skeleton/
│   ├── skeleton.stories.tsx
│   ├── skeleton.test.tsx
│   └── index.tsx                       # Skeleton (single component)
├── progress/
│   ├── progress.stories.tsx
│   ├── progress.test.tsx
│   └── index.tsx                       # Progress (Base UI wrap, encapsulated)
├── list/
│   ├── list.stories.tsx
│   ├── list.test.tsx
│   └── index.tsx                       # List + ListItem
├── empty-state/
│   ├── empty-state.stories.tsx
│   ├── empty-state.test.tsx
│   └── index.tsx                       # 5 sub-parts
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
- `.js` extension on local imports.
- Storybook category for data display: `'DataDisplay/<Component>'`.

---

## Test scope

Stack unchanged: `vitest` + `@testing-library/react` + `@testing-library/user-event`.

| Component | Tests | Coverage |
|---|---:|---|
| Badge | 8 | render with text, default variant classes, secondary/destructive/outline/success/warning variants (5 sub-tests via `test.each`), ref forwarding |
| Skeleton | 4 | renders `<div>`, default classes (`animate-pulse` + `bg-muted`), custom className merge, ref forwarding |
| Progress | 6 | renders progressbar role, value=60 sets `aria-valuenow=60`, value-driven indicator transform, value=null indeterminate state (no `aria-valuenow`), max prop affects ARIA, ref forwarding |
| List | 6 | List renders `<ul>`, ListItem renders `<li>`, divider prop applies `divide-y` class, custom className merge, multi-item rendering, ref forwarding |
| EmptyState | 6 | EmptyState root renders, EmptyStateIcon contains SVG, EmptyStateTitle as `<h3>`, EmptyStateDescription as `<p>`, EmptyStateAction renders children, ref forwarding |
| Avatar | 9 | Avatar renders, AvatarImage with src + alt, AvatarFallback shows when image absent, size sm/md/lg/xl variants (4 sub-tests), AvatarGroup renders all when ≤max, AvatarGroup truncates to max + shows `+N` badge when > max, ref forwarding |

**Plan 6a total**: ~39 tests.

**Test setup notes**:

- Badge `test.each` parameterizes 5 variants (excluding default) in a single block, matching Plan 3 Alert's pattern. Plus one default + one ref test = 8 total.
- Avatar fallback test: jsdom doesn't load images. Pass an empty/missing `src`; Base UI `Avatar.Fallback` will render after the image fails to load (Base UI's auto behavior). Some tests may need `screen.findByText` (async) since Base UI delays fallback render to avoid flicker on fast image loads.
- Progress indeterminate test: when `value={null}`, Base UI's Progress.Root sets `data-state="indeterminate"` and omits `aria-valuenow`. Test asserts both.
- AvatarGroup `max` test: 5 children + max=3 → renders 3 + 1 `+2` fallback = 4 total Avatar elements visible.
- Skeleton tests verify the static class string only — no animation timing checks (jsdom can't run keyframes deterministically).

Coverage target: 100% public API. No visual regression in this plan.

---

## Versioning + release

Single changeset `.changeset/v0.8.0-data-display-base.md`:

```markdown
---
'@idcert/ui': minor
---

Add 6 new components in the Data Display category (first half — Table is Plan 6b).

Components (`@idcert/ui`):
- `Badge` — pill `<span>` with 6 cva variants: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`. Exports `badgeVariants` for consumer override.
- `Skeleton` — single styled `<div>` with `animate-pulse` + `bg-muted rounded-md`. Consumer dimensions via className.
- `Progress` — Base UI Progress wrapper. Linear bar. Accepts `value` (0-`max`) or `null` for indeterminate. Sub-parts (Track/Indicator/Value/Label) encapsulated; only `Progress` exported.
- `List` compound — `<ul>` + `<li>` styled. Sub-parts: `List`, `ListItem`. `divider?: boolean` prop adds separator between items.
- `EmptyState` compound — semantic empty-state pattern. 5 sub-parts: `EmptyState`, `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateAction`.
- `Avatar` compound — Base UI Avatar wrapper. 4 sub-parts: `Avatar` (with cva size variants sm/md/lg/xl), `AvatarImage`, `AvatarFallback`, `AvatarGroup` (custom: stacks children with overlap, `max` prop truncates with "+N" fallback). Exports `avatarVariants`.

No new dependencies.

Out of scope (deferred):
- `Table` (Plan 6b — sorting + selection + heavy custom logic).
- Badge dot variant + removable, Skeleton shimmer + shape presets, Progress circular + label, List ordered + interactive, EmptyState illustrations, Avatar status indicator, AvatarGroup hover-expand.
```

`@idcert/tokens` and `@idcert/tailwind-config` do not bump.

---

## Risks and mitigations

- **Base UI Avatar fallback timing**: Base UI's `Avatar.Fallback` waits a brief delay before rendering to avoid flicker on fast image loads. Tests that assert fallback presence may need `findBy*` (async) instead of `getBy*`. Documented in test setup notes.
- **Base UI Progress data attributes**: Plan 4a Select used `data-active` (no value); Plan 3 Dialog used `data-[open]:` / `data-[closed]:`. Progress likely uses `data-state="loading" | "complete" | "indeterminate"` per Base UI 1.4 conventions. Implementation must verify with `node_modules/@base-ui/react/progress/...DataAttributes` and adapt cva selectors accordingly.
- **AvatarGroup ring offset clipping**: when stacked avatars overlap, the ring (`ring-2 ring-background`) creates visual separation. If the group's parent has the same background as the ring color, the rings disappear visually — this is intentional. Consumers using the group on a non-background surface should override the ring color via className.
- **Badge `success` and `warning` colors**: hard-coded Tailwind colors (`bg-green-500`, `bg-yellow-500`) instead of design tokens. Consistent with existing Plan 3 Alert variants. If tokens get added in the future, both Badge and Alert can be updated together; deferred for now.
- **Skeleton `animate-pulse` accessibility**: skeleton elements should not be announced by screen readers. We add `aria-hidden="true"` by default. Documented.
- **EmptyState heading level**: `EmptyStateTitle` renders `<h3>`. If consumers use it on pages where the document outline expects `<h2>` or `<h1>`, they should override the rendered tag. We document but don't expose an `as` prop in v1 (consumer can wrap in another heading or use Slot pattern in a future iteration).
- **List `divider` prop and gap conflict**: when `divider` is true, we drop `gap-2` and rely on `divide-y` + per-item `py-2`. If consumer passes their own `gap-*` className, it visually doubles the spacing. Documented as expected; consumers override per-item padding instead.

---

## Acceptance criteria

- All 6 new components pass `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` from the monorepo root.
- `publint` passes for `@idcert/ui`.
- Storybook builds; 6 new component stories visible under `DataDisplay/*` categories.
- Playground app `apps/playground/app/data/page.tsx` builds and renders all 6 components in browser; manual smoke verifies:
  - All 6 Badge variants visible and styled correctly.
  - Skeleton card layout (avatar + 2 lines) animates pulse.
  - Progress bars at 30%, 60%, 100%, indeterminate all render correctly.
  - List default + divider variants render with proper spacing.
  - EmptyState centers content vertically and horizontally with icon, title, description, action.
  - Avatar single + with fallback (broken image src) + AvatarGroup with 5 users and max=3 (shows 3 + "+2") all render correctly.
- Bundle analysis confirms `@base-ui/react/avatar` and `@base-ui/react/progress` are external (not inlined).
- Changeset added; `pnpm exec changeset status` shows `@idcert/ui` minor bump 0.7.0 → 0.8.0.
- Branch `feat/data-display-base` clean, ~7 commits (verify start + 6 components + final validation/changeset).
