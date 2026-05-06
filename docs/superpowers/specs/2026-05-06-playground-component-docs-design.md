# Playground Component Documentation — Design

**Date:** 2026-05-06
**Status:** Approved (brainstorming)
**Owner:** Andrea Alunni Guiducci
**Related:** `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`, `docs/superpowers/plans/2026-05-04-idcert-ui-foundation.md`

---

## Summary

Build a React Aria–style component documentation site inside `apps/playground`, replacing the current smoke-test pages. The docs cover every `@idcert/ui` component with handwritten prose (anatomy, accessibility, usage guidance) plus auto-generated props tables and reused live examples sourced from the existing `*.stories.tsx` files. Foundations (colors, typography, spacing, radius) and recipes (multi-component patterns migrated from current smoke pages) are first-class sections.

The MVP ships infrastructure plus five fully written pilot components (Button, Input, Dialog, Form, Table); the remaining 38 components are scaffolded with hero example + props table only and prose is written incrementally.

---

## Goals

- Single internal source of truth for `@idcert/ui` component usage, props, tokens, and accessibility behaviour.
- Live, real-environment previews — examples render under the same `ThemeProvider` and `ToastProvider` consumers use, not in isolation.
- Zero drift between code and props documentation: types are the source of truth.
- Discoverable via sidebar navigation, in-page table of contents, and Cmd+K search.
- Authoring-friendly: contributors write Markdown/MDX prose, not JSX walls of text.

## Non-goals

- Public hosting. Docs stay on internal Next.js dev server / Verdaccio / build artifacts. (Public hosting is a future migration to a separate `apps/docs` if needed.)
- Internationalization. English only.
- Live code editing (Sandpack/CodeSandbox). Static preview + copyable code only.
- Versioning docs per release.
- Auto-changelog rendering, REST API docs.
- Full prose coverage of all 43 components at launch. Pilot 5 + scaffolding for the rest.

---

## Decisions log

| Decision | Choice | Rationale |
|---|---|---|
| Docs location | Refactor `apps/playground` (option B) | Avoid duplicate route confusion vs `apps/docs`; reuse existing ThemeProvider/ToastProvider; Storybook continues to cover isolated stories |
| Authoring source | Hybrid (option C): handwritten MDX + auto props from TS + reuse `*.stories.tsx` examples | Single source of truth for props (no drift), prose remains human-curated, examples not duplicated |
| Example rendering | Static preview + code block (option A) | Standard pattern (React Aria, Radix, shadcn); Sandpack overhead unjustified for internal docs |
| Page layout | 3-pane: sidebar + content + ToC (option A) | Standard docs layout; ToC critical for long pages with multiple sections |
| Page sections | 7 standard + optional `whenToUse` callout | Hero, Import, Anatomy, Examples, API, Tokens, Accessibility — skip empty sections per component |
| MDX system | `@next/mdx` (option B) | Zero vendor lock; `fumadocs` proprietary, `contentlayer2` is a community fork after maintainer departure |
| Foundations placement | Top-level Foundations section (option A) | First-class citizens; scales as foundations grow (animations, shadows, focus) |
| Smoke pages destiny | Migrate to Recipes (option C) | Existing forms page contains valuable multi-component patterns; promote to docs as recipes |
| Language | English (option B) | User decision (overrides Italian-codebase consistency); opens path to future open-source |
| Stories reuse | Split into `<name>.examples.tsx` (option A) | Pure JSX modules; both Storybook and MDX import from one place |
| Search | `cmdk` Cmd+K with build-time JSON index (option B) | ~70 pages need search; client-side fuzzy match is sufficient and zero infra |
| MDX file location | `apps/playground/content/docs/**` (option A) | Co-located with the app that serves them; avoids cross-package import config |
| MVP scope | Infra + 5 pilot components (option B) | Validates infrastructure with real prose; remaining components remain navigable via auto-generated stubs |

---

## Architecture

### Module layout

```
apps/playground/
├── app/
│   ├── docs/
│   │   ├── [...slug]/page.tsx       # catch-all MDX route
│   │   └── layout.tsx               # 3-pane DocsLayout
│   ├── (smoke)/                     # legacy smoke pages, route group, not in nav
│   │   ├── forms/page.tsx
│   │   ├── data/page.tsx
│   │   ├── utility/page.tsx
│   │   ├── navigation/page.tsx
│   │   └── dashboard/page.tsx
│   ├── layout.tsx                   # ThemeProvider + ToastProvider
│   └── page.tsx                     # redirect → /docs/getting-started/installation
├── content/
│   └── docs/
│       ├── getting-started/
│       │   ├── installation.mdx
│       │   └── theming.mdx
│       ├── foundations/
│       │   ├── colors.mdx
│       │   ├── typography.mdx
│       │   ├── spacing.mdx
│       │   └── radius.mdx
│       ├── components/
│       │   ├── button.mdx
│       │   ├── badge.mdx
│       │   └── ...                  # 41 files
│       └── recipes/
│           ├── login-form.mdx
│           ├── settings-panel.mdx
│           └── ...
├── components/docs/
│   ├── DocsLayout.tsx               # 3-pane shell
│   ├── Sidebar.tsx                  # left nav
│   ├── TableOfContents.tsx          # right rail
│   ├── PropsTable.tsx               # reads public/props.json
│   ├── Example.tsx                  # preview pane + tabbed code
│   ├── CodeBlock.tsx                # Shiki-rendered + copy
│   ├── TokenList.tsx                # CSS vars list with swatches
│   ├── TokenGrid.tsx                # foundations color/spacing grids
│   ├── PrimitiveColorRamp.tsx       # 50→950 ramp
│   ├── CommandMenu.tsx              # cmdk Cmd+K
│   ├── WhenToUseCallout.tsx
│   └── ThemeToggle.tsx
├── lib/
│   ├── docs.ts                      # MDX loader, frontmatter parser, slug helpers
│   ├── nav.ts                       # hand-curated sidebar tree
│   └── search.ts                    # read public/search-index.json
├── scripts/
│   ├── generate-props.ts            # react-docgen-typescript → public/props.json
│   ├── extract-examples-source.ts   # AST parse *.examples.tsx → public/examples-source.json
│   └── generate-search-index.ts     # parse MDX → public/search-index.json
├── mdx-components.tsx               # injects custom components into MDX scope
└── next.config.mjs                  # @next/mdx + remark/rehype plugins

packages/ui/src/components/<name>/
├── index.tsx
├── <name>.examples.tsx              # NEW: pure JSX exports, no Storybook imports
├── <name>.stories.tsx               # refactored: imports examples + adds Meta
└── <name>.test.tsx
```

### Module boundaries

- **`lib/docs.ts`** — filesystem layer. Reads MDX files, parses frontmatter, normalizes slugs. Server-only.
- **`lib/nav.ts`** — hand-curated navigation tree. Single source of truth for sidebar order and grouping.
- **`scripts/*`** — build-time only. Run during `prebuild`. Output JSON files to `public/`.
- **`components/docs/*`** — presentational React components. Custom MDX components are injected via `mdx-components.tsx` (Next 14 standard mechanism).
- **`packages/ui`** does not depend on docs. The new addition is `<name>.examples.tsx` files plus a subpath export.

### MDX route loading

`@next/mdx` natively supports MDX files placed inside `app/` as routes. Since our docs live in `content/docs/**/*.mdx` (outside `app/`), we use dynamic import in the catch-all route:

```tsx
// apps/playground/app/docs/[...slug]/page.tsx
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  // glob content/docs/**/*.mdx → return [{ slug: ['components', 'button'] }, ...]
}

export default async function DocsPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/')
  try {
    const { default: MDXContent, frontmatter, toc } =
      await import(`@/content/docs/${slug}.mdx`)
    return <DocsLayout frontmatter={frontmatter} toc={toc}><MDXContent /></DocsLayout>
  } catch {
    notFound()
  }
}
```

`frontmatter` and `toc` are exposed as named exports by remark plugins (`remark-mdx-frontmatter` + `rehype-extract-toc`). Webpack/Turbopack resolves the dynamic import at build time when paths are statically analyzable from `generateStaticParams`.

### Build pipeline

```
1. pnpm --filter @idcert/ui build
   └─ tsup emits dist/components/<name>/examples.js
2. pnpm --filter @idcert/playground prebuild
   ├─ generate-props      → public/props.json
   ├─ extract-examples    → public/examples-source.json
   └─ generate-search     → public/search-index.json
3. pnpm --filter @idcert/playground build
   └─ next build (with @next/mdx)
```

---

## Page anatomy (MDX)

### Standard sections (in order)

1. **Hero** — title + description + minimal live example (rendered from `<Default />` example).
2. **Import** — single code block.
3. **Anatomy** (compound components only) — list of sub-components, each with mini props table.
4. **Examples** — multiple `<Example>` blocks reusing `*.examples.tsx` exports.
5. **API Reference** — auto-rendered `<PropsTable component="X" />`.
6. **Tokens** — `<TokenList>` listing CSS variables consumed by the component.
7. **Accessibility** — keyboard interactions, ARIA roles, screen reader notes, focus management.

Sections without content are simply omitted from the MDX file.

### Frontmatter contract

```yaml
---
title: Button                              # required
description: Trigger primary actions...    # required, used in search and Hero subtitle
component: Button                          # required, drives <PropsTable> default
package: '@idcert/ui'                      # required
category: primitives                       # required, drives sidebar grouping cross-check
status: stable | experimental | deprecated | in-progress  # optional, renders status badge
whenToUse: |                               # optional, renders <WhenToUseCallout> below Hero
  Use for actions ("Save", "Delete"). For navigation, use Link.
---
```

**`category` allowed values** (cross-checked with `nav.ts` group keys):
`getting-started`, `foundations`, `primitives`, `forms`, `overlays`, `layout`, `navigation`, `data`, `feedback`, `utility`, `recipes`.

**`status` semantics:**
- `stable` (default if absent) — no badge.
- `experimental` — yellow badge, "API may change."
- `deprecated` — red badge with replacement guidance in `whenToUse`.
- `in-progress` — blue badge, "Documentation in progress." Used by Phase 4 scaffolded pages.

### Sample page

```mdx
---
title: Button
description: Trigger primary actions and form submissions.
component: Button
package: '@idcert/ui'
category: primitives
status: stable
whenToUse: |
  Use for actions. For navigation, use Link. For toggle state, use Switch.
---

import { Button } from '@idcert/ui'
import {
  Default, AllVariants, Sizes, WithIcon, Disabled,
} from '@idcert/ui/components/button/examples'

<Hero><Default /></Hero>

## Import

<CodeBlock language="tsx">{`import { Button } from '@idcert/ui'`}</CodeBlock>

## Examples

### Variants
<Example name="AllVariants"><AllVariants /></Example>

### Sizes
<Example name="Sizes"><Sizes /></Example>

### With icon
<Example name="WithIcon"><WithIcon /></Example>

### Disabled
<Example name="Disabled"><Disabled /></Example>

## API Reference

<PropsTable component="Button" />

## Tokens

<TokenList component="Button" tokens={[
  '--color-primary', '--color-primary-foreground',
  '--color-destructive', '--color-destructive-foreground',
  '--color-secondary', '--color-accent', '--color-ring',
  '--radius-md',
]} />

## Accessibility

- Renders a native `<button>` element by default. Use `asChild` to compose with `<a>`.
- Supports keyboard activation (`Enter`, `Space`).
- `disabled` removes the element from tab order.
- Focus ring uses `--color-ring` with 2px outline at 2px offset.
```

### Custom MDX components contract

| Component | Purpose |
|---|---|
| `<Hero>` | Wraps the marquee preview, full-bleed |
| `<Example name>` | Preview pane + tabbed code block (toggleable source) |
| `<CodeBlock language>` | Standalone Shiki-highlighted code with copy button |
| `<PropsTable component>` | Reads `public/props.json[component]` and renders table |
| `<TokenList component tokens>` | Lists CSS vars + resolved values + light/dark swatches |
| `<TokenGrid scope>` | Foundations grid (colors, spacing, radius, etc.) |
| `<PrimitiveColorRamp ramp>` | 50→950 color ramp with click-to-copy hex |
| `<WhenToUseCallout>` | Auto-rendered from frontmatter.whenToUse |
| `<Note>` `<Warning>` | Generic callouts |

---

## Props auto-generation

**Tool:** `react-docgen-typescript` — parses TypeScript AST, supports `forwardRef`, generics, and JSDoc tags.

**Script:** `apps/playground/scripts/generate-props.ts`

```ts
import * as docgen from 'react-docgen-typescript'
import { glob } from 'glob'
import path from 'node:path'
import fs from 'node:fs/promises'

const parser = docgen.withCustomConfig(
  path.resolve('../../packages/ui/tsconfig.json'),
  {
    savePropValueAsString: true,
    propFilter: (prop) => !prop.parent?.fileName.includes('node_modules'),
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
  },
)

const files = await glob('../../packages/ui/src/components/**/index.tsx')
const out: Record<string, docgen.ComponentDoc> = {}
for (const file of files) {
  for (const doc of parser.parse(file)) {
    out[doc.displayName] = doc
  }
}
await fs.writeFile('public/props.json', JSON.stringify(out, null, 2))
```

**`cva` defaults:** `react-docgen-typescript` does not read `cva` runtime defaults. Workaround: explicit `@default` JSDoc tags on the prop type. The parser reads these and overrides parsed defaults.

```tsx
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Visual style. @default "default" */
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    /** Render as Slot, forwarding props to the child. @default false */
    asChild?: boolean
  }
```

**Compound components:** each sub-component (e.g. `FormItem`, `FormLabel`, `FormControl`) gets its own `props.json` entry. The MDX page renders multiple `<PropsTable>` blocks under `## Anatomy`.

**`<PropsTable>` runtime:** reads `props.json` (statically imported), maps to `<table>` with columns: Prop, Type, Default, Description. Enum types render as multiple pill chips. Required props get a visible asterisk + `aria-label="required"`.

**CI gate:** `prebuild` regenerates `props.json`; CI fails if the file diff is uncommitted.

---

## Sidebar navigation

`lib/nav.ts` — hand-curated, the source of truth for ordering and grouping.

```ts
export type NavItem = { title: string; slug: string; status?: 'experimental' | 'deprecated' }
export type NavGroup = { title: string; items: NavItem[] }
export type NavSection = { title: string; groups: NavGroup[] }

export const nav: NavSection[] = [
  { title: 'Getting Started', groups: [{ title: '', items: [
    { title: 'Installation', slug: 'getting-started/installation' },
    { title: 'Theming',      slug: 'getting-started/theming' },
  ]}]},
  { title: 'Foundations', groups: [{ title: '', items: [
    { title: 'Colors',     slug: 'foundations/colors' },
    { title: 'Typography', slug: 'foundations/typography' },
    { title: 'Spacing',    slug: 'foundations/spacing' },
    { title: 'Radius',     slug: 'foundations/radius' },
  ]}]},
  { title: 'Components', groups: [
    { title: 'Primitives', items: [
      { title: 'Button',  slug: 'components/button' },
      { title: 'Badge',   slug: 'components/badge' },
      { title: 'Avatar',  slug: 'components/avatar' },
      { title: 'Divider', slug: 'components/divider' },
    ]},
    { title: 'Forms', items: [
      { title: 'Input',           slug: 'components/input' },
      { title: 'Textarea',        slug: 'components/textarea' },
      { title: 'Select',          slug: 'components/select' },
      { title: 'MultiSelect',     slug: 'components/multi-select' },
      { title: 'Checkbox',        slug: 'components/checkbox' },
      { title: 'Radio',           slug: 'components/radio' },
      { title: 'Switch',          slug: 'components/switch' },
      { title: 'Slider',          slug: 'components/slider' },
      { title: 'DatePicker',      slug: 'components/date-picker' },
      { title: 'DateRangePicker', slug: 'components/date-range-picker' },
      { title: 'TimePicker',      slug: 'components/time-picker' },
      { title: 'FileUpload',      slug: 'components/file-upload' },
      { title: 'Form',            slug: 'components/form' },
      { title: 'Label',           slug: 'components/label' },
    ]},
    { title: 'Overlays', items: [
      { title: 'Dialog',       slug: 'components/dialog' },
      { title: 'AlertDialog',  slug: 'components/alert-dialog' },
      { title: 'Sheet',        slug: 'components/sheet' },
      { title: 'DropdownMenu', slug: 'components/dropdown-menu' },
      { title: 'Tooltip',      slug: 'components/tooltip' },
      { title: 'Toast',        slug: 'components/toast' },
      { title: 'Portal',       slug: 'components/portal' },
    ]},
    { title: 'Layout', items: [
      { title: 'Container', slug: 'components/container' },
      { title: 'Grid',      slug: 'components/grid' },
      { title: 'Stack',     slug: 'components/stack' },
      { title: 'Separator', slug: 'components/separator' },
    ]},
    { title: 'Navigation', items: [
      { title: 'Navbar',     slug: 'components/navbar' },
      { title: 'Sidebar',    slug: 'components/sidebar' },
      { title: 'Breadcrumb', slug: 'components/breadcrumb' },
      { title: 'Tabs',       slug: 'components/tabs' },
      { title: 'Pagination', slug: 'components/pagination' },
    ]},
    { title: 'Data', items: [
      { title: 'Table', slug: 'components/table' },
      { title: 'List',  slug: 'components/list' },
      { title: 'Card',  slug: 'components/card' },
    ]},
    { title: 'Feedback', items: [
      { title: 'Alert',      slug: 'components/alert' },
      { title: 'Progress',   slug: 'components/progress' },
      { title: 'Skeleton',   slug: 'components/skeleton' },
      { title: 'Spinner',    slug: 'components/spinner' },
      { title: 'EmptyState', slug: 'components/empty-state' },
    ]},
    { title: 'Utility', items: [
      { title: 'ThemeProvider', slug: 'components/theme-provider' },
    ]},
  ]},
  { title: 'Recipes', groups: [{ title: '', items: [
    { title: 'Login form',          slug: 'recipes/login-form' },
    { title: 'Settings panel',      slug: 'recipes/settings-panel' },
    { title: 'Data dashboard',      slug: 'recipes/data-dashboard' },
    { title: 'Multi-step form',     slug: 'recipes/multi-step-form' },
    { title: 'Navigation patterns', slug: 'recipes/navigation' },
  ]}]},
]
```

**Validation:** test cross-checking `nav.ts` against `content/docs/**/*.mdx` filesystem. Orphan entries either side fail CI.

---

## Table of contents

- Headings (`h2`, `h3`) extracted at build time via `rehype-slug` + `rehype-extract-toc`.
- TOC array exposed as named export from each MDX page module.
- `<TableOfContents>` renders a sticky list, uses `IntersectionObserver` to highlight the active heading.
- Hidden on viewports `<1024px`.

---

## Search

**Library:** `cmdk` (~6KB).

**Build-time index:** `scripts/generate-search-index.ts` globs `content/docs/**/*.mdx`, parses frontmatter, extracts `h2`/`h3`, and writes `public/search-index.json`:

```ts
type SearchEntry = {
  slug: string
  title: string
  description: string
  category: string
  headings: { id: string; text: string; level: 2 | 3 }[]
}
```

**`<CommandMenu>`:**
- Cmd+K (Ctrl+K Windows) to open; Esc to close.
- Lazy-loads `search-index.json`.
- Fuzzy match weighted: title (3×) > description (2×) > headings (1×).
- Results grouped by `category` (Foundations, Components, Recipes).
- Click → `router.push('/docs/' + slug + '#' + headingId?)`.
- Bonus actions: "Toggle theme", "Open Storybook" (if `STORYBOOK_URL` env var set).

---

## Examples reuse: `*.examples.tsx`

### Convention

Each `packages/ui/src/components/<name>/` gets a sibling `<name>.examples.tsx` exporting named JSX components. No `Meta`, no `StoryObj`, no Storybook imports.

```tsx
// packages/ui/src/components/button/button.examples.tsx
import { Button } from './index.js'
import { Trash, Plus } from 'lucide-react'

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
    <Button size="icon"><Plus /></Button>
  </div>
)

export const WithIcon = () => (
  <Button variant="destructive"><Trash /> Delete</Button>
)

export const Disabled = () => <Button disabled>Disabled</Button>
```

### Storybook refactor

```tsx
// packages/ui/src/components/button/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './index.js'
import * as examples from './button.examples.js'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default:     Story = { render: examples.Default }
export const AllVariants: Story = { render: examples.AllVariants }
export const Sizes:       Story = { render: examples.Sizes }
export const WithIcon:    Story = { render: examples.WithIcon }
export const Disabled:    Story = { render: examples.Disabled }
```

### Package subpath export

`packages/ui/package.json`:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./components/*/examples": "./dist/components/*/examples.js"
  }
}
```

Tsup build emits `dist/components/<name>/examples.js`. Docs MDX:

```mdx
import { AllVariants } from '@idcert/ui/components/button/examples'
```

### Source code injection

`<Example>` displays the raw source of the example.

**Approach:** build-time AST extraction (chosen over webpack `?raw` for portability across bundlers).

`scripts/extract-examples-source.ts`:

```ts
// Parse each *.examples.tsx file with @typescript-eslint/parser or babel,
// extract each `export const <Name> = ...` block as raw source string,
// emit public/examples-source.json shaped as:
//
//   { "Button": { "AllVariants": "<raw source string>", "Sizes": "..." } }
```

`<Example name="AllVariants">` reads `examples-source.json[component][name]` (component name from page frontmatter), passes to `<CodeBlock>`.

---

## Code rendering

- **Syntax highlighter:** `shiki` — build-time WASM rendering, zero JS shipped to client for highlight.
- **Themes:** `github-light` + `github-dark`, switched by `data-theme` attribute on `<html>`.
- **`<CodeBlock>`:** renders pre-highlighted HTML, plus copy button using `navigator.clipboard.writeText`. Copy success triggers `useToast`.
- **`<Example>` UI:**
  - Preview pane on top with checker pattern background (subtle, theme-aware).
  - "Code" tab below toggles a `<CodeBlock>` open. Default closed. State not persisted.
  - Optional "Open in Storybook" link if `STORYBOOK_URL` env is set.

---

## Foundations pages

All foundations pages render CSS variables resolved at runtime, so token changes propagate automatically.

- **`foundations/colors.mdx`:** `<TokenGrid scope="color">` (semantic tokens with light/dark swatches), then `<PrimitiveColorRamp>` per ramp (neutral, brand, red, green, yellow), then a CSS override snippet showing how consumers customize brand color.
- **`foundations/typography.mdx`:** `--font-sans` / `--font-mono` showcase, type scale (text-xs → text-2xl) with live samples and pixel values.
- **`foundations/spacing.mdx`:** Tailwind spacing scale (0.25rem step) with visual rulers.
- **`foundations/radius.mdx`:** `--radius-sm` → `--radius-xl` with example squares.

`<TokenGrid>` and `<PrimitiveColorRamp>` are client components reading `@idcert/tokens` exports (already shipped) and resolving CSS variables for live swatches.

---

## Theming guide

`getting-started/theming.mdx` covers:

- Light/dark mode wiring (`ThemeProvider` + `next-themes` from existing setup).
- Overriding CSS variables consumer-side (Tailwind v4 preset).
- Custom theme creation with full CSS example.
- Live theme switcher embed and Cmd+K "Toggle theme" shortcut.

The docs header has a theme toggle (reuses existing `useTheme` hook from `@idcert/ui`).

---

## Testing strategy

### Unit (vitest)

- `lib/docs.ts` — frontmatter parsing, glob discovery, slug normalization, error on malformed MDX.
- `lib/nav.ts` — cross-check vs filesystem (no orphans either way).
- `scripts/generate-props.ts` — fixture component → expected props.json shape.
- `scripts/generate-search-index.ts` — fixture mdx → expected entries.
- `scripts/extract-examples-source.ts` — fixture examples.tsx → expected JSON shape.
- `<PropsTable>`, `<TokenList>`, `<Example>`, `<CommandMenu>` — render with mock data, interaction tests (copy click, navigation click).

### E2E (Playwright)

Smoke flow on three representative pages:

- `/docs/getting-started/installation`
- `/docs/components/button`
- `/docs/foundations/colors`

Tests cover: rendering, sidebar nav click, ToC anchor scroll, Cmd+K open + result navigation, theme toggle.

### Visual regression

Out of scope for MVP. Future option: Chromatic or Percy.

---

## Rollout plan (MVP)

| Phase | Scope | Effort |
|---|---|---|
| 1. Infrastructure | Add deps (`@next/mdx`, `cmdk`, `shiki`, `react-docgen-typescript`, `rehype-slug`, `rehype-extract-toc`, `remark-mdx-frontmatter`, `gray-matter`, `glob`); MDX config; `mdx-components.tsx`; `lib/docs.ts`; `app/docs/[...slug]/page.tsx`; `components/docs/*` skeletons (CommandMenu UI shell only — wired in Phase 5); three build scripts wired to `prebuild`; `lib/nav.ts` with all 43 components; move smoke pages to `app/(smoke)/` route group | ~3 days |
| 2. Pilot 5 components | Button, Input, Dialog, Form, Table: write `<name>.examples.tsx`, refactor `<name>.stories.tsx`, write full MDX with all 7 sections | ~3 days |
| 3. Foundations + Recipes | 4 foundations pages; 4–5 recipes migrated from existing smoke pages; Installation + Theming pages | ~2 days |
| 4. Scaffold remaining 38 components | For each non-pilot component: `<name>.examples.tsx` with `Default` export; MDX page with frontmatter (`status: in-progress`) + `<Hero><Default /></Hero>` + `<PropsTable />` only | ~1 day |
| 5. Polish | Search index + cmdk command menu finalization; e2e tests; README update with `pnpm dev` → `http://localhost:3000/docs` | ~1 day |

**Total MVP effort:** ~10 working days.

**Pilot 5 component selection rationale:**
- **Button** — simple primitive with variants and sizes (validates basic flow).
- **Input** — form primitive (validates form integration).
- **Dialog** — compound + portal + accessibility-critical (validates anatomy + a11y sections).
- **Form** — most complex compound, react-hook-form integration (validates multi-component prose).
- **Table** — data primitive with composition (validates the data category).

---

## Open questions / risks

- **`react-docgen-typescript` performance** on full `packages/ui` — first run may take seconds. Mitigation: cache in CI, skip if no diff in `packages/ui/src`.
- **Shiki theme assets size** — `github-light` + `github-dark` add ~100KB to build output. Acceptable for internal docs.
- **MDX hot-reload speed** — `@next/mdx` rebuild on save can lag with many components. Mitigation: dynamic import via `[...slug]/page.tsx` so only the touched page rebuilds.
- **`*.examples.tsx` build emission** — verify `tsup` config for `packages/ui` includes `*.examples.tsx` in entry points and emits to `dist/components/<name>/examples.js`. Update tsup config in Phase 1.
- **Storybook autodocs and the new `*.examples.tsx`** — Storybook 8 reads stories. Refactored stories still expose Meta + StoryObj, so autodocs continues to work. Verify on Phase 2.
- **`generateStaticParams` and dynamic MDX imports** — Next 14 may not statically analyze `import(\`@/content/docs/${slug}.mdx\`)` patterns through Webpack/Turbopack reliably. Mitigation in Phase 1: spike the route loader with two known slugs first; if dynamic import fails, fall back to a generated `lib/mdx-routes.ts` map (`{ 'components/button': () => import('@/content/docs/components/button.mdx'), ... }`) emitted by a build script.

---

## Cleanup after rollout

- Once all recipes are migrated and validated, the `app/(smoke)/` route group is deleted in a follow-up PR. Until then, smoke pages remain reachable by direct URL but are not linked from any nav.
- Update root `README.md` to point to `http://localhost:3000/docs` and explain the docs vs Storybook split (docs = consumer-facing reference, Storybook = isolated dev playground).
