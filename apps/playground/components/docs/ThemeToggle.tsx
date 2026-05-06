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
