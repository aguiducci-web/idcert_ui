'use client'
import * as React from 'react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
  <Sheet>
    <SheetTrigger render={<Button>Open sheet</Button>} />
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
        <SheetDescription>Adjust the active settings here.</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        <p className="text-sm">Body content goes here.</p>
      </div>
      <SheetFooter>
        <SheetClose render={<Button variant="outline">Cancel</Button>} />
        <Button>Save</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)

export const Sides = () => (
  <div className="flex flex-wrap gap-2">
    {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
      <Sheet key={side}>
        <SheetTrigger render={<Button variant="outline">{side}</Button>} />
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>From {side}</SheetTitle>
            <SheetDescription>Sheet anchored to the {side} edge.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    ))}
  </div>
)

export const WithForm = () => (
  <Sheet>
    <SheetTrigger render={<Button>Edit profile</Button>} />
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Edit profile</SheetTitle>
        <SheetDescription>
          Update your account details. Save when you are done.
        </SheetDescription>
      </SheetHeader>
      <form
        id="profile-form"
        className="grid gap-4 py-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Name</span>
          <input
            name="name"
            defaultValue="Ada Lovelace"
            className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            defaultValue="ada@example.com"
            className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </form>
      <SheetFooter>
        <SheetClose render={<Button variant="outline">Cancel</Button>} />
        <Button type="submit" form="profile-form">
          Save changes
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)

export const Controlled = () => {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => setOpen(true)}>Open externally</Button>
      <span className="text-sm text-muted-foreground">
        State: {open ? 'open' : 'closed'}
      </span>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Controlled sheet</SheetTitle>
            <SheetDescription>
              Open state is owned by the parent component.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export const WideContent = () => (
  <Sheet>
    <SheetTrigger render={<Button>Open changelog</Button>} />
    <SheetContent side="right" className="flex flex-col">
      <SheetHeader>
        <SheetTitle>Changelog</SheetTitle>
        <SheetDescription>Long content scrolls inside the sheet body.</SheetDescription>
      </SheetHeader>
      <div className="-mx-6 flex-1 overflow-y-auto px-6 py-4">
        <ul className="grid gap-3 text-sm">
          {Array.from({ length: 24 }).map((_, index) => (
            <li key={index} className="rounded-md border p-3">
              <p className="font-medium">v1.{24 - index}.0</p>
              <p className="text-muted-foreground">
                Release notes for entry {24 - index}. Body copy continues so the
                list overflows the viewport and the sheet body scrolls.
              </p>
            </li>
          ))}
        </ul>
      </div>
      <SheetFooter>
        <SheetClose render={<Button variant="outline">Close</Button>} />
      </SheetFooter>
    </SheetContent>
  </Sheet>
)
