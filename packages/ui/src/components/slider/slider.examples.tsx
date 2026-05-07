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

export const Range = () => {
  const [v, setV] = React.useState([20, 80])
  return (
    <div className="w-80 space-y-2">
      <Slider
        value={v}
        onValueChange={setV}
        min={0}
        max={100}
        aria-label="Price range"
      />
      <div className="text-sm text-muted-foreground">
        {v[0]} – {v[1]}
      </div>
    </div>
  )
}

export const Steps = () => {
  const [v, setV] = React.useState([30])
  return (
    <div className="w-80 space-y-2">
      <Slider
        value={v}
        onValueChange={setV}
        min={0}
        max={100}
        step={10}
        aria-label="Quality"
      />
      <div className="text-sm text-muted-foreground">Step 10 — value: {v[0]}</div>
    </div>
  )
}

export const WithLabel = () => {
  const [v, setV] = React.useState([60])
  return (
    <div className="w-80 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <label htmlFor="brightness" className="font-medium">
          Brightness
        </label>
        <span className="tabular-nums text-muted-foreground">{v[0]}%</span>
      </div>
      <Slider id="brightness" value={v} onValueChange={setV} />
    </div>
  )
}

export const Disabled = () => (
  <div className="w-80">
    <Slider defaultValue={[40]} disabled aria-label="Disabled slider" />
  </div>
)
