import { Badge } from './index.js'

export const Default = () => (
  <div className="flex flex-wrap gap-2">
    <Badge>Default</Badge>
    <Badge variant="secondary">Beta</Badge>
    <Badge variant="success">Active</Badge>
  </div>
)

export const AllVariants = () => (
  <div className="flex flex-wrap gap-2">
    <Badge variant="default">Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="destructive">Destructive</Badge>
    <Badge variant="outline">Outline</Badge>
    <Badge variant="success">Success</Badge>
    <Badge variant="warning">Warning</Badge>
  </div>
)

export const StatusIndicators = () => (
  <div className="flex flex-wrap gap-2">
    <Badge variant="success">Online</Badge>
    <Badge variant="warning">Degraded</Badge>
    <Badge variant="destructive">Offline</Badge>
    <Badge variant="secondary">Unknown</Badge>
  </div>
)

export const Counts = () => (
  <div className="flex items-center gap-3">
    <span className="text-sm">Inbox</span>
    <Badge>12</Badge>
    <span className="text-sm">Mentions</span>
    <Badge variant="destructive">3</Badge>
  </div>
)

export const WithDot = () => (
  <Badge variant="outline" className="gap-1.5">
    <span className="size-1.5 rounded-full bg-green-500" aria-hidden />
    Active
  </Badge>
)
