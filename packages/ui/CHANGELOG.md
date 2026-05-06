# @idcert/ui

## 1.0.0

### Minor Changes

- Migrate `@idcert/tailwind-config` to Tailwind v4 (CSS-first preset).

  **Breaking changes:**

  - `@idcert/tailwind-config` now ships a CSS file (`preset.css`) instead of a JS preset. Consumers must use Tailwind v4 (`tailwindcss@^4` + `@tailwindcss/postcss`).
  - The previous `import preset from "@idcert/tailwind-config"` JS export is removed. Replace `tailwind.config.{ts,js}` with a CSS entry that imports the preset:

    ```css
    @import "tailwindcss";
    @import "@idcert/tokens/styles.css";
    @import "@idcert/tailwind-config/preset.css";

    @source "../node_modules/@idcert/ui/dist";
    ```

  - `peerDependencies.tailwindcss` bumped from `>=3.4` to `^4`.
  - `@idcert/ui` integration steps updated accordingly (no source changes; bump signals consumer setup change).

### Patch Changes

- Updated dependencies
  - @idcert/tailwind-config@0.2.0

## 0.10.0

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

- b989e51: Add Plan 7 (Utility) — `Portal` and `Toast` system.

  Components (`@idcert/ui`):

  - `Portal` — SSR-safe `createPortal` wrapper. Renders children into `document.body` (or supplied `container`) on the client; renders nothing on the server. No styling, no a11y opinions — pure escape hatch for layered UI.
  - `Toast` system built on Base UI Toast:
    - `ToastProvider` — wraps the app, owns the manager state. Props: `timeout` (default 5000ms), `limit` (default 3).
    - `Toaster` — viewport + default template. 6 positions via `position` variant: `top-right` (default), `top-left`, `bottom-right`, `bottom-left`, `top-center`, `bottom-center`. Auto-renders icon + title + description + optional action + close based on `useToast().add()` payload.
    - `useToast()` — `{ add, update, close }`. `add({ title, description?, type?, timeout?, action? })` returns toast id. Throws when used outside `<ToastProvider>`.
    - Sub-parts for custom templates: `Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`.
    - 4 semantic types (`info` | `success` | `warning` | `error`) with matching border + lucide icon (Info / CheckCircle2 / AlertTriangle / XCircle).

  New dependency: `@base-ui/react` (Toast primitive). No other additions.

  Out of scope (deferred):

  - Promise/loading toast helpers (consumer composes via `update`).
  - Swipe-to-dismiss gestures beyond Base UI defaults.
  - Programmatic focus management beyond Base UI defaults.

- fb7b8b2: Add 13 new components in the primitives + layout categories.

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

- 0bb8593: Add 4 new components in the Form avanzati category (first half of the form layer).

  Components (`@idcert/ui`):

  - `Select` compound — single-value dropdown built on Base UI Select. Sub-parts: `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`.
  - `MultiSelect` compound — multi-value combobox with chip-style trigger and search filter, built on Base UI Combobox (`multiple`). Data-driven: consumer supplies `items` array; rendered list via `MultiSelectList` render-prop. Sub-parts: `MultiSelectTrigger`, `MultiSelectChips`, `MultiSelectContent`, `MultiSelectList`, `MultiSelectItem`, `MultiSelectEmpty`. Type: `MultiSelectOption`.
  - `Slider` — numeric input with single-thumb or range support (array `value`), built on Base UI Slider.
  - `Form` + `FormField` compound — `react-hook-form` + `zod` integration following the shadcn pattern. Sub-parts: `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`. Hook: `useFormField()`. `FormControl` uses `@radix-ui/react-slot` (existing runtime dep) for child cloning.

  New peer dependencies (consumer must install when using the form module):

  - `react-hook-form` ^7
  - `zod` ^3

  Out of scope (deferred to Plan 4b):

  - DatePicker, DateRangePicker, TimePicker, FileUpload.

- a94e9ed: Add 4 new components in the Form avanzati category (second half — completes the form layer).

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

- c9bb3a8: Add 4 new components in the Navigation category (first half — second half is Plan 5b: Navbar + Sidebar).

  Components (`@idcert/ui`):

  - `Tabs` compound — Base UI Tabs wrapper. Sub-parts: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. cva variants: `default` (underline) and `pills` (rounded segment). Horizontal and vertical orientation. Active state via Base UI `data-active` attribute; disabled via `aria-disabled`.
  - `DropdownMenu` compound — Base UI Menu wrapper. 13 exported sub-parts: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`. `asChild` prop on `DropdownMenuTrigger` for Button composition. CheckboxItem and RadioItem use Base UI's dedicated `CheckboxItemIndicator` / `RadioItemIndicator` parts. `DropdownMenuLabel` renders a plain `<div>` by default; opt into the Base UI `GroupLabel` context with `asGroupLabel` when nested inside a `DropdownMenuGroup`.
  - `Breadcrumb` compound — semantic HTML (`<nav><ol><li>`). 7 sub-parts: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`. `BreadcrumbLink asChild` for Next.js Link integration.
  - `Pagination` — smart data-driven component with auto range calculation. Props: `currentPage`, `totalPages`, `onPageChange`, `siblingCount`, `showPrevNext`. Helper `getPaginationRange` exported for advanced custom layouts.

  No new dependencies.

  Out of scope (deferred):

  - Navbar + Sidebar → Plan 5b layout shells.
  - Tabs underline+boxed variants, animated indicator, lazy mount panels.
  - DropdownMenuShortcut display, ContextMenu, CommandPalette.
  - Pagination items-per-page selector, route integration, jump-to-page input.

- 4676f98: Add 3 new components in the Navigation category (second half — completes the category alongside Plan 5a's Tabs / DropdownMenu / Breadcrumb / Pagination).

  Components (`@idcert/ui`):

  - `Sheet` compound — slide-in drawer built on Base UI Dialog. cva variant `side`: `top`, `right` (default), `bottom`, `left`. Sub-parts: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`. Default close-X icon button in top-right (opt-out via `showCloseButton={false}` on SheetContent). Reusable beyond Sidebar (filter panels, mobile cart, settings drawers).
  - `Navbar` compound — semantic `<nav>` shell. cva variant `position`: `static` (default), `sticky`, `fixed`. Sub-parts: `Navbar`, `NavbarBrand`, `NavbarContent`, `NavbarItem`, `NavbarActions`, `NavbarMobileToggle`. `NavbarItem asChild` for Next.js Link.
  - `Sidebar` compound — full app shell with state management. `SidebarProvider` (cookie persistence via `sidebar:state`, `Cmd/Ctrl+B` keyboard shortcut), 11 sub-parts (`Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`), and 2 hooks (`useSidebar`, `useIsMobile`). Variants: `side` (left/right), `variant` (sidebar/inset), `collapsible` (offcanvas/icon/none). Mobile mode auto-renders inside `Sheet`.

  No new dependencies.

  Out of scope (deferred):

  - Sidebar `floating` variant, nested groups, drag-to-resize handle, mobile drawer side="right".
  - Navbar mega-menu, customizable mobile breakpoint.
  - Sheet stacked, mobile swipe-to-close.
  - Customizable keyboard shortcut, alternative persistence backends, SSR cookie helper.

- 39eb8e8: Add 6 new components in the Data Display category (first half — Table is Plan 6b).

  Components (`@idcert/ui`):

  - `Badge` — pill `<span>` with 6 cva variants: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`. Exports `badgeVariants` for consumer override.
  - `Skeleton` — single styled `<div>` with `animate-pulse` + `bg-muted rounded-md`. Consumer dimensions via className. `aria-hidden` by default.
  - `Progress` — Base UI Progress wrapper. Linear bar. Accepts `value` (0-`max`) or `null` for indeterminate. Sub-parts (Track/Indicator/Value/Label) encapsulated; only `Progress` exported.
  - `List` compound — `<ul>` + `<li>` styled. Sub-parts: `List`, `ListItem`. `divider?: boolean` prop adds separator between items.
  - `EmptyState` compound — semantic empty-state pattern. 5 sub-parts: `EmptyState`, `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateAction`.
  - `Avatar` compound — Base UI Avatar wrapper. 4 sub-parts: `Avatar` (with cva size variants sm/md/lg/xl), `AvatarImage`, `AvatarFallback`, `AvatarGroup` (custom: stacks children with overlap, `max` prop truncates with "+N" fallback). Exports `avatarVariants`.

  No new dependencies.

  Out of scope (deferred):

  - `Table` (Plan 6b — sorting + selection + heavy custom logic).
  - Badge dot variant + removable, Skeleton shimmer + shape presets, Progress circular + label, List ordered + interactive, EmptyState illustrations, Avatar status indicator, AvatarGroup hover-expand.

- b2cc545: Add `Table` compound — pure semantic HTML primitive with styled sub-parts. Completes the Data Display category alongside Plan 6a.

  Components (`@idcert/ui`):

  - `Table` compound — semantic `<table>` wrapped in a scrollable `<div>` for horizontal overflow. 8 sub-parts: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`. Styled to match shadcn/ui Table primitive. `TableRow data-state="selected"` applies selection background — consumer manages selected state.

  No internal sorting/selection/pagination logic — consumer composes with own state or third-party library (TanStack Table, etc.). Storybook docs include sortable and selectable composition examples.

  No new dependencies.

  Out of scope (deferred):

  - Internal sorting / selection / pagination logic (use consumer state or external library).
  - TanStack Table integration helpers (future utility plan).
  - Column resizing, virtualization, sticky header utilities (consumer composes manually).

### Patch Changes

- Updated dependencies [099a40e]
  - @idcert/tokens@0.1.0
