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
