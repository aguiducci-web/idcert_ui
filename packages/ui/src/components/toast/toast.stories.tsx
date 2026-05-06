import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { ToastProvider, Toaster, useToast } from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Utility/Toast',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

type Position =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center'

function ToastDemo({ position = 'top-right' as const }: { position?: Position }) {
  const toast = useToast()
  return (
    <div className="space-y-3 p-8">
      <p className="text-sm text-muted-foreground">Click any button to fire a toast.</p>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            toast.add({ type: 'info', title: 'Heads up', description: 'Just so you know.' })
          }
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.add({ type: 'success', title: 'Saved', description: 'Your changes are stored.' })
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
              action: { label: 'Undo', onClick: () => alert('Undo clicked') },
            })
          }
        >
          With action
        </Button>
      </div>
      <Toaster position={position} />
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo position="top-right" />
    </ToastProvider>
  ),
}

export const TopLeft: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo position="top-left" />
    </ToastProvider>
  ),
}

export const BottomRight: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo position="bottom-right" />
    </ToastProvider>
  ),
}

export const BottomCenter: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo position="bottom-center" />
    </ToastProvider>
  ),
}
