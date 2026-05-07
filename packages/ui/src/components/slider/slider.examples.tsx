'use client'
import * as React from 'react'
import { Slider } from './index.js'

export const Default = () => {
  const [v, setV] = React.useState([50])
  return (
    <div className="w-80 space-y-2">
      <Slider value={v} onValueChange={setV} aria-label="Volume" />
      <div className="text-sm text-muted-foreground">Value: {v[0]}</div>
    </div>
  )
}
