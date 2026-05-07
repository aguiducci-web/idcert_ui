'use client'
import { ToastProvider, Toaster, useToast } from './index.js'
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

function VariantsTrigger() {
  const toast = useToast()
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => toast.add({ type: 'info', title: 'Info', description: 'Heads up.' })}
      >
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({ type: 'success', title: 'Success', description: 'Saved successfully.' })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({ type: 'warning', title: 'Warning', description: 'Check your input.' })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({ type: 'error', title: 'Error', description: 'Something went wrong.' })
        }
      >
        Error
      </Button>
    </div>
  )
}

export const Variants = () => (
  <ToastProvider>
    <div className="p-4">
      <VariantsTrigger />
    </div>
    <Toaster />
  </ToastProvider>
)

function ActionTrigger() {
  const toast = useToast()
  return (
    <Button
      onClick={() =>
        toast.add({
          type: 'info',
          title: 'Item deleted',
          description: 'The record has been removed.',
          action: { label: 'Undo', onClick: () => console.log('undo') },
        })
      }
    >
      Delete item
    </Button>
  )
}

export const WithAction = () => (
  <ToastProvider>
    <div className="p-4">
      <ActionTrigger />
    </div>
    <Toaster />
  </ToastProvider>
)

function DescriptionTrigger() {
  const toast = useToast()
  return (
    <Button
      onClick={() =>
        toast.add({
          type: 'success',
          title: 'Profile updated',
          description: 'Your name and avatar are now visible to your team.',
        })
      }
    >
      Update profile
    </Button>
  )
}

export const WithDescription = () => (
  <ToastProvider>
    <div className="p-4">
      <DescriptionTrigger />
    </div>
    <Toaster />
  </ToastProvider>
)

function PersistentTrigger() {
  const toast = useToast()
  return (
    <Button
      onClick={() =>
        toast.add({
          type: 'error',
          title: 'Connection lost',
          description: 'Reconnect to keep editing. This toast will not auto-dismiss.',
          timeout: 0,
        })
      }
    >
      Trigger critical error
    </Button>
  )
}

export const Persistent = () => (
  <ToastProvider>
    <div className="p-4">
      <PersistentTrigger />
    </div>
    <Toaster />
  </ToastProvider>
)
