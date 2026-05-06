# Playground Docs Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the documentation site infrastructure inside `apps/playground` — MDX routing, custom MDX components, build-time generators (props/search/examples-source), 3-pane layout, sidebar/ToC/CommandMenu shells — so a stub MDX page renders end-to-end with theming.

**Architecture:** Next.js 14 app router catch-all route (`app/docs/[...slug]/page.tsx`) loads MDX from `content/docs/**/*.mdx` via dynamic import. `@next/mdx` compiles MDX, custom components are injected via `mdx-components.tsx`. Three build-time scripts emit JSON to `public/`: `props.json` (TypeScript prop metadata), `examples-source.json` (raw source of example exports), `search-index.json` (page metadata + headings). Existing smoke pages move into a non-public route group `(smoke)`.

**Tech Stack:** Next 14, `@next/mdx`, `react-docgen-typescript`, `cmdk`, `shiki`, `rehype-slug`, `@stefanprobst/rehype-extract-toc`, `remark-mdx-frontmatter`, `gray-matter`, `glob`, `vitest`, `@testing-library/react`, `jsdom`.

**Note on dep majors:** `vitest` is at 4.x and `shiki` is at 4.x at the time of writing. Plan code uses standard APIs (`defineConfig`, `vi.mock` with factory, `getHighlighter`). If a Task 2 / 11+ step fails due to vitest 4.x API drift, downgrade to `vitest@^2` (the most recent LTS-feeling line) and proceed. Do not block on this.

**Spec reference:** `docs/superpowers/specs/2026-05-06-playground-component-docs-design.md`.

**Out of scope (Plan B/C):** Real component documentation, foundations pages, recipes pages, scaffolding for 38 components, e2e tests, search index wiring, README rewrite. This plan stops at: infra renders a single stub MDX page successfully.

---

## File Structure

### New files (apps/playground)

| Path | Responsibility |
|---|---|
| `vitest.config.ts` | Vitest config (jsdom, react plugin) |
| `vitest.setup.ts` | Testing-library matchers |
| `mdx-components.tsx` | Maps MDX-injected JSX names → React components |
| `lib/docs.ts` | MDX filesystem helpers: glob, frontmatter, slug normalization |
| `lib/nav.ts` | Hand-curated sidebar tree (NavSection[] for all 43 components + foundations + recipes) |
| `lib/search.ts` | Read `public/search-index.json` (lazy) |
| `lib/cn.ts` | `clsx` wrapper, copy from `packages/ui/src/lib/cn.ts` |
| `scripts/generate-props.ts` | `react-docgen-typescript` → `public/props.json` |
| `scripts/extract-examples-source.ts` | AST parse `*.examples.tsx` → `public/examples-source.json` |
| `scripts/generate-search-index.ts` | Parse `content/docs/**/*.mdx` → `public/search-index.json` |
| `app/docs/layout.tsx` | 3-pane DocsLayout with header |
| `app/docs/[...slug]/page.tsx` | Catch-all MDX renderer with `generateStaticParams` |
| `app/docs/not-found.tsx` | 404 for unknown slugs |
| `content/docs/_stub.mdx` | Placeholder MDX for Phase 1 smoke (deleted in Plan B) |
| `components/docs/DocsLayout.tsx` | 3-pane shell (sidebar, content, ToC) |
| `components/docs/DocsHeader.tsx` | Top bar (logo, theme toggle, Cmd+K trigger) |
| `components/docs/Sidebar.tsx` | Renders `nav.ts` tree |
| `components/docs/TableOfContents.tsx` | Right rail: scroll-spy on `h2`/`h3` |
| `components/docs/Hero.tsx` | Wraps marquee preview |
| `components/docs/Example.tsx` | Preview pane + tabbed code block |
| `components/docs/CodeBlock.tsx` | Shiki-rendered code with copy button |
| `components/docs/PropsTable.tsx` | Reads `props.json` → table |
| `components/docs/TokenList.tsx` | Renders CSS var swatches |
| `components/docs/CommandMenu.tsx` | `cmdk` UI shell (no search wiring yet) |
| `components/docs/WhenToUseCallout.tsx` | Renders frontmatter.whenToUse |
| `components/docs/StatusBadge.tsx` | Renders `experimental` / `deprecated` / `in-progress` badge |
| `components/docs/ThemeToggle.tsx` | Light/dark switch in header |
| `components/docs/Note.tsx` `Warning.tsx` | Generic callouts |
| `tests/lib/docs.test.ts` | `lib/docs.ts` unit tests |
| `tests/lib/nav.test.ts` | `nav.ts` cross-check vs filesystem |
| `tests/scripts/generate-props.test.ts` | Props extraction |
| `tests/scripts/extract-examples-source.test.ts` | Source extraction |
| `tests/scripts/generate-search-index.test.ts` | Search index |
| `tests/components/PropsTable.test.tsx` | PropsTable rendering |
| `tests/components/Example.test.tsx` | Example tab toggle |
| `tests/components/CodeBlock.test.tsx` | Copy button |
| `tests/components/Sidebar.test.tsx` | Nav rendering + active state |
| `tests/components/CommandMenu.test.tsx` | Cmd+K open/close |

### Modified files

| Path | Change |
|---|---|
| `apps/playground/next.config.mjs` | Wrap with `@next/mdx`, add remark/rehype plugins |
| `apps/playground/package.json` | Add deps + `prebuild` + `test` scripts |
| `apps/playground/app/layout.tsx` | Drop hardcoded Navbar (now lives in DocsHeader); keep ThemeProvider+ToastProvider |
| `apps/playground/app/page.tsx` | Replace home with redirect → `/docs/_stub` (becomes `/docs/getting-started/installation` in Plan B) |
| `apps/playground/app/forms/page.tsx` → `apps/playground/app/(smoke)/forms/page.tsx` | git mv |
| `apps/playground/app/data/page.tsx` → `apps/playground/app/(smoke)/data/page.tsx` | git mv |
| `apps/playground/app/utility/page.tsx` → `apps/playground/app/(smoke)/utility/page.tsx` | git mv |
| `apps/playground/app/navigation/page.tsx` → `apps/playground/app/(smoke)/navigation/page.tsx` | git mv |
| `apps/playground/app/dashboard/page.tsx` → `apps/playground/app/(smoke)/dashboard/page.tsx` | git mv |
| `apps/playground/app/(smoke)/layout.tsx` | New: keeps the legacy Navbar so smoke pages still work |
| `apps/playground/tsconfig.json` | Add `"@/*"` path alias if not present |
| `packages/ui/tsup.config.ts` | Add subpath entries for `*.examples.tsx` |
| `packages/ui/package.json` | Add `./components/*/examples` to `exports` |

---

## Conventions

- **Tests live next to where they make sense:** scripts → `tests/scripts/`, lib → `tests/lib/`, components → `tests/components/`. Following the existing `packages/ui` convention of `<name>.test.tsx` next to source for component packages, but `apps/playground` keeps a flat `tests/` tree because the Next.js app conventions reserve special filenames in `app/`.
- **Test runner:** vitest (matches `packages/ui`).
- **Style:** all new files use `'use client'` only when interactivity is required; server components are the default.
- **Path alias:** `@/*` resolves to `apps/playground/*`. (Configured in `tsconfig.json`.)
- **Each task ends with a commit.**

---

## Task 1: Add dependencies and scripts to apps/playground

**Files:**
- Modify: `apps/playground/package.json`

- [ ] **Step 1: Add dependencies**

Run from repo root:

```bash
pnpm --filter @idcert/playground add \
  @next/mdx \
  @mdx-js/loader \
  @mdx-js/react \
  @types/mdx \
  cmdk \
  shiki \
  gray-matter \
  glob \
  remark-mdx-frontmatter \
  rehype-slug \
  @stefanprobst/rehype-extract-toc \
  rehype-pretty-code

pnpm --filter @idcert/playground add -D \
  react-docgen-typescript \
  vitest \
  @vitest/coverage-v8 \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  tsx
```

Expected: `package.json` updated, `pnpm-lock.yaml` updated.

- [ ] **Step 2: Add scripts to package.json**

Edit `apps/playground/package.json`. Replace the `"scripts"` object so it reads:

```json
"scripts": {
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start",
  "clean": "rm -rf .next .turbo",
  "typecheck": "tsc --noEmit",
  "lint": "eslint .",
  "test": "vitest run",
  "test:watch": "vitest",
  "prebuild": "pnpm gen:props && pnpm gen:examples-source && pnpm gen:search-index",
  "gen:props": "tsx scripts/generate-props.ts",
  "gen:examples-source": "tsx scripts/extract-examples-source.ts",
  "gen:search-index": "tsx scripts/generate-search-index.ts"
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/playground/package.json pnpm-lock.yaml
git commit -m "build(playground): add MDX, vitest, and docs generator deps"
```

---

## Task 2: Configure path alias and Vitest in apps/playground

**Files:**
- Modify: `apps/playground/tsconfig.json`
- Create: `apps/playground/vitest.config.ts`
- Create: `apps/playground/vitest.setup.ts`

- [ ] **Step 1: Verify and update tsconfig.json**

Read `apps/playground/tsconfig.json`. Ensure `compilerOptions.paths` contains:

```json
"paths": {
  "@/*": ["./*"]
}
```

If missing, add. Save. **Do NOT add `baseUrl`** — it is deprecated in TS 7 and unnecessary since TS 4.1 (paths resolve relative to the tsconfig file).

- [ ] **Step 2: Create vitest.config.ts**

Path: `apps/playground/vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    passWithNoTests: true,
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
```

- [ ] **Step 3: Create vitest.setup.ts**

Path: `apps/playground/vitest.setup.ts`

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Run vitest to verify wiring**

```bash
pnpm --filter @idcert/playground test
```

Expected: `0 tests` because no test files exist yet, exit code 0 (`passWithNoTests: true`).

- [ ] **Step 5: Commit**

```bash
git add apps/playground/tsconfig.json apps/playground/vitest.config.ts apps/playground/vitest.setup.ts
git commit -m "test(playground): bootstrap vitest with jsdom + RTL"
```

---

## Task 3: Configure @next/mdx in next.config.mjs

**Files:**
- Modify: `apps/playground/next.config.mjs`

- [ ] **Step 1: Replace next.config.mjs**

Path: `apps/playground/next.config.mjs`

```js
import createMDX from '@next/mdx'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeSlug from 'rehype-slug'
import rehypeExtractToc from '@stefanprobst/rehype-extract-toc'
import rehypeExtractTocExport from '@stefanprobst/rehype-extract-toc/mdx'
import rehypePrettyCode from 'rehype-pretty-code'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: 'frontmatter' }],
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeExtractToc,
      rehypeExtractTocExport,
      [rehypePrettyCode, { theme: { dark: 'github-dark', light: 'github-light' } }],
    ],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@idcert/ui'],
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'mdx'],
}

export default withMDX(nextConfig)
```

- [ ] **Step 2: Add remark-frontmatter dep**

Run:

```bash
pnpm --filter @idcert/playground add remark-frontmatter
```

- [ ] **Step 3: Verify Next builds (no MDX content yet, just config validity)**

```bash
pnpm --filter @idcert/playground build
```

Expected: succeeds (smoke pages still work, MDX config not exercised yet).

- [ ] **Step 4: Commit**

```bash
git add apps/playground/next.config.mjs apps/playground/package.json pnpm-lock.yaml
git commit -m "build(playground): wire @next/mdx with remark/rehype plugin chain"
```

---

## Task 4: Move smoke pages into (smoke) route group

**Files:**
- Move: `apps/playground/app/{forms,data,utility,navigation,dashboard}/page.tsx` → `apps/playground/app/(smoke)/{forms,data,utility,navigation,dashboard}/page.tsx`
- Create: `apps/playground/app/(smoke)/layout.tsx`
- Modify: `apps/playground/app/layout.tsx`

- [ ] **Step 1: Create (smoke) directory and move pages**

```bash
cd apps/playground/app
mkdir -p "(smoke)"
git mv forms "(smoke)/forms"
git mv data "(smoke)/data"
git mv utility "(smoke)/utility"
git mv navigation "(smoke)/navigation"
git mv dashboard "(smoke)/dashboard"
cd -
```

- [ ] **Step 2: Create (smoke) layout that keeps the legacy Navbar**

Path: `apps/playground/app/(smoke)/layout.tsx`

```tsx
import { Navbar, NavbarContent, NavbarItem } from '@idcert/ui'

export default function SmokeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar>
        <NavbarContent>
          <NavbarItem href="/docs/_stub">Docs</NavbarItem>
          <NavbarItem href="/(smoke)/forms">Forms</NavbarItem>
          <NavbarItem href="/(smoke)/data">Data</NavbarItem>
          <NavbarItem href="/(smoke)/utility">Utility</NavbarItem>
          <NavbarItem href="/(smoke)/navigation">Navigation</NavbarItem>
        </NavbarContent>
      </Navbar>
      {children}
    </>
  )
}
```

Note: `(smoke)` is a route group (parens make it not appear in the URL). Smoke pages remain at `/forms`, `/data`, etc., but now have their own layout.

- [ ] **Step 3: Strip the Navbar from the root layout**

Path: `apps/playground/app/layout.tsx`

Replace the body so it reads:

```tsx
import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider, ToastProvider, Toaster } from '@idcert/ui'

export const metadata: Metadata = {
  title: 'idcert-ui playground',
  description: 'Documentation and integration playground for @idcert/ui',
}

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
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm --filter @idcert/playground build
```

Expected: compiles. Smoke pages still routable (try `/forms` if running dev later).

- [ ] **Step 5: Commit**

```bash
git add apps/playground/app
git commit -m "refactor(playground): isolate smoke pages under (smoke) route group"
```

---

## Task 5: Implement lib/docs.ts (MDX filesystem helpers)

**Files:**
- Create: `apps/playground/lib/docs.ts`
- Test: `apps/playground/tests/lib/docs.test.ts`

- [ ] **Step 1: Write the failing test**

Path: `apps/playground/tests/lib/docs.test.ts`

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
  listDocSlugs,
  parseDocFile,
  slugFromContentPath,
} from '@/lib/docs'

const fixtureDir = path.resolve(__dirname, '__fixtures__/content/docs')

beforeAll(async () => {
  await fs.mkdir(path.join(fixtureDir, 'components'), { recursive: true })
  await fs.writeFile(
    path.join(fixtureDir, 'components/button.mdx'),
    `---
title: Button
description: Primary actions.
component: Button
package: '@idcert/ui'
category: primitives
---

# Hello
`,
  )
  await fs.writeFile(
    path.join(fixtureDir, 'index.mdx'),
    `---
title: Home
description: Top page.
category: getting-started
---

intro
`,
  )
})

afterAll(async () => {
  await fs.rm(path.dirname(fixtureDir), { recursive: true, force: true })
})

describe('slugFromContentPath', () => {
  it('strips content/docs prefix and .mdx extension', () => {
    expect(
      slugFromContentPath('/abs/content/docs/components/button.mdx', '/abs/content/docs'),
    ).toBe('components/button')
  })

  it('treats index.mdx as parent slug', () => {
    expect(
      slugFromContentPath('/abs/content/docs/index.mdx', '/abs/content/docs'),
    ).toBe('')
  })
})

describe('listDocSlugs', () => {
  it('returns all MDX slugs under content/docs', async () => {
    const slugs = await listDocSlugs(fixtureDir)
    expect(slugs.sort()).toEqual(['', 'components/button'])
  })
})

describe('parseDocFile', () => {
  it('returns frontmatter and raw body', async () => {
    const file = path.join(fixtureDir, 'components/button.mdx')
    const result = await parseDocFile(file)
    expect(result.frontmatter).toMatchObject({
      title: 'Button',
      description: 'Primary actions.',
      component: 'Button',
      category: 'primitives',
    })
    expect(result.body).toContain('# Hello')
  })

  it('throws on missing required frontmatter', async () => {
    const bad = path.join(fixtureDir, 'bad.mdx')
    await fs.writeFile(bad, '# no frontmatter\n')
    await expect(parseDocFile(bad)).rejects.toThrow(/missing required frontmatter/i)
    await fs.rm(bad)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @idcert/playground test tests/lib/docs.test.ts
```

Expected: FAIL with "Cannot find module '@/lib/docs'".

- [ ] **Step 3: Implement lib/docs.ts**

Path: `apps/playground/lib/docs.ts`

```ts
import fs from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'glob'
import matter from 'gray-matter'

export type DocCategory =
  | 'getting-started'
  | 'foundations'
  | 'primitives'
  | 'forms'
  | 'overlays'
  | 'layout'
  | 'navigation'
  | 'data'
  | 'feedback'
  | 'utility'
  | 'recipes'

export type DocStatus = 'stable' | 'experimental' | 'deprecated' | 'in-progress'

export type DocFrontmatter = {
  title: string
  description: string
  category: DocCategory
  component?: string
  package?: string
  status?: DocStatus
  whenToUse?: string
}

const REQUIRED_KEYS: (keyof DocFrontmatter)[] = ['title', 'description', 'category']

export const CONTENT_DIR = path.resolve(process.cwd(), 'content/docs')

export function slugFromContentPath(filePath: string, baseDir: string): string {
  const rel = path.relative(baseDir, filePath).replace(/\\/g, '/')
  const noExt = rel.replace(/\.mdx?$/, '')
  return noExt === 'index' ? '' : noExt.replace(/\/index$/, '')
}

export async function listDocSlugs(baseDir: string = CONTENT_DIR): Promise<string[]> {
  const files = await glob('**/*.mdx', { cwd: baseDir, absolute: true })
  return files.map((f) => slugFromContentPath(f, baseDir))
}

export async function parseDocFile(filePath: string): Promise<{
  frontmatter: DocFrontmatter
  body: string
}> {
  const raw = await fs.readFile(filePath, 'utf8')
  const { data, content } = matter(raw)
  for (const key of REQUIRED_KEYS) {
    if (!data[key]) {
      throw new Error(
        `${filePath}: missing required frontmatter key "${key}"`,
      )
    }
  }
  return { frontmatter: data as DocFrontmatter, body: content }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @idcert/playground test tests/lib/docs.test.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/playground/lib/docs.ts apps/playground/tests/lib/docs.test.ts
git commit -m "feat(playground): add docs frontmatter parser and slug helpers"
```

---

## Task 6: Implement lib/nav.ts (full sidebar tree)

**Files:**
- Create: `apps/playground/lib/nav.ts`
- Test: `apps/playground/tests/lib/nav.test.ts`

- [ ] **Step 1: Write the failing test (cross-checks against filesystem)**

Path: `apps/playground/tests/lib/nav.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { nav, allNavSlugs } from '@/lib/nav'

describe('nav structure', () => {
  it('every entry has a non-empty slug and title', () => {
    for (const section of nav) {
      for (const group of section.groups) {
        for (const item of group.items) {
          expect(item.title.length).toBeGreaterThan(0)
          expect(item.slug.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('slugs are unique', () => {
    const slugs = allNavSlugs()
    const set = new Set(slugs)
    expect(set.size).toBe(slugs.length)
  })

  it('contains all 43 components by canonical slug', () => {
    const slugs = allNavSlugs().filter((s) => s.startsWith('components/'))
    expect(slugs).toHaveLength(41)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @idcert/playground test tests/lib/nav.test.ts
```

Expected: FAIL with "Cannot find module '@/lib/nav'".

- [ ] **Step 3: Implement lib/nav.ts**

Path: `apps/playground/lib/nav.ts`

```ts
export type NavItem = {
  title: string
  slug: string
  status?: 'experimental' | 'deprecated' | 'in-progress'
}
export type NavGroup = { title: string; items: NavItem[] }
export type NavSection = { title: string; groups: NavGroup[] }

export const nav: NavSection[] = [
  {
    title: 'Getting Started',
    groups: [
      {
        title: '',
        items: [
          { title: 'Installation', slug: 'getting-started/installation' },
          { title: 'Theming', slug: 'getting-started/theming' },
        ],
      },
    ],
  },
  {
    title: 'Foundations',
    groups: [
      {
        title: '',
        items: [
          { title: 'Colors', slug: 'foundations/colors' },
          { title: 'Typography', slug: 'foundations/typography' },
          { title: 'Spacing', slug: 'foundations/spacing' },
          { title: 'Radius', slug: 'foundations/radius' },
        ],
      },
    ],
  },
  {
    title: 'Components',
    groups: [
      {
        title: 'Primitives',
        items: [
          { title: 'Button', slug: 'components/button' },
          { title: 'Badge', slug: 'components/badge' },
          { title: 'Avatar', slug: 'components/avatar' },
          { title: 'Divider', slug: 'components/divider' },
        ],
      },
      {
        title: 'Forms',
        items: [
          { title: 'Input', slug: 'components/input' },
          { title: 'Textarea', slug: 'components/textarea' },
          { title: 'Select', slug: 'components/select' },
          { title: 'MultiSelect', slug: 'components/multi-select' },
          { title: 'Checkbox', slug: 'components/checkbox' },
          { title: 'Radio', slug: 'components/radio' },
          { title: 'Switch', slug: 'components/switch' },
          { title: 'Slider', slug: 'components/slider' },
          { title: 'DatePicker', slug: 'components/date-picker' },
          { title: 'DateRangePicker', slug: 'components/date-range-picker' },
          { title: 'TimePicker', slug: 'components/time-picker' },
          { title: 'FileUpload', slug: 'components/file-upload' },
          { title: 'Form', slug: 'components/form' },
          { title: 'Label', slug: 'components/label' },
        ],
      },
      {
        title: 'Overlays',
        items: [
          { title: 'Dialog', slug: 'components/dialog' },
          { title: 'AlertDialog', slug: 'components/alert-dialog' },
          { title: 'Sheet', slug: 'components/sheet' },
          { title: 'DropdownMenu', slug: 'components/dropdown-menu' },
          { title: 'Tooltip', slug: 'components/tooltip' },
          { title: 'Toast', slug: 'components/toast' },
          { title: 'Portal', slug: 'components/portal' },
        ],
      },
      {
        title: 'Layout',
        items: [
          { title: 'Container', slug: 'components/container' },
          { title: 'Grid', slug: 'components/grid' },
          { title: 'Stack', slug: 'components/stack' },
          { title: 'Separator', slug: 'components/separator' },
        ],
      },
      {
        title: 'Navigation',
        items: [
          { title: 'Navbar', slug: 'components/navbar' },
          { title: 'Sidebar', slug: 'components/sidebar' },
          { title: 'Breadcrumb', slug: 'components/breadcrumb' },
          { title: 'Tabs', slug: 'components/tabs' },
          { title: 'Pagination', slug: 'components/pagination' },
        ],
      },
      {
        title: 'Data',
        items: [
          { title: 'Table', slug: 'components/table' },
          { title: 'List', slug: 'components/list' },
          { title: 'Card', slug: 'components/card' },
        ],
      },
      {
        title: 'Feedback',
        items: [
          { title: 'Alert', slug: 'components/alert' },
          { title: 'Progress', slug: 'components/progress' },
          { title: 'Skeleton', slug: 'components/skeleton' },
          { title: 'Spinner', slug: 'components/spinner' },
          { title: 'EmptyState', slug: 'components/empty-state' },
        ],
      },
      {
        title: 'Utility',
        items: [{ title: 'ThemeProvider', slug: 'components/theme-provider' }],
      },
    ],
  },
  {
    title: 'Recipes',
    groups: [
      {
        title: '',
        items: [
          { title: 'Login form', slug: 'recipes/login-form' },
          { title: 'Settings panel', slug: 'recipes/settings-panel' },
          { title: 'Data dashboard', slug: 'recipes/data-dashboard' },
          { title: 'Multi-step form', slug: 'recipes/multi-step-form' },
          { title: 'Navigation patterns', slug: 'recipes/navigation' },
        ],
      },
    ],
  },
]

export function allNavSlugs(): string[] {
  return nav.flatMap((s) => s.groups.flatMap((g) => g.items.map((i) => i.slug)))
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @idcert/playground test tests/lib/nav.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/playground/lib/nav.ts apps/playground/tests/lib/nav.test.ts
git commit -m "feat(playground): add hand-curated docs navigation tree"
```

---

## Task 7: Build-time script — generate-props.ts

**Files:**
- Create: `apps/playground/scripts/generate-props.ts`
- Test: `apps/playground/tests/scripts/generate-props.test.ts`
- Modify: `apps/playground/package.json` (no — already wired in Task 1)

- [ ] **Step 1: Write the failing test**

Path: `apps/playground/tests/scripts/generate-props.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import path from 'node:path'
import fs from 'node:fs/promises'
import { extractProps } from '@/scripts/generate-props'

describe('extractProps', () => {
  it('extracts displayName, description, and prop info from Button', async () => {
    const docs = await extractProps([
      path.resolve(__dirname, '../../../../packages/ui/src/components/button/index.tsx'),
    ])
    expect(docs.Button).toBeDefined()
    expect(docs.Button.props.variant).toBeDefined()
    expect(docs.Button.props.variant.type.name).toBe('enum')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @idcert/playground test tests/scripts/generate-props.test.ts
```

Expected: FAIL with "Cannot find module '@/scripts/generate-props'".

- [ ] **Step 3: Implement scripts/generate-props.ts**

Path: `apps/playground/scripts/generate-props.ts`

```ts
import * as docgen from 'react-docgen-typescript'
import { glob } from 'glob'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TSCONFIG_PATH = path.resolve(__dirname, '../../../packages/ui/tsconfig.json')
const SOURCE_GLOB = path.resolve(
  __dirname,
  '../../../packages/ui/src/components/**/index.tsx',
)
const OUTPUT_PATH = path.resolve(__dirname, '../public/props.json')

const parser = docgen.withCustomConfig(TSCONFIG_PATH, {
  savePropValueAsString: true,
  propFilter: (prop) => !prop.parent?.fileName.includes('node_modules'),
  shouldExtractLiteralValuesFromEnum: true,
  shouldExtractValuesFromUnion: true,
  shouldRemoveUndefinedFromOptional: true,
})

export async function extractProps(
  files: string[],
): Promise<Record<string, docgen.ComponentDoc>> {
  const out: Record<string, docgen.ComponentDoc> = {}
  for (const file of files) {
    const docs = parser.parse(file)
    for (const doc of docs) {
      out[doc.displayName] = doc
    }
  }
  return out
}

async function main() {
  const files = await glob(SOURCE_GLOB)
  const out = await extractProps(files)
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(out, null, 2))
  console.log(`✓ wrote ${Object.keys(out).length} component entries to ${OUTPUT_PATH}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @idcert/playground test tests/scripts/generate-props.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run script standalone to verify end-to-end**

```bash
pnpm --filter @idcert/playground gen:props
ls apps/playground/public/props.json
```

Expected: `props.json` written, file size >0.

- [ ] **Step 6: Commit**

```bash
git add apps/playground/scripts/generate-props.ts apps/playground/tests/scripts/generate-props.test.ts apps/playground/public/props.json
git commit -m "feat(playground): add react-docgen-typescript props generator"
```

---

## Task 8: Build-time script — extract-examples-source.ts

**Files:**
- Create: `apps/playground/scripts/extract-examples-source.ts`
- Test: `apps/playground/tests/scripts/extract-examples-source.test.ts`
- Create fixture: `apps/playground/tests/scripts/__fixtures__/sample.examples.tsx`

- [ ] **Step 1: Create fixture**

Path: `apps/playground/tests/scripts/__fixtures__/sample.examples.tsx`

```tsx
import { Button } from '@idcert/ui'

export const Default = () => <Button>Hello</Button>

export const WithIcon = () => (
  <Button>
    <span>Icon</span>
    Click
  </Button>
)
```

- [ ] **Step 2: Write the failing test**

Path: `apps/playground/tests/scripts/extract-examples-source.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { extractFromFile } from '@/scripts/extract-examples-source'

const fixture = path.resolve(__dirname, '__fixtures__/sample.examples.tsx')

describe('extractFromFile', () => {
  it('extracts each named export with its source body', async () => {
    const result = await extractFromFile(fixture)
    expect(Object.keys(result).sort()).toEqual(['Default', 'WithIcon'])
    expect(result.Default).toContain('<Button>Hello</Button>')
    expect(result.WithIcon).toContain('<span>Icon</span>')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm --filter @idcert/playground test tests/scripts/extract-examples-source.test.ts
```

Expected: FAIL.

- [ ] **Step 4: Implement extract-examples-source.ts**

Path: `apps/playground/scripts/extract-examples-source.ts`

```ts
import { glob } from 'glob'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SOURCE_GLOB = path.resolve(
  __dirname,
  '../../../packages/ui/src/components/**/*.examples.tsx',
)
const OUTPUT_PATH = path.resolve(__dirname, '../public/examples-source.json')

const EXPORT_REGEX = /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=/g

export async function extractFromFile(file: string): Promise<Record<string, string>> {
  const raw = await fs.readFile(file, 'utf8')
  const out: Record<string, string> = {}
  const matches: { name: string; start: number }[] = []
  for (const m of raw.matchAll(EXPORT_REGEX)) {
    matches.push({ name: m[1], start: m.index! })
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].start
    const end = i + 1 < matches.length ? matches[i + 1].start : raw.length
    out[matches[i].name] = raw.slice(start, end).trim()
  }
  return out
}

function componentNameFromPath(file: string): string {
  // .../components/button/button.examples.tsx → Button
  const dir = path.basename(path.dirname(file))
  return dir
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

async function main() {
  const files = await glob(SOURCE_GLOB)
  const out: Record<string, Record<string, string>> = {}
  for (const file of files) {
    const name = componentNameFromPath(file)
    out[name] = await extractFromFile(file)
  }
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(out, null, 2))
  console.log(
    `✓ wrote ${Object.keys(out).length} component entries to ${OUTPUT_PATH}`,
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm --filter @idcert/playground test tests/scripts/extract-examples-source.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run script standalone (will produce empty JSON since no .examples.tsx exist yet)**

```bash
pnpm --filter @idcert/playground gen:examples-source
cat apps/playground/public/examples-source.json
```

Expected: `{}` (no examples files exist).

- [ ] **Step 7: Commit**

```bash
git add apps/playground/scripts/extract-examples-source.ts apps/playground/tests/scripts/extract-examples-source.test.ts apps/playground/tests/scripts/__fixtures__/sample.examples.tsx apps/playground/public/examples-source.json
git commit -m "feat(playground): add example source extractor"
```

---

## Task 9: Build-time script — generate-search-index.ts

**Files:**
- Create: `apps/playground/scripts/generate-search-index.ts`
- Test: `apps/playground/tests/scripts/generate-search-index.test.ts`

- [ ] **Step 1: Write the failing test**

Path: `apps/playground/tests/scripts/generate-search-index.test.ts`

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs/promises'
import path from 'node:path'
import { buildIndex } from '@/scripts/generate-search-index'

const fixtureDir = path.resolve(__dirname, '__fixtures__/search-content')

beforeAll(async () => {
  await fs.mkdir(path.join(fixtureDir, 'components'), { recursive: true })
  await fs.writeFile(
    path.join(fixtureDir, 'components/button.mdx'),
    `---
title: Button
description: Trigger primary actions.
category: primitives
---

## Examples

### Variants

### Sizes

## API Reference
`,
  )
})

afterAll(async () => {
  await fs.rm(fixtureDir, { recursive: true, force: true })
})

// NOTE: cleanup is scoped to fixtureDir, not the shared __fixtures__ root,
// so it does not collide with the static sample.examples.tsx fixture from Task 8.

describe('buildIndex', () => {
  it('produces one entry per MDX with title, description, headings', async () => {
    const entries = await buildIndex(fixtureDir)
    expect(entries).toHaveLength(1)
    const e = entries[0]
    expect(e.slug).toBe('components/button')
    expect(e.title).toBe('Button')
    expect(e.description).toBe('Trigger primary actions.')
    expect(e.category).toBe('primitives')
    expect(e.headings.map((h) => h.text)).toEqual([
      'Examples',
      'Variants',
      'Sizes',
      'API Reference',
    ])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @idcert/playground test tests/scripts/generate-search-index.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement generate-search-index.ts**

Path: `apps/playground/scripts/generate-search-index.ts`

```ts
import { glob } from 'glob'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_DIR = path.resolve(__dirname, '../content/docs')
const OUTPUT_PATH = path.resolve(__dirname, '../public/search-index.json')

export type SearchEntry = {
  slug: string
  title: string
  description: string
  category: string
  headings: { id: string; text: string; level: 2 | 3 }[]
}

const HEADING_REGEX = /^(#{2,3})\s+(.+?)\s*$/gm

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function buildIndex(baseDir: string): Promise<SearchEntry[]> {
  const files = await glob('**/*.mdx', { cwd: baseDir, absolute: true })
  const entries: SearchEntry[] = []
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8')
    const { data, content } = matter(raw)
    const headings: SearchEntry['headings'] = []
    for (const m of content.matchAll(HEADING_REGEX)) {
      const level = m[1].length === 2 ? 2 : 3
      const text = m[2].trim()
      headings.push({ id: slugify(text), text, level: level as 2 | 3 })
    }
    const rel = path.relative(baseDir, file).replace(/\\/g, '/')
    const slug = rel.replace(/\.mdx$/, '').replace(/\/index$/, '')
    entries.push({
      slug,
      title: data.title ?? '',
      description: data.description ?? '',
      category: data.category ?? '',
      headings,
    })
  }
  return entries
}

async function main() {
  const entries = await buildIndex(CONTENT_DIR)
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(entries, null, 2))
  console.log(`✓ wrote ${entries.length} search entries to ${OUTPUT_PATH}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @idcert/playground test tests/scripts/generate-search-index.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/playground/scripts/generate-search-index.ts apps/playground/tests/scripts/generate-search-index.test.ts
git commit -m "feat(playground): add MDX search index generator"
```

---

## Task 10: Stub MDX content + content/docs directory

**Files:**
- Create: `apps/playground/content/docs/_stub.mdx`

- [ ] **Step 1: Create stub MDX**

Path: `apps/playground/content/docs/_stub.mdx`

```mdx
---
title: Docs Infrastructure Smoke
description: Placeholder page validating MDX route loading. Removed in Plan B.
category: getting-started
---

# Hello from MDX

This page exists to verify the docs infrastructure renders end-to-end.

## Section A

Some prose.

### Sub-section A.1

More prose.

## Section B

Final prose.
```

- [ ] **Step 2: Run search index generator and verify output**

```bash
pnpm --filter @idcert/playground gen:search-index
cat apps/playground/public/search-index.json
```

Expected: contains one entry with slug `_stub`.

- [ ] **Step 3: Commit**

```bash
git add apps/playground/content/docs/_stub.mdx apps/playground/public/search-index.json
git commit -m "feat(playground): add stub MDX page for infra validation"
```

---

## Task 11: Implement components/docs/PropsTable.tsx

**Files:**
- Create: `apps/playground/components/docs/PropsTable.tsx`
- Test: `apps/playground/tests/components/PropsTable.test.tsx`
- Create: `apps/playground/lib/cn.ts`

- [ ] **Step 1: Create lib/cn.ts**

Path: `apps/playground/lib/cn.ts`

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Run:

```bash
pnpm --filter @idcert/playground add clsx tailwind-merge
```

- [ ] **Step 2: Write the failing test**

Path: `apps/playground/tests/components/PropsTable.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PropsTable } from '@/components/docs/PropsTable'

vi.mock('@/public/props.json', () => ({
  default: {
    Button: {
      displayName: 'Button',
      description: '',
      props: {
        variant: {
          name: 'variant',
          required: false,
          description: 'Visual style.',
          defaultValue: { value: '"default"' },
          type: {
            name: 'enum',
            value: [
              { value: '"default"' },
              { value: '"destructive"' },
            ],
          },
        },
        asChild: {
          name: 'asChild',
          required: false,
          description: 'Render as Slot.',
          defaultValue: { value: 'false' },
          type: { name: 'boolean' },
        },
      },
    },
  },
}))

describe('<PropsTable>', () => {
  it('renders one row per prop with name, type, default, description', () => {
    render(<PropsTable component="Button" />)
    expect(screen.getByText('variant')).toBeInTheDocument()
    expect(screen.getByText('asChild')).toBeInTheDocument()
    expect(screen.getByText('Visual style.')).toBeInTheDocument()
    expect(screen.getAllByText('"default"').length).toBeGreaterThan(0)
    expect(screen.getByText('false')).toBeInTheDocument()
  })

  it('renders nothing for unknown component', () => {
    const { container } = render(<PropsTable component="Unknown" />)
    expect(container).toBeEmptyDOMElement()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm --filter @idcert/playground test tests/components/PropsTable.test.tsx
```

Expected: FAIL.

- [ ] **Step 4: Implement PropsTable.tsx**

Path: `apps/playground/components/docs/PropsTable.tsx`

```tsx
import propsData from '@/public/props.json'
import { cn } from '@/lib/cn'

type PropType =
  | { name: 'string' | 'number' | 'boolean' | string }
  | { name: 'enum'; value: { value: string }[] }

type PropDoc = {
  name: string
  required: boolean
  description: string
  defaultValue?: { value: string } | null
  type: PropType
}

type ComponentDoc = {
  displayName: string
  description: string
  props: Record<string, PropDoc>
}

const data = propsData as unknown as Record<string, ComponentDoc>

export function PropsTable({ component }: { component: string }) {
  const doc = data[component]
  if (!doc) return null
  const entries = Object.values(doc.props)
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Prop</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-left font-medium">Default</th>
            <th className="px-3 py-2 text-left font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((p) => (
            <tr key={p.name} className="border-t border-border align-top">
              <td className="px-3 py-2">
                <code className="font-mono">{p.name}</code>
                {p.required && (
                  <span className="ml-1 text-destructive" aria-label="required">
                    *
                  </span>
                )}
              </td>
              <td className="px-3 py-2">
                <TypeCell type={p.type} />
              </td>
              <td className="px-3 py-2 font-mono text-muted-foreground">
                {p.defaultValue?.value ?? '—'}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {p.description || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TypeCell({ type }: { type: PropType }) {
  if (type.name === 'enum') {
    return (
      <div className="flex flex-wrap gap-1">
        {type.value.map((v) => (
          <code
            key={v.value}
            className={cn(
              'rounded bg-secondary px-1.5 py-0.5 text-xs',
              'text-secondary-foreground',
            )}
          >
            {v.value}
          </code>
        ))}
      </div>
    )
  }
  return <code className="font-mono">{type.name}</code>
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm --filter @idcert/playground test tests/components/PropsTable.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/playground/lib/cn.ts apps/playground/components/docs/PropsTable.tsx apps/playground/tests/components/PropsTable.test.tsx apps/playground/package.json apps/playground/pnpm-lock.yaml 2>/dev/null || true
git add apps/playground/lib apps/playground/components apps/playground/tests apps/playground/package.json
git commit -m "feat(playground): render component PropsTable from props.json"
```

---

## Task 12: Implement components/docs/CodeBlock.tsx

**Files:**
- Create: `apps/playground/components/docs/CodeBlock.tsx`
- Test: `apps/playground/tests/components/CodeBlock.test.tsx`

- [ ] **Step 1: Write the failing test**

Path: `apps/playground/tests/components/CodeBlock.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeBlock } from '@/components/docs/CodeBlock'

describe('<CodeBlock>', () => {
  it('renders code text', () => {
    render(<CodeBlock language="tsx">{`const x = 1`}</CodeBlock>)
    expect(screen.getByText(/const x = 1/)).toBeInTheDocument()
  })

  it('copy button writes to clipboard', async () => {
    const writeText = vi.fn()
    Object.assign(navigator, { clipboard: { writeText } })
    render(<CodeBlock language="tsx">{`hello`}</CodeBlock>)
    const btn = screen.getByRole('button', { name: /copy/i })
    await userEvent.click(btn)
    expect(writeText).toHaveBeenCalledWith('hello')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @idcert/playground test tests/components/CodeBlock.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement CodeBlock.tsx**

Path: `apps/playground/components/docs/CodeBlock.tsx`

```tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

export function CodeBlock({
  language = 'tsx',
  children,
  className,
}: {
  language?: string
  children: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn('group relative my-4 rounded-md border border-border bg-muted', className)}>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'absolute right-2 top-2 rounded border border-border bg-background px-2 py-1 text-xs',
          'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
        )}
        aria-label="Copy code"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className={`language-${language}`}>{children}</code>
      </pre>
    </div>
  )
}
```

Note: real Shiki rendering happens in MDX via `rehype-pretty-code` (already configured). This `<CodeBlock>` is for explicit JSX usage in MDX (e.g., the Import section). Children is plain text.

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @idcert/playground test tests/components/CodeBlock.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/playground/components/docs/CodeBlock.tsx apps/playground/tests/components/CodeBlock.test.tsx
git commit -m "feat(playground): add CodeBlock with copy button"
```

---

## Task 13: Implement components/docs/Example.tsx

**Files:**
- Create: `apps/playground/components/docs/Example.tsx`
- Test: `apps/playground/tests/components/Example.test.tsx`

- [ ] **Step 1: Write the failing test**

Path: `apps/playground/tests/components/Example.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Example } from '@/components/docs/Example'

vi.mock('@/public/examples-source.json', () => ({
  default: {
    Button: {
      AllVariants: 'export const AllVariants = () => <Button>v</Button>',
    },
  },
}))

describe('<Example>', () => {
  it('renders preview by default and toggles code on click', async () => {
    render(
      <Example name="AllVariants" component="Button">
        <button>preview</button>
      </Example>,
    )
    expect(screen.getByText('preview')).toBeInTheDocument()
    expect(screen.queryByText(/AllVariants/)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /code/i }))
    expect(screen.getByText(/AllVariants/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @idcert/playground test tests/components/Example.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement Example.tsx**

Path: `apps/playground/components/docs/Example.tsx`

```tsx
'use client'

import * as React from 'react'
import examplesSource from '@/public/examples-source.json'
import { CodeBlock } from './CodeBlock'

const sources = examplesSource as unknown as Record<string, Record<string, string>>

export function Example({
  name,
  component,
  children,
}: {
  name: string
  component: string
  children: React.ReactNode
}) {
  const [showCode, setShowCode] = React.useState(false)
  const source = sources[component]?.[name] ?? ''

  return (
    <div className="my-6 overflow-hidden rounded-md border border-border">
      <div
        className="bg-background p-6"
        style={{
          backgroundImage:
            'linear-gradient(45deg, var(--muted) 25%, transparent 25%, transparent 75%, var(--muted) 75%), linear-gradient(45deg, var(--muted) 25%, transparent 25%, transparent 75%, var(--muted) 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-3 rounded bg-card p-6">
          {children}
        </div>
      </div>
      <div className="border-t border-border bg-muted px-3 py-1.5">
        <button
          type="button"
          onClick={() => setShowCode((v) => !v)}
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-expanded={showCode}
        >
          {showCode ? 'Hide code' : 'Show code'}
        </button>
      </div>
      {showCode && source && (
        <CodeBlock language="tsx" className="m-0 rounded-none border-0">
          {source}
        </CodeBlock>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @idcert/playground test tests/components/Example.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/playground/components/docs/Example.tsx apps/playground/tests/components/Example.test.tsx
git commit -m "feat(playground): add Example component with preview/code toggle"
```

---

## Task 14: Implement components/docs/Hero, WhenToUseCallout, Note, Warning, StatusBadge, TokenList

**Files:**
- Create: `apps/playground/components/docs/Hero.tsx`
- Create: `apps/playground/components/docs/WhenToUseCallout.tsx`
- Create: `apps/playground/components/docs/Note.tsx`
- Create: `apps/playground/components/docs/Warning.tsx`
- Create: `apps/playground/components/docs/StatusBadge.tsx`
- Create: `apps/playground/components/docs/TokenList.tsx`

- [ ] **Step 1: Hero.tsx**

Path: `apps/playground/components/docs/Hero.tsx`

```tsx
import { cn } from '@/lib/cn'

export function Hero({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'my-6 flex min-h-[200px] items-center justify-center rounded-md border border-border bg-card p-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: WhenToUseCallout.tsx**

Path: `apps/playground/components/docs/WhenToUseCallout.tsx`

```tsx
export function WhenToUseCallout({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-6 rounded-md border-l-4 border-primary bg-muted p-4">
      <h2 className="m-0 mb-2 text-sm font-semibold uppercase text-muted-foreground">
        When to use
      </h2>
      <div className="text-sm">{children}</div>
    </aside>
  )
}
```

- [ ] **Step 3: Note.tsx and Warning.tsx**

Path: `apps/playground/components/docs/Note.tsx`

```tsx
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-4 rounded-md border-l-4 border-primary bg-muted p-4 text-sm">
      {children}
    </aside>
  )
}
```

Path: `apps/playground/components/docs/Warning.tsx`

```tsx
export function Warning({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-4 rounded-md border-l-4 border-destructive bg-destructive/10 p-4 text-sm">
      {children}
    </aside>
  )
}
```

- [ ] **Step 4: StatusBadge.tsx**

Path: `apps/playground/components/docs/StatusBadge.tsx`

```tsx
import type { DocStatus } from '@/lib/docs'

const labels: Record<DocStatus, { text: string; className: string }> = {
  stable: { text: '', className: '' },
  experimental: {
    text: 'Experimental',
    className: 'bg-yellow-200 text-yellow-900',
  },
  deprecated: {
    text: 'Deprecated',
    className: 'bg-red-200 text-red-900',
  },
  'in-progress': {
    text: 'Documentation in progress',
    className: 'bg-blue-200 text-blue-900',
  },
}

export function StatusBadge({ status }: { status?: DocStatus }) {
  if (!status || status === 'stable') return null
  const { text, className } = labels[status]
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {text}
    </span>
  )
}
```

- [ ] **Step 5: TokenList.tsx (server component, reads CSS at build via prop list)**

Path: `apps/playground/components/docs/TokenList.tsx`

```tsx
'use client'

import * as React from 'react'

export function TokenList({
  component,
  tokens,
}: {
  component?: string
  tokens: string[]
}) {
  const [resolved, setResolved] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const map: Record<string, string> = {}
    for (const token of tokens) {
      const value = getComputedStyle(document.documentElement).getPropertyValue(
        token,
      )
      map[token] = value.trim()
    }
    setResolved(map)
  }, [tokens])

  return (
    <ul className="my-4 list-none space-y-1 rounded-md border border-border p-3">
      {tokens.map((token) => (
        <li key={token} className="flex items-center gap-3 font-mono text-sm">
          <span
            aria-hidden
            style={{
              backgroundColor: token.startsWith('--color')
                ? `rgb(${resolved[token] || '128 128 128'})`
                : 'transparent',
            }}
            className="h-4 w-4 rounded border border-border"
          />
          <code>{token}</code>
          <span className="text-muted-foreground">
            {resolved[token] || '…'}
          </span>
          {component && (
            <span className="ml-auto text-xs text-muted-foreground">
              {component}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/playground/components/docs
git commit -m "feat(playground): add Hero, callouts, StatusBadge, and TokenList"
```

---

## Task 15: Implement components/docs/Sidebar.tsx

**Files:**
- Create: `apps/playground/components/docs/Sidebar.tsx`
- Test: `apps/playground/tests/components/Sidebar.test.tsx`

- [ ] **Step 1: Write the failing test**

Path: `apps/playground/tests/components/Sidebar.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/docs/Sidebar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/docs/components/button',
}))

describe('<Sidebar>', () => {
  it('renders all sections and groups', () => {
    render(<Sidebar />)
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Foundations')).toBeInTheDocument()
    expect(screen.getByText('Components')).toBeInTheDocument()
    expect(screen.getByText('Primitives')).toBeInTheDocument()
  })

  it('marks the active link', () => {
    render(<Sidebar />)
    const active = screen.getByRole('link', { name: 'Button' })
    expect(active).toHaveAttribute('aria-current', 'page')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @idcert/playground test tests/components/Sidebar.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement Sidebar.tsx**

Path: `apps/playground/components/docs/Sidebar.tsx`

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { nav } from '@/lib/nav'
import { cn } from '@/lib/cn'

export function Sidebar() {
  const pathname = usePathname()
  return (
    <nav aria-label="Documentation" className="w-60 shrink-0 border-r border-border bg-background">
      <ul className="space-y-6 p-4 text-sm">
        {nav.map((section) => (
          <li key={section.title}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            {section.groups.map((group) => (
              <div key={group.title || section.title} className="mb-3">
                {group.title && (
                  <h4 className="mb-1 px-2 text-xs font-medium text-foreground">
                    {group.title}
                  </h4>
                )}
                <ul>
                  {group.items.map((item) => {
                    const href = `/docs/${item.slug}`
                    const active = pathname === href
                    return (
                      <li key={item.slug}>
                        <Link
                          href={href}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'block rounded px-2 py-1 transition-colors',
                            active
                              ? 'bg-accent font-medium text-accent-foreground'
                              : 'text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {item.title}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @idcert/playground test tests/components/Sidebar.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/playground/components/docs/Sidebar.tsx apps/playground/tests/components/Sidebar.test.tsx
git commit -m "feat(playground): add docs Sidebar with active-page styling"
```

---

## Task 16: Implement components/docs/TableOfContents.tsx

**Files:**
- Create: `apps/playground/components/docs/TableOfContents.tsx`

(No unit test — IntersectionObserver is exercised in e2e in Plan C; component shape is trivial.)

- [ ] **Step 1: Implement TableOfContents.tsx**

Path: `apps/playground/components/docs/TableOfContents.tsx`

```tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

export type TocEntry = {
  value: string
  depth: number
  attributes?: { id?: string }
  children?: TocEntry[]
}

function flatten(toc: TocEntry[], out: TocEntry[] = []): TocEntry[] {
  for (const e of toc) {
    if (e.depth === 2 || e.depth === 3) out.push(e)
    if (e.children) flatten(e.children, out)
  }
  return out
}

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const flat = React.useMemo(() => flatten(toc), [toc])
  const [active, setActive] = React.useState<string | null>(null)

  React.useEffect(() => {
    const ids = flat.map((e) => e.attributes?.id).filter(Boolean) as string[]
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
            return
          }
        }
      },
      { rootMargin: '0% 0% -70% 0%' },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [flat])

  if (flat.length === 0) return null

  return (
    <aside
      aria-label="On this page"
      className="sticky top-20 hidden w-52 shrink-0 self-start lg:block"
    >
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </h3>
      <ul className="space-y-1 text-sm">
        {flat.map((entry) => {
          const id = entry.attributes?.id ?? ''
          return (
            <li
              key={id}
              className={cn(entry.depth === 3 && 'ml-3')}
            >
              <a
                href={`#${id}`}
                className={cn(
                  'block py-0.5 transition-colors',
                  active === id
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {entry.value}
              </a>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm --filter @idcert/playground typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/playground/components/docs/TableOfContents.tsx
git commit -m "feat(playground): add TableOfContents with scroll-spy"
```

---

## Task 17: Implement components/docs/CommandMenu.tsx (UI shell, no search yet)

**Files:**
- Create: `apps/playground/components/docs/CommandMenu.tsx`
- Test: `apps/playground/tests/components/CommandMenu.test.tsx`

- [ ] **Step 1: Write the failing test**

Path: `apps/playground/tests/components/CommandMenu.test.tsx`

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommandMenu } from '@/components/docs/CommandMenu'

describe('<CommandMenu>', () => {
  it('opens on Cmd+K and closes on Esc', async () => {
    render(<CommandMenu />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter @idcert/playground test tests/components/CommandMenu.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement CommandMenu.tsx (UI shell only — search wired in Plan C)**

Path: `apps/playground/components/docs/CommandMenu.tsx`

```tsx
'use client'

import * as React from 'react'
import { Command } from 'cmdk'

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)

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

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      className="fixed left-1/2 top-1/4 w-[600px] max-w-[90vw] -translate-x-1/2 rounded-md border border-border bg-background p-2 shadow-lg"
    >
      <Command.Input
        placeholder="Search docs… (Plan C wires the index)"
        className="w-full border-b border-border px-3 py-2 outline-none"
      />
      <Command.List className="max-h-[400px] overflow-y-auto p-2">
        <Command.Empty className="p-4 text-sm text-muted-foreground">
          No results yet — search wiring in Plan C.
        </Command.Empty>
      </Command.List>
    </Command.Dialog>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter @idcert/playground test tests/components/CommandMenu.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/playground/components/docs/CommandMenu.tsx apps/playground/tests/components/CommandMenu.test.tsx
git commit -m "feat(playground): add CommandMenu UI shell with Cmd+K toggle"
```

---

## Task 18: Implement components/docs/ThemeToggle.tsx

**Files:**
- Create: `apps/playground/components/docs/ThemeToggle.tsx`

- [ ] **Step 1: Implement ThemeToggle.tsx**

Path: `apps/playground/components/docs/ThemeToggle.tsx`

```tsx
'use client'

import { useTheme } from '@idcert/ui'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground hover:bg-accent"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm --filter @idcert/playground typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/playground/components/docs/ThemeToggle.tsx
git commit -m "feat(playground): add docs theme toggle reusing useTheme"
```

---

## Task 19: Implement components/docs/DocsHeader.tsx and DocsLayout.tsx

**Files:**
- Create: `apps/playground/components/docs/DocsHeader.tsx`
- Create: `apps/playground/components/docs/DocsLayout.tsx`

- [ ] **Step 1: DocsHeader.tsx**

Path: `apps/playground/components/docs/DocsHeader.tsx`

```tsx
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { CommandMenu } from './CommandMenu'

export function DocsHeader() {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
        <Link href="/docs/_stub" className="font-semibold">
          @idcert/ui
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
              window.dispatchEvent(e)
            }}
            className="rounded border border-border bg-background px-3 py-1 text-sm text-muted-foreground"
          >
            Search… <kbd className="ml-2 rounded bg-muted px-1 text-xs">⌘K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </header>
      <CommandMenu />
    </>
  )
}
```

- [ ] **Step 2: DocsLayout.tsx**

Path: `apps/playground/components/docs/DocsLayout.tsx`

```tsx
import { Sidebar } from './Sidebar'
import { TableOfContents, type TocEntry } from './TableOfContents'
import { DocsHeader } from './DocsHeader'
import { WhenToUseCallout } from './WhenToUseCallout'
import { StatusBadge } from './StatusBadge'
import type { DocFrontmatter } from '@/lib/docs'

export function DocsLayout({
  frontmatter,
  toc,
  children,
}: {
  frontmatter: DocFrontmatter
  toc: TocEntry[]
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <DocsHeader />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <header className="mb-6">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold">{frontmatter.title}</h1>
              <StatusBadge status={frontmatter.status} />
            </div>
            <p className="text-lg text-muted-foreground">{frontmatter.description}</p>
            {frontmatter.whenToUse && (
              <WhenToUseCallout>{frontmatter.whenToUse}</WhenToUseCallout>
            )}
          </header>
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            {children}
          </article>
        </main>
        <TableOfContents toc={toc} />
      </div>
    </div>
  )
}
```

Note: relies on `@tailwindcss/typography`. Add it now if missing.

- [ ] **Step 3: Add @tailwindcss/typography**

```bash
pnpm --filter @idcert/playground add -D @tailwindcss/typography
```

Then in `apps/playground/app/globals.css` ensure the plugin is registered. Tailwind v4 syntax:

Add to top of `apps/playground/app/globals.css`:

```css
@plugin "@tailwindcss/typography";
```

(Place it near other `@plugin` directives.)

- [ ] **Step 4: Verify typecheck**

```bash
pnpm --filter @idcert/playground typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/playground/components/docs apps/playground/app/globals.css apps/playground/package.json apps/playground/pnpm-lock.yaml
git commit -m "feat(playground): assemble DocsLayout with sidebar, content, ToC"
```

---

## Task 20: Implement mdx-components.tsx and the docs route

**Files:**
- Create: `apps/playground/mdx-components.tsx`
- Create: `apps/playground/app/docs/layout.tsx`
- Create: `apps/playground/app/docs/[...slug]/page.tsx`
- Create: `apps/playground/app/docs/not-found.tsx`
- Modify: `apps/playground/app/page.tsx`

- [ ] **Step 1: mdx-components.tsx**

Path: `apps/playground/mdx-components.tsx`

```tsx
import type { MDXComponents } from 'mdx/types'
import { Hero } from '@/components/docs/Hero'
import { Example } from '@/components/docs/Example'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { PropsTable } from '@/components/docs/PropsTable'
import { TokenList } from '@/components/docs/TokenList'
import { Note } from '@/components/docs/Note'
import { Warning } from '@/components/docs/Warning'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Hero,
    Example,
    CodeBlock,
    PropsTable,
    TokenList,
    Note,
    Warning,
    ...components,
  }
}
```

- [ ] **Step 2: app/docs/layout.tsx (passes through; layout details rendered per page)**

Path: `apps/playground/app/docs/layout.tsx`

```tsx
export default function DocsRouteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 3: app/docs/[...slug]/page.tsx**

Path: `apps/playground/app/docs/[...slug]/page.tsx`

```tsx
import { notFound } from 'next/navigation'
import { listDocSlugs, parseDocFile, CONTENT_DIR } from '@/lib/docs'
import { DocsLayout } from '@/components/docs/DocsLayout'
import path from 'node:path'

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await listDocSlugs(CONTENT_DIR)
  return slugs.map((slug) => ({ slug: slug ? slug.split('/') : [] }))
}

export default async function DocsPage({
  params,
}: {
  params: { slug?: string[] }
}) {
  const slug = (params.slug ?? []).join('/')
  if (!slug) notFound()

  let mod: any
  try {
    mod = await import(`@/content/docs/${slug}.mdx`)
  } catch {
    notFound()
  }

  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  const { frontmatter } = await parseDocFile(filePath)

  const MDXContent = mod.default
  const toc = mod.tableOfContents ?? []

  return (
    <DocsLayout frontmatter={frontmatter} toc={toc}>
      <MDXContent />
    </DocsLayout>
  )
}
```

- [ ] **Step 4: app/docs/not-found.tsx**

Path: `apps/playground/app/docs/not-found.tsx`

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md p-12 text-center">
      <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
      <p className="mb-4 text-muted-foreground">No documentation at this URL.</p>
      <Link href="/docs/_stub" className="underline">
        Back to docs
      </Link>
    </main>
  )
}
```

- [ ] **Step 5: app/page.tsx — redirect to stub**

Path: `apps/playground/app/page.tsx`

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/docs/_stub')
}
```

- [ ] **Step 6: Verify build**

```bash
pnpm --filter @idcert/playground build
```

Expected: succeeds. `app/docs/_stub` is statically generated.

- [ ] **Step 7: Smoke test by running dev**

```bash
pnpm --filter @idcert/playground dev
```

Open `http://localhost:3000/`. Expected: redirects to `/docs/_stub`. Sidebar visible (with all 41 component links — they 404 if clicked since pages don't exist yet, that's expected). ToC rail visible on right with "Hello from MDX", "Section A", "Sub-section A.1", "Section B". Cmd+K opens command palette. Theme toggle works.

Stop dev server.

- [ ] **Step 8: Commit**

```bash
git add apps/playground/mdx-components.tsx apps/playground/app
git commit -m "feat(playground): render MDX docs via [...slug] catch-all route"
```

---

## Task 21: Update packages/ui tsup config and exports for *.examples.tsx

**Files:**
- Modify: `packages/ui/tsup.config.ts`
- Modify: `packages/ui/package.json`

**Note:** `*.examples.tsx` files do not exist yet (they ship in Plan B per component). This task only configures the build pipeline so it works when files appear. We add ONE placeholder examples file as a smoke test, then remove it.

- [ ] **Step 1: Update tsup.config.ts to include *.examples.tsx as additional entries**

Path: `packages/ui/tsup.config.ts`

Replace `entry` line:

```ts
entry: ['src/index.ts', 'src/components/*/*.examples.tsx'],
```

Full file:

```ts
import { defineConfig } from 'tsup'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const USE_CLIENT = '"use client";\n'

function prependUseClient(filePath: string): void {
  const content = readFileSync(filePath, 'utf8')
  if (!content.startsWith(USE_CLIENT)) {
    writeFileSync(filePath, USE_CLIENT + content, 'utf8')
  }
}

export default defineConfig({
  entry: ['src/index.ts', 'src/components/*/*.examples.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'next', 'next-themes'],
  treeshake: true,
  outDir: 'dist',
  outExtension({ format }) {
    return { js: format === 'esm' ? '.js' : '.cjs' }
  },
  async onSuccess() {
    const dist = resolve('dist')
    prependUseClient(resolve(dist, 'index.js'))
    prependUseClient(resolve(dist, 'index.cjs'))
    console.log('✓ prepended "use client" directive to bundle entries')
  },
})
```

- [ ] **Step 2: Update packages/ui/package.json exports**

Read `packages/ui/package.json`, replace `"exports"` block with:

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js",
    "require": "./dist/index.cjs"
  },
  "./components/*/examples": {
    "types": "./dist/components/*/*.examples.d.ts",
    "import": "./dist/components/*/*.examples.js",
    "require": "./dist/components/*/*.examples.cjs"
  }
}
```

- [ ] **Step 3: Add a placeholder examples file to verify pipeline**

Path: `packages/ui/src/components/button/button.examples.tsx`

```tsx
import { Button } from './index.js'

export const Default = () => <Button>Click me</Button>
```

- [ ] **Step 4: Build packages/ui and verify dist output**

```bash
pnpm --filter @idcert/ui build
ls packages/ui/dist/components/button
```

Expected: `button.examples.js`, `button.examples.cjs`, `button.examples.d.ts` present.

- [ ] **Step 5: Verify subpath import resolves from playground**

Create one-off test file `apps/playground/tests/integration/examples-import.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('examples subpath', () => {
  it('resolves @idcert/ui/components/button/examples', async () => {
    const mod = await import('@idcert/ui/components/button/examples')
    expect(typeof mod.Default).toBe('function')
  })
})
```

Run:

```bash
pnpm --filter @idcert/playground test tests/integration/examples-import.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run extract-examples-source against the new file**

```bash
pnpm --filter @idcert/playground gen:examples-source
cat apps/playground/public/examples-source.json
```

Expected: contains `{ "Button": { "Default": "export const Default = ..." } }`.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/tsup.config.ts packages/ui/package.json packages/ui/src/components/button/button.examples.tsx apps/playground/tests/integration/examples-import.test.ts apps/playground/public/examples-source.json
git commit -m "build(ui): emit *.examples.tsx as subpath exports"
```

---

## Task 22: Hook up MDX content/docs imports for build-time discovery

The dynamic `import(\`@/content/docs/${slug}.mdx\`)` may not be statically analyzable by Webpack/Turbopack. This task validates and falls back if needed.

**Files (potential):**
- Modify: `apps/playground/app/docs/[...slug]/page.tsx`
- Create (only if fallback needed): `apps/playground/lib/mdx-routes.generated.ts` + script

- [ ] **Step 1: Verify dynamic import works at build time**

```bash
pnpm --filter @idcert/playground build
```

Expected outcomes:
- **PASS:** build emits `_stub` page. Skip to Step 4.
- **FAIL:** error like "Module not found" or "ReferenceError" → proceed to Step 2.

- [ ] **Step 2 (only if Step 1 failed): Create generated routes map**

Path: `apps/playground/scripts/generate-mdx-routes.ts`

```ts
import { glob } from 'glob'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_DIR = path.resolve(__dirname, '../content/docs')
const OUTPUT_PATH = path.resolve(__dirname, '../lib/mdx-routes.generated.ts')

async function main() {
  const files = await glob('**/*.mdx', { cwd: CONTENT_DIR })
  const lines = files.map((f) => {
    const slug = f.replace(/\.mdx$/, '').replace(/\/index$/, '')
    return `  '${slug}': () => import('@/content/docs/${f}'),`
  })
  const out = `// AUTO-GENERATED. Do not edit.
export const mdxRoutes: Record<string, () => Promise<any>> = {
${lines.join('\n')}
}
`
  await fs.writeFile(OUTPUT_PATH, out)
  console.log(`✓ wrote ${files.length} route entries to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

Add to `apps/playground/package.json` scripts:

```json
"gen:mdx-routes": "tsx scripts/generate-mdx-routes.ts",
"prebuild": "pnpm gen:props && pnpm gen:examples-source && pnpm gen:search-index && pnpm gen:mdx-routes"
```

Modify `apps/playground/app/docs/[...slug]/page.tsx` to use the map:

```tsx
import { mdxRoutes } from '@/lib/mdx-routes.generated'
// ...
const loader = mdxRoutes[slug]
if (!loader) notFound()
const mod = await loader()
```

- [ ] **Step 3 (fallback only): Run generator + rebuild**

```bash
pnpm --filter @idcert/playground gen:mdx-routes
pnpm --filter @idcert/playground build
```

Expected: build succeeds.

- [ ] **Step 4: Commit (whichever path was taken)**

If Step 1 passed:

```bash
# nothing to commit, dynamic import works
```

If Step 2-3 path was taken:

```bash
git add apps/playground/scripts/generate-mdx-routes.ts apps/playground/lib/mdx-routes.generated.ts apps/playground/app/docs/[...slug]/page.tsx apps/playground/package.json
git commit -m "build(playground): generate static MDX route map for build-time discovery"
```

---

## Task 23: End-to-end smoke check

**Files:** none (verification only).

- [ ] **Step 1: Full clean rebuild**

```bash
pnpm --filter @idcert/ui build
pnpm --filter @idcert/playground build
```

Expected: both succeed.

- [ ] **Step 2: Run all playground tests**

```bash
pnpm --filter @idcert/playground test
```

Expected: all PASS, no failures.

- [ ] **Step 3: Run full repo tests + typecheck**

```bash
pnpm typecheck
pnpm test
```

Expected: green across packages.

- [ ] **Step 4: Run dev server and validate manually**

```bash
pnpm --filter @idcert/playground dev
```

Open `http://localhost:3000/`:
- Should redirect to `/docs/_stub`.
- Sidebar shows all sections (Getting Started, Foundations, Components, Recipes).
- Content area shows "Docs Infrastructure Smoke" title, description, then `# Hello from MDX` body.
- ToC rail on right shows: Section A → Sub-section A.1 → Section B.
- Theme toggle (top-right) flips between light/dark with no FOUC.
- Cmd+K opens the command menu (empty results, "Plan C wires the index" message visible).
- Click any sidebar component link (e.g., Button): expect 404 page (intentional — no MDX yet).
- Visit `/forms`: smoke page renders with legacy Navbar.

Stop dev server.

- [ ] **Step 5: Commit any pending generated artifacts**

```bash
git status
# If public/*.json files have unstaged changes from final builds:
git add apps/playground/public
git commit -m "chore(playground): refresh generated docs artifacts" || true
```

---

## Self-Review

**Spec coverage:**
- Architecture/module layout — Tasks 1, 4, 5, 6, 19, 20.
- MDX route loading — Task 20 (with fallback Task 22).
- `<PropsTable>` from `props.json` — Tasks 7, 11.
- `<Example>` reusing `*.examples.tsx` source — Tasks 8, 13, 21.
- Sidebar — Tasks 6, 15.
- ToC — Task 16.
- Search index generated, command menu UI shell — Tasks 9, 17. (Wiring deferred to Plan C as documented.)
- Theme toggle — Task 18.
- Foundations layouts (`TokenGrid`, `PrimitiveColorRamp`) — deferred to Plan B (foundations content). The base `TokenList` ships in Task 14.
- Smoke pages → `(smoke)` route group — Task 4.
- `*.examples.tsx` subpath export — Task 21.
- Vitest setup — Task 2.

Items deliberately deferred to Plan B/C and called out in "Out of scope":
- Pilot 5 component MDX content
- Foundations content
- Recipes migrated from smoke pages
- 36 component scaffolds
- Full search wiring
- Playwright e2e
- README rewrite

**Placeholder scan:** none of "TBD", "TODO", "fill in details", "appropriate error handling" — every step contains the actual code or command.

**Type consistency:**
- `DocFrontmatter` type defined in Task 5, used in Task 19, 20.
- `DocStatus` defined in Task 5, used in Task 14 (StatusBadge), 19 (DocsLayout).
- `NavSection`/`NavGroup`/`NavItem` defined in Task 6, used in Task 15.
- `TocEntry` defined in Task 16, used in Task 19, 20.
- `extractProps` signature in Task 7 matches usage in test fixtures.

**Risks not addressed in tasks (logged in spec):**
- `react-docgen-typescript` build performance — accepted, mitigated post-Plan-A if needed.
- Shiki theme size — acceptable.
- `@tailwindcss/typography` Tailwind v4 syntax — uses `@plugin` directive (Task 19 step 3); verify against current preset.css.
