import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Portal } from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Utility/Portal',
  component: Portal,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Portal>

export default meta
type Story = StoryObj<typeof meta>

function ToggleDemo() {
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

export const FloatingHelp: Story = {
  args: { children: null },
  render: () => <ToggleDemo />,
}

function CustomContainerDemo() {
  const slotRef = React.useRef<HTMLDivElement>(null)
  const [, force] = React.useReducer((x: number) => x + 1, 0)
  React.useEffect(() => {
    force()
  }, [])
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Portal mounted into the bordered slot below, not document.body.
      </p>
      <div
        ref={slotRef}
        className="min-h-[100px] rounded-md border-2 border-dashed border-primary p-4"
      />
      {slotRef.current && (
        <Portal container={slotRef.current}>
          <span className="font-medium">I live inside the dashed slot.</span>
        </Portal>
      )}
    </div>
  )
}

export const CustomContainer: Story = {
  args: { children: null },
  render: () => <CustomContainerDemo />,
}
