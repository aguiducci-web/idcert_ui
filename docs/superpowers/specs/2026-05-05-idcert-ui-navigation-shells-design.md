# Plan 5b — Navigation Shells (Sheet, Navbar, Sidebar)

**Status**: Design approved
**Date**: 2026-05-05
**Author**: Andrea Alunni Guiducci
**Target version**: `@idcert/ui` v0.7.0
**Branch**: `feat/navigation-shells` (off `main` after Plan 5a v0.6.0)
**Predecessor**: Plan 5a — Navigation Base (`feat/navigation-base`, v0.6.0)

---

## Overview

Plan 5b is the second half of the Navigation category from the master spec. It covers the heavyweight layout shells that Plan 5a deferred:

- **Sheet** — a slide-in drawer compound built on Base UI Dialog with `side` variants (top, right, bottom, left). Reusable beyond Sidebar — useful for filter panels, mobile carts, settings drawers, command palettes' mobile fallback.
- **Navbar** — a semantic `<nav>` shell with composition sub-parts and `position` variants (static, sticky, fixed). Hosts brand, nav items, actions, and a mobile toggle.
- **Sidebar** — the full shadcn-block app shell. `SidebarProvider` plus 11 sub-parts plus 2 hooks (`useSidebar`, `useIsMobile`). State machine covers expanded / collapsed / mobile-drawer. Cookie persistence. `Cmd/Ctrl+B` keyboard toggle. Mobile mode auto-renders inside `Sheet`.

After Plan 5b ships, the Navigation category from the master inventory is fully delivered (Plan 5a Tabs/DropdownMenu/Breadcrumb/Pagination + Plan 5b Sheet/Navbar/Sidebar).

---

## Goals

- Provide a reusable `Sheet` primitive that consumers can use for any side-anchored modal drawer pattern, not only inside Sidebar.
- Ship a Navbar compound that follows the same composition style as Breadcrumb / DropdownMenu / Tabs (sub-parts mirror semantic slots).
- Ship a Sidebar compound matching the shadcn block API exactly — `SidebarProvider`, the standard sub-parts, `useSidebar`, `useIsMobile`, cookie persistence, and the `Cmd/Ctrl+B` shortcut — so consumer apps can copy-paste shadcn examples without adaptation.
- Reuse existing dependencies (`@base-ui/react/dialog`, `@radix-ui/react-slot`, `lucide-react`) — no new runtime or peer deps.
- Reuse existing design tokens (no new `--sidebar-*` tokens). Sidebar inherits the app theme.

## Non-goals (out of scope for Plan 5b)

- **Sidebar variant `floating`** (sidebar detached with margin + rounded). Future additive variant; v1 ships `sidebar` (default) + `inset`.
- **Sidebar nested groups / collapsible sub-menus** inside menu items. Consumer composes with DropdownMenu or a future Disclosure primitive.
- **Sidebar drag-to-resize handle**. Width is fixed via CSS variable `--sidebar-width`.
- **Sidebar mobile drawer side="right"**. v1 mobile drawer always slides from left; desktop `side="right"` is supported.
- **Sidebar advanced animations** (e.g. tooltip slide-in from icon-collapsed state). Base behavior solid; advanced animations later.
- **Navbar mega-menu** (large multi-column dropdown). Consumer composes with DropdownMenu.
- **Navbar customizable mobile breakpoint**. Fixed at `md` (768px). Override via Tailwind responsive classes consumer-side.
- **Sheet stacked** (multiple Sheets simultaneously). Single Sheet via Base UI Dialog `modal=true`.
- **Sheet mobile swipe-to-close**. Future additive feature.
- **Customizable keyboard shortcut** (other than `Cmd/Ctrl+B`). Opt-out via `enableKeyboardShortcut={false}` on `SidebarProvider`.
- **Persistence storage alternatives** (localStorage / sessionStorage / API). Fixed at cookie. Consumer can override with controlled mode (`open` + `onOpenChange`).
- **SSR cookie initial-state read helper**. Consumer Next.js wires with `cookies()` from `next/headers`. Documented in README and stories.

---

## Architecture

### Dependencies

**No new dependencies.** All three components consume primitives already installed:

- `@base-ui/react/dialog` (Plan 3 introduced this, used by Sheet)
- `@radix-ui/react-slot` (already runtime, used by `NavbarItem asChild`, `SidebarMenuButton asChild`, `SheetTrigger asChild`, `SheetClose asChild`)
- `lucide-react` (icons: `Menu` for hamburger, `X` for close, `ChevronLeft` and `ChevronRight` not required here)

`tailwindcss-animate` (Plan 3) supplies the `animate-in` / `animate-out` / `slide-in-from-*` / `slide-out-to-*` utilities used by Sheet's side animations.

### Base primitive mapping

| Component | Base primitive | Custom logic |
|---|---|---|
| Sheet | `Base UI Dialog.*` (Root, Trigger, Portal, Backdrop, Popup, Close, Title, Description) | cva variant `side`: top/right/bottom/left applies positioning + slide animations via `data-[state=open]:slide-in-from-*` and `data-[state=closed]:slide-out-to-*` utility groups |
| Navbar | semantic `<nav>` HTML | cva variant `position`: static/sticky/fixed; `NavbarItem` uses `@radix-ui/react-slot` for `asChild`; `NavbarMobileToggle` is a styled `<button>` consumer wires |
| Sidebar | `<aside>` + Sheet (mobile drawer) + custom layout | `SidebarProvider` state machine, cookie persistence (`document.cookie sidebar:state`), `useIsMobile` matchMedia hook, keyboard shortcut listener; mobile renders Sidebar inside `<Sheet>` automatically |

### `SidebarProvider` state machine

Internal state shape:

```ts
type SidebarState = 'expanded' | 'collapsed'

type SidebarContextValue = {
  state: SidebarState
  open: boolean
  setOpen: (next: boolean) => void
  openMobile: boolean
  setOpenMobile: (next: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}
```

Behavior:
- Desktop: `state` derived from `open`. `setOpen(next)` writes cookie `sidebar:state=<next>` (max-age 7d). `toggleSidebar` flips `open`.
- Mobile: `openMobile` is the Sheet open state. `toggleSidebar` flips `openMobile` instead of `open`. The desktop `open`/`state` is unchanged on mobile.
- `isMobile` from `useIsMobile(768)` — viewport-driven boolean.
- Provider can be controlled (`open` + `onOpenChange` props) or uncontrolled (`defaultOpen` prop, default `true`).

Provider also installs a keyboard shortcut listener: `Cmd+B` (Mac) / `Ctrl+B` (Win/Linux) calls `toggleSidebar`. Can be disabled with `enableKeyboardShortcut={false}`.

### `useIsMobile` hook

```ts
function useIsMobile(breakpoint = 768): boolean
```

Implementation: `window.matchMedia(\`(max-width: ${breakpoint - 1}px)\`)` with subscription. Returns `false` during SSR (defaults to desktop). Consumers who need SSR-aware initial mobile state should pass it down via cookie / header sniffing — out of scope here.

---

## Component APIs

### 1. Sheet

```tsx
<Sheet open onOpenChange>
  <SheetTrigger asChild>
    <Button>Open filters</Button>
  </SheetTrigger>
  <SheetContent side="right">                {/* default "right" */}
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Adjust the active filters.</SheetDescription>
    </SheetHeader>
    <div className="py-4">…filter form…</div>
    <SheetFooter>
      <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
      <Button>Apply</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

**Sub-parts** (8, all exported):

- `Sheet` — wraps Base UI `Dialog.Root`. Pass-through `open`, `defaultOpen`, `onOpenChange`, `modal`.
- `SheetTrigger` — wraps Base UI `Dialog.Trigger`. Accepts `asChild?: boolean`.
- `SheetContent` — Portal + Backdrop + styled Popup container. cva variant `side`:
  - `top`: `inset-x-0 top-0 border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top`
  - `right` (default): `inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right`
  - `bottom`: `inset-x-0 bottom-0 border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom`
  - `left`: `inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left`

  Common: `fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500`. Includes a default close-X button (`SheetClose` with `X` icon) in top-right (opt-out via `showCloseButton={false}`).
- `SheetHeader` — `flex flex-col space-y-2 text-center sm:text-left`.
- `SheetFooter` — `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2`.
- `SheetTitle` — wraps `Dialog.Title`. `text-lg font-semibold text-foreground`.
- `SheetDescription` — wraps `Dialog.Description`. `text-sm text-muted-foreground`.
- `SheetClose` — wraps `Dialog.Close`. `asChild?: boolean`.

Backdrop, focus trap, ESC, click-outside via Base UI Dialog (same as Plan 3 Dialog).

**Note on Base UI Dialog `data-state`**: Plan 3 verified that Base UI 1.4 emits `data-state="open"` / `data-state="closed"` on the popup. Sheet's slide animations use `data-[state=open]:` / `data-[state=closed]:` selectors that match. Plan 4a noted Select used `data-open` (no value) — but Dialog uses the `data-state` form. Implementation must verify with `node_modules/@base-ui/react/dialog/popup/...DataAttributes` if any uncertainty.

### 2. Navbar

```tsx
<Navbar position="sticky">                   {/* default "static" */}
  <NavbarBrand>
    <Link href="/"><Logo /></Link>
  </NavbarBrand>
  <NavbarContent>
    <NavbarItem href="/products" active>Products</NavbarItem>
    <NavbarItem href="/docs">Docs</NavbarItem>
    <NavbarItem asChild><Link href="/blog">Blog</Link></NavbarItem>
  </NavbarContent>
  <NavbarActions>
    <Button variant="ghost">Sign in</Button>
    <Button>Get started</Button>
  </NavbarActions>
  <NavbarMobileToggle aria-label="Open menu" />
</Navbar>
```

**Sub-parts** (6, all exported):

- `Navbar` — `<nav>` semantic root. cva variant `position`:
  - `static` (default): standard flow.
  - `sticky`: `sticky top-0 z-40`.
  - `fixed`: `fixed inset-x-0 top-0 z-40`.

  Container: `flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6`.

- `NavbarBrand` — `flex items-center gap-2 mr-4`. Slot for logo + name.
- `NavbarContent` — `hidden md:flex flex-1 items-center gap-4`. Hidden on mobile.
- `NavbarItem` — `<a>` (or `Slot` if `asChild`). Default style `text-sm font-medium text-muted-foreground transition-colors hover:text-foreground`. With `active` prop or `aria-current="page"`: `text-foreground`. Accepts `href`, `active?: boolean`, `asChild?: boolean`.
- `NavbarActions` — `ml-auto flex items-center gap-2`. Right-aligned slot.
- `NavbarMobileToggle` — `<button>` with `Menu` lucide icon (24x24). `md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent`. Consumer wires `onClick` (typically toggles SidebarProvider's `openMobile`, or opens a Sheet for nav menu).

`NavbarMobileToggle` does **not** automatically integrate with `SidebarProvider`. Consumer wires the click handler. Documented in stories with both patterns: standalone Sheet, and SidebarProvider-driven.

### 3. Sidebar

```tsx
<SidebarProvider defaultOpen open onOpenChange enableKeyboardShortcut>
  <Sidebar side="left" variant="sidebar" collapsible="icon">
    <SidebarHeader>
      <SidebarMenuButton size="lg" asChild>
        <Link href="/"><Logo /><span>idcert</span></Link>
      </SidebarMenuButton>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild active>
              <Link href="/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/projects"><Folder /><span>Projects</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenuButton><User /><span>Account</span></SidebarMenuButton>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>

  <SidebarInset>
    <Navbar position="sticky">
      <SidebarTrigger />
      <NavbarBrand>…</NavbarBrand>
      <NavbarActions>…</NavbarActions>
    </Navbar>
    <main className="p-6">…page content…</main>
  </SidebarInset>
</SidebarProvider>
```

**Public exports** (11 sub-parts + 2 hooks):

- `SidebarProvider` — wraps the app/layout. Props:
  - `defaultOpen?: boolean` (default `true`)
  - `open?: boolean` (controlled)
  - `onOpenChange?: (next: boolean) => void` (controlled)
  - `enableKeyboardShortcut?: boolean` (default `true`)
  - `children: ReactNode`

  Provides `SidebarContext`. Reads cookie `sidebar:state` on mount for initial state when uncontrolled. Writes cookie on `setOpen`. Installs `Cmd/Ctrl+B` listener.

- `Sidebar` — `<aside>` root. Mobile mode auto-renders inside `<Sheet side="left">`. Props:
  - `side?: 'left' | 'right'` (default `'left'`)
  - `variant?: 'sidebar' | 'inset'` (default `'sidebar'`)
  - `collapsible?: 'offcanvas' | 'icon' | 'none'` (default `'offcanvas'`)
  - `className?: string`

  Width: CSS variable `--sidebar-width: 16rem` (default), `--sidebar-width-icon: 3rem`. Consumer overrides via inline style or className.

- `SidebarHeader` — `flex flex-col gap-2 p-2`.
- `SidebarContent` — `flex flex-1 flex-col gap-2 overflow-auto p-2`. Scrollable middle area.
- `SidebarFooter` — `flex flex-col gap-2 p-2`.
- `SidebarGroup` — `flex flex-col gap-1 p-2`.
- `SidebarGroupLabel` — `text-xs font-medium text-muted-foreground px-2`.
- `SidebarMenu` — `<ul className="flex flex-col gap-1">`.
- `SidebarMenuItem` — `<li>`.
- `SidebarMenuButton` — primary nav button. cva variants:
  - `size`: `default` (h-8), `sm` (h-7), `lg` (h-12).
  - `active` boolean prop applies `bg-accent text-accent-foreground font-medium`.
  - Inactive: `hover:bg-accent hover:text-accent-foreground transition-colors`.
  - In collapsed=`icon` state: `[&>span]:hidden` hides text (only icon visible). Width compresses to `--sidebar-width-icon`.

  Accepts `asChild?: boolean` for Next.js Link composition.

- `SidebarTrigger` — toggle button. Renders `<button>` with `Menu` icon. Mobile: `setOpenMobile(!openMobile)`. Desktop: `setOpen(!open)` (== `toggleSidebar()`). Accepts `className`. Default styling matches Button `ghost size="icon"`.

- `SidebarRail` — narrow vertical strip at sidebar edge. Click toggles collapsed state. Visual hint for desktop hover-resize affordance. `desktop only`. `hidden md:block absolute inset-y-0 right-0 z-20 w-1 cursor-pointer hover:bg-accent`.

- `SidebarInset` — wrapper for main content. Adapts margin based on sidebar state via CSS variable. `flex flex-col flex-1 min-h-svh ml-[var(--sidebar-margin)]`. The provider sets `--sidebar-margin` to `0` (mobile or collapsed=offcanvas), `--sidebar-width-icon` (collapsed=icon), or `--sidebar-width` (expanded). Side="right" mirrors with `mr-` instead.

- `useSidebar()` — accesses context. Throws if used outside `SidebarProvider`. Returns `SidebarContextValue` (state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar).

- `useIsMobile(breakpoint = 768)` — boolean from matchMedia. Used internally by Provider; exported for consumer convenience.

**Mobile mode rendering**: when `useIsMobile()` returns true, `Sidebar` does NOT render the `<aside>`. Instead it renders:

```tsx
<Sheet open={openMobile} onOpenChange={setOpenMobile}>
  <SheetContent side={side === 'right' ? 'right' : 'left'} className="w-[var(--sidebar-width)] p-0">
    {children}
  </SheetContent>
</Sheet>
```

The desktop `<aside>` and the mobile Sheet share `children`. Consumer composes once.

**Cookie persistence**: Provider reads `document.cookie sidebar:state` on mount. Setter writes `document.cookie = "sidebar:state=" + open + "; max-age=604800; path=/"`. Cookie name `sidebar:state` matches shadcn convention.

**SSR initial state**: Provider does NOT block on cookie read — initial state is `defaultOpen`. Consumer Next.js apps can pre-read the cookie via `cookies()` from `next/headers` and pass to `defaultOpen` for hydration consistency. Documented in README/storybook.

OK Sezione 5+6 — vai al test scope formale + file structure + risks e acceptance:

---

## File structure

```
packages/ui/src/components/
├── sheet/
│   ├── index.tsx                       # Sheet + 7 sub-parts + cva side variants
│   ├── sheet.test.tsx
│   └── sheet.stories.tsx
├── navbar/
│   ├── index.tsx                       # Navbar + 5 sub-parts + cva position variants
│   ├── navbar.test.tsx
│   └── navbar.stories.tsx
└── sidebar/
    ├── index.tsx                       # SidebarProvider + Sidebar + 11 sub-parts + 2 hooks + cookie helpers
    ├── sidebar.test.tsx
    └── sidebar.stories.tsx
```

`sidebar/index.tsx` will be approximately 600 lines — the largest single file in the package. Acceptable for compound coherence (one provider + many tightly-coupled sub-parts). If the file grows unwieldy during implementation, splitting into `sidebar/_provider.tsx`, `sidebar/_use-sidebar.ts`, `sidebar/_constants.ts`, `sidebar/_menu.tsx` etc. is reasonable — but keep the public `index.tsx` as the single export entry.

Plus modified:
- `packages/ui/src/index.ts` — barrel re-exports for the 3 new modules + 2 hooks + types.
- `apps/playground/app/dashboard/page.tsx` (new) — full layout smoke (SidebarProvider wrapping Sidebar + Navbar with SidebarTrigger + main content).
- `.changeset/v0.7.0-navigation-shells.md` — release note.

**Storybook**: 3 new stories under `Navigation/Sheet`, `Navigation/Navbar`, `Navigation/Sidebar`. Auto-indexed via existing glob.

---

## Test scope

Stack unchanged: `vitest` + `@testing-library/react` + `@testing-library/user-event`.

| Component | Tests | Coverage |
|---|---:|---|
| Sheet | 9 | render trigger, open on click, close on ESC, close on backdrop click, side="right" classes (default), side="left" applies left-anchored classes, side="top" classes, side="bottom" classes, ref forwarding on SheetContent |
| Navbar | 8 | renders `<nav>`, position="static" classes, position="sticky" classes, position="fixed" classes, NavbarBrand + NavbarContent + NavbarActions structural slots render, NavbarItem with `active` prop sets aria-current, NavbarItem `asChild` slot composition, NavbarMobileToggle button click fires onClick + ref forwarding |
| Sidebar | 18 | useSidebar hook (3 sub-tests: returns context inside Provider, throws outside Provider, toggleSidebar flips open state), useIsMobile hook (2 sub-tests: matches viewport breakpoint via mocked matchMedia, updates listener on viewport change), SidebarProvider provides initial state from defaultOpen, Sidebar root renders `<aside>` desktop, Sidebar mobile mode renders inside Sheet with side="left", Sidebar side="right" applies right-anchored classes, collapsible="icon" + collapsed hides label text via CSS, SidebarTrigger click toggles open state, SidebarTrigger keyboard Cmd+B toggles open, cookie setter called on toggle (mocked via Object.defineProperty document.cookie), SidebarMenuButton active state applies bg-accent, SidebarMenuButton asChild composes child element, SidebarHeader / SidebarContent / SidebarFooter render in expected slot positions, SidebarGroup + SidebarGroupLabel render, SidebarMenu renders `<ul>`, SidebarMenuItem renders `<li>`, ref forwarding on Sidebar root |

**Plan 5b total**: ~35 tests.

**Test setup notes**:

- Sheet tests inherit Plan 3 Dialog patterns. Side variants verified by checking computed class strings (cva output) since jsdom doesn't run animations.
- `useIsMobile` test mocks `window.matchMedia` (jsdom doesn't implement). Pattern: `Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation((query) => ({ matches: query === expected, addEventListener: vi.fn(), removeEventListener: vi.fn() })) })`. Cleanup in afterEach.
- `useSidebar throws` test wraps with `vi.spyOn(console, 'error').mockImplementation(() => {})` to suppress React error noise.
- Cookie test: spy on `document.cookie` setter via `Object.defineProperty(document, 'cookie', { configurable: true, set: spy, get: () => '' })`.
- Keyboard shortcut test: `fireEvent.keyDown(window, { key: 'b', metaKey: true })` to simulate `Cmd+B`. Provider listener uses `window.addEventListener('keydown', ...)`.

Coverage target: 100% public API. No visual regression in this plan.

---

## Versioning + release

Single changeset `.changeset/v0.7.0-navigation-shells.md`:

```markdown
---
'@idcert/ui': minor
---

Add 3 new components in the Navigation category (second half — completes the category alongside Plan 5a's Tabs / DropdownMenu / Breadcrumb / Pagination).

Components (`@idcert/ui`):
- `Sheet` compound — slide-in drawer built on Base UI Dialog. cva variant `side`: `top`, `right` (default), `bottom`, `left`. Sub-parts: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`. `asChild` on Trigger and Close. Default close-X icon button in top-right (opt-out via `showCloseButton={false}` on SheetContent).
- `Navbar` compound — semantic `<nav>` shell. cva variant `position`: `static` (default), `sticky`, `fixed`. Sub-parts: `Navbar`, `NavbarBrand`, `NavbarContent`, `NavbarItem`, `NavbarActions`, `NavbarMobileToggle`. `NavbarItem asChild` for Next.js Link.
- `Sidebar` compound — full app shell with state management. `SidebarProvider` (cookie persistence, `Cmd/Ctrl+B` shortcut), 11 sub-parts (`Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`), and 2 hooks (`useSidebar`, `useIsMobile`). Variants: `side` (left/right), `variant` (sidebar/inset), `collapsible` (offcanvas/icon/none). Mobile mode auto-renders inside `Sheet`.

No new dependencies.

Out of scope (deferred):
- Sidebar `floating` variant, nested groups, drag-to-resize handle, mobile drawer side="right".
- Navbar mega-menu, customizable mobile breakpoint.
- Sheet stacked, mobile swipe-to-close.
- Customizable keyboard shortcut, alternative persistence backends, SSR cookie helper.
```

`@idcert/tokens` and `@idcert/tailwind-config` do not bump (no new tokens — Sidebar reuses existing `--background`, `--foreground`, `--accent`, `--border`).

---

## Risks and mitigations

- **Sidebar mobile mode + Sheet integration**: Sidebar's children must render inside both the desktop `<aside>` and the mobile `<Sheet>`. The implementation should branch on `isMobile` and render the appropriate container; children pass through to the active container. Tests cover both modes.
- **Cookie persistence + SSR mismatch**: if Provider reads cookie on mount but server-rendered initial state was `defaultOpen`, hydration may flicker. Mitigation: documented in README that consumers using SSR should pre-read the cookie server-side and pass to `defaultOpen`. Out-of-scope to ship a Next.js-specific helper.
- **Keyboard shortcut conflict**: `Cmd/Ctrl+B` may conflict with browser bookmarks or app-level shortcuts. Mitigation: opt-out via `enableKeyboardShortcut={false}`. Documented in changeset and Provider props.
- **`useIsMobile` SSR**: returns `false` during SSR (no `window`). Consumers requiring SSR-aware mobile state pass it down via cookies/headers. Documented.
- **Sheet `data-state` attribute**: Plan 4a Select used `data-active`/`data-open`; Plan 3 Dialog used `data-state="open"`. Sheet inherits Dialog so should match — but the implementation must verify with Base UI 1.4.1 Dialog source first and adapt cva selectors if needed. Same precedent as Plan 4b react-day-picker key adaptations.
- **Sidebar variant `inset`**: applies background contrast (e.g. `bg-muted`) to `SidebarInset`. Subtle, not breaking. Implementation must keep CSS variable naming consistent (`--sidebar-margin`, `--sidebar-width`).
- **`SidebarTrigger` keyboard event vs `Cmd+B`**: the Provider listener uses `window.addEventListener` with `metaKey || ctrlKey` check. Make sure not to conflict if multiple Providers nest (shouldn't happen in practice — document as unsupported).
- **`document.cookie` in jsdom**: jsdom supports `document.cookie` natively. No mock needed for production code path. Tests that want to spy on writes mock via `Object.defineProperty` (see test setup notes).
- **Sidebar inside Server Component layouts**: `SidebarProvider` is `'use client'` (uses hooks). Consumer must mark the layout component as client or wrap only the sidebar tree as client. Documented.

---

## Acceptance criteria

- All 3 new components pass `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` from the monorepo root.
- `publint` passes for `@idcert/ui`.
- Storybook builds; 3 new component stories visible under `Navigation/*` categories.
- Playground app `apps/playground/app/dashboard/page.tsx` builds and renders the full layout in browser; manual smoke verifies:
  - Sidebar renders with header/content/footer/menu items.
  - SidebarTrigger click toggles between expanded and collapsed (`icon` mode shows only icons).
  - Cmd/Ctrl+B toggles sidebar (verify on macOS via Cmd, on Win/Linux via Ctrl).
  - Reload page persists state (cookie).
  - Mobile viewport (DevTools < 768px): sidebar becomes Sheet drawer, opens via SidebarTrigger / NavbarMobileToggle.
  - Navbar sticky: scrolls correctly with main content; sidebar trigger always accessible.
  - Sheet standalone story: opens, closes via ESC / X / backdrop, all four sides work.
- Bundle analysis confirms `@base-ui/react/dialog` is external (not inlined).
- Changeset added; `pnpm exec changeset status` shows `@idcert/ui` minor bump 0.6.0 → 0.7.0.
- Branch `feat/navigation-shells` clean, ~5 commits (verify start + 3 components + final validation/changeset).
