import { Trash, Plus, Loader2 } from 'lucide-react'
import { Button } from './index.js'

export const Default = () => <Button>Click me</Button>

export const AllVariants = () => (
  <div className="flex flex-wrap gap-3">
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
)

export const Sizes = () => (
  <div className="flex items-center gap-3">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon" aria-label="Add">
      <Plus />
    </Button>
  </div>
)

export const WithIcon = () => (
  <div className="flex flex-wrap gap-3">
    <Button>
      <Plus /> New item
    </Button>
    <Button variant="destructive">
      <Trash /> Delete
    </Button>
  </div>
)

export const Disabled = () => (
  <div className="flex flex-wrap gap-3">
    <Button disabled>Disabled</Button>
    <Button variant="destructive" disabled>Disabled</Button>
  </div>
)

export const Loading = () => (
  <Button disabled>
    <Loader2 className="animate-spin" />
    Saving…
  </Button>
)

export const AsLink = () => (
  <Button asChild>
    <a href="https://idcert.io">Open in tab</a>
  </Button>
)
