import { Check, Star, X } from 'lucide-react'
import { List, ListItem } from './index.js'

export const Default = () => (
  <List className="w-64">
    <ListItem>First item</ListItem>
    <ListItem>Second item</ListItem>
    <ListItem>Third item</ListItem>
  </List>
)

export const Divided = () => (
  <List className="w-64" divider>
    <ListItem>Account</ListItem>
    <ListItem>Billing</ListItem>
    <ListItem>Notifications</ListItem>
    <ListItem>Security</ListItem>
  </List>
)

export const WithIcons = () => (
  <List className="w-64">
    <ListItem className="flex items-center gap-2">
      <Check className="size-4 text-primary" aria-hidden="true" />
      Includes unlimited seats
    </ListItem>
    <ListItem className="flex items-center gap-2">
      <Star className="size-4 text-primary" aria-hidden="true" />
      Priority support
    </ListItem>
    <ListItem className="flex items-center gap-2 text-muted-foreground">
      <X className="size-4" aria-hidden="true" />
      No on-prem deployment
    </ListItem>
  </List>
)

export const Nested = () => (
  <List className="w-64">
    <ListItem>
      Frontend
      <List className="mt-2 ml-4">
        <ListItem>React</ListItem>
        <ListItem>Tailwind</ListItem>
      </List>
    </ListItem>
    <ListItem>
      Backend
      <List className="mt-2 ml-4">
        <ListItem>Node</ListItem>
        <ListItem>PostgreSQL</ListItem>
      </List>
    </ListItem>
  </List>
)

export const Interactive = () => (
  <List className="w-64" divider>
    <ListItem>
      <a
        href="#account"
        className="block text-foreground hover:text-primary focus-visible:outline-none focus-visible:underline"
      >
        Account settings
      </a>
    </ListItem>
    <ListItem>
      <a
        href="#billing"
        className="block text-foreground hover:text-primary focus-visible:outline-none focus-visible:underline"
      >
        Billing
      </a>
    </ListItem>
    <ListItem>
      <a
        href="#team"
        className="block text-foreground hover:text-primary focus-visible:outline-none focus-visible:underline"
      >
        Team members
      </a>
    </ListItem>
  </List>
)
