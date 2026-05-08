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

Shortcuts con Make:

```bash
make install
make build
make test
make dev
```

## Setup Verdaccio (local registry)

Deploy local npm registry via Docker + Verdaccio. Richiede Docker installato.

```bash
# setup config + avvia Verdaccio + Caddy
make verdaccio-start

# verifica
curl -I http://localhost:4873/
open http://localhost:4873  # web UI
```

Crea utente:

```bash
npm login --registry=http://localhost:4873/
# username, password, email
```

Stop:

```bash
make verdaccio-stop
```

Clean data:

```bash
make verdaccio-clean
```

### Publishing su Verdaccio

Build + publish all packages:

```bash
make publish
```

Verifica web UI: `http://localhost:4873` → `@idcert/*` packages.

Workflow release con Changesets:

```bash
pnpm changeset                 # aggiungi changeset
git add .changeset && git commit
pnpm changeset version         # bump versioni
make publish                   # build + publish
git push --follow-tags
```

O tutto in one:

```bash
make release
```

## Documentation

### Component docs

Live in `apps/playground/content/docs`, served by playground Next app.

```bash
make build                     # ensure dist/* exists
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

### Opzione A — Automatico (Makefile)

Salva `Makefile` nella app consumer:

```makefile
REGISTRY := http://localhost:4873/
REGISTRY_HOST := localhost:4873

DEPS := @idcert/ui @idcert/tokens \
        react react-dom \
        date-fns react-day-picker react-hook-form zod

DEV_DEPS := @idcert/tailwind-config tailwindcss postcss autoprefixer

NEXT_DEPS := next next-themes

.PHONY: setup npmrc login install clean

setup: npmrc login install
	@echo "✓ idcert-ui ready"

npmrc:
	@if [ ! -f .npmrc ]; then \
		printf "@idcert:registry=$(REGISTRY)\n//$REGISTRY_HOST/:always-auth=true\n" > .npmrc; \
		echo "✓ .npmrc created"; \
	fi

login:
	@if ! npm whoami --registry=$(REGISTRY) >/dev/null 2>&1; then \
		npm login --registry=$(REGISTRY); \
	fi

install:
	npm i $(DEPS) $(NEXT_DEPS)
	npm i -D $(DEV_DEPS)

clean:
	rm -rf node_modules package-lock.json
```

Uso:

```bash
make setup
```

### Opzione B — Manuale

1. Installa pacchetti:

   ```bash
   npm i @idcert/ui @idcert/tokens \
         react react-dom \
         date-fns react-day-picker react-hook-form zod \
         next next-themes
   npm i -D @idcert/tailwind-config tailwindcss postcss autoprefixer
   ```

   Setup `.npmrc` (commit):

   ```ini
   @idcert:registry=http://localhost:4873/
   //localhost:4873/:always-auth=true
   ```

   Login (una volta):

   ```bash
   npm login --registry=http://localhost:4873/
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

## Infra + Deployment

- [Verdaccio on company Docker](docs/infra/verdaccio-on-company-docker.md) — deploy registry su server aziendale
- [VPS + Docker setup](docs/infra/vps-docker-setup.md) — provisioning VPS da zero
- [Complete setup guide](docs/infra/verdaccio-bitbucket-setup.md) — full workflow Bitbucket + Verdaccio + CI

## Documentazione design system

- Spec design system: `docs/superpowers/specs/2026-05-04-idcert-ui-design.md`
- Plan foundation: `docs/superpowers/plans/2026-05-04-idcert-ui-foundation.md`
