import { Spinner } from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
  <div className="flex items-center gap-4">
    <Spinner aria-label="Loading" />
    <Spinner size="lg" aria-label="Loading" />
  </div>
)

export const Sizes = () => (
  <div className="flex items-center gap-6">
    <Spinner size="sm" aria-label="Loading" />
    <Spinner size="md" aria-label="Loading" />
    <Spinner size="lg" aria-label="Loading" />
    <Spinner size="xl" aria-label="Loading" />
  </div>
)

export const WithLabel = () => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Spinner size="sm" aria-label="Loading" />
    <span>Loading…</span>
  </div>
)

export const InButton = () => (
  <Button disabled>
    <Spinner size="sm" aria-label="Loading" />
    Saving…
  </Button>
)

export const Inline = () => (
  <p className="text-sm">
    Fetching results <Spinner size="sm" aria-label="Loading" /> please wait.
  </p>
)
