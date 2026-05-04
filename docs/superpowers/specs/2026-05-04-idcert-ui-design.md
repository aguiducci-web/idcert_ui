# @idcert/ui — Design System Spec

**Date:** 2026-05-04
**Owner:** Andrea Alunni Guiducci (aguiducci@idcert.io)
**Status:** Draft — pending implementation plan

## Overview

Design system aziendale per idcert.io, distribuito come pacchetto npm pubblico scoped `@idcert/ui`. Costruito su React 18+, Next.js 14+, Tailwind CSS, e Base UI (`@base-ui-components/react`) come libreria di primitive headless. Distribuito via monorepo Turborepo con pacchetti separati per UI, design tokens, e Tailwind preset.

### Goals

- Coerenza visiva e comportamentale tra tutte le app idcert.
- Accessibility baseline tramite primitive Base UI.
- Theming runtime (light/dark) tramite CSS variables.
- Distribuzione npm pubblica con versionamento semver via changesets.
- Sviluppo isolato in Storybook 8.

### Non-goals (v1)

- Visual regression testing automatico (rimandato a v2).
- Branding finale: tokens iniziali sono placeholder, definiti dopo dal team design.
- Internazionalizzazione componenti (consumer responsabile per stringhe).
- Mobile-first native (focus web responsive).

## Architecture

### Repo structure

```
idcert-ui/
├── package.json              # root, pnpm workspaces, scripts turbo
├── pnpm-workspace.yaml
├── turbo.json                # pipeline: build, test, lint, typecheck
├── tsconfig.base.json
├── .changeset/               # changesets config
├── .github/workflows/        # ci.yml (PR), release.yml (main)
├── packages/
│   ├── ui/                   # @idcert/ui — libreria pubblicata
│   │   ├── src/
│   │   │   ├── components/   # un file/dir per componente
│   │   │   ├── hooks/
│   │   │   ├── lib/          # cn(), utility
│   │   │   ├── styles/       # globals.css con CSS vars
│   │   │   └── index.ts      # barrel export
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── tokens/               # @idcert/tokens — design tokens
│   ├── tailwind-config/      # @idcert/tailwind-config — preset condiviso
│   └── tsconfig/             # @idcert/tsconfig — base configs
├── apps/
│   ├── storybook/            # Storybook 8 — dev/docs
│   └── playground/           # Next.js 15 app router — test integrazione
└── README.md
```

### Boundaries

- `packages/ui` consuma `@idcert/tokens` + `@idcert/tailwind-config` + `@base-ui-components/react`.
- `apps/storybook` consuma `@idcert/ui` via workspace `*`.
- `apps/playground` consuma `@idcert/ui` come consumer Next.js esterno (test integrazione reale).
- Pubblicati npm: `packages/ui`, `packages/tokens`, `packages/tailwind-config`. `apps/*` e `packages/tsconfig` privati.

### Tech stack

| Concern              | Choice                                |
|----------------------|---------------------------------------|
| Framework target     | React 18+, Next.js 14+ App Router     |
| Headless primitives  | Base UI (`@base-ui-components/react`) |
| Styling              | Tailwind CSS + CSS variables          |
| Variants             | `class-variance-authority`            |
| Class merging        | `clsx` + `tailwind-merge`             |
| Forms                | `react-hook-form` + `zod`             |
| Icons                | `lucide-react`                        |
| Animations           | `framer-motion`                       |
| Date handling        | `react-day-picker` + `date-fns`       |
| Theme switching      | `next-themes`                         |
| Build                | `tsup` (esbuild)                      |
| Test runner          | Vitest + Testing Library              |
| Component dev        | Storybook 8 (`@storybook/nextjs`)     |
| Versioning/release   | `changesets`                          |
| Package manager      | pnpm (workspaces)                     |
| Task orchestration   | Turborepo                             |

### Why Base UI (not Radix)

- Anchor positioning più robusto (Floating UI integrato).
- API più pulita e consistente cross-componente.
- Single package, tree-shaking efficace.
- Roadmap aperta (governance MUI Inc).
- v1 stabile 2025; backing solido.

Trade-off accettato: ecosistema esempi più piccolo vs Radix, compensato da docs ufficiali.

## Component inventory v1

Totale: ~42 componenti.

### Primitives (7)
Button, Input, Textarea, Label, Checkbox, Radio (+ RadioGroup), Switch.

### Layout (6)
Container, Stack (VStack/HStack), Grid, Card (+ Header/Content/Footer), Divider, Separator.

### Feedback (6)
Toast (Base UI Toast), Alert, Dialog/Modal, AlertDialog (conferma), Tooltip, Spinner/Loader.

### Navigation (6)
Navbar, Sidebar, Tabs, Breadcrumb, Pagination, DropdownMenu.

### Data display (7)
Table (con sorting + selection), Badge, Avatar (+ AvatarGroup), List, Skeleton, Progress, EmptyState.

### Form avanzati (7)
Select (Combobox singolo), MultiSelect, DatePicker (+ DateRangePicker), TimePicker, FileUpload (drag+drop), FormField wrapper (react-hook-form + zod), Slider.

### Utility (3)
ThemeProvider (next-themes wrap), Toaster (mount Toast region), Portal.

### Coverage da Base UI (nativi)

Dialog, AlertDialog, Tooltip, Popover, DropdownMenu (Menu), Tabs, Select, Combobox, Checkbox, Radio, Switch, Slider, Progress, Toast, Avatar, Separator, Accordion, ScrollArea, Field/Form.

### Custom (non coperti da Base UI)

Button, Input, Textarea, Label, Card, Container, Stack, Grid, Table, Sidebar, FileUpload, Navbar, Breadcrumb, Pagination, List, Skeleton, EmptyState, Spinner, DatePicker (`react-day-picker` + Base UI Popover).

### Component conventions

- Singolo file `src/components/<name>/index.tsx` (subcomponenti se compound).
- `forwardRef` dove componente espone elemento DOM.
- Variants definiti via `cva` (class-variance-authority).
- Storybook story accanto: `<name>.stories.tsx`.
- Test base: `<name>.test.tsx`.
- Default export: NO. Named export only.
- `'use client'` directive iniettata da tsup banner per tutti componenti.

## Theming + design tokens

Three-layer architecture:

### Layer 1 — Primitive tokens

`packages/tokens/src/primitives.ts`. Valori grezzi senza semantica:

```ts
export const primitives = {
  color: {
    neutral: { 50: '#fafafa', 100: '#f5f5f5', /* ...950 */ },
    brand:   { 50: '#...', /* placeholder Sky 500/600 — definito dopo */ },
    red:     { /* scale */ }, green: { /* scale */ }, /* ecc */
  },
  spacing: { 0: '0', 1: '0.25rem', 2: '0.5rem', /* ...96 */ },
  radius:  { sm: '0.25rem', md: '0.5rem', lg: '0.75rem', full: '9999px' },
  font:    { sans: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, ui-monospace, monospace' },
  fontSize:{ xs: '0.75rem', /* ...4xl */ },
  shadow:  { sm: '...', md: '...', lg: '...' },
}
```

### Layer 2 — Semantic tokens

`packages/tokens/src/semantic.ts`. Mappa primitive a ruoli, light + dark:

```ts
export const semantic = {
  light: {
    background:        primitives.color.neutral[50],
    foreground:        primitives.color.neutral[950],
    primary:           primitives.color.brand[600],
    primaryForeground: primitives.color.neutral[50],
    muted:             primitives.color.neutral[100],
    mutedForeground:   primitives.color.neutral[600],
    border:            primitives.color.neutral[200],
    input:             primitives.color.neutral[200],
    ring:              primitives.color.brand[600],
    destructive:       primitives.color.red[600],
    destructiveForeground: primitives.color.neutral[50],
    /* ecc */
  },
  dark: { /* stessa shape, valori invertiti */ },
}
```

### Layer 3 — CSS variables generate

Script build (`packages/tokens/src/build.ts`) emette `dist/styles.css`:

```css
:root {
  --background: 250 250 250;       /* RGB canali separati */
  --foreground: 10 10 10;
  --primary: 14 165 233;
  --primary-foreground: 250 250 250;
  /* ecc */
}
.dark {
  --background: 10 10 10;
  --foreground: 250 250 250;
  /* ecc */
}
```

**Perché RGB canali separati:** Tailwind utility `bg-primary/50` (alpha 50%) richiede sintassi `rgb(var(--primary) / <alpha-value>)`. Var che contiene `#hex` o `rgb(...)` non permette injection alpha.

### Tailwind preset

`packages/tailwind-config/tailwind.preset.ts`:

```ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT:    'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        /* ecc */
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
} satisfies Config
```

### Dark mode

`next-themes` provider espone classe `dark` su `<html>`. Toggle utente via `useTheme()`. SSR-safe: classe applicata server-side da cookie/header per evitare FOUC.

### ThemeProvider export

```tsx
import { ThemeProvider } from '@idcert/ui'

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

### Consumer setup (Next.js app)

```tsx
// app/layout.tsx
import '@idcert/ui/styles.css'
import { ThemeProvider, Toaster } from '@idcert/ui'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

```ts
// tailwind.config.ts (consumer)
import preset from '@idcert/tailwind-config'

export default {
  presets: [preset],
  content: [
    './app/**/*.{ts,tsx}',
    './node_modules/@idcert/ui/dist/**/*.js',
  ],
}
```

### Branding override

Consumer può sovrascrivere token nel proprio CSS senza forkare libreria:

```css
/* app idcert-admin override per whitelabel */
:root { --primary: 220 38 38; }
```

## Build + release

### tsup config

`packages/ui/tsup.config.ts`:

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/styles.css'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'next', 'next-themes'],
  treeshake: true,
  banner: { js: '"use client"' },
})
```

### Package.json exports

`packages/ui/package.json`:

```json
{
  "name": "@idcert/ui",
  "version": "0.0.0",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css",
    "./tailwind": "./tailwind.preset.js"
  },
  "files": ["dist", "tailwind.preset.js"],
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "next": ">=14"
  }
}
```

### Tree-shaking

- Barrel `src/index.ts` re-export per nome.
- `splitting: true` + ESM → consumer bundler scarta componenti non usati.
- No side-effect cross-componente.
- `sideEffects: ["**/*.css"]` segnala bundler che solo CSS ha side-effect.

### Versioning — changesets

- Sviluppatore: `pnpm changeset` su PR, descrive change (patch/minor/major).
- File `.changeset/*.md` committato.
- GitHub Action su `main`: `changesets/action` apre/aggiorna PR "Version Packages".
- Merge PR → bump versione + CHANGELOG + `pnpm publish` automatico.

### CI: `.github/workflows/ci.yml`

Trigger: PR su `main`. Steps:
- Install (`pnpm install --frozen-lockfile`)
- Lint (`pnpm lint`)
- Typecheck (`pnpm typecheck`)
- Test (`pnpm test`)
- Build (`pnpm build`)
- `publint` validare exports map
- `arethetypeswrong` validare types ESM/CJS dual-publish

### Release: `.github/workflows/release.yml`

```yaml
on: { push: { branches: [main] } }
jobs:
  release:
    runs-on: ubuntu-latest
    permissions: { contents: write, pull-requests: write, id-token: write }
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm, registry-url: 'https://registry.npmjs.org' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: changesets/action@v1
        with: { publish: pnpm release }
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`pnpm release` script: `changeset publish`.

### Pacchetti pubblicati

`@idcert/ui`, `@idcert/tokens`, `@idcert/tailwind-config`. Versioni indipendenti via changesets.

### Versioning iniziale

`0.1.0` durante sviluppo. `1.0.0` quando API stabile + tutti componenti coperti + branding finale definito.

## Testing + QA

### Stack

- Vitest (jsdom environment).
- @testing-library/react.
- @testing-library/user-event.
- @vitest/coverage-v8.

### Vitest config

`packages/ui/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: { reporter: ['text', 'html'], thresholds: { lines: 70, branches: 70 } },
  },
})
```

### Setup file

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())
```

### Test scope per componente

- Render senza errori.
- Props chiave applicate (variants, disabled, ecc).
- Interazione principale (click, type, select).
- ARIA attribute corretti.
- `forwardRef` funziona.

### Coverage target

70% lines/branches v1. Componenti custom (Table, Sidebar, FileUpload, DatePicker) priorità alta — più logica, più rischio.

### Storybook

`apps/storybook` con `@storybook/nextjs` framework.

Addons:
- `@storybook/addon-essentials`
- `@storybook/addon-a11y` (axe-core, warning only v1)
- `@storybook/addon-themes` (toggle dark/light in toolbar)

Ogni componente: story `Default` + `Variants` + `States`. Play functions per testing interattivo.

### Type checking

- `tsc --noEmit` parte di CI, fallimento blocca merge.
- Strict mode (`strict: true`, `noUncheckedIndexedAccess: true`).
- ESLint + `@typescript-eslint`, regola `no-explicit-any` errore.

### A11y

Storybook addon-a11y mostra violazioni axe inline durante dev. Non blocking in CI v1 (warning only). Promuovibile a errore quando baseline pulita.

## Open questions / future work

- Visual regression testing (Chromatic vs Playwright screenshots) — v2.
- Branding tokens finali definiti dal team design — sostituiscono placeholder.
- Documentation site dedicato (Next.js MDX) vs Storybook only — valutare se Storybook insufficiente per docs pubbliche.
- i18n primitives (es. RTL support, locale-aware DatePicker) — valutare in base a roadmap idcert.
- Migration guide quando bump major versions.

## References

- Base UI docs: https://base-ui.com
- Turborepo docs: https://turborepo.com
- Changesets docs: https://github.com/changesets/changesets
- Tailwind CSS variables pattern: shadcn/ui design system convention
- next-themes: https://github.com/pacocoursey/next-themes
