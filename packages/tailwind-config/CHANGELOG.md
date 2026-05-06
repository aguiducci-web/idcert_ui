# @idcert/tailwind-config

## 0.1.0

### Minor Changes

- 099a40e: Initial release of `@idcert/ui` design system foundation.

  - Monorepo Turborepo structure
  - Three published packages: `@idcert/ui`, `@idcert/tokens`, `@idcert/tailwind-config`
  - Design tokens (primitives + semantic) with auto-generated CSS variables
  - Tailwind preset consuming CSS variables for theming
  - Light + dark mode via `next-themes`
  - `Button` component with 6 variants and 4 sizes (Radix Slot + cva)
  - `ThemeProvider` wrapper
  - `cn` utility for class merging
  - Storybook 8 development environment
  - Vitest + Testing Library test setup

- dc91b7a: Add 5 new components in the Feedback category, introducing Base UI as the headless primitive layer.

  Components (`@idcert/ui`):

  - `Alert` + `AlertTitle` + `AlertDescription` — semantic notice block with cva variants (default/info/success/warning/destructive) and optional default icons.
  - `Dialog` compound — modal overlay built on Base UI `Dialog`. Sub-parts: `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`. Includes default close-X button (opt-out via `showCloseButton={false}`).
  - `AlertDialog` compound — destructive-confirmation modal built on Base UI `AlertDialog`. Sub-parts: `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel`. Action defaults to `Button variant="destructive"`, Cancel to `outline`.
  - `Tooltip` compound — hover/focus help text built on Base UI `Tooltip`. Sub-parts: `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`. Provider configures `delay` (default 200ms).
  - `Spinner` — loading indicator using lucide `Loader2` + Tailwind `animate-spin`. cva size variants (sm/md/lg/xl). Default `aria-label="Loading"`.

  Internals:

  - `@base-ui/react` added as a runtime dependency of `@idcert/ui`.

  Tailwind preset (`@idcert/tailwind-config`):

  - `tailwindcss-animate` plugin added to enable `animate-in`/`animate-out`/`fade-*`/`zoom-*`/`slide-*` utilities driven by Base UI `data-[open]`/`data-[closed]` attributes.

  Out of scope (deferred):

  - `Toast` + `Toaster` — moves to the future Utility plan; bundling them keeps the Toast subsystem cohesive.
