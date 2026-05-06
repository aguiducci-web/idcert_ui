# @idcert/tokens

## 0.1.0

### Minor Changes

- 099a40e: Initial release of `@idcert/ui` design system foundation.

  - Monorepo Turborepo structure
  - Three published packages: `@idcert/ui`, `@idcert/tokens`, `@idcert/tailwind-config`
  - Design tokens (primitives + semantic) with auto-generated CSS variables
  - Tailwind preset consuming CSS variables for theming
  - Light + dark mode via `next-themes`
  - `Button` component with 6 variants and 4 sizes (Radix Slot + cva)
  - `ThemeProvider` wrapper
  - `cn` utility for class merging
  - Storybook 8 development environment
  - Vitest + Testing Library test setup
