# @idcert/ui — Feedback Layer Design (Plan 3 of 5)

> **Addendum** to `2026-05-04-idcert-ui-design.md`. Defines plan-specific decisions for the Feedback component slice. Does not supersede the main spec — only fills in choices left open there.

## Scope

5 components from the spec's "Feedback (6)" inventory:

- **Alert** — custom static notice block
- **Dialog** — modal overlay (Base UI)
- **AlertDialog** — destructive confirmation modal (Base UI)
- **Tooltip** — hover/focus help text (Base UI)
- **Spinner** — loading indicator (custom)

**Deferred:** `Toast` + `Toaster` move to the future Utility plan. Toast requires a mount region (`Toaster`) which the spec classifies as Utility; shipping `Toast` without `Toaster` would yield a non-functional component. Bundling both into Utility keeps that subsystem cohesive.

**Branch:** `feat/feedback`, branched from `feat/primitives` (not yet merged to `main`).

**Release target:** `v0.3.0` minor.

## Design decisions

### Headless primitives — Base UI

`@base-ui/react` is added as a runtime dependency of `@idcert/ui` for the first time. The package powers `Dialog`, `AlertDialog`, and `Tooltip`. It ships its own focus-trap, anchor positioning (Floating UI), and ARIA wiring — we wrap and style, never re-implement.

Subpath imports are used per Base UI convention:

```ts
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
```

### Animations — CSS-only

Base UI exposes state via `data-state="open" | "closed"` attributes on rendered elements. We animate with Tailwind utilities driven by those attributes. No `framer-motion`, no JS animation runtime.

To enable shadcn-style `animate-in` / `fade-in-0` / `zoom-in-95` utilities, we add the `tailwindcss-animate` plugin to `@idcert/tailwind-config` preset. This is a zero-runtime CSS plugin (compile-time only).

### Alert variants

cva-driven, mirroring the existing `Button` variant pattern:

| variant | use case | icon (default) |
|---|---|---|
| `default` | neutral notice | none |
| `info` | informational | `Info` |
| `success` | positive feedback | `CheckCircle2` |
| `warning` | non-blocking warning | `AlertTriangle` |
| `destructive` | error / failure | `XCircle` |

Icons opt-in via boolean prop or a custom `icon` ReactNode. Sub-components: `AlertTitle` (h5) and `AlertDescription` (p).

### Spinner

Tailwind `animate-spin` applied to the lucide `Loader2` icon. Single component, cva for size variants (`sm` 16px, `md` 20px, `lg` 24px, `xl` 32px). Color inherits via `currentColor`. ARIA: `role="status"` + `aria-label` (default `"Loading"`).

### Dialog & AlertDialog compound shape

Both follow the same compound shape so consumers move between them with muscle memory:

```
Dialog
├── DialogTrigger          # Base UI Trigger, no styling
├── DialogContent          # styled wrapper around Base UI Popup + Backdrop
│   ├── DialogHeader       # flex column for title+description
│   │   ├── DialogTitle
│   │   └── DialogDescription
│   ├── (children)
│   ├── DialogClose        # styled X button, top-right
│   └── DialogFooter       # right-aligned action row
```

`AlertDialog` mirrors this 1:1 except:

- `AlertDialogAction` (default `Button variant="destructive"`)
- `AlertDialogCancel` (default `Button variant="outline"`)
- No `AlertDialogClose` X button (per WAI-ARIA pattern — alert dialogs require explicit cancel/confirm)

### Tooltip

`TooltipProvider` wrapper is required at app root (or per-tree). Configures `delayDuration` (default `200ms`) and `skipDelayDuration` (default `0`).

Compound:

```
TooltipProvider              # context, no DOM
└── Tooltip                  # logical wrapper
    ├── TooltipTrigger       # asChild forwarded; no styling
    └── TooltipContent       # styled popup, includes Tooltip.Arrow
```

## Component conventions

Every component follows the conventions established in Plan 1/2:

- Single file per component (compound parts in same `index.tsx`)
- `'use client'` first line for any component using Base UI hooks/refs
- `React.forwardRef` where the component renders a single DOM element with a public ref
- Named exports only
- cva for multi-variant components (Alert, Spinner)
- Storybook story per component (`<name>.stories.tsx`)
- Vitest tests cover: render, primary interaction, ARIA, ref forwarding, controlled state where applicable, variant classes

## Test coverage estimate

| Component | tests |
|---|---|
| Alert | 6 (render, variant classes via parametrized test, custom icon, sub-parts render, ref forwarding, role="alert") |
| Dialog | 8 (render, open/close, trigger, ESC, backdrop click, controlled, sub-parts, ref) |
| AlertDialog | 7 (render, action click, cancel click, ESC, controlled, sub-parts, ref) |
| Tooltip | 6 (render, hover open, focus open, content, provider, ref) |
| Spinner | 5 (render, size variants, role, aria-label, custom className) |
| **Total** | **~32** |

Brings repo total from ~70 to ~102.

## Dependency changes

`packages/ui/package.json`:

```jsonc
"dependencies": {
  "@base-ui/react": "^1.0.0", // first add
  // ...existing
}
```

`packages/tailwind-config/package.json`:

```jsonc
"dependencies": {
  "tailwindcss-animate": "^1.0.7" // first add — runtime-free CSS plugin
}
```

`packages/tailwind-config/src/index.ts` — add plugin:

```ts
import animate from 'tailwindcss-animate'

const preset: Pick<Config, 'darkMode' | 'theme' | 'plugins'> = {
  darkMode: 'class',
  theme: { /* unchanged */ },
  plugins: [animate],
}
```

## Out of scope (explicit)

- Toast + Toaster — Utility plan
- Visual regression tests — v2 (per main spec non-goals)
- Animation timing tokens — current iteration uses Tailwind defaults; tokens iteration possible later
- Custom Dialog sizes (`sm` / `md` / `lg` width variants) — first iteration ships single default width; size variants land in a follow-up if usage warrants
- Modal stacking (Dialog inside Dialog) — Base UI handles z-index but UX patterns deferred

## Risks / forecasted issues

- **Base UI version pinning.** v1.0+ stable but minor releases may move APIs in ways subpath imports surface immediately. Pin minor (`^1.0.0`) and watch on first install.
- **`tailwindcss-animate` + Tailwind 4.** Plugin is Tailwind 3-era. We're on `^3.4`. If repo upgrades to Tailwind 4 (open question in main spec), revisit.
- **Tooltip + Storybook.** Hover-driven components can be flaky in Storybook autodocs. Stories will use `parameters: { layout: 'centered' }` and may need `play` functions for visual verification — not blocking, but called out.
- **Alert icon bundle cost.** Importing 4 lucide icons by default adds ~2KB to consumers using only one variant. Acceptable; lucide is tree-shakable per-icon at consumer build time when imported by name.
