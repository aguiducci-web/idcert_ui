'use client'

import * as React from 'react'
import { Button, Portal, useToast } from '@idcert/ui'

export default function UtilityPage() {
  const toast = useToast()
  const [portalOpen, setPortalOpen] = React.useState(false)
  const slotRef = React.useRef<HTMLDivElement>(null)
  const [slotMounted, setSlotMounted] = React.useState(false)
  React.useEffect(() => {
    setSlotMounted(true)
  }, [])

  return (
    <main className="mx-auto max-w-3xl space-y-12 p-8">
      <h1 className="text-2xl font-semibold">Utility smoke test</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Toast</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              toast.add({
                type: 'info',
                title: 'Heads up',
                description: 'This is an info toast.',
              })
            }
          >
            Info
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.add({
                type: 'success',
                title: 'Saved',
                description: 'Your changes are stored.',
              })
            }
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.add({
                type: 'warning',
                title: 'Slow connection',
                description: 'You may experience delays.',
              })
            }
          >
            Warning
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              toast.add({
                type: 'error',
                title: 'Failed',
                description: 'Could not complete the request.',
              })
            }
          >
            Error
          </Button>
          <Button
            onClick={() =>
              toast.add({
                type: 'info',
                title: 'Item deleted',
                description: 'You can undo this within 5 seconds.',
                action: {
                  label: 'Undo',
                  onClick: () => alert('Undo clicked'),
                },
              })
            }
          >
            With action
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Portal</h2>
        <Button onClick={() => setPortalOpen((v) => !v)}>
          {portalOpen ? 'Hide floating help' : 'Show floating help (document.body)'}
        </Button>
        {portalOpen && (
          <Portal>
            <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-md border border-border bg-background p-4 shadow-lg">
              <p className="text-sm">Rendered into document.body via Portal.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPortalOpen(false)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          </Portal>
        )}

        <p className="text-sm text-muted-foreground">
          The dashed slot below hosts a Portal-rendered child (custom container).
        </p>
        <div
          ref={slotRef}
          className="min-h-[80px] rounded-md border-2 border-dashed border-primary p-4"
        />
        {slotMounted && slotRef.current && (
          <Portal container={slotRef.current}>
            <span className="font-medium">I live inside the dashed slot.</span>
          </Portal>
        )}
      </section>
    </main>
  )
}
