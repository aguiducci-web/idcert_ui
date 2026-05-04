# idcert-ui Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation of `@idcert/ui` design system — full Turborepo monorepo with all packages skeletoned, tokens system, Tailwind preset, theming, Storybook + Vitest + CI/release infrastructure, and one canonical component (Button) shipped end-to-end as v0.1.0 to npm.

**Architecture:** pnpm workspaces + Turborepo. Three published packages (`@idcert/ui`, `@idcert/tokens`, `@idcert/tailwind-config`) plus shared `@idcert/tsconfig` (private). Two apps (`storybook`, `playground`) for development. CSS variables generated from TS tokens at build time. Components use Base UI headless primitives + Tailwind. Released via changesets on merge to main.

**Tech Stack:** React 18+, Next.js 14+, TypeScript 5.4+, pnpm 9+, Turborepo 2+, Tailwind 3.4+, Base UI, tsup (esbuild), Vitest, Storybook 8, changesets, ESLint 9 (flat config).

**Spec:** `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`

**Repo:** `~/progetti/idcert-ui` (already initialized as git repo on `main` branch)

---

## File Structure

After completion:

```
idcert-ui/
├── .changeset/
│   └── config.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── .gitignore
├── .npmrc
├── apps/
│   ├── playground/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── next.config.mjs
│   │   ├── package.json
│   │   ├── postcss.config.mjs
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   └── storybook/
│       ├── .storybook/
│       │   ├── main.ts
│       │   └── preview.tsx
│       ├── package.json
│       └── tsconfig.json
├── docs/
│   └── superpowers/
│       ├── plans/2026-05-04-idcert-ui-foundation.md
│       └── specs/2026-05-04-idcert-ui-design.md
├── eslint.config.mjs
├── package.json
├── packages/
│   ├── tailwind-config/
│   │   ├── package.json
│   │   ├── tailwind.preset.ts
│   │   └── tsconfig.json
│   ├── tokens/
│   │   ├── package.json
│   │   ├── scripts/build-css.ts
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── primitives.ts
│   │   │   └── semantic.ts
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   ├── tsconfig/
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   ├── package.json
│   │   └── react-library.json
│   └── ui/
│       ├── package.json
│       ├── src/
│       │   ├── components/
│       │   │   ├── button/
│       │   │   │   ├── button.stories.tsx
│       │   │   │   ├── button.test.tsx
│       │   │   │   └── index.tsx
│       │   │   └── theme-provider/
│       │   │       └── index.tsx
│       │   ├── hooks/
│       │   │   └── index.ts
│       │   ├── lib/
│       │   │   ├── cn.ts
│       │   │   └── index.ts
│       │   ├── styles/
│       │   │   └── globals.css
│       │   └── index.ts
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       ├── vitest.config.ts
│       └── vitest.setup.ts
├── pnpm-workspace.yaml
├── README.md
└── turbo.json
```

**Responsibilities:**

- `package.json` (root): workspace orchestration scripts only.
- `pnpm-workspace.yaml`: declare workspaces.
- `turbo.json`: pipeline (build, test, lint, typecheck) with caching.
- `eslint.config.mjs`: shared ESLint flat config.
- `.changeset/config.json`: changesets config (public access, baseBranch main).
- `packages/tsconfig`: 3 base TS configs reused everywhere.
- `packages/tokens`: source of truth for design values; emits CSS + TS exports.
- `packages/tailwind-config`: Tailwind preset consuming tokens via CSS vars.
- `packages/ui`: published library; one component per directory; barrel index.
- `apps/storybook`: development & visual review.
- `apps/playground`: Next.js consumer for integration testing.

---

## Task 1: Root workspace setup

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.npmrc`
- Create: `README.md`

- [ ] **Step 1: Create `.gitignore`**

Create `.gitignore`:

```gitignore
# Dependencies
node_modules
.pnpm-store

# Builds
dist
.next
out
storybook-static
.turbo

# Test
coverage
.vitest-cache

# Editor
.vscode
.idea
.DS_Store

# Env
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Package artifacts
*.tgz
.changeset/.changes.json
```

- [ ] **Step 2: Create `.npmrc`**

Create `.npmrc`:

```
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=false
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
```

- [ ] **Step 3: Create `pnpm-workspace.yaml`**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 4: Create root `package.json`**

Create `package.json`:

```json
{
  "name": "idcert-ui",
  "version": "0.0.0",
  "private": true,
  "description": "idcert.io design system monorepo",
  "packageManager": "pnpm@9.12.0",
  "engines": {
    "node": ">=20",
    "pnpm": ">=9"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build --filter=./packages/* && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.9",
    "turbo": "^2.2.3",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 5: Create `README.md`**

Create `README.md`:

```markdown
# idcert-ui

Design system aziendale per idcert.io.

Monorepo Turborepo con pacchetti pubblicati su npm:

- `@idcert/ui` — libreria componenti React
- `@idcert/tokens` — design tokens (colori, spacing, tipografia)
- `@idcert/tailwind-config` — preset Tailwind condiviso

## Setup

```bash
pnpm install
pnpm dev          # avvia Storybook + playground
pnpm test         # run tutti test
pnpm build        # build tutti pacchetti
```

## Stack

React 18+, Next.js 14+, TypeScript, Base UI, Tailwind CSS, Vitest, Storybook 8.

Vedi `docs/superpowers/specs/` per design system completo.
```

- [ ] **Step 6: Install root dependencies and verify**

Run:
```bash
cd ~/progetti/idcert-ui
pnpm install
```

Expected: pnpm creates `node_modules/`, `pnpm-lock.yaml`. No errors.

Then verify turbo works:
```bash
pnpm exec turbo --version
```

Expected: prints version `2.x.x`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: init pnpm workspace with turborepo"
```

---

## Task 2: Turborepo pipeline config

**Files:**
- Create: `turbo.json`

- [ ] **Step 1: Create `turbo.json`**

Create `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", "tsconfig.base.json"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**", "storybook-static/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add turbo.json
git commit -m "chore: add turborepo pipeline config"
```

---

## Task 3: Shared TypeScript configs package

**Files:**
- Create: `packages/tsconfig/package.json`
- Create: `packages/tsconfig/base.json`
- Create: `packages/tsconfig/react-library.json`
- Create: `packages/tsconfig/nextjs.json`

- [ ] **Step 1: Create `packages/tsconfig/package.json`**

```json
{
  "name": "@idcert/tsconfig",
  "version": "0.0.0",
  "private": true,
  "files": ["base.json", "react-library.json", "nextjs.json"]
}
```

- [ ] **Step 2: Create `packages/tsconfig/base.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Base",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "moduleDetection": "force",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "exclude": ["node_modules", "dist", ".next", ".turbo", "coverage"]
}
```

- [ ] **Step 3: Create `packages/tsconfig/react-library.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "React Library",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: Create `packages/tsconfig/nextjs.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "allowJs": true,
    "incremental": true,
    "plugins": [{ "name": "next" }]
  }
}
```

- [ ] **Step 5: Verify pnpm picks up the package**

Run:
```bash
pnpm install
pnpm ls --depth=0 --filter='@idcert/tsconfig'
```

Expected: shows `@idcert/tsconfig` from `packages/tsconfig`.

- [ ] **Step 6: Commit**

```bash
git add packages/tsconfig
git commit -m "chore(tsconfig): add shared typescript configs"
```

---

## Task 4: Tokens package — primitives

**Files:**
- Create: `packages/tokens/package.json`
- Create: `packages/tokens/tsconfig.json`
- Create: `packages/tokens/src/primitives.ts`

- [ ] **Step 1: Create `packages/tokens/package.json`**

```json
{
  "name": "@idcert/tokens",
  "version": "0.0.0",
  "description": "Design tokens for @idcert/ui",
  "type": "module",
  "sideEffects": ["dist/styles.css"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup && tsx scripts/build-css.ts",
    "dev": "tsup --watch",
    "clean": "rm -rf dist .turbo",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src"
  },
  "devDependencies": {
    "@idcert/tsconfig": "workspace:*",
    "tsup": "^8.3.0",
    "tsx": "^4.19.1",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 2: Create `packages/tokens/tsconfig.json`**

```json
{
  "extends": "@idcert/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*", "scripts/**/*"]
}
```

- [ ] **Step 3: Create `packages/tokens/src/primitives.ts`**

```ts
export const primitives = {
  color: {
    neutral: {
      50:  '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    brand: {
      50:  '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    red: {
      50:  '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    green: {
      50:  '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    yellow: {
      50:  '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
      950: '#422006',
    },
  },
  radius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  font: {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',
  },
} as const

export type ColorScale = keyof typeof primitives.color
export type ColorShade = keyof (typeof primitives.color)['neutral']
```

- [ ] **Step 4: Install package deps**

Run:
```bash
cd ~/progetti/idcert-ui
pnpm install
```

Expected: installs `tsup`, `tsx`, `typescript` for `@idcert/tokens`.

- [ ] **Step 5: Verify TypeScript compiles primitives**

Run:
```bash
pnpm --filter @idcert/tokens exec tsc --noEmit
```

Expected: PASS, no output.

- [ ] **Step 6: Commit**

```bash
git add packages/tokens
git commit -m "feat(tokens): add primitive design tokens"
```

---

## Task 5: Tokens package — semantic layer

**Files:**
- Create: `packages/tokens/src/semantic.ts`
- Create: `packages/tokens/src/index.ts`

- [ ] **Step 1: Create `packages/tokens/src/semantic.ts`**

```ts
import { primitives } from './primitives.js'

export type SemanticTokens = {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
}

export const semantic: { light: SemanticTokens; dark: SemanticTokens } = {
  light: {
    background:            primitives.color.neutral[50],
    foreground:            primitives.color.neutral[950],
    card:                  '#ffffff',
    cardForeground:        primitives.color.neutral[950],
    primary:               primitives.color.brand[600],
    primaryForeground:     primitives.color.neutral[50],
    secondary:             primitives.color.neutral[100],
    secondaryForeground:   primitives.color.neutral[900],
    muted:                 primitives.color.neutral[100],
    mutedForeground:       primitives.color.neutral[600],
    accent:                primitives.color.neutral[100],
    accentForeground:      primitives.color.neutral[900],
    destructive:           primitives.color.red[600],
    destructiveForeground: primitives.color.neutral[50],
    border:                primitives.color.neutral[200],
    input:                 primitives.color.neutral[200],
    ring:                  primitives.color.brand[600],
  },
  dark: {
    background:            primitives.color.neutral[950],
    foreground:            primitives.color.neutral[50],
    card:                  primitives.color.neutral[900],
    cardForeground:        primitives.color.neutral[50],
    primary:               primitives.color.brand[500],
    primaryForeground:     primitives.color.neutral[950],
    secondary:             primitives.color.neutral[800],
    secondaryForeground:   primitives.color.neutral[50],
    muted:                 primitives.color.neutral[800],
    mutedForeground:       primitives.color.neutral[400],
    accent:                primitives.color.neutral[800],
    accentForeground:      primitives.color.neutral[50],
    destructive:           primitives.color.red[500],
    destructiveForeground: primitives.color.neutral[50],
    border:                primitives.color.neutral[800],
    input:                 primitives.color.neutral[800],
    ring:                  primitives.color.brand[500],
  },
}
```

- [ ] **Step 2: Create `packages/tokens/src/index.ts`**

```ts
export { primitives } from './primitives.js'
export type { ColorScale, ColorShade } from './primitives.js'
export { semantic } from './semantic.js'
export type { SemanticTokens } from './semantic.js'
```

- [ ] **Step 3: Verify TypeScript**

Run:
```bash
pnpm --filter @idcert/tokens exec tsc --noEmit
```

Expected: PASS, no output.

- [ ] **Step 4: Commit**

```bash
git add packages/tokens/src/semantic.ts packages/tokens/src/index.ts
git commit -m "feat(tokens): add semantic layer mapping primitives to roles"
```

---

## Task 6: Tokens — CSS variables build script

**Files:**
- Create: `packages/tokens/scripts/build-css.ts`
- Create: `packages/tokens/tsup.config.ts`

- [ ] **Step 1: Create `packages/tokens/tsup.config.ts`**

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
})
```

- [ ] **Step 2: Create `packages/tokens/scripts/build-css.ts`**

This script reads semantic + primitive tokens and emits `dist/styles.css` with CSS variables.

Hex-to-RGB-channels conversion: `#0ea5e9` → `14 165 233`.

```ts
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { primitives } from '../src/primitives.js'
import { semantic, type SemanticTokens } from '../src/semantic.js'

function hexToRgbChannels(hex: string): string {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.slice(0, 2), 16)
  const g = parseInt(cleaned.slice(2, 4), 16)
  const b = parseInt(cleaned.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function emitColorVars(tokens: SemanticTokens): string {
  return Object.entries(tokens)
    .map(([name, hex]) => `  --${camelToKebab(name)}: ${hexToRgbChannels(hex)};`)
    .join('\n')
}

function emitRadiusVars(): string {
  return Object.entries(primitives.radius)
    .map(([name, value]) => `  --radius-${name}: ${value};`)
    .join('\n')
}

function emitFontVars(): string {
  return Object.entries(primitives.font)
    .map(([name, value]) => `  --font-${name}: ${value};`)
    .join('\n')
}

const css = `/* Auto-generated by packages/tokens/scripts/build-css.ts. Do not edit. */

:root {
${emitColorVars(semantic.light)}
${emitRadiusVars()}
${emitFontVars()}
}

.dark {
${emitColorVars(semantic.dark)}
}
`

const distDir = resolve(import.meta.dirname, '..', 'dist')
mkdirSync(distDir, { recursive: true })
writeFileSync(resolve(distDir, 'styles.css'), css, 'utf8')
console.log(`✓ wrote ${resolve(distDir, 'styles.css')}`)
```

- [ ] **Step 3: Run build**

Run:
```bash
pnpm --filter @idcert/tokens build
```

Expected:
- `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts` created by tsup
- `dist/styles.css` created by build-css script
- Console output ends with `✓ wrote .../dist/styles.css`

- [ ] **Step 4: Verify CSS output**

Run:
```bash
head -20 packages/tokens/dist/styles.css
```

Expected: header comment, `:root` block with `--background: 250 250 250;`, `--primary: 2 132 199;` etc., `.dark` block.

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/tsup.config.ts packages/tokens/scripts/build-css.ts
git commit -m "feat(tokens): add tsup build and CSS variables generator"
```

---

## Task 7: Tailwind config preset package

**Files:**
- Create: `packages/tailwind-config/package.json`
- Create: `packages/tailwind-config/tsconfig.json`
- Create: `packages/tailwind-config/tailwind.preset.ts`

- [ ] **Step 1: Create `packages/tailwind-config/package.json`**

```json
{
  "name": "@idcert/tailwind-config",
  "version": "0.0.0",
  "description": "Shared Tailwind preset for @idcert/ui consumers",
  "type": "module",
  "main": "./tailwind.preset.ts",
  "exports": {
    ".": "./tailwind.preset.ts"
  },
  "files": ["tailwind.preset.ts"],
  "scripts": {
    "build": "echo 'no build needed'",
    "clean": "echo 'nothing to clean'",
    "typecheck": "tsc --noEmit",
    "lint": "eslint ."
  },
  "peerDependencies": {
    "tailwindcss": ">=3.4"
  },
  "devDependencies": {
    "@idcert/tsconfig": "workspace:*",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 2: Create `packages/tailwind-config/tsconfig.json`**

```json
{
  "extends": "@idcert/tsconfig/base.json",
  "include": ["tailwind.preset.ts"]
}
```

- [ ] **Step 3: Create `packages/tailwind-config/tailwind.preset.ts`**

```ts
import type { Config } from 'tailwindcss'

const preset: Pick<Config, 'darkMode' | 'theme'> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background:  'rgb(var(--background) / <alpha-value>)',
        foreground:  'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT:    'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT:    'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT:    'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        input:  'rgb(var(--input) / <alpha-value>)',
        ring:   'rgb(var(--ring) / <alpha-value>)',
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
}

export default preset
```

- [ ] **Step 4: Install + typecheck**

Run:
```bash
pnpm install
pnpm --filter @idcert/tailwind-config typecheck
```

Expected: PASS, no output.

- [ ] **Step 5: Commit**

```bash
git add packages/tailwind-config
git commit -m "feat(tailwind-config): add shared tailwind preset"
```

---

## Task 8: UI package skeleton + cn utility

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/lib/cn.ts`
- Create: `packages/ui/src/lib/index.ts`
- Create: `packages/ui/src/hooks/index.ts`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/src/styles/globals.css`

- [ ] **Step 1: Create `packages/ui/package.json`**

```json
{
  "name": "@idcert/ui",
  "version": "0.0.0",
  "description": "idcert.io React component library",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css",
    "./tailwind": {
      "types": "./tailwind.preset.d.ts",
      "default": "./tailwind.preset.js"
    }
  },
  "files": ["dist", "tailwind.preset.js", "tailwind.preset.d.ts"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist .turbo",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src"
  },
  "peerDependencies": {
    "next": ">=14",
    "next-themes": ">=0.3",
    "react": ">=18",
    "react-dom": ">=18"
  },
  "peerDependenciesMeta": {
    "next": { "optional": true }
  },
  "dependencies": {
    "@base-ui-components/react": "^1.0.0-beta.0",
    "@idcert/tokens": "workspace:*",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.453.0",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@idcert/tailwind-config": "workspace:*",
    "@idcert/tsconfig": "workspace:*",
    "@testing-library/jest-dom": "^6.6.2",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "@vitest/coverage-v8": "^2.1.4",
    "jsdom": "^25.0.1",
    "next": "^14.2.16",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tsup": "^8.3.0",
    "typescript": "^5.6.3",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Step 2: Create `packages/ui/tsconfig.json`**

```json
{
  "extends": "@idcert/tsconfig/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create `packages/ui/src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Create `packages/ui/src/lib/index.ts`**

```ts
export { cn } from './cn.js'
```

- [ ] **Step 5: Create `packages/ui/src/hooks/index.ts`**

```ts
export {}
```

- [ ] **Step 6: Create `packages/ui/src/styles/globals.css`**

```css
@import '@idcert/tokens/styles.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
  }
}
```

- [ ] **Step 7: Create `packages/ui/src/index.ts`**

```ts
export { cn } from './lib/index.js'
```

- [ ] **Step 8: Install**

Run:
```bash
pnpm install
```

Expected: installs all `@idcert/ui` deps.

- [ ] **Step 9: Typecheck**

Run:
```bash
pnpm --filter @idcert/ui typecheck
```

Expected: PASS, no output.

- [ ] **Step 10: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): add package skeleton with cn utility and globals.css"
```

---

## Task 9: Vitest config + setup file

**Files:**
- Create: `packages/ui/vitest.config.ts`
- Create: `packages/ui/vitest.setup.ts`

- [ ] **Step 1: Create `packages/ui/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/index.ts',
        '**/*.config.ts',
      ],
      thresholds: { lines: 70, branches: 70 },
    },
  },
})
```

- [ ] **Step 2: Create `packages/ui/vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 3: Verify Vitest runs (no tests yet)**

Run:
```bash
pnpm --filter @idcert/ui test
```

Expected:
```
No test files found, exiting with code 0
```
(or similar — no tests, no failures)

If exit code is non-zero with `passWithNoTests` issue, edit `vitest.config.ts` and add `passWithNoTests: true` under `test:`.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/vitest.config.ts packages/ui/vitest.setup.ts
git commit -m "chore(ui): add vitest config with jsdom and testing-library setup"
```

---

## Task 10: ThemeProvider component

**Files:**
- Create: `packages/ui/src/components/theme-provider/index.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Create `packages/ui/src/components/theme-provider/index.tsx`**

```tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps): React.JSX.Element {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { useTheme } from 'next-themes'
```

- [ ] **Step 2: Update `packages/ui/src/index.ts`**

Replace contents:

```ts
export { cn } from './lib/index.js'
export { ThemeProvider, useTheme } from './components/theme-provider/index.js'
```

- [ ] **Step 3: Typecheck**

Run:
```bash
pnpm --filter @idcert/ui typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src
git commit -m "feat(ui): add ThemeProvider wrapping next-themes"
```

---

## Task 11: Button component — failing test (TDD step 1)

**Files:**
- Create: `packages/ui/src/components/button/button.test.tsx`

- [ ] **Step 1: Create `packages/ui/src/components/button/button.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Button } from './index.js'

describe('Button', () => {
  test('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  test('forwards click handler', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  test('respects disabled prop', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>X</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  test('applies destructive variant class', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
  })

  test('applies size variant class', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')
  })

  test('forwards ref to button element', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref}>Ref</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  test('merges custom className with variant classes', () => {
    render(<Button className="custom-class">X</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  test('renders as child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Link' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })
})
```

- [ ] **Step 2: Run the test — verify it fails**

Run:
```bash
pnpm --filter @idcert/ui test
```

Expected: FAIL with error like `Failed to resolve import "./index.js"` or `Cannot find module './index'`.

This is the expected RED state of TDD.

- [ ] **Step 3: Commit failing test**

```bash
git add packages/ui/src/components/button/button.test.tsx
git commit -m "test(ui): add failing Button tests"
```

---

## Task 12: Button component — implementation (TDD step 2)

**Files:**
- Create: `packages/ui/src/components/button/index.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Create `packages/ui/src/components/button/index.tsx`**

```tsx
'use client'

import * as React from 'react'
import { useRender } from '@base-ui-components/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:     'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:       'hover:bg-accent hover:text-accent-foreground',
        link:        'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-8 rounded-md px-3 text-xs',
        lg:      'h-11 rounded-md px-8',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  },
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, asChild = false, ...props }, ref) {
    const { renderElement } = useRender({
      render: asChild ? <slot /> : <button />,
      props: {
        ...props,
        ref,
        className: cn(buttonVariants({ variant, size, className })),
      },
    })
    return renderElement()
  },
)

export { buttonVariants }
```

**Note:** Base UI `useRender` with `<slot />` is the asChild equivalent. If `@base-ui-components/react/use-render` is not exported in your installed version, fall back to a manual `Slot` implementation:

```tsx
// Fallback if useRender unavailable
import { Slot } from '@radix-ui/react-slot'  // already a transitive dep
// then in Button:
const Comp = asChild ? Slot : 'button'
return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
```

Verify which API your installed Base UI version exposes via:
```bash
ls node_modules/@base-ui-components/react/cjs/ | head -30
```

If `use-render` exists, use it. Otherwise install `@radix-ui/react-slot` explicitly and use the fallback.

- [ ] **Step 2: Update `packages/ui/src/index.ts`**

Replace contents:

```ts
export { cn } from './lib/index.js'
export { ThemeProvider, useTheme } from './components/theme-provider/index.js'
export { Button, buttonVariants, type ButtonProps } from './components/button/index.js'
```

- [ ] **Step 3: Run tests — verify they pass**

Run:
```bash
pnpm --filter @idcert/ui test
```

Expected: 8 tests PASS.

If `bg-destructive` or `h-8` class assertions fail, the cva output isn't generating those classes. Inspect with:
```bash
pnpm --filter @idcert/ui test -- --reporter=verbose
```

- [ ] **Step 4: Typecheck**

Run:
```bash
pnpm --filter @idcert/ui typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src
git commit -m "feat(ui): add Button component with variants"
```

---

## Task 13: tsup build config for UI package

**Files:**
- Create: `packages/ui/tsup.config.ts`

- [ ] **Step 1: Create `packages/ui/tsup.config.ts`**

```ts
import { defineConfig } from 'tsup'
import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'next', 'next-themes'],
  treeshake: true,
  banner: { js: '"use client";' },
  async onSuccess() {
    const dist = resolve('dist')
    mkdirSync(dist, { recursive: true })
    copyFileSync('src/styles/globals.css', resolve(dist, 'styles.css'))
    console.log('✓ copied globals.css to dist/styles.css')
  },
})
```

- [ ] **Step 2: Build the package**

Run:
```bash
pnpm --filter @idcert/tokens build
pnpm --filter @idcert/ui build
```

Expected:
- `packages/ui/dist/index.js` (ESM)
- `packages/ui/dist/index.cjs` (CJS)
- `packages/ui/dist/index.d.ts` (types)
- `packages/ui/dist/styles.css` (CSS)
- All start with `"use client";` banner (for `.js` and `.cjs`)

- [ ] **Step 3: Verify "use client" banner**

Run:
```bash
head -1 packages/ui/dist/index.js
```

Expected: `"use client";`

- [ ] **Step 4: Verify exports work — quick smoke test**

Run:
```bash
node -e "import('./packages/ui/dist/index.js').then(m => console.log(Object.keys(m)))"
```

Expected: prints `[ 'Button', 'ThemeProvider', 'buttonVariants', 'cn', 'useTheme' ]` (order may vary).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/tsup.config.ts
git commit -m "feat(ui): add tsup build config with use client banner"
```

---

## Task 14: ESLint flat config

**Files:**
- Create: `eslint.config.mjs`
- Modify: root `package.json` (add ESLint deps)

- [ ] **Step 1: Add ESLint deps to root `package.json`**

Update `devDependencies` block in root `package.json` to include ESLint stack:

```json
"devDependencies": {
  "@changesets/cli": "^2.27.9",
  "@eslint/js": "^9.13.0",
  "@typescript-eslint/eslint-plugin": "^8.11.0",
  "@typescript-eslint/parser": "^8.11.0",
  "eslint": "^9.13.0",
  "eslint-plugin-react": "^7.37.2",
  "eslint-plugin-react-hooks": "^5.0.0",
  "globals": "^15.11.0",
  "turbo": "^2.2.3",
  "typescript": "^5.6.3",
  "typescript-eslint": "^8.11.0"
}
```

- [ ] **Step 2: Create `eslint.config.mjs`**

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/storybook-static/**',
      '**/coverage/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
```

- [ ] **Step 3: Install + run lint**

Run:
```bash
pnpm install
pnpm --filter @idcert/ui lint
```

Expected: PASS (or trivial warnings — fix any errors).

- [ ] **Step 4: Commit**

```bash
git add eslint.config.mjs package.json
git commit -m "chore: add eslint flat config"
```

---

## Task 15: Storybook app

**Files:**
- Create: `apps/storybook/package.json`
- Create: `apps/storybook/tsconfig.json`
- Create: `apps/storybook/.storybook/main.ts`
- Create: `apps/storybook/.storybook/preview.tsx`

- [ ] **Step 1: Create `apps/storybook/package.json`**

```json
{
  "name": "@idcert/storybook",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "storybook build",
    "clean": "rm -rf storybook-static .turbo",
    "typecheck": "tsc --noEmit",
    "lint": "eslint ."
  },
  "dependencies": {
    "@idcert/ui": "workspace:*",
    "@idcert/tokens": "workspace:*",
    "@idcert/tailwind-config": "workspace:*",
    "next": "^14.2.16",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@idcert/tsconfig": "workspace:*",
    "@storybook/addon-a11y": "^8.3.6",
    "@storybook/addon-essentials": "^8.3.6",
    "@storybook/addon-themes": "^8.3.6",
    "@storybook/nextjs": "^8.3.6",
    "@storybook/react": "^8.3.6",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "storybook": "^8.3.6",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 2: Create `apps/storybook/tsconfig.json`**

```json
{
  "extends": "@idcert/tsconfig/nextjs.json",
  "include": [".storybook/**/*", "../../packages/ui/src/**/*.stories.tsx"]
}
```

- [ ] **Step 3: Create `apps/storybook/.storybook/main.ts`**

```ts
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: ['../../../packages/ui/src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
  },
}

export default config
```

- [ ] **Step 4: Create `apps/storybook/.storybook/preview.tsx`**

```tsx
import * as React from 'react'
import type { Preview } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes'
import '@idcert/ui/styles.css'

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
```

- [ ] **Step 5: Tailwind config for Storybook**

Storybook needs Tailwind to compile classes used in stories. Add `apps/storybook/tailwind.config.ts`:

```ts
import preset from '@idcert/tailwind-config'

export default {
  presets: [preset],
  content: [
    '../../packages/ui/src/**/*.{ts,tsx}',
    '.storybook/**/*.{ts,tsx}',
  ],
}
```

And `apps/storybook/postcss.config.mjs`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: Install + verify Storybook starts**

Run:
```bash
pnpm install
pnpm --filter @idcert/storybook dev
```

Expected: Storybook starts on `http://localhost:6006`. No stories yet (Button story added next task).

Stop with Ctrl+C after verifying.

- [ ] **Step 7: Commit**

```bash
git add apps/storybook
git commit -m "feat(storybook): add storybook app with a11y and themes addons"
```

---

## Task 16: Button Storybook story

**Files:**
- Create: `packages/ui/src/components/button/button.stories.tsx`

- [ ] **Step 1: Create `packages/ui/src/components/button/button.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './index.js'

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
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Button',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete' } }
export const Outline: Story = { args: { variant: 'outline' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Link: Story = { args: { variant: 'link' } }

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const Disabled: Story = { args: { disabled: true } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}
```

- [ ] **Step 2: Verify story renders in Storybook**

Run:
```bash
pnpm --filter @idcert/storybook dev
```

Open `http://localhost:6006`.

Expected:
- Sidebar shows `Primitives/Button` with stories: Default, Destructive, Outline, Secondary, Ghost, Link, Sizes, Disabled, AllVariants
- Default story renders a styled blue button
- Theme toolbar (top) toggles light/dark; button colors swap
- A11y addon panel shows no violations on Default story

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/button/button.stories.tsx
git commit -m "docs(ui): add Button stories"
```

---

## Task 17: Playground Next.js app

**Files:**
- Create: `apps/playground/package.json`
- Create: `apps/playground/tsconfig.json`
- Create: `apps/playground/next.config.mjs`
- Create: `apps/playground/postcss.config.mjs`
- Create: `apps/playground/tailwind.config.ts`
- Create: `apps/playground/app/layout.tsx`
- Create: `apps/playground/app/page.tsx`
- Create: `apps/playground/app/globals.css`

- [ ] **Step 1: Create `apps/playground/package.json`**

```json
{
  "name": "@idcert/playground",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "clean": "rm -rf .next .turbo",
    "typecheck": "tsc --noEmit",
    "lint": "next lint"
  },
  "dependencies": {
    "@idcert/tailwind-config": "workspace:*",
    "@idcert/tokens": "workspace:*",
    "@idcert/ui": "workspace:*",
    "next": "^14.2.16",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@idcert/tsconfig": "workspace:*",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 2: Create `apps/playground/tsconfig.json`**

```json
{
  "extends": "@idcert/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `apps/playground/next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@idcert/ui'],
}

export default nextConfig
```

- [ ] **Step 4: Create `apps/playground/postcss.config.mjs`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Create `apps/playground/tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'
import preset from '@idcert/tailwind-config'

export default {
  presets: [preset],
  content: [
    './app/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
} satisfies Config
```

- [ ] **Step 6: Create `apps/playground/app/globals.css`**

```css
@import '@idcert/tokens/styles.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Create `apps/playground/app/layout.tsx`**

```tsx
import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@idcert/ui'

export const metadata: Metadata = {
  title: 'idcert-ui playground',
  description: 'Integration test app for @idcert/ui',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 8: Create `apps/playground/app/page.tsx`**

```tsx
'use client'

import { Button, useTheme } from '@idcert/ui'

export default function Home() {
  const { theme, setTheme } = useTheme()

  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">@idcert/ui playground</h1>
      <p className="text-muted-foreground">Theme: {theme}</p>
      <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle theme
      </Button>
      <div className="flex flex-wrap gap-3">
        <Button>Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </main>
  )
}
```

- [ ] **Step 9: Install + run dev**

Run:
```bash
pnpm install
pnpm --filter @idcert/ui build
pnpm --filter @idcert/tokens build
pnpm --filter @idcert/playground dev
```

Open `http://localhost:3000`.

Expected:
- Page renders with heading + theme indicator + toggle button + variant row
- Toggle button switches `<html>` between `class=""` and `class="dark"`
- Button colors invert on theme switch
- No console errors in browser

Stop with Ctrl+C.

- [ ] **Step 10: Commit**

```bash
git add apps/playground
git commit -m "feat(playground): add Next.js integration test app"
```

---

## Task 18: Changesets initialization

**Files:**
- Create: `.changeset/config.json`
- Create: `.changeset/README.md`

- [ ] **Step 1: Initialize changesets**

Run:
```bash
pnpm exec changeset init
```

Expected: creates `.changeset/config.json` and `.changeset/README.md`.

- [ ] **Step 2: Update `.changeset/config.json`**

Replace contents with:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@idcert/storybook", "@idcert/playground", "@idcert/tsconfig"]
}
```

Key settings:
- `access: public` — npm scoped packages default to private; this enables public publish
- `ignore` — apps and tsconfig package never published

- [ ] **Step 3: Commit**

```bash
git add .changeset
git commit -m "chore: init changesets"
```

---

## Task 19: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    name: Build, lint, test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Validate published package types
        run: pnpm exec attw --pack packages/ui --pack packages/tokens --pack packages/tailwind-config --ignore-rules cjs-resolves-to-esm
        continue-on-error: true
```

- [ ] **Step 2: Add `@arethetypeswrong/cli` + `publint` to root deps**

Update root `package.json` `devDependencies`:

```json
"@arethetypeswrong/cli": "^0.16.4",
"publint": "^0.2.12",
```

Run:
```bash
pnpm install
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml package.json
git commit -m "ci: add github actions ci workflow"
```

---

## Task 20: Release workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create `.github/workflows/release.yml`**

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          registry-url: 'https://registry.npmjs.org'

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Create release PR or publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
          version: pnpm version-packages
          commit: 'chore: version packages'
          title: 'chore: version packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Manual setup required by user:** add `NPM_TOKEN` secret to GitHub repo settings (npm automation token with publish scope for `@idcert/*`).

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add changesets release workflow"
```

---

## Task 21: First changeset for v0.1.0

**Files:**
- Create: `.changeset/initial-release.md`

- [ ] **Step 1: Create `.changeset/initial-release.md`**

```markdown
---
'@idcert/ui': minor
'@idcert/tokens': minor
'@idcert/tailwind-config': minor
---

Initial release of `@idcert/ui` design system foundation.

- Monorepo Turborepo structure
- Three published packages: `@idcert/ui`, `@idcert/tokens`, `@idcert/tailwind-config`
- Design tokens (primitives + semantic) with auto-generated CSS variables
- Tailwind preset consuming CSS variables for theming
- Light + dark mode via `next-themes`
- `Button` component with 6 variants and 4 sizes (Base UI + cva)
- `ThemeProvider` wrapper
- `cn` utility for class merging
- Storybook 8 development environment
- Vitest + Testing Library test setup
```

- [ ] **Step 2: Verify changeset is detected**

Run:
```bash
pnpm changeset status
```

Expected: shows 3 packages bumping minor, target version `0.1.0`.

- [ ] **Step 3: Commit changeset**

```bash
git add .changeset/initial-release.md
git commit -m "chore: add initial release changeset"
```

---

## Task 22: Final validation

- [ ] **Step 1: Clean build from scratch**

Run:
```bash
pnpm clean
pnpm install
pnpm build
```

Expected: all packages build without errors. `packages/ui/dist/`, `packages/tokens/dist/` populated.

- [ ] **Step 2: Run all tests**

Run:
```bash
pnpm test
```

Expected: all tests PASS. Button has 8 passing tests.

- [ ] **Step 3: Run lint + typecheck across monorepo**

Run:
```bash
pnpm lint
pnpm typecheck
```

Expected: PASS, no errors.

- [ ] **Step 4: Validate package exports**

Run:
```bash
pnpm exec publint packages/ui
pnpm exec publint packages/tokens
pnpm exec publint packages/tailwind-config
```

Expected: no errors. Warnings about missing `repository` field acceptable for now.

- [ ] **Step 5: Smoke test playground**

Run:
```bash
pnpm --filter @idcert/playground dev
```

Open `http://localhost:3000`. Verify:
- Page loads
- Buttons render with correct styling
- Theme toggle works (light ↔ dark, colors invert)
- No console errors

Stop with Ctrl+C.

- [ ] **Step 6: Smoke test Storybook**

Run:
```bash
pnpm --filter @idcert/storybook dev
```

Open `http://localhost:6006`. Verify:
- Button stories all render
- Theme toggle in toolbar works
- A11y addon shows no violations
- Controls panel works (change variant/size live)

Stop with Ctrl+C.

- [ ] **Step 7: Final commit (if any leftover)**

Run:
```bash
git status
```

Expected: clean working tree. If anything uncommitted, commit it now.

---

## Post-merge actions (manual, by user)

After merging this plan to `main`:

1. Add `NPM_TOKEN` GitHub secret (npm automation token, publish scope for `@idcert/*`).
2. Reserve npm scope `@idcert` if not already owned (`npm org create idcert` or via npm web UI).
3. Wait for release workflow to run on `main` push.
4. It will create a "Version Packages" PR. Merging it triggers actual publish to npm.
5. Verify packages appear at:
   - https://www.npmjs.com/package/@idcert/ui
   - https://www.npmjs.com/package/@idcert/tokens
   - https://www.npmjs.com/package/@idcert/tailwind-config

---

## Self-Review Notes

**Spec coverage:**
- Architecture (monorepo, packages, apps) → Tasks 1-3, 7, 15, 17
- Component inventory v1 → only Button shipped here; remaining 41 components in Plans 2-5
- Theming + tokens (3-layer) → Tasks 4-7
- Build + release (tsup, exports, changesets, CI) → Tasks 13, 18-20
- Testing + QA (Vitest, RTL, Storybook a11y) → Tasks 9, 11, 16

Foundation plan deliberately scopes to **Button only** as canonical example. Plans 2-5 cover remaining components reusing the established pattern.

**Placeholder scan:** none.

**Type consistency:**
- `cn`, `Button`, `ButtonProps`, `buttonVariants`, `ThemeProvider`, `useTheme` consistent across tasks 8-12.
- `SemanticTokens` defined task 5, used task 6.
- `primitives` shape used identically tasks 4 and 6.

**Known risk:** Task 12 has fallback note for `useRender` API in Base UI. If installed version differs, fallback to `@radix-ui/react-slot` is documented inline.
