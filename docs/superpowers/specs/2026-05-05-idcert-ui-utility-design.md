# Plan 7 — Utility (Toast + Portal)

**Status**: Design approved
**Date**: 2026-05-05
**Author**: Andrea Alunni Guiducci
**Target version**: `@idcert/ui` v0.10.0
**Branch**: `feat/utility` (off `main` after Plan 6b v0.9.0)
**Predecessor**: Plan 6b — Data Display Table (`feat/data-display-table`, v0.9.0)

---

## Overview

Plan 7 is the final inventory plan. It ships the two remaining components from the master spec's Utility category: **Toast** (Provider + Toaster + sub-parts + `useToast` imperative hook) and **Portal** (React `createPortal` wrapper). After Plan 7 ships, every component listed in the master spec inventory is delivered.

The **ThemeProvider** utility from the master spec was already shipped in Plan 1 (foundation), so this plan does not include it.

Plan 7 ships at **v0.10.0** (minor bump). v1.0.0 (stable release) is a separate "release readiness" effort that will cover dependency audit, integration tests, README/docs, migration guide, and visual regression coverage — out of scope for this plan.

---

## Goals

- Provide a Base UI Toast wrapper consistent with how every other Plan exposes Base UI primitives (Dialog, Tooltip, Popover, Menu, Tabs, Avatar, Progress, Toast).
- Ship an imperative toast API (`useToast().add({...})`) matching shadcn's `useToast` shape — copy-paste examples work.
- Cover the four toast types most apps need: info / success / warning / error, with auto-rendered lucide icons.
- Provide a single-mount `Toaster` viewport with cva-driven position variants (six positions) so consumers can place it anywhere.
- Ship a small `Portal` component for advanced consumers who need to render outside the React tree (custom popovers, escape stacking contexts, render to specific containers).
- Reuse Base UI Toast (already installed); no new runtime or peer dependencies.

## Non-goals (out of scope for Plan 7)

- **Toast custom render-prop** on `Toaster` (e.g. `<Toaster renderToast={(t) => ...}>`). Consumer who needs full custom rendering composes manually with the exposed sub-parts. Future additive prop.
- **Toast promise/loading state** (`toast.promise(p, {...})` Sonner-style) → future additive.
- **Toast swipe-to-dismiss** on mobile → future additive (Base UI exposes a hook but we don't surface it in v1).
- **Responsive Toaster position** (mobile bottom, desktop top-right) → consumer composes with `useIsMobile` hook (Plan 5b) + two `<Toaster>` components conditionally. No dedicated prop.
- **Portal cleanup callback** on unmount → React handles automatically; no API exposed.
- **`PortalProvider`** for app-level container override → future "utility-extra" plan if needed.
- **Toast variants beyond 4 types** → future cva extension.
- **v1.0.0 stable release** — separate plan covering dependency audit, integration tests, README/docs, migration guide.

---

## Architecture

### Dependencies

**No new dependencies.** Both components consume primitives already installed:

- `@base-ui/react/toast` (Base UI v1.4.1, never used before — exposes Provider, Viewport, Root, Title, Description, Action, Close, Portal, Positioner, Arrow, plus `useToastManager` and `createToastManager` factories)
- `react-dom` `createPortal` (already a peer/runtime via `react-dom`)
- `lucide-react` (already runtime; default Toast icons)

`tailwindcss-animate` (Plan 3) is **not** required — Toast slide animations use plain CSS transitions on transform + opacity gated by Base UI's `data-starting-style` / `data-ending-style` attributes (same pattern as Plan 5b Sheet fix to avoid backdrop flicker).

### Base primitive mapping

| Component | Base primitive | Custom logic |
|---|---|---|
| `ToastProvider` | `Toast.Provider` | Pass-through with `timeout` (default `5000`ms auto-dismiss) and `limit` (default `3` visible toasts) |
| `Toaster` | `Toast.Viewport` + render-prop default toast template | cva variant `position`: `top-right` (default), `top-left`, `bottom-right`, `bottom-left`, `top-center`, `bottom-center` — applies `fixed` + corner offsets |
| `Toast` sub-parts | `Toast.Root`, `Toast.Title`, `Toast.Description`, `Toast.Action`, `Toast.Close` | Each forwarded with idcert styling; consumers can opt out of the default template by composing these manually |
| `useToast()` | re-export `useToastManager` | Adds local `ToastOptions` type for ergonomics |
| `Portal` | React `createPortal` | SSR-safe: defers target resolution to `useEffect`; returns `null` on first render |

### Default Toaster template (per-toast rendering)

The `Toaster` component subscribes to the toast manager queue (Base UI Toast.Viewport handles this internally) and renders each toast with the default template:

```
<Toast.Root variant={toast.type}>            {/* cva: info/success/warning/error border-color + icon color */}
  <Icon />                                    {/* lucide: Info | CheckCircle2 | AlertTriangle | XCircle */}
  <Toast.Content>                              {/* if Base UI exposes Content; else <div> */}
    <Toast.Title>{toast.title}</Toast.Title>
    {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
  </Toast.Content>
  {toast.action && (
    <Toast.Action onClick={toast.action.onClick}>
      {toast.action.label}
    </Toast.Action>
  )}
  <Toast.Close>
    <X aria-hidden="true" className="h-4 w-4" />
  </Toast.Close>
</Toast.Root>
```

Animations: `transition-transform duration-200 ease-in-out` plus `data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full` for `top-right`/`bottom-right` positions (slides in from right). For `top-left`/`bottom-left`: `-translate-x-full`. For `top-center`/`bottom-center`: `-translate-y-full` (top) / `translate-y-full` (bottom).

### Position cva on Toaster (Viewport positioning)

```ts
const toasterVariants = cva('fixed z-50 flex flex-col gap-2 p-4', {
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
```

### `useToast()` API

```ts
export function useToast(): {
  add: (options: ToastOptions) => string       // returns toast id
  update: (id: string, options: Partial<ToastOptions>) => void
  close: (id: string) => void
}
```

Internally re-exports Base UI `useToastManager`. We narrow the input/output types via a thin adapter so the consumer-facing types match `ToastOptions` (defined below).

### `ToastOptions` type

```ts
export type ToastOptions = {
  title: string
  description?: string
  type?: 'info' | 'success' | 'warning' | 'error'   // default 'info'
  timeout?: number                                    // override Provider default
  action?: { label: string; onClick: () => void }
}
```

The default Toaster template reads the `type` field to pick the icon and border color.

### `Portal` SSR-safe pattern

```tsx
export function Portal({ children, container }: PortalProps): React.ReactPortal | null {
  const [target, setTarget] = useState<Element | null>(null)
  useEffect(() => {
    setTarget(container ?? document.body)
  }, [container])
  if (!target) return null
  return createPortal(children, target)
}
```

`useEffect` runs only on client, so during SSR the component returns `null` (no portal attempt before `document` is defined). After hydration, the portal mounts to `document.body` (or the consumer-provided `container`).

---

## Component APIs

### 1. Toast (full system)

```tsx
// app root (Next.js layout.tsx)
import { ToastProvider, Toaster } from '@idcert/ui'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider timeout={5000} limit={3}>
          {children}
          <Toaster position="top-right" />
        </ToastProvider>
      </body>
    </html>
  )
}
```

```tsx
// any component
import { useToast, Button } from '@idcert/ui'

function SaveButton() {
  const toast = useToast()

  async function onSave() {
    try {
      await save()
      toast.add({
        type: 'success',
        title: 'Saved',
        description: 'Changes saved successfully.',
      })
    } catch (e) {
      toast.add({
        type: 'error',
        title: 'Save failed',
        description: String(e),
        action: { label: 'Retry', onClick: () => onSave() },
      })
    }
  }

  return <Button onClick={onSave}>Save</Button>
}
```

**Public exports** (8):

- `ToastProvider` — wraps `Toast.Provider`. Props:
  - `timeout?: number` — default `5000`ms auto-dismiss.
  - `limit?: number` — default `3` visible toasts (older toasts queued).
  - `children: ReactNode`
- `Toaster` — viewport. Props:
  - `position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'` (default `'top-right'`)
  - `className?: string`
  - Renders Base UI `Toast.Viewport` with the default per-toast template internally.
- `useToast(): { add, update, close }` — imperative API.
- `ToastOptions` — input type.
- Sub-parts (5 exported for consumer custom override of the default Toaster template):
  - `Toast` (`Toast.Root`)
  - `ToastTitle` (`Toast.Title`)
  - `ToastDescription` (`Toast.Description`)
  - `ToastAction` (`Toast.Action`)
  - `ToastClose` (`Toast.Close`)

The default Toaster template handles the common case. Consumers who need fully custom rendering compose the sub-parts manually inside their own viewport — but most apps will only need `<Toaster position="top-right" />` + `useToast()`.

### 2. Portal

```tsx
import { Portal } from '@idcert/ui'

function FloatingHelp() {
  return (
    <Portal>
      <div className="fixed bottom-4 right-4 z-50 rounded-md bg-background p-4 shadow-lg border">
        Help content rendered into document.body.
      </div>
    </Portal>
  )
}

// custom container
function MountToCustom() {
  const slotRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <div ref={slotRef} className="custom-slot" />
      <Portal container={slotRef.current}>
        <span>Renders into the custom slot, not body.</span>
      </Portal>
    </>
  )
}
```

**Public exports** (1):

- `Portal` — props:
  - `children: ReactNode`
  - `container?: Element | null` — default `document.body` after first client render. If `container` is `null` explicitly, Portal returns `null` (no mount).

SSR returns `null` until first `useEffect` runs.

---

## File structure

```
packages/ui/src/components/
├── toast/
│   ├── toast.stories.tsx
│   ├── toast.test.tsx
│   └── index.tsx                       # ToastProvider + Toaster + 5 sub-parts + useToast + ToastOptions
└── portal/
    ├── portal.stories.tsx
    ├── portal.test.tsx
    └── index.tsx                       # Portal (createPortal wrapper)
```

Plus modified:
- `packages/ui/src/index.ts` — barrel re-exports for both modules.
- `apps/playground/app/layout.tsx` — wrap children with `<ToastProvider>` + render `<Toaster position="top-right" />` after children. Existing pages (`/forms`, `/navigation`, `/dashboard`, `/data`) remain functional.
- `apps/playground/app/utility/page.tsx` (new) — smoke page with toast + portal demos.
- `.changeset/v0.10.0-utility.md` — release note.

**Component conventions** (from earlier plans, repeated):
- `'use client'` first line for any component using hooks, Base UI, or browser APIs (both Toast and Portal qualify).
- `React.forwardRef` on every component that renders a single DOM element with a public ref (Toaster forwards to the viewport `<div>`).
- Named exports only.
- cva for variants when more than one visual variant exists (Toaster `position`).
- `<name>.test.tsx` and `<name>.stories.tsx` accompany every component.
- `.js` extension on local imports (NodeNext + ESM).
- Storybook category for utilities: `'Utility/<Component>'`.
- Stateful Storybook stories: extract demos with hooks to named function components.

---

## Test scope

Stack unchanged: `vitest` + `@testing-library/react` + `@testing-library/user-event`.

| Component | Tests | Coverage |
|---|---:|---|
| Toast | 12 | ToastProvider renders children, useToast throws when used outside Provider, useToast returns add/update/close API, toast.add fires Toaster render of toast (assert title in DOM after click), type=success renders Check icon, type=error renders X icon (XCircle), type=warning renders AlertTriangle, type=info renders Info icon, action button renders + click fires onClick, close button dismisses toast (waitFor disappearance), timeout auto-dismisses after Provider default (vi.advanceTimersByTime), Toaster position cva applies expected `fixed` corner classes (one parametrized test for `top-right`/`top-left`/`bottom-right`/`bottom-left`) |
| Portal | 5 | renders children into document.body by default, custom container prop targets specified element, returns null during SSR (initial render before useEffect), forwards children unchanged (text content visible), multiple Portal instances coexist |

**Plan 7 total**: ~17 tests.

**Test setup notes**:
- Toast timeout test uses `vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval'] })` — NOT bare `vi.useFakeTimers()` (Plan 4b lesson — bare fake timers hang Base UI portal/positioner mounts).
- Portal SSR test: `useEffect` mock or `act()` flush. Initial return = `null`. After flush, target set, portal mounts.
- Action button test: `userEvent.click` on button inside toast, verify `vi.fn()` spy fired.
- Close button test: click X, `waitFor(() => expect(queryByText(title)).not.toBeInTheDocument())`.
- Multiple Portal instances test: render two `<Portal>` siblings, verify both children appear in `document.body`.
- All Toast tests must be wrapped in `<ToastProvider>` (test helper).

Coverage target: 100% public API.

---

## Versioning + release

Single changeset `.changeset/v0.10.0-utility.md`:

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

`@idcert/ui` minor 0.9.0 → 0.10.0. `@idcert/tokens` and `@idcert/tailwind-config` do not bump.

After Plan 7, master spec inventory is **fully delivered**:

| Categoria | Status |
|---|---|
| Primitives (7) | ✅ Plans 1–2 |
| Layout (6) | ✅ Plan 2 |
| Feedback (6) | ✅ Plan 3 (Toast moved to Plan 7 — still covered) |
| Form avanzati (7) | ✅ Plans 4a + 4b |
| Navigation (6) | ✅ Plans 5a + 5b |
| Data display (7) | ✅ Plans 6a + 6b |
| Utility (3) | ✅ Plan 1 (ThemeProvider) + Plan 7 (Toast + Portal) |

**Total**: 42 components delivered across 7 plans.

---

## Risks and mitigations

- **Base UI Toast naming and types**: the `useToastManager` hook returns specific types from Base UI 1.4.1. Our `useToast()` adapter must cast or remap to our `ToastOptions` shape. If Base UI Toast's add signature doesn't match shadcn's `{ title, description, action, type }` 1:1, the implementer adapts the adapter. Documented as a deviation if needed.
- **Default Toaster template iteration over toasts**: Base UI `Toast.Viewport` exposes the queue via render-prop or via `Toast.Root` children that auto-iterate. Implementation must verify Base UI 1.4.1 API and adapt — pattern established in earlier Plans (Plan 4b react-day-picker, Plan 4a Select). Read `node_modules/@base-ui/react/toast/viewport/...` source first.
- **Toast type → cva variant**: our `ToastOptions.type` field doesn't directly map to a Base UI prop (Base UI Toast.Root accepts arbitrary props). We pass `type` via `data-type={...}` on `Toast.Root` and use `data-[type=success]:border-green-500` etc. selectors. Alternative: cva on Toast.Root with `variant={type}` passed explicitly.
- **Toast animation**: lesson from Plan 5b Sheet — use CSS transitions on transform/opacity gated by Base UI `data-starting-style`/`data-ending-style`, not `tailwindcss-animate` `animate-in`/`animate-out` keyframes. Avoids race conditions with Base UI state attribute swaps.
- **Portal SSR**: documented `null`-during-SSR behavior. Consumers using SSR (Next.js) will see no portal output until hydration. For modal/popover usage where this matters, our existing Sheet/Dialog already handle their own portals — consumers don't need this generic Portal for those cases.
- **`'use client'` directive**: both files use hooks/browser APIs. Mark first line accordingly. Without it, Next.js Server Components can't import them.

---

## Acceptance criteria

- Both components pass `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` from the monorepo root.
- `publint` passes for `@idcert/ui`.
- Storybook builds; 2 new component stories visible under `Utility/Toast` and `Utility/Portal`.
- Playground app:
  - Root `apps/playground/app/layout.tsx` wraps children with `<ToastProvider>` and renders `<Toaster position="top-right" />` after children. All existing routes still work.
  - New `apps/playground/app/utility/page.tsx` renders 4 buttons that fire each toast type + 1 button with action callback + 1 Portal demo (toggle button + content rendering inside a custom container).
  - Manual smoke verifies: toasts appear top-right, slide in/out smoothly, auto-dismiss after 5s, action button click fires callback, close X dismisses early, Portal demo mounts content into the chosen container.
- Bundle analysis confirms `@base-ui/react/toast` and `react-dom` are external (not inlined).
- Changeset added; `pnpm exec changeset status` shows `@idcert/ui` minor bump 0.9.0 → 0.10.0.
- Branch `feat/utility` clean, ~3 commits (Toast + Portal + final validation/changeset).
