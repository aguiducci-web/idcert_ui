import { Badge } from './index.js'

export const Default = () => (
  <div className="flex flex-wrap gap-2">
    <Badge>Default</Badge>
    <Badge variant="secondary">Beta</Badge>
    <Badge variant="success">Active</Badge>
  </div>
)
