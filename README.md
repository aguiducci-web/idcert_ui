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
