import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Navigation/Sheet',
  component: Sheet,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

function ExampleContent({ title }: { title: string }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>Adjust the active settings here.</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        <p className="text-sm">Body content goes here.</p>
      </div>
      <SheetFooter>
        <SheetClose render={<Button variant="outline">Cancel</Button>} />
        <Button>Save</Button>
      </SheetFooter>
    </>
  )
}

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open right</Button>} />
      <SheetContent side="right">
        <ExampleContent title="Right sheet" />
      </SheetContent>
    </Sheet>
  ),
}

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open left</Button>} />
      <SheetContent side="left">
        <ExampleContent title="Left sheet" />
      </SheetContent>
    </Sheet>
  ),
}

export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open top</Button>} />
      <SheetContent side="top">
        <ExampleContent title="Top sheet" />
      </SheetContent>
    </Sheet>
  ),
}

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open bottom</Button>} />
      <SheetContent side="bottom">
        <ExampleContent title="Bottom sheet" />
      </SheetContent>
    </Sheet>
  ),
}

export const NoCloseButton: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open without X</Button>} />
      <SheetContent side="right" showCloseButton={false}>
        <ExampleContent title="No close button" />
      </SheetContent>
    </Sheet>
  ),
}
