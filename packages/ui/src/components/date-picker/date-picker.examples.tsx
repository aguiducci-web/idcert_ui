'use client'
import * as React from 'react'
import { DatePicker } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
  <div className="w-72">
    <DatePicker aria-label="Date" placeholder="Pick a date…" />
  </div>
)

export const Controlled = () => {
  const [value, setValue] = React.useState<Date | undefined>(undefined)
  return (
    <div className="flex w-72 flex-col gap-2">
      <DatePicker
        aria-label="Controlled date"
        value={value}
        onValueChange={setValue}
      />
      <p className="text-muted-foreground text-sm">
        Selected: {value ? value.toDateString() : 'none'}
      </p>
    </div>
  )
}

export const WithLabel = () => {
  const id = React.useId()
  return (
    <div className="flex w-72 flex-col gap-1.5">
      <Label htmlFor={id}>Birth date</Label>
      <DatePicker id={id} placeholder="Select your birth date" />
    </div>
  )
}

export const MinMax = () => {
  const today = new Date()
  const fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
  const toDate = new Date(today.getFullYear(), today.getMonth() + 2, 0)
  return (
    <div className="w-72">
      <DatePicker
        aria-label="Bounded date"
        placeholder="This month or next"
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  )
}

export const Disabled = () => (
  <div className="w-72">
    <DatePicker aria-label="Disabled date" placeholder="Unavailable" disabled />
  </div>
)
