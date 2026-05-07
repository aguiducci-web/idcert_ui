'use client'
import * as React from 'react'
import { TimePicker } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
  <div className="w-64">
    <TimePicker aria-label="Time" defaultValue="09:00" />
  </div>
)

export const Controlled = () => {
  const [value, setValue] = React.useState('14:30')
  return (
    <div className="w-64 space-y-2">
      <TimePicker
        aria-label="Meeting time"
        value={value}
        onValueChange={setValue}
      />
      <p className="text-muted-foreground text-sm">Selected: {value || '—'}</p>
    </div>
  )
}

export const WithLabel = () => {
  const id = React.useId()
  return (
    <div className="w-64 space-y-2">
      <Label htmlFor={id}>Start time</Label>
      <TimePicker id={id} defaultValue="08:00" />
    </div>
  )
}

export const WithSeconds = () => {
  const [value, setValue] = React.useState('09:30:15')
  return (
    <div className="w-64 space-y-2">
      <Label htmlFor="time-seconds">Precise time</Label>
      <TimePicker
        id="time-seconds"
        step={1}
        value={value}
        onValueChange={setValue}
      />
    </div>
  )
}

export const Step = () => {
  const [value, setValue] = React.useState('09:00')
  return (
    <div className="w-64 space-y-2">
      <Label htmlFor="time-step">Slot (15-min)</Label>
      <TimePicker
        id="time-step"
        step={900}
        value={value}
        onValueChange={setValue}
      />
    </div>
  )
}
