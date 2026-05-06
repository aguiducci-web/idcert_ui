'use client'

import * as React from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
  <Dialog>
    <DialogTrigger render={<Button>Open dialog</Button>} />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. All linked data will be permanently removed.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <DialogClose render={<Button variant="destructive">Delete</Button>} />
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export const Controlled = () => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open programmatically</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled dialog</DialogTitle>
            <DialogDescription>
              Open state lives in your component, not inside the trigger.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const NoCloseButton = () => (
  <Dialog>
    <DialogTrigger render={<Button>Open</Button>} />
    <DialogContent showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>Confirm migration</DialogTitle>
        <DialogDescription>
          You must accept or reject — there is no implicit dismiss.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Reject</Button>} />
        <DialogClose render={<Button>Accept</Button>} />
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export const CustomWidth = () => (
  <Dialog>
    <DialogTrigger render={<Button>Open wide dialog</Button>} />
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Detailed report</DialogTitle>
        <DialogDescription>
          Override the default `max-w-lg` with any Tailwind width utility.
        </DialogDescription>
      </DialogHeader>
      <p className="text-sm">…content…</p>
    </DialogContent>
  </Dialog>
)
