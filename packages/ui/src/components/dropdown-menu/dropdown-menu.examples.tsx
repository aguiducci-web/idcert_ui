'use client'
import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './index.js'
import { Button } from '../button/index.js'
import { User, Settings, LogOut, Trash, MoreHorizontal } from 'lucide-react'

export const Default = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">Open menu</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Billing</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled>Disabled item</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export const WithIcons = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">Account</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuItem>
        <User aria-hidden="true" className="h-4 w-4" />
        Profile
        <span className="ml-auto text-xs text-muted-foreground">⇧⌘P</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Settings aria-hidden="true" className="h-4 w-4" />
        Settings
        <span className="ml-auto text-xs text-muted-foreground">⌘,</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <LogOut aria-hidden="true" className="h-4 w-4" />
        Log out
        <span className="ml-auto text-xs text-muted-foreground">⇧⌘Q</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export const Checkboxes = () => {
  const [statusBar, setStatusBar] = React.useState(true)
  const [activityBar, setActivityBar] = React.useState(false)
  const [panel, setPanel] = React.useState(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>
          Status bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={activityBar} onCheckedChange={setActivityBar}>
          Activity bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={panel} onCheckedChange={setPanel}>
          Panel
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const RadioGroup = () => {
  const [position, setPosition] = React.useState('bottom')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Panel position</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const Submenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">File</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>New file</DropdownMenuItem>
      <DropdownMenuItem>Open</DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Email link</DropdownMenuItem>
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuItem>Invite people</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Save</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export const Destructive = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" aria-label="Row actions">
        <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem>Edit</DropdownMenuItem>
      <DropdownMenuItem>Duplicate</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-destructive data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground">
        <Trash aria-hidden="true" className="h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
