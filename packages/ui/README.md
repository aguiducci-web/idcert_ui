# @idcert/ui

React component library for idcert.io. Tailwind v4 + design tokens via CSS variables.

## Install

```sh
npm i @idcert/ui --registry=http://localhost:4873/
```

Pulls transitively:
- `@idcert/tokens` — CSS variable definitions
- `@idcert/tailwind-config` — Tailwind v4 preset

Peers (auto-installed by npm 7+/pnpm with `auto-install-peers=true`):
- `tailwindcss@^4`
- `react@>=18`, `react-dom@>=18`
- `react-hook-form@^7`, `zod@^3`, `date-fns@^3 || ^4`, `react-day-picker@^9`
- `next-themes@>=0.3`
- `next@>=14` (optional)

Persistent registry mapping (avoid `--registry` flag):

```sh
echo "@idcert:registry=http://localhost:4873/" >> ~/.npmrc
```

## Setup (Next.js 14+ App Router)

### 1. Install PostCSS plugin (Tailwind v4 requirement)

```sh
npm i -D @tailwindcss/postcss
```

### 2. `postcss.config.mjs`

```js
export default {
  plugins: { "@tailwindcss/postcss": {} },
};
```

### 3. `app/globals.css`

```css
@import "tailwindcss";
@import "@idcert/tokens/styles.css";
@import "@idcert/tailwind-config/preset.css";

@source "../node_modules/@idcert/ui/dist";
```

Critical: `@source` directive tells Tailwind v4 to scan compiled component classes inside `node_modules`. Without it, utilities like `bg-destructive` are purged and components render unstyled.

Adjust `@source` path to match your project's relative location to `node_modules` (e.g. `"../../node_modules/@idcert/ui/dist"` from `src/app/globals.css` with src dir).

### 4. `app/layout.tsx`

```tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 5. Use components

```tsx
import { Button } from "@idcert/ui";

export default function Page() {
  return <Button variant="destructive">Hello world</Button>;
}
```

## Setup (Vite / generic)

Same as Next.js but:
- Replace `postcss.config.mjs` with whatever PostCSS integration the bundler uses (Vite picks up `postcss.config.*` automatically).
- Adjust `@source` path relative to your CSS file location.

## Dark mode

Preset registers `dark` variant scoped to `.dark` class. Toggle with `next-themes`:

```tsx
import { ThemeProvider } from "next-themes";

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

## Troubleshooting

**Components render unstyled / no background colors**
→ Missing `@source` directive in `globals.css`. Tailwind v4 does not scan `node_modules` by default.

**`Cannot find module '@idcert/tokens/styles.css'`**
→ Run `npm i` again, or check `@idcert:registry` mapping points to the right registry.

**Peer dependency warnings on install**
→ Install missing peers explicitly: `npm i react-hook-form zod date-fns react-day-picker`.

**Token CSS variables undefined (e.g. `--destructive` empty)**
→ Missing `@import "@idcert/tokens/styles.css";` before the preset import. Order matters: tokens first, preset second.
