import { Spinner } from './index.js'

export const Default = () => (
  <div className="flex items-center gap-4">
    <Spinner aria-label="Loading" />
    <Spinner size="lg" aria-label="Loading" />
  </div>
)
