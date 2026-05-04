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
