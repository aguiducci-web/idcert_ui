'use client'
import { ToastProvider, useToast } from './index.js'
import { Button } from '../button/index.js'

function Trigger() {
  const toast = useToast()
  return (
    <Button
      onClick={() =>
        toast.add({ type: 'success', title: 'Saved', description: 'Your changes are stored.' })
      }
    >
      Show toast
    </Button>
  )
}

export const Default = () => (
  <ToastProvider>
    <div className="p-4">
      <Trigger />
    </div>
  </ToastProvider>
)
