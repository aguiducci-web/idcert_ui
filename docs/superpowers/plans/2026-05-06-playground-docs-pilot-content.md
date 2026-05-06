# Playground Docs Pilot Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author the first wave of real documentation content on top of the Plan A infrastructure: 4 foundations pages, 2 getting-started pages, 5 fully-written pilot components (Button, Input, Dialog, Form, Table), and 3 recipes migrated from the legacy smoke pages. Retire the placeholder `_stub.mdx`.

**Architecture:** Each pilot component pairs three artifacts — a sibling `<name>.examples.tsx` (named JSX exports), a refactored `<name>.stories.tsx` that re-uses those exports, and a `content/docs/components/<name>.mdx` page rendering all 7 standard sections. Foundations pages use two new helper components (`TokenGrid`, `PrimitiveColorRamp`) that read the live CSS variables. Recipes are MDX pages that import existing smoke-page-style flows from compositional building blocks already in `@idcert/ui`.

**Tech Stack:** Same as Plan A (`@next/mdx`, `react-hook-form`, `zod`, `date-fns`, `@idcert/ui`). No new dependencies.

**Spec reference:** `docs/superpowers/specs/2026-05-06-playground-component-docs-design.md`.

**Plan A baseline:** `docs/superpowers/plans/2026-05-06-playground-docs-infra.md` (commit `cef8d2d` and earlier on branch `feat/playground-docs-infra`). Plan B extends the same branch.

**Out of scope (Plan C):** Scaffolding the remaining 38 components, finalizing search-index wiring inside CommandMenu, Playwright e2e suite, README rewrite for external consumers.

---

## File Structure

### New components (`apps/playground/components/docs/`)

| Path | Responsibility |
|---|---|
| `TokenGrid.tsx` | Renders CSS variables in scope (color, radius, spacing, typography) as a grid with live swatches and resolved values. Reads `getComputedStyle(document.documentElement)`. |
| `PrimitiveColorRamp.tsx` | Shows a 50→950 ramp for a primitive color (neutral, brand, red, green, yellow). Click-to-copy hex. Reads from `@idcert/tokens`. |

### New `apps/playground/content/docs/` files

| Path | Content type |
|---|---|
| `getting-started/installation.mdx` | Setup snippets for Tailwind v4 + tokens + ThemeProvider. |
| `getting-started/theming.mdx` | Light/dark wiring + custom CSS-var override + theme switcher embed. |
| `foundations/colors.mdx` | TokenGrid for color tokens + 5 color ramps. |
| `foundations/typography.mdx` | Font tokens + size scale demos. |
| `foundations/spacing.mdx` | Tailwind spacing rulers. |
| `foundations/radius.mdx` | Radius variant squares. |
| `components/button.mdx` | Pilot. |
| `components/input.mdx` | Pilot. |
| `components/dialog.mdx` | Pilot. |
| `components/form.mdx` | Pilot. |
| `components/table.mdx` | Pilot. |
| `recipes/login-form.mdx` | Multi-component login form (migrated from `/forms`). |
| `recipes/data-dashboard.mdx` | Table + filters (migrated from `/data`). |
| `recipes/navigation.mdx` | Navbar + sidebar patterns (migrated from `/navigation`). |

### New `packages/ui/src/components/<name>/<name>.examples.tsx`

| Path | Owner task |
|---|---|
| `button/button.examples.tsx` | Replace placeholder from Plan A. Full set of variants, sizes, with-icon, disabled. |
| `input/input.examples.tsx` | Default, with label, with description, error state, disabled, types. |
| `dialog/dialog.examples.tsx` | Default, controlled, no close button, custom width. |
| `form/form.examples.tsx` | Login form, settings form, file upload. |
| `table/table.examples.tsx` | Default, with footer, with selection (CSS state demo). |

### Modifications

| Path | Change |
|---|---|
| `packages/ui/src/components/{button,input,dialog,form,table}/<name>.stories.tsx` | Refactor to import from `<name>.examples.tsx` (per spec Task 21 pattern from Plan A). |
| `apps/playground/app/page.tsx` | Redirect target changes from `/docs/_stub` to `/docs/getting-started/installation`. |
| `apps/playground/components/docs/DocsHeader.tsx` | Logo `<Link href>` updated to new redirect target. |
| `apps/playground/components/docs/CommandMenu.tsx` | "Plan C wires the index" copy stays — search wiring still deferred. |
| `apps/playground/content/docs/_stub.mdx` | DELETED in Task 19. |

---

## Conventions

- **Component MDX page anatomy** matches the Plan A spec: Hero → Import → Anatomy (compound only) → Examples → API Reference → Tokens → Accessibility. Optional `whenToUse` callout under hero (rendered via frontmatter).
- **Each `.examples.tsx` export** is a zero-prop named arrow function returning JSX. No `Meta`/`StoryObj` imports.
- **Each pilot component task is 3 sub-files**, but they share one commit per component (atomic).
- **Foundations and recipes pages** are committed individually.
- **MDX prose** is in English (per spec decision).
- **No tests required** for purely declarative MDX content; the existing Plan A test suite catches structural breakage.

---

## Task 1: TokenGrid component

**Files:**
- Create: `apps/playground/components/docs/TokenGrid.tsx`

- [ ] **Step 1: Implement**

```tsx
'use client'

import * as React from 'react'

type Scope = 'color' | 'radius' | 'spacing'

const SCOPES: Record<Scope, { label: string; tokens: string[] }> = {
  color: {
    label: 'Color',
    tokens: [
      '--background', '--foreground',
      '--card', '--card-foreground',
      '--primary', '--primary-foreground',
      '--secondary', '--secondary-foreground',
      '--muted', '--muted-foreground',
      '--accent', '--accent-foreground',
      '--destructive', '--destructive-foreground',
      '--border', '--input', '--ring',
    ],
  },
  radius: {
    label: 'Radius',
    tokens: ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl'],
  },
  spacing: {
    label: 'Spacing',
    tokens: ['--spacing-1', '--spacing-2', '--spacing-3', '--spacing-4', '--spacing-6', '--spacing-8'],
  },
}

export function TokenGrid({ scope }: { scope: Scope }) {
  const { tokens } = SCOPES[scope]
  const [resolved, setResolved] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const map: Record<string, string> = {}
    const styles = getComputedStyle(document.documentElement)
    for (const token of tokens) {
      map[token] = styles.getPropertyValue(token).trim()
    }
    setResolved(map)
  }, [tokens])

  return (
    <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tokens.map((token) => (
        <div
          key={token}
          className="flex items-center gap-3 rounded-md border border-border p-3"
        >
          <Swatch scope={scope} token={token} value={resolved[token]} />
          <div className="min-w-0 flex-1">
            <code className="block truncate font-mono text-sm">{token}</code>
            <span className="text-xs text-muted-foreground">
              {resolved[token] || '…'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function Swatch({ scope, token, value }: { scope: Scope; token: string; value?: string }) {
  if (scope === 'color') {
    return (
      <span
        aria-hidden
        className="h-10 w-10 shrink-0 rounded border border-border"
        style={{ backgroundColor: value ? `rgb(${value})` : undefined }}
      />
    )
  }
  if (scope === 'radius') {
    return (
      <span
        aria-hidden
        className="h-10 w-10 shrink-0 border border-border bg-muted"
        style={{ borderRadius: value || undefined }}
      />
    )
  }
  return (
    <span
      aria-hidden
      className="h-10 shrink-0 bg-muted"
      style={{ width: value || '0.25rem' }}
    />
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm --filter @idcert/playground typecheck
```

Expected: clean.

- [ ] **Step 3: Register in mdx-components.tsx**

Edit `apps/playground/mdx-components.tsx`. Add the import and entry alongside existing components.

```tsx
import { TokenGrid } from '@/components/docs/TokenGrid'
// ...
return {
  Hero,
  Example,
  CodeBlock,
  PropsTable,
  TokenList,
  TokenGrid,  // NEW
  Note,
  Warning,
  ...components,
}
```

- [ ] **Step 4: Commit**

```bash
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/components/docs/TokenGrid.tsx apps/playground/mdx-components.tsx
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "feat(playground): add TokenGrid for foundations pages"
```

---

## Task 2: PrimitiveColorRamp component

**Files:**
- Create: `apps/playground/components/docs/PrimitiveColorRamp.tsx`

- [ ] **Step 1: Implement**

```tsx
'use client'

import * as React from 'react'
import { primitives } from '@idcert/tokens'
import { useToast } from '@idcert/ui'

type Ramp = keyof typeof primitives.color

export function PrimitiveColorRamp({ ramp }: { ramp: Ramp }) {
  const colors = primitives.color[ramp] as Record<string, string>
  const toast = useToast()

  async function copy(hex: string) {
    await navigator.clipboard.writeText(hex)
    toast.add({ title: `Copied ${hex}` })
  }

  return (
    <div className="my-4">
      <h4 className="mb-2 text-sm font-semibold capitalize">{ramp}</h4>
      <div className="grid grid-cols-11 overflow-hidden rounded-md border border-border">
        {Object.entries(colors).map(([step, hex]) => (
          <button
            type="button"
            key={step}
            onClick={() => copy(hex)}
            aria-label={`Copy ${ramp}-${step} ${hex}`}
            className="flex aspect-square flex-col items-center justify-center text-[10px] font-mono transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            style={{ backgroundColor: hex, color: Number(step) >= 500 ? '#fff' : '#000' }}
          >
            <span>{step}</span>
            <span className="opacity-60">{hex}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm --filter @idcert/playground typecheck
```

If `useToast` import fails, double-check the export from `@idcert/ui`. It exists per Plan A baseline.

- [ ] **Step 3: Register in mdx-components.tsx**

Edit `apps/playground/mdx-components.tsx`. Add `PrimitiveColorRamp`:

```tsx
import { PrimitiveColorRamp } from '@/components/docs/PrimitiveColorRamp'
// ...
return {
  Hero, Example, CodeBlock, PropsTable, TokenList, TokenGrid,
  PrimitiveColorRamp,  // NEW
  Note, Warning,
  ...components,
}
```

- [ ] **Step 4: Commit**

```bash
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/components/docs/PrimitiveColorRamp.tsx apps/playground/mdx-components.tsx
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "feat(playground): add PrimitiveColorRamp with copy-to-clipboard"
```

---

## Task 3: foundations/colors.mdx

**Files:**
- Create: `apps/playground/content/docs/foundations/colors.mdx`

- [ ] **Step 1: Create file**

```mdx
---
title: Colors
description: Semantic color tokens with light and dark mode mappings, plus the underlying primitive color ramps.
category: foundations
---

The `@idcert/ui` color system has two layers: **semantic tokens** that components consume, and **primitives** that semantic tokens reference. Override semantic tokens in your CSS to retheme without touching component code.

## Semantic tokens

Each pair (`X` / `X-foreground`) forms a high-contrast surface. `--background` and `--foreground` are the page baseline; `--primary` and `--primary-foreground` drive the default brand surface. Switching to dark mode via `<ThemeProvider>` swaps the underlying values without changing the variable names.

<TokenGrid scope="color" />

## Primitive ramps

Primitives are the raw palette. They are **not** consumed directly by components — semantic tokens map to specific steps. Click any swatch to copy its hex.

<PrimitiveColorRamp ramp="neutral" />
<PrimitiveColorRamp ramp="brand" />
<PrimitiveColorRamp ramp="red" />
<PrimitiveColorRamp ramp="green" />
<PrimitiveColorRamp ramp="yellow" />

## Override the brand color

The simplest customization: redirect `--primary` to a different RGB triplet in your global CSS. The triplet format (`R G B` separated by spaces, no commas) is what Tailwind v4 expects so opacity modifiers like `bg-primary/80` continue to work.

<CodeBlock language="css">{`:root {
  --primary: 14 165 233;            /* sky-500 */
  --primary-foreground: 250 250 250;
}

.dark {
  --primary: 56 189 248;            /* sky-400 — slightly brighter for dark UIs */
  --primary-foreground: 12 74 110;  /* sky-900 */
}`}</CodeBlock>

## Override the entire scale

To rebrand fully, mirror the structure in `@idcert/tokens`. Either edit your consumer-side CSS or fork `@idcert/tailwind-config` and re-publish a project preset.

<Note>
Light/dark variables are scoped under `:root` and `.dark` respectively. The selector `.dark` is applied by `<ThemeProvider>` (via `next-themes`) on the `<html>` element. See the [Theming guide](/docs/getting-started/theming) for the full setup.
</Note>
```

- [ ] **Step 2: Build to refresh search index**

```bash
pnpm --filter @idcert/playground gen:search-index
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/content/docs/foundations/colors.mdx apps/playground/public/search-index.json
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(playground): foundations/colors page"
```

---

## Task 4: foundations/typography.mdx

**Files:**
- Create: `apps/playground/content/docs/foundations/typography.mdx`

- [ ] **Step 1: Create file**

```mdx
---
title: Typography
description: Font families and the type scale used across @idcert/ui components.
category: foundations
---

Typography sits on two CSS variables: `--font-sans` (used everywhere except code) and `--font-mono` (code blocks, prop tables, keyboard hints). The defaults are Inter and JetBrains Mono with system-font fallbacks for environments without web fonts.

## Font tokens

<CodeBlock language="css">{`:root {
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: JetBrains Mono, ui-monospace, SFMono-Regular, monospace;
}`}</CodeBlock>

## Type scale

The scale is Tailwind's defaults — there is no proprietary `text-display-2xl` or similar. Components compose the sizes you already know.

<table className="my-6 w-full text-sm">
  <thead className="border-b border-border">
    <tr>
      <th className="px-3 py-2 text-left font-medium">Class</th>
      <th className="px-3 py-2 text-left font-medium">Size / Line</th>
      <th className="px-3 py-2 text-left font-medium">Sample</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border"><td className="px-3 py-2 font-mono">text-xs</td><td className="px-3 py-2 text-muted-foreground">12 / 16</td><td className="px-3 py-2 text-xs">The quick brown fox</td></tr>
    <tr className="border-b border-border"><td className="px-3 py-2 font-mono">text-sm</td><td className="px-3 py-2 text-muted-foreground">14 / 20</td><td className="px-3 py-2 text-sm">The quick brown fox</td></tr>
    <tr className="border-b border-border"><td className="px-3 py-2 font-mono">text-base</td><td className="px-3 py-2 text-muted-foreground">16 / 24</td><td className="px-3 py-2 text-base">The quick brown fox</td></tr>
    <tr className="border-b border-border"><td className="px-3 py-2 font-mono">text-lg</td><td className="px-3 py-2 text-muted-foreground">18 / 28</td><td className="px-3 py-2 text-lg">The quick brown fox</td></tr>
    <tr className="border-b border-border"><td className="px-3 py-2 font-mono">text-xl</td><td className="px-3 py-2 text-muted-foreground">20 / 28</td><td className="px-3 py-2 text-xl">The quick brown fox</td></tr>
    <tr className="border-b border-border"><td className="px-3 py-2 font-mono">text-2xl</td><td className="px-3 py-2 text-muted-foreground">24 / 32</td><td className="px-3 py-2 text-2xl">The quick brown fox</td></tr>
    <tr><td className="px-3 py-2 font-mono">text-3xl</td><td className="px-3 py-2 text-muted-foreground">30 / 36</td><td className="px-3 py-2 text-3xl">The quick brown fox</td></tr>
  </tbody>
</table>

## Override the default font

Add an `@font-face` declaration plus override `--font-sans` (or `--font-mono`) in your global CSS.

<CodeBlock language="css">{`:root {
  --font-sans: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
}`}</CodeBlock>

If you load fonts via `next/font`, expose its CSS variable on `<html>` and reference it.

<CodeBlock language="tsx">{`import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}`}</CodeBlock>
```

- [ ] **Step 2: Refresh search index + commit**

```bash
pnpm --filter @idcert/playground gen:search-index
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/content/docs/foundations/typography.mdx apps/playground/public/search-index.json
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(playground): foundations/typography page"
```

---

## Task 5: foundations/spacing.mdx

**Files:**
- Create: `apps/playground/content/docs/foundations/spacing.mdx`

- [ ] **Step 1: Create file**

```mdx
---
title: Spacing
description: The spacing scale derives from Tailwind's 0.25rem step.
category: foundations
---

Spacing follows the Tailwind v4 default — every unit is `0.25rem` (4px at the base 16px font size). Components do not introduce custom spacing tokens; they compose `p-*`, `m-*`, `gap-*`, and `space-*` utilities directly. This keeps consumer overrides predictable: any utility you already know works.

## Visual scale

<TokenGrid scope="spacing" />

## Common patterns

- **Form fields** typically pair `space-y-4` between siblings and `gap-2` between label, control, and message.
- **Cards** use `p-6` interior padding with `gap-4` for stacked content.
- **Buttons** use `px-4 py-2` (default size), `px-3` (sm), `px-8` (lg), and `h-10 w-10` (icon).
- **Dialogs** use `p-6` with `gap-4` between header, body, and footer.

## Why no proprietary tokens

A custom spacing scale (`--space-md`, `--space-lg`, etc.) adds friction without buying determinism — Tailwind already enforces a strict scale and rejects arbitrary values. Using its scale directly means consumers can extend with `theme.extend.spacing` in standard fashion.

<Note>
If you need very large or very small values, use Tailwind's arbitrary syntax (`p-[36px]`, `gap-[0.625rem]`). Don't introduce one-off custom variables — they fragment the system.
</Note>
```

- [ ] **Step 2: Commit**

```bash
pnpm --filter @idcert/playground gen:search-index
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/content/docs/foundations/spacing.mdx apps/playground/public/search-index.json
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(playground): foundations/spacing page"
```

---

## Task 6: foundations/radius.mdx

**Files:**
- Create: `apps/playground/content/docs/foundations/radius.mdx`

- [ ] **Step 1: Create file**

```mdx
---
title: Radius
description: Corner radius tokens used by buttons, cards, dialogs, inputs, and other surfaces.
category: foundations
---

Four radius tokens cover the common cases: small (chips, badges, code pills), medium (default surfaces — buttons, inputs, cards), large (dialogs, sheets), extra large (page-level hero panels). Setting one variable changes every surface keyed off it.

<TokenGrid scope="radius" />

## Component mapping

| Token | Components |
|---|---|
| `--radius-sm` | `Badge`, code chips inside `PropsTable`, `Skeleton` |
| `--radius-md` | `Button`, `Input`, `Card`, `Alert`, `Avatar`, `Tooltip` |
| `--radius-lg` | `Dialog`, `AlertDialog`, `Sheet`, `Popover` |
| `--radius-xl` | Reserved for future hero panels — not currently used |

## Override

To soften or sharpen the entire system, redefine the four variables in your global CSS:

<CodeBlock language="css">{`:root {
  --radius-sm: 0;
  --radius-md: 0.125rem;
  --radius-lg: 0.25rem;
  --radius-xl: 0.5rem;
}`}</CodeBlock>

For a single component override, prefer Tailwind's class API: `<Button className="rounded-full">…</Button>` keeps the change local.
```

- [ ] **Step 2: Commit**

```bash
pnpm --filter @idcert/playground gen:search-index
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/content/docs/foundations/radius.mdx apps/playground/public/search-index.json
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(playground): foundations/radius page"
```

---

## Task 7: getting-started/installation.mdx

**Files:**
- Create: `apps/playground/content/docs/getting-started/installation.mdx`

- [ ] **Step 1: Create file**

```mdx
---
title: Installation
description: Install @idcert/ui in a Next.js 14 + Tailwind v4 application.
category: getting-started
---

`@idcert/ui` ships as three packages on the internal Verdaccio registry. The `ui` package is the React component library, `tokens` provides CSS variables, and `tailwind-config` is a Tailwind v4 preset that wires the variables to utility classes.

## Prerequisites

- Node ≥ 18
- React 18+ and Next.js 14+
- Tailwind CSS v4

## 1. Install packages

<CodeBlock language="bash">{`pnpm add @idcert/ui @idcert/tokens
pnpm add -D @idcert/tailwind-config tailwindcss postcss autoprefixer`}</CodeBlock>

## 2. Wire Tailwind

For Tailwind v4 (CSS-first preset), import the preset into your global stylesheet. There is no `tailwind.config.js` needed — the preset is the configuration.

`app/globals.css`:

<CodeBlock language="css">{`@import 'tailwindcss';
@import '@idcert/tokens/styles.css';
@import '@idcert/tailwind-config/preset.css';

@source '../node_modules/@idcert/ui/dist';`}</CodeBlock>

The `@source` directive tells Tailwind to scan the published `dist` for utility usage. Without it, the JIT compiler will purge classes that components use internally.

## 3. Wrap your root layout

`app/layout.tsx`:

<CodeBlock language="tsx">{`import './globals.css'
import { ThemeProvider, ToastProvider, Toaster } from '@idcert/ui'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>
          <ToastProvider>
            {children}
            <Toaster position="top-right" />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}`}</CodeBlock>

`suppressHydrationWarning` is required because `ThemeProvider` (under the hood: `next-themes`) sets the `class` on `<html>` after hydration.

## 4. First component

<CodeBlock language="tsx">{`import { Button } from '@idcert/ui'

export default function Home() {
  return <Button>Hello world</Button>
}`}</CodeBlock>

## What's next

- [Theming](/docs/getting-started/theming) — switch between light/dark and override colors.
- [Components](/docs/components/button) — start with `Button` and explore the catalog from the sidebar.
- [Foundations](/docs/foundations/colors) — token model, type scale, spacing, radius.
```

- [ ] **Step 2: Commit**

```bash
pnpm --filter @idcert/playground gen:search-index
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/content/docs/getting-started/installation.mdx apps/playground/public/search-index.json
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(playground): getting-started/installation page"
```

---

## Task 8: getting-started/theming.mdx

**Files:**
- Create: `apps/playground/content/docs/getting-started/theming.mdx`

- [ ] **Step 1: Create file**

```mdx
---
title: Theming
description: Light / dark mode wiring and how to override the design tokens.
category: getting-started
---

`@idcert/ui` ships a `ThemeProvider` that wraps `next-themes`. It sets a `class="dark"` on `<html>` when dark mode is active; the Tailwind preset has matching `@custom-variant dark (&:where(.dark, .dark *))` so dark-mode utilities work out of the box.

## Wiring the provider

`ThemeProvider` is already part of the standard root layout from [Installation](/docs/getting-started/installation). It accepts the `next-themes` props.

<CodeBlock language="tsx">{`import { ThemeProvider } from '@idcert/ui'

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>`}</CodeBlock>

## Reading and changing the theme

The `useTheme` hook is re-exported from `@idcert/ui`.

<CodeBlock language="tsx">{`'use client'

import { useTheme } from '@idcert/ui'
import { Button } from '@idcert/ui'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="outline"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </Button>
  )
}`}</CodeBlock>

## Overriding tokens for a custom theme

Add a third theme by defining a class selector with the variables you want to override.

<CodeBlock language="css">{`:root {
  --background: 250 250 250;
  --foreground: 23 23 23;
  --primary: 14 165 233;
  --primary-foreground: 250 250 250;
  /* ...other semantic tokens */
}

.dark {
  --background: 10 10 10;
  --foreground: 250 250 250;
  --primary: 56 189 248;
  --primary-foreground: 12 74 110;
}

.high-contrast {
  --background: 0 0 0;
  --foreground: 255 255 255;
  --primary: 255 255 0;
  --primary-foreground: 0 0 0;
}`}</CodeBlock>

Apply by setting `attribute="data-theme"` on the provider and selecting via `[data-theme="high-contrast"]` instead of `.high-contrast` if you want to support multiple non-light/dark themes side by side.

## Why CSS variables, not Tailwind classes

The semantic layer is a single CSS-variable indirection: components compose `bg-primary` (a Tailwind utility) and that utility resolves through `@theme` to `rgb(var(--primary))`. Result: changing one variable retones the whole library; no Tailwind config edit, no rebuild.

<Warning>
Don't override colors inside individual component class names (e.g., `<Button className="bg-blue-600">`). It works, but breaks the dark mode pairing because `--primary-foreground` won't follow. Override the variable instead.
</Warning>
```

- [ ] **Step 2: Commit**

```bash
pnpm --filter @idcert/playground gen:search-index
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/content/docs/getting-started/theming.mdx apps/playground/public/search-index.json
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(playground): getting-started/theming page"
```

---

## Task 9: Pilot — Button

**Files:**
- Replace: `packages/ui/src/components/button/button.examples.tsx` (Plan A's placeholder)
- Modify: `packages/ui/src/components/button/button.stories.tsx`
- Create: `apps/playground/content/docs/components/button.mdx`

- [ ] **Step 1: Replace examples.tsx with a complete set**

```tsx
import { Trash, Plus, Loader2 } from 'lucide-react'
import { Button } from './index.js'

export const Default = () => <Button>Click me</Button>

export const AllVariants = () => (
  <div className="flex flex-wrap gap-3">
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
)

export const Sizes = () => (
  <div className="flex items-center gap-3">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon" aria-label="Add">
      <Plus />
    </Button>
  </div>
)

export const WithIcon = () => (
  <div className="flex flex-wrap gap-3">
    <Button>
      <Plus /> New item
    </Button>
    <Button variant="destructive">
      <Trash /> Delete
    </Button>
  </div>
)

export const Disabled = () => (
  <div className="flex flex-wrap gap-3">
    <Button disabled>Disabled</Button>
    <Button variant="destructive" disabled>Disabled</Button>
  </div>
)

export const Loading = () => (
  <Button disabled>
    <Loader2 className="animate-spin" />
    Saving…
  </Button>
)

export const AsLink = () => (
  <Button asChild>
    <a href="https://idcert.io">Open in tab</a>
  </Button>
)
```

- [ ] **Step 2: Refactor stories.tsx to import from examples**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './index.js'
import * as examples from './button.examples.js'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Button' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete' } }
export const Outline: Story = { args: { variant: 'outline' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Link: Story = { args: { variant: 'link' } }
export const Sizes: Story = { render: examples.Sizes }
export const WithIcon: Story = { render: examples.WithIcon }
export const Disabled: Story = { render: examples.Disabled }
export const Loading: Story = { render: examples.Loading }
export const AllVariants: Story = { render: examples.AllVariants }
```

- [ ] **Step 3: Create button.mdx**

`apps/playground/content/docs/components/button.mdx`:

````mdx
---
title: Button
description: Trigger primary actions, form submissions, and links.
component: Button
package: '@idcert/ui'
category: primitives
status: stable
whenToUse: |
  Use Button for actions ("Save", "Delete", "Submit"). For navigation between pages,
  use a regular `<a>` (or `<Link>`) styled with `variant="link"`. For toggling state,
  prefer `Switch` or `Checkbox`.
---

import { Button } from '@idcert/ui'
import {
  Default, AllVariants, Sizes, WithIcon, Disabled, Loading, AsLink,
} from '@idcert/ui/components/button/examples'

<Hero>
  <Default />
</Hero>

## Import

<CodeBlock language="tsx">{`import { Button } from '@idcert/ui'`}</CodeBlock>

## Examples

### Variants

Six visual styles; pick by intent, not by color. `default` is for the primary action on screen, `destructive` for irreversible operations, `outline` and `secondary` for non-primary actions, `ghost` for low-emphasis affordances inside dense UI, and `link` for in-prose actions that look like text links.

<Example name="AllVariants" component="Button"><AllVariants /></Example>

### Sizes

Four sizes. `icon` is square (`h-10 w-10`) and is the only one that expects a single SVG child. Always pair `icon` with an `aria-label`.

<Example name="Sizes" component="Button"><Sizes /></Example>

### With icons

Place a Lucide (or any SVG) icon as the first child. The `[&_svg]:size-4` rule on the button base styles all child SVGs to 16×16 automatically.

<Example name="WithIcon" component="Button"><WithIcon /></Example>

### Disabled

`disabled` removes the button from tab order and grays it out. For a "loading" state where the button should still announce activity to screen readers, prefer the loading example below.

<Example name="Disabled" component="Button"><Disabled /></Example>

### Loading

There is no built-in loading variant — compose with `disabled` plus a spinning icon. Optionally include `aria-live="polite"` on a status node nearby if the action takes more than a second.

<Example name="Loading" component="Button"><Loading /></Example>

### As a link (asChild)

Use `asChild` to render the styles on a different element. The child becomes the rendered tag while inheriting all classes and ARIA props.

<Example name="AsLink" component="Button"><AsLink /></Example>

## API Reference

<PropsTable component="Button" />

## Tokens

<TokenList component="Button" tokens={[
  '--primary',
  '--primary-foreground',
  '--destructive',
  '--destructive-foreground',
  '--secondary',
  '--secondary-foreground',
  '--accent',
  '--accent-foreground',
  '--ring',
  '--radius-md',
]} />

## Accessibility

- Renders a native `<button>` element by default. Native keyboard activation (`Enter`, `Space`) is preserved automatically.
- Use `asChild` to compose with other interactive elements (e.g., `<a>` for links, `<Link>` from Next.js). The child element receives the styles and any ARIA props passed to `<Button>`.
- `disabled` removes the element from tab order. If you need to keep it focusable but inert (e.g., to attach a tooltip explaining why it's disabled), set `aria-disabled="true"` and prevent the click handler manually.
- The `icon` size variant must be paired with `aria-label` since it has no visible text.
- The focus ring is `2px` solid `--ring` with a `2px` offset against `--background`. It uses `focus-visible` so it appears for keyboard navigation but not on click — preserve this behaviour when restyling.
- Do not change the `role` attribute. If you need a toggle, use `Switch` or `ToggleButton` (Plan B addition) instead.
````

- [ ] **Step 4: Verify build**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground gen:examples-source
pnpm --filter @idcert/playground gen:search-index
pnpm --filter @idcert/playground build
```

Expected: build succeeds, `/docs/components/button` is statically generated.

- [ ] **Step 5: Commit**

```bash
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add packages/ui/src/components/button apps/playground/content/docs/components/button.mdx apps/playground/public
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(button): pilot component documentation"
```

---

## Task 10: Pilot — Input

**Files:**
- Create: `packages/ui/src/components/input/input.examples.tsx`
- Modify: `packages/ui/src/components/input/input.stories.tsx`
- Create: `apps/playground/content/docs/components/input.mdx`

- [ ] **Step 1: Create input.examples.tsx**

```tsx
import { Input } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => <Input placeholder="Enter your name" />

export const WithLabel = () => (
  <div className="grid w-72 gap-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="you@example.com" />
  </div>
)

export const WithDescription = () => (
  <div className="grid w-72 gap-1.5">
    <Label htmlFor="password">Password</Label>
    <Input id="password" type="password" />
    <p className="text-xs text-muted-foreground">At least 12 characters.</p>
  </div>
)

export const ErrorState = () => (
  <div className="grid w-72 gap-1.5">
    <Label htmlFor="email-bad">Email</Label>
    <Input
      id="email-bad"
      type="email"
      defaultValue="not-an-email"
      aria-invalid
      className="border-destructive focus-visible:ring-destructive"
    />
    <p className="text-xs text-destructive">Enter a valid email address.</p>
  </div>
)

export const Disabled = () => <Input placeholder="Disabled" disabled />

export const Types = () => (
  <div className="grid w-72 gap-3">
    <Input type="text" placeholder="Text" />
    <Input type="email" placeholder="Email" />
    <Input type="password" placeholder="Password" />
    <Input type="number" placeholder="Number" />
    <Input type="search" placeholder="Search" />
    <Input type="file" />
  </div>
)
```

- [ ] **Step 2: Refactor stories.tsx**

Read existing `packages/ui/src/components/input/input.stories.tsx` to preserve any existing argTypes structure. Then replace with:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './index.js'
import * as examples from './input.examples.js'

const meta = {
  title: 'Forms/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithLabel: Story = { render: examples.WithLabel }
export const WithDescription: Story = { render: examples.WithDescription }
export const ErrorState: Story = { render: examples.ErrorState }
export const Disabled: Story = { args: { disabled: true, placeholder: 'Disabled' } }
export const Types: Story = { render: examples.Types }
```

- [ ] **Step 3: Create input.mdx**

````mdx
---
title: Input
description: Single-line text input.
component: Input
package: '@idcert/ui'
category: forms
status: stable
whenToUse: |
  Use Input for short single-line text. For multi-line text, use `Textarea`.
  For options from a fixed set, use `Select` or `Radio`. For freeform text with
  validation, pair Input with `Form` and a Zod resolver.
---

import { Input } from '@idcert/ui'
import {
  Default, WithLabel, WithDescription, ErrorState, Disabled, Types,
} from '@idcert/ui/components/input/examples'

<Hero><Default /></Hero>

## Import

<CodeBlock language="tsx">{`import { Input } from '@idcert/ui'`}</CodeBlock>

## Examples

### With a label

`Input` does not include a label. Pair with the `<Label>` primitive (or with `<FormLabel>` inside a `<Form>`). Always link the label to the input via `htmlFor` / `id`.

<Example name="WithLabel" component="Input"><WithLabel /></Example>

### With a description

Add a sibling `<p>` with `text-xs text-muted-foreground`. Reference it from the input via `aria-describedby` if the description is essential.

<Example name="WithDescription" component="Input"><WithDescription /></Example>

### Error state

Set `aria-invalid` and add `border-destructive` plus a destructive focus ring. The error message gets `text-destructive` and should appear immediately below the input.

<Example name="ErrorState" component="Input"><ErrorState /></Example>

### Disabled

`disabled` removes the field from tab order and lowers opacity to 50%.

<Example name="Disabled" component="Input"><Disabled /></Example>

### Types

`type` is the standard HTML attribute. Useful values: `text` (default), `email`, `password`, `number`, `search`, `tel`, `url`, `file`. Browsers attach format-aware keyboards on mobile.

<Example name="Types" component="Input"><Types /></Example>

## API Reference

<PropsTable component="Input" />

## Tokens

<TokenList component="Input" tokens={[
  '--background',
  '--input',
  '--ring',
  '--muted-foreground',
  '--destructive',
  '--radius-md',
]} />

## Accessibility

- Always pair with a `<Label>` (or `<FormLabel>`). Visually hidden labels are acceptable when the field is unambiguous from context (search inputs, toolbar inputs).
- `aria-invalid` on the input + `role="alert"` on the inline error message exposes the error to screen readers without requiring focus to move.
- `disabled` should never be the primary signal for "not editable". For a value the user shouldn't change but should see, render plain text instead — `disabled` text is hard to read and skipped by tab.
- For password fields, prefer `type="password"` with a separate visibility toggle (button + `type` swap on click). Don't replace it with a custom obfuscator that breaks browser password managers.
- Native HTML constraints (`required`, `pattern`, `minLength`, `maxLength`) are respected. They run before the parent `<Form>` resolver — set `noValidate` on the `<form>` element to defer validation entirely to react-hook-form when using a Zod resolver.
````

- [ ] **Step 4: Build + commit**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground gen:examples-source
pnpm --filter @idcert/playground gen:search-index
pnpm --filter @idcert/playground build

git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add packages/ui/src/components/input apps/playground/content/docs/components/input.mdx apps/playground/public
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(input): pilot component documentation"
```

---

## Task 11: Pilot — Dialog

**Files:**
- Create: `packages/ui/src/components/dialog/dialog.examples.tsx`
- Modify: `packages/ui/src/components/dialog/dialog.stories.tsx`
- Create: `apps/playground/content/docs/components/dialog.mdx`

- [ ] **Step 1: Create dialog.examples.tsx**

```tsx
import * as React from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
  <Dialog>
    <DialogTrigger render={<Button>Open dialog</Button>} />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. All linked data will be permanently removed.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <DialogClose render={<Button variant="destructive">Delete</Button>} />
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export const Controlled = () => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open programmatically</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled dialog</DialogTitle>
            <DialogDescription>
              Open state lives in your component, not inside the trigger.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const NoCloseButton = () => (
  <Dialog>
    <DialogTrigger render={<Button>Open</Button>} />
    <DialogContent showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>Confirm migration</DialogTitle>
        <DialogDescription>
          You must accept or reject — there is no implicit dismiss.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Reject</Button>} />
        <DialogClose render={<Button>Accept</Button>} />
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export const CustomWidth = () => (
  <Dialog>
    <DialogTrigger render={<Button>Open wide dialog</Button>} />
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Detailed report</DialogTitle>
        <DialogDescription>
          Override the default `max-w-lg` with any Tailwind width utility.
        </DialogDescription>
      </DialogHeader>
      <p className="text-sm">…content…</p>
    </DialogContent>
  </Dialog>
)
```

- [ ] **Step 2: Refactor stories.tsx**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Dialog } from './index.js'
import * as examples from './dialog.examples.js'

const meta = {
  title: 'Overlays/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: examples.Default }
export const Controlled: Story = { render: examples.Controlled }
export const NoCloseButton: Story = { render: examples.NoCloseButton }
export const CustomWidth: Story = { render: examples.CustomWidth }
```

- [ ] **Step 3: Create dialog.mdx**

````mdx
---
title: Dialog
description: A modal that interrupts the page to ask for confirmation or input.
component: Dialog
package: '@idcert/ui'
category: overlays
status: stable
whenToUse: |
  Use Dialog when the user must respond before continuing (confirmations, edits in
  context). For destructive irreversible actions, prefer `AlertDialog` — it uses
  stronger focus management and an alert role. For non-modal side panels, use `Sheet`.
---

import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogFooter, DialogTitle, DialogDescription, DialogClose,
} from '@idcert/ui'
import {
  Default, Controlled, NoCloseButton, CustomWidth,
} from '@idcert/ui/components/dialog/examples'

<Hero><Default /></Hero>

## Import

<CodeBlock language="tsx">{`import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@idcert/ui'`}</CodeBlock>

## Anatomy

Dialog is a compound. Compose:

```
<Dialog>
  <DialogTrigger />
  <DialogContent>
    <DialogHeader>
      <DialogTitle />
      <DialogDescription />
    </DialogHeader>
    {/* body */}
    <DialogFooter>
      <DialogClose />
    </DialogFooter>
  </DialogContent>
</Dialog>
```

`DialogContent` renders a `Portal` + `Backdrop` + the focused panel. `DialogTitle` and `DialogDescription` are required for accessibility — `Base UI` will warn at runtime if they are missing.

### Sub-component props

#### Dialog

<PropsTable component="Dialog" />

#### DialogContent

<PropsTable component="DialogContent" />

#### DialogTitle

<PropsTable component="DialogTitle" />

#### DialogDescription

<PropsTable component="DialogDescription" />

## Examples

### Basic confirmation

The most common pattern: `DialogTrigger` renders a `Button` via `render={<Button />}`, body has a destructive primary, footer has Cancel + Confirm.

<Example name="Default" component="Dialog"><Default /></Example>

### Controlled

Pass `open` and `onOpenChange` to drive the state from your component. Useful when opening the dialog programmatically (e.g., after a server-side validation failure).

<Example name="Controlled" component="Dialog"><Controlled /></Example>

### No close button

Set `showCloseButton={false}` on `DialogContent` to remove the corner X. Pair with explicit footer actions so the dialog cannot be dismissed by misclick.

<Example name="NoCloseButton" component="Dialog"><NoCloseButton /></Example>

### Custom width

`DialogContent` defaults to `max-w-lg`. Override with any Tailwind width utility on `className`.

<Example name="CustomWidth" component="Dialog"><CustomWidth /></Example>

## Tokens

<TokenList component="Dialog" tokens={[
  '--background',
  '--foreground',
  '--border',
  '--muted-foreground',
  '--ring',
  '--radius-lg',
]} />

## Accessibility

- Built on Base UI's `Dialog` primitive. Inherits ARIA roles (`role="dialog"`, `aria-modal="true"`), focus trap, and `Esc` to close.
- `DialogTitle` and `DialogDescription` are wired to `aria-labelledby` and `aria-describedby` automatically. **Always include both**; if visually unnecessary, wrap in `<VisuallyHidden>` from `@base-ui/react`.
- Initial focus moves to the first focusable element inside `DialogContent`. To override, render a button at the top with `autoFocus`.
- Returning focus: when the dialog closes, focus restores to the element that opened it (`DialogTrigger` by default, or the element that received the controlled-open click).
- Backdrop click closes the dialog. To make the dialog mandatory (escape-hatch only via explicit footer action), pass `dismissible={false}` on `Dialog`.
- For destructive actions, prefer `AlertDialog` — it uses `role="alertdialog"` and stronger semantics for screen readers.
````

- [ ] **Step 4: Build + commit**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground gen:examples-source
pnpm --filter @idcert/playground gen:search-index
pnpm --filter @idcert/playground build

git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add packages/ui/src/components/dialog apps/playground/content/docs/components/dialog.mdx apps/playground/public
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(dialog): pilot component documentation"
```

---

## Task 12: Pilot — Form

**Files:**
- Create: `packages/ui/src/components/form/form.examples.tsx`
- Modify: `packages/ui/src/components/form/form.stories.tsx`
- Create: `apps/playground/content/docs/components/form.mdx`

- [ ] **Step 1: Create form.examples.tsx**

```tsx
'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage,
} from './index.js'
import { Input } from '../input/index.js'
import { Switch } from '../switch/index.js'
import { Button } from '../button/index.js'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  remember: z.boolean(),
})

export const Default = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })
  const [submitted, setSubmitted] = React.useState<unknown>(null)
  return (
    <div className="w-full max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((v) => setSubmitted(v))} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormDescription>Never shared.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormLabel>Remember me</FormLabel>
              </FormItem>
            )}
          />
          <Button type="submit">Sign in</Button>
        </form>
      </Form>
      {submitted ? (
        <pre className="mt-4 rounded-md bg-muted p-3 text-xs">{JSON.stringify(submitted, null, 2)}</pre>
      ) : null}
    </div>
  )
}

export const FieldErrorState = () => {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'not-an-email', password: 'short', remember: false },
    mode: 'onChange',
  })
  React.useEffect(() => { form.trigger() }, [form])
  return (
    <div className="w-full max-w-sm">
      <Form {...form}>
        <form className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}
```

- [ ] **Step 2: Refactor stories.tsx (read existing first to preserve title/structure)**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as examples from './form.examples.js'

const meta = {
  title: 'Forms/Form',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: examples.Default }
export const FieldErrorState: Story = { render: examples.FieldErrorState }
```

- [ ] **Step 3: Create form.mdx**

````mdx
---
title: Form
description: react-hook-form integration with @idcert/ui inputs and Zod validation.
component: Form
package: '@idcert/ui'
category: forms
status: stable
whenToUse: |
  Use Form whenever you have more than two related fields or any non-trivial validation.
  For a single search input, just render `<Input>` directly. Form provides accessible
  error wiring and integrates with Zod (or any Resolver supported by react-hook-form).
---

import {
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage,
} from '@idcert/ui'
import { Default, FieldErrorState } from '@idcert/ui/components/form/examples'

<Hero><Default /></Hero>

## Import

<CodeBlock language="tsx">{`import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@idcert/ui'`}</CodeBlock>

You also need react-hook-form and (typically) Zod:

<CodeBlock language="bash">{`pnpm add react-hook-form zod @hookform/resolvers`}</CodeBlock>

## Anatomy

Form is a deeply compound component. The hierarchy:

```
<Form {...useForm()}>
  <form onSubmit={form.handleSubmit(...)}>
    <FormField control name render={({ field }) => (
      <FormItem>
        <FormLabel />
        <FormControl>{/* your input */}</FormControl>
        <FormDescription />
        <FormMessage />
      </FormItem>
    )} />
  </form>
</Form>
```

`Form` is `FormProvider` from react-hook-form re-exported. `FormField` wires a `Controller`. `FormItem` provides a stable `id` so `FormLabel`, `FormControl`, `FormDescription`, and `FormMessage` can link via `htmlFor`/`aria-describedby` automatically.

### Sub-component props

#### FormField

<PropsTable component="FormField" />

#### FormItem

<PropsTable component="FormItem" />

#### FormLabel

<PropsTable component="FormLabel" />

#### FormControl

<PropsTable component="FormControl" />

#### FormDescription

<PropsTable component="FormDescription" />

#### FormMessage

<PropsTable component="FormMessage" />

## Examples

### Login form

A complete login flow with email + password + remember-me, validated by Zod, submitted on click.

<Example name="Default" component="Form"><Default /></Example>

### Showing field errors

When validation fails, `FormMessage` renders the error text in `text-destructive`. The input's `aria-invalid` and `aria-describedby` are set automatically.

<Example name="FieldErrorState" component="Form"><FieldErrorState /></Example>

## API Reference

#### Form

<PropsTable component="Form" />

## Tokens

<TokenList component="Form" tokens={[
  '--foreground',
  '--muted-foreground',
  '--destructive',
  '--ring',
  '--border',
]} />

## Accessibility

- Each `FormItem` generates a unique id used for `<FormLabel htmlFor>`, `<FormControl id>`, `<FormDescription id>`, and `<FormMessage id>`. `FormControl` automatically sets `aria-describedby` to include description and message ids.
- When validation fails, `FormControl` sets `aria-invalid` on the inner element; `FormMessage` renders inside the `aria-describedby` chain.
- Submit handler typing: `form.handleSubmit(onValid, onInvalid?)`. `onValid` receives the typed values; `onInvalid` receives errors. Always wire `onInvalid` to a focus call (`form.setFocus('field')`) for the first error so screen readers announce it.
- Native browser validation runs **before** the resolver. Set `noValidate` on the `<form>` element to defer entirely to react-hook-form (recommended when using Zod).
- For dynamic field arrays, use react-hook-form's `useFieldArray`; it integrates with `FormField` without modification.
- Submit on Enter: native `<form>` behaviour. To prevent it (e.g., search-as-you-type), set `onSubmit={(e) => e.preventDefault()}` and call `form.handleSubmit` from a `useEffect` keyed on `form.formState.isValid`.
````

- [ ] **Step 4: Build + commit**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground gen:examples-source
pnpm --filter @idcert/playground gen:search-index
pnpm --filter @idcert/playground build

git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add packages/ui/src/components/form apps/playground/content/docs/components/form.mdx apps/playground/public
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(form): pilot component documentation"
```

---

## Task 13: Pilot — Table

**Files:**
- Create: `packages/ui/src/components/table/table.examples.tsx`
- Modify: `packages/ui/src/components/table/table.stories.tsx`
- Create: `apps/playground/content/docs/components/table.mdx`

- [ ] **Step 1: Create table.examples.tsx**

```tsx
import {
  Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell,
} from './index.js'

const invoices = [
  { id: 'INV-001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
  { id: 'INV-002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  { id: 'INV-003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
  { id: 'INV-004', status: 'Paid', method: 'Credit Card', amount: '$450.00' },
]

export const Default = () => (
  <div className="w-full max-w-2xl">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell className="font-mono">{inv.id}</TableCell>
            <TableCell>{inv.status}</TableCell>
            <TableCell>{inv.method}</TableCell>
            <TableCell className="text-right">{inv.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)

export const WithFooter = () => (
  <div className="w-full max-w-2xl">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell className="font-mono">{inv.id}</TableCell>
            <TableCell className="text-right">{inv.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-right">$1,200.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
)

export const SelectedRow = () => (
  <div className="w-full max-w-2xl">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv, i) => (
          <TableRow key={inv.id} data-state={i === 1 ? 'selected' : undefined}>
            <TableCell className="font-mono">{inv.id}</TableCell>
            <TableCell>{inv.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)
```

- [ ] **Step 2: Refactor stories.tsx**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './index.js'
import * as examples from './table.examples.js'

const meta = {
  title: 'Data/Table',
  component: Table,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: examples.Default }
export const WithFooter: Story = { render: examples.WithFooter }
export const SelectedRow: Story = { render: examples.SelectedRow }
```

- [ ] **Step 3: Create table.mdx**

````mdx
---
title: Table
description: A styled HTML table with header, body, footer, and row selection states.
component: Table
package: '@idcert/ui'
category: data
status: stable
whenToUse: |
  Use Table for tabular data — multiple rows that share the same columns.
  For a single key-value object, prefer a description list (`<dl>`).
  For sortable, filterable, paginated data grids, compose Table with `Pagination`,
  `Input` for search, and `DropdownMenu` for column controls — there is no built-in
  data-grid abstraction, by design.
---

import {
  Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption,
} from '@idcert/ui'
import { Default, WithFooter, SelectedRow } from '@idcert/ui/components/table/examples'

<Hero><Default /></Hero>

## Import

<CodeBlock language="tsx">{`import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@idcert/ui'`}</CodeBlock>

## Anatomy

Mirrors the native HTML table elements with consistent styles.

```
<Table>
  <TableCaption />        {/* optional, screen-reader accessible name */}
  <TableHeader>
    <TableRow>
      <TableHead />
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell />
    </TableRow>
  </TableBody>
  <TableFooter />         {/* optional */}
</Table>
```

### Sub-component props

#### Table

<PropsTable component="Table" />

#### TableHeader

<PropsTable component="TableHeader" />

#### TableRow

<PropsTable component="TableRow" />

#### TableCell

<PropsTable component="TableCell" />

#### TableHead

<PropsTable component="TableHead" />

## Examples

### Basic

<Example name="Default" component="Table"><Default /></Example>

### With a footer

`TableFooter` rows have a `bg-muted/50` background and a top border, ideal for totals.

<Example name="WithFooter" component="Table"><WithFooter /></Example>

### Selected row

Set `data-state="selected"` on `TableRow` to highlight it. This is intentionally CSS-driven so you can derive selection from any state container — local React state, URL params, server-driven flags.

<Example name="SelectedRow" component="Table"><SelectedRow /></Example>

## Tokens

<TokenList component="Table" tokens={[
  '--border',
  '--muted',
  '--muted-foreground',
  '--foreground',
]} />

## Accessibility

- Renders semantic table elements (`<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`). Screen readers announce row/column relationships natively.
- For column headers, use `TableHead` (renders `<th scope="col">`). For row headers (e.g., the leftmost identifier column), wrap that cell in a `<th scope="row">` manually — there is no `TableRowHead` component.
- Provide a `TableCaption` for tables that aren't otherwise labelled. The caption is visually below the table by default; for screen-reader-only context, wrap in `<VisuallyHidden>`.
- Sortable columns: render a `Button` (variant `ghost`) inside the `TableHead` with the column name and sort icon. Use `aria-sort="ascending" | "descending" | "none"` on the `<th>` so assistive tech announces the state.
- Selection: pair `data-state="selected"` with `aria-selected="true"` on the row. For multi-select with a checkbox column, the checkbox itself can be the source of truth — `aria-selected` on the row is helpful but not required when the checkbox is announced.
- Don't make non-cell interactive elements (whole-row clickable). Use a focused button or link in a dedicated cell.
````

- [ ] **Step 4: Build + commit**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground gen:examples-source
pnpm --filter @idcert/playground gen:search-index
pnpm --filter @idcert/playground build

git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add packages/ui/src/components/table apps/playground/content/docs/components/table.mdx apps/playground/public
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(table): pilot component documentation"
```

---

## Task 14: Recipe — Login form

**Files:**
- Create: `apps/playground/content/docs/recipes/login-form.mdx`

- [ ] **Step 1: Create file**

````mdx
---
title: Login form
description: Email + password + remember-me, validated end-to-end with Zod.
category: recipes
---

A login form combines `Form`, `Input`, `Switch`, and `Button` with `react-hook-form` + Zod. The same pattern works for any authenticated workflow: signup, password reset, account settings.

import { Default as LoginForm } from '@idcert/ui/components/form/examples'

<Hero><LoginForm /></Hero>

## Full source

<CodeBlock language="tsx">{`'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage,
  Input, Switch, Button,
} from '@idcert/ui'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  remember: z.boolean(),
})

type Values = z.infer<typeof schema>

export function LoginForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
  })

  async function onSubmit(values: Values) {
    // call your auth endpoint
    await fetch('/api/login', { method: 'POST', body: JSON.stringify(values) })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" autoComplete="email" {...field} /></FormControl>
              <FormDescription>We'll never share your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" autoComplete="current-password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              </FormControl>
              <FormLabel>Remember me</FormLabel>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Form>
  )
}`}</CodeBlock>

## Patterns to take away

1. **`autoComplete` hints** (`email`, `current-password`) so password managers fill correctly. Add `autoComplete="new-password"` for signup forms instead.
2. **`noValidate`** on `<form>` defers validation entirely to Zod. Without it, the browser native popups fire first and break the error styling.
3. **Disable on submit** via `form.formState.isSubmitting` to prevent double submission. Combine with the [Loading button pattern](/docs/components/button) for visual feedback.
4. **Remember me as a Switch, not a Checkbox** — by convention in `@idcert/ui`. The schema field is still a plain `boolean`.

## Server-side error handling

After a failed `/api/login` response, surface the error with `form.setError`:

<CodeBlock language="tsx">{`async function onSubmit(values: Values) {
  const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify(values) })
  if (!res.ok) {
    form.setError('root', { message: 'Invalid credentials.' })
    return
  }
  // navigate to dashboard
}`}</CodeBlock>

Then render a top-level error if present:

<CodeBlock language="tsx">{`{form.formState.errors.root && (
  <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
)}`}</CodeBlock>
````

- [ ] **Step 2: Commit**

```bash
pnpm --filter @idcert/playground gen:search-index
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/content/docs/recipes/login-form.mdx apps/playground/public/search-index.json
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(playground): recipes/login-form page"
```

---

## Task 15: Recipe — Data dashboard

**Files:**
- Create: `apps/playground/content/docs/recipes/data-dashboard.mdx`

- [ ] **Step 1: Create file**

````mdx
---
title: Data dashboard
description: Table + filter bar + pagination — the standard data-management view.
category: recipes
---

A data dashboard combines `Table`, `Input` (search), `Select` (column filter), `Button`, and `Pagination` with local state. For server-driven pagination, swap the local slice for a fetch keyed on the page number.

## Full source

<CodeBlock language="tsx">{`'use client'

import * as React from 'react'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Button,
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationPrevious, PaginationNext,
} from '@idcert/ui'

type Invoice = { id: string; status: 'Paid' | 'Pending' | 'Unpaid'; amount: number }

const ALL: Invoice[] = Array.from({ length: 47 }).map((_, i) => ({
  id: \`INV-\${String(i + 1).padStart(3, '0')}\`,
  status: (['Paid', 'Pending', 'Unpaid'] as const)[i % 3]!,
  amount: 100 + i * 17,
}))

const PAGE_SIZE = 10

export function DataDashboard() {
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState<'all' | Invoice['status']>('all')
  const [page, setPage] = React.useState(1)

  const filtered = ALL.filter((inv) => {
    if (status !== 'all' && inv.status !== status) return false
    if (search && !inv.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by invoice id…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={(v) => { setStatus(v as never); setPage(1) }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell className="font-mono">{inv.id}</TableCell>
              <TableCell>{inv.status}</TableCell>
              <TableCell className="text-right">\${inv.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setPage(Math.max(1, page - 1))} />
          </PaginationItem>
          {Array.from({ length: pageCount }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={page === i + 1}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext onClick={() => setPage(Math.min(pageCount, page + 1))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}`}</CodeBlock>

## Patterns to take away

1. **Reset to page 1** when filters change — otherwise empty pages confuse users.
2. **Debounce search** for server-side queries — for client-side filter on under 1k rows, native re-render is fast enough.
3. **`onValueChange` for Select** vs `onChange` for Input — `Select` is a controlled compound, not a native input.
4. **Pagination with `isActive`** — the active page button has stronger visual weight via `bg-accent`.

## Going server-side

Replace the client-side `filter` + `slice` with a fetch:

<CodeBlock language="tsx">{`React.useEffect(() => {
  const params = new URLSearchParams({ search, status, page: String(page), pageSize: String(PAGE_SIZE) })
  fetch(\`/api/invoices?\${params}\`)
    .then((r) => r.json())
    .then(setData)
}, [search, status, page])`}</CodeBlock>
````

- [ ] **Step 2: Commit**

```bash
pnpm --filter @idcert/playground gen:search-index
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/content/docs/recipes/data-dashboard.mdx apps/playground/public/search-index.json
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(playground): recipes/data-dashboard page"
```

---

## Task 16: Recipe — Navigation

**Files:**
- Create: `apps/playground/content/docs/recipes/navigation.mdx`

- [ ] **Step 1: Create file**

````mdx
---
title: Navigation patterns
description: Compose Navbar, Sidebar, Breadcrumb, Tabs, and Pagination for typical app shells.
category: recipes
---

`@idcert/ui` ships five navigation components. They are intentionally orthogonal — no built-in app shell — so any combination is possible without fighting the library.

## Top bar + content (smallest layout)

The simplest authenticated layout: a `Navbar` for global actions (logo, account menu, theme toggle) and the page content below.

<CodeBlock language="tsx">{`import { Navbar, NavbarContent, NavbarItem } from '@idcert/ui'

export function AppLayout({ children }) {
  return (
    <>
      <Navbar>
        <NavbarContent>
          <NavbarItem href="/dashboard">Dashboard</NavbarItem>
          <NavbarItem href="/billing">Billing</NavbarItem>
          <NavbarItem href="/settings">Settings</NavbarItem>
        </NavbarContent>
      </Navbar>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </>
  )
}`}</CodeBlock>

## Sidebar + content

When you have more than ~5 top-level destinations, the navbar becomes cramped. Move secondary nav into a `Sidebar`:

<CodeBlock language="tsx">{`import {
  SidebarProvider, Sidebar, SidebarContent, SidebarMenu,
  SidebarMenuButton, SidebarTrigger,
} from '@idcert/ui'
import { Home, Users, Settings, FileText } from 'lucide-react'

export function AppLayout({ children }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton><Home /> Dashboard</SidebarMenuButton>
            <SidebarMenuButton><Users /> Team</SidebarMenuButton>
            <SidebarMenuButton><FileText /> Invoices</SidebarMenuButton>
            <SidebarMenuButton><Settings /> Settings</SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 p-6">
        <SidebarTrigger className="md:hidden mb-4" />
        {children}
      </main>
    </SidebarProvider>
  )
}`}</CodeBlock>

The `SidebarTrigger` is shown only on mobile (`md:hidden`); on desktop the sidebar is permanently expanded.

## Breadcrumb for hierarchical pages

For pages buried more than two levels deep, render a `Breadcrumb` above the page heading:

<CodeBlock language="tsx">{`import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from '@idcert/ui'

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/projects">Projects</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbLink href="/projects/alpha">Alpha</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>Settings</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}</CodeBlock>

The last item uses `BreadcrumbPage` (no `href`) since it's the current page.

## Tabs within a page

For switching between views of the same resource (e.g., a project page with Overview / Tasks / Settings sub-views):

<CodeBlock language="tsx">{`import { Tabs, TabsList, TabsTrigger, TabsContent } from '@idcert/ui'

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="tasks">Tasks</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content…</TabsContent>
  <TabsContent value="tasks">Tasks content…</TabsContent>
  <TabsContent value="settings">Settings content…</TabsContent>
</Tabs>`}</CodeBlock>

For deep-linkable tabs, control the `value` from URL params instead of `defaultValue`.

## Anti-patterns

- **Don't nest a Sidebar inside Tabs**. A Sidebar implies a primary navigation level; if you need different sets of links per tab, make those tabs separate routes.
- **Don't put primary actions in Breadcrumb**. The breadcrumb is a wayfinder, not a toolbar. Put "Edit" or "Delete" in a button next to the page heading.
- **Don't combine top Navbar items with Sidebar items**. Pick one — the user's eye should know where global vs. contextual nav lives.
````

- [ ] **Step 2: Commit**

```bash
pnpm --filter @idcert/playground gen:search-index
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/content/docs/recipes/navigation.mdx apps/playground/public/search-index.json
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "docs(playground): recipes/navigation page"
```

---

## Task 17: Retire `_stub.mdx`, redirect home, update CommandMenu link

**Files:**
- Delete: `apps/playground/content/docs/_stub.mdx`
- Modify: `apps/playground/app/page.tsx`
- Modify: `apps/playground/components/docs/DocsHeader.tsx`
- Modify: `apps/playground/app/(smoke)/layout.tsx`
- Modify: `apps/playground/app/docs/not-found.tsx`

- [ ] **Step 1: Delete `_stub.mdx`**

```bash
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui rm apps/playground/content/docs/_stub.mdx
```

- [ ] **Step 2: Update home redirect**

`apps/playground/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/docs/getting-started/installation')
}
```

- [ ] **Step 3: Update DocsHeader logo link**

In `apps/playground/components/docs/DocsHeader.tsx`, change the `Link href="/docs/_stub"` to `href="/docs/getting-started/installation"`.

- [ ] **Step 4: Update smoke-layout "Docs" link**

In `apps/playground/app/(smoke)/layout.tsx`, change `<NavbarItem href="/docs/_stub">Docs</NavbarItem>` to `<NavbarItem href="/docs/getting-started/installation">Docs</NavbarItem>`.

- [ ] **Step 5: Update not-found "Back to docs" link**

In `apps/playground/app/docs/not-found.tsx`, change `<Link href="/docs/_stub">` to `<Link href="/docs/getting-started/installation">`.

- [ ] **Step 6: Refresh search index**

```bash
pnpm --filter @idcert/playground gen:search-index
```

- [ ] **Step 7: Verify build**

```bash
pnpm --filter @idcert/playground build
```

Expected: succeeds; no `_stub` route in the output.

- [ ] **Step 8: Commit**

```bash
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/app apps/playground/components/docs/DocsHeader.tsx apps/playground/public/search-index.json
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "refactor(playground): retire _stub.mdx, point home to installation"
```

---

## Task 18: Final verification

No new code. Verification only.

- [ ] **Step 1: Full clean rebuild**

```bash
pnpm --filter @idcert/ui clean
pnpm --filter @idcert/playground clean
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground build
```

Expected: both succeed.

- [ ] **Step 2: Repo-wide tests + typecheck**

```bash
pnpm -r typecheck
pnpm -r test
```

Expected: green.

- [ ] **Step 3: Verify the static export contains every page**

```bash
ls /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui/apps/playground/.next/server/app/docs/
```

Expected: per-page `.html`/`.rsc` files for getting-started, foundations, components/{button,input,dialog,form,table}, recipes/{login-form,data-dashboard,navigation}.

- [ ] **Step 4: Working-tree check**

```bash
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui status --short
```

Expected: clean except possibly `packages/ui/src/components/sidebar/index.tsx` (pre-existing user WIP — leave alone).

- [ ] **Step 5: No commit unless uncommitted regenerated artifacts**

```bash
git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui add apps/playground/public 2>/dev/null
if ! git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui diff --cached --quiet; then
  git -C /Users/andreaalunniguiducci/Desktop/Progetti/idcert-ui commit -m "chore(playground): refresh generated docs artifacts"
fi
```

---

## Self-Review

**Spec coverage:**
- Foundations colors / typography / spacing / radius — Tasks 3-6.
- Getting Started installation / theming — Tasks 7-8.
- Pilot Button, Input, Dialog, Form, Table — Tasks 9-13.
- Recipes — Tasks 14-16 (3 of 5; settings-panel and multi-step-form deferred to Plan C alongside the 38 scaffolds since they have no smoke-page source to migrate).
- Helper components TokenGrid, PrimitiveColorRamp — Tasks 1-2.
- Cleanup of `_stub.mdx` — Task 17.

**Placeholder scan:** No "TBD"/"TODO" patterns. MDX prose is concrete; example files have actual JSX. Commands are explicit. Type names (`DocFrontmatter`, `PropType`, `PropDoc`) are consistent with Plan A's exports.

**Type consistency:** `Form` typing uses `UseFormReturn<TValues>` matching `packages/ui/src/components/form/index.tsx` (read in plan-prep). `Dialog` props mirror Base UI's `BaseDialog.Root` re-export. `PropsTable component="X"` strings match the displayName emitted by `react-docgen-typescript` (`Form`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `FormField` for Form sub-parts).

**Risks not addressed inline:**
- The `Pagination` and `Sidebar` composition in Recipes references components whose anatomy this plan does not document. If `PaginationLink isActive`, `PaginationPrevious onClick`, or `SidebarTrigger className` differ from the recipe MDX, the recipe code blocks will be inaccurate (but won't break the build — they're just code blocks in MDX). Plan C's full scaffolding will document Pagination and Sidebar, at which point recipes can be cross-validated. Acceptable for Plan B.
- The `Switch` `onChange` API uses `(e) => field.onChange(e.target.checked)` because `@idcert/ui` Switch wraps a native checkbox. Confirmed against the existing forms smoke page.
- `Select` recipe uses `onValueChange` per the existing forms page pattern.

**Scope check:** Plan B remains a single cohesive subsystem (real content for the docs site), not a new independent subsystem.
