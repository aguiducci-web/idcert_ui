'use client'
import * as React from 'react'
import { Portal } from './index.js'
import { Button } from '../button/index.js'

export const Default = () => {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen((v) => !v)}>
        {open ? 'Close portal' : 'Open portal'}
      </Button>
      {open && (
        <Portal>
          <div className="fixed bottom-4 right-4 z-50 rounded-md border border-border bg-background p-4 shadow-lg">
            <p className="text-sm">Floating help (rendered into document.body).</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        </Portal>
      )}
    </div>
  )
}

export const IntoBody = () => {
  const [open, setOpen] = React.useState(false)
  const [body, setBody] = React.useState<HTMLElement | null>(null)
  React.useEffect(() => {
    setBody(document.body)
  }, [])
  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide' : 'Show in body'}
      </Button>
      {open && body && (
        <Portal container={body}>
          <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-md border border-border bg-background px-3 py-2 shadow-md">
            <p className="text-sm">Explicit container={`{document.body}`}.</p>
          </div>
        </Portal>
      )}
    </div>
  )
}

export const CustomContainer = () => {
  const [mounted, setMounted] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    setMounted(true)
  }, [])
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Portal renders into the bordered box below, not next to the button.
      </p>
      <div
        ref={ref}
        className="min-h-16 rounded-md border border-dashed border-border p-3"
      />
      {mounted && ref.current && (
        <Portal container={ref.current}>
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
            Teleported into the dashed box.
          </span>
        </Portal>
      )}
    </div>
  )
}
