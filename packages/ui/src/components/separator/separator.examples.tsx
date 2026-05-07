import { Separator } from './index.js'

export const Default = () => (
  <div className="w-64">
    <h4 className="text-sm font-semibold">Section A</h4>
    <p className="text-sm text-muted-foreground">Content for section A.</p>
    <Separator className="my-4" />
    <h4 className="text-sm font-semibold">Section B</h4>
    <p className="text-sm text-muted-foreground">Content for section B.</p>
  </div>
)
