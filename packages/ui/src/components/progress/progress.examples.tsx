import * as React from 'react'
import { Progress } from './index.js'

export const Default = () => (
  <div className="w-80">
    <Progress value={60} />
  </div>
)

export const Indeterminate = () => (
  <div className="w-80">
    <Progress value={null} />
  </div>
)

export const Animated = () => {
  const [v, setV] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => {
      setV((prev) => (prev >= 100 ? 0 : prev + 10))
    }, 500)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="w-80">
      <Progress value={v} />
    </div>
  )
}

export const WithLabel = () => {
  const value = 72
  return (
    <div className="w-80 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground">Uploading</span>
        <span className="text-muted-foreground" aria-hidden>{value}%</span>
      </div>
      <Progress value={value} aria-label={`Uploading: ${value}%`} />
    </div>
  )
}
