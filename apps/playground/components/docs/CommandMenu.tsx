'use client'

import * as React from 'react'
import { Command } from 'cmdk'

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      className="fixed left-1/2 top-1/4 w-[600px] max-w-[90vw] -translate-x-1/2 rounded-md border border-border bg-background p-2 shadow-lg"
    >
      <Command.Input
        placeholder="Search docs… (Plan C wires the index)"
        className="w-full border-b border-border px-3 py-2 outline-none"
      />
      <Command.List className="max-h-[400px] overflow-y-auto p-2">
        <Command.Empty className="p-4 text-sm text-muted-foreground">
          No results yet — search wiring in Plan C.
        </Command.Empty>
      </Command.List>
    </Command.Dialog>
  )
}
