'use client'
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
