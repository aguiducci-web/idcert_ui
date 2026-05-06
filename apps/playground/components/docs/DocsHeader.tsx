'use client'

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
