# idcert-ui

Design system aziendale per idcert.io.

Monorepo Turborepo con pacchetti pubblicati su npm:

- `@idcert/ui` — libreria componenti React
- `@idcert/tokens` — design tokens (colori, spacing, tipografia)
- `@idcert/tailwind-config` — preset Tailwind condiviso

## Setup (sviluppo)

```bash
pnpm install
pnpm build        # build tutti pacchetti
pnpm test         # run tutti test
pnpm dev          # avvia Storybook + playground (interattivo)
```

## Documentation

Component docs live in `apps/playground/content/docs` and are served by the playground Next app.

```bash
pnpm --filter @idcert/ui build           # ensure dist/* exists for examples imports
pnpm --filter @idcert/playground dev     # http://localhost:3000/docs
```

Browse:

- `http://localhost:3000/docs/getting-started/installation` — install + theming guide
- `http://localhost:3000/docs/foundations/colors` — design tokens
- `http://localhost:3000/docs/components/<slug>` — every `@idcert/ui` component

Press **Cmd+K** (Ctrl+K on Windows/Linux) anywhere in `/docs` to search component docs, foundations, and recipes. Results are grouped by category.

### Docs vs Storybook

- **Docs (`/docs`)** — consumer-facing reference: prose, anatomy, accessibility, tokens, composed examples.
- **Storybook (`pnpm --filter @idcert/ui storybook`)** — isolated component dev playground: every story in isolation, controls panel, autodocs.

Pages with a blue "Documentation in progress" badge are scaffolded only — Hero + props table — and prose is being filled in incrementally.

## Setup consumer (Next.js + Tailwind)

In una app Next.js che consuma `@idcert/ui`:

1. Installa pacchetti:

   ```bash
   pnpm add @idcert/ui @idcert/tokens
   pnpm add -D @idcert/tailwind-config tailwindcss postcss autoprefixer
   ```

2. Tailwind config (`tailwind.config.ts`):

   ```ts
   import type { Config } from 'tailwindcss'
   import preset from '@idcert/tailwind-config'

   export default {
     presets: [preset],
     content: [
       './app/**/*.{ts,tsx}',
       './node_modules/@idcert/ui/dist/**/*.js',
     ],
   } satisfies Config
   ```

3. CSS globale (`app/globals.css`):

   ```css
   @import '@idcert/tokens/styles.css';
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. Layout (`app/layout.tsx`):

   ```tsx
   import './globals.css'
   import { ThemeProvider } from '@idcert/ui'

   export default function RootLayout({ children }) {
     return (
       <html lang="it" suppressHydrationWarning>
         <body>
           <ThemeProvider>{children}</ThemeProvider>
         </body>
       </html>
     )
   }
   ```

## Stack

React 18+, Next.js 14+, TypeScript, Tailwind CSS, headless primitives (Base UI per componenti compound, Radix Slot per `asChild`), Vitest, Storybook 8.

## License

MIT — vedi [LICENSE](./LICENSE).

## Documentazione

- Spec design system: `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`
- Plan foundation: `docs/superpowers/plans/2026-05-04-idcert-ui-foundation.md`
