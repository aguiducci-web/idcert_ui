'use client'
import * as React from 'react'
import { DateRangePicker, type DateRange } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => (
  <div className="w-80">
    <DateRangePicker aria-label="Range" placeholder="Pick a range…" />
  </div>
)

export const Controlled = () => {
  const [value, setValue] = React.useState<DateRange | undefined>(undefined)
  return (
    <div className="flex flex-col gap-2 w-80">
      <DateRangePicker
        aria-label="Trip dates"
        value={value}
        onValueChange={setValue}
        placeholder="Select trip dates…"
      />
      <p className="text-xs text-muted-foreground">
        {value?.from && value?.to
          ? `${value.from.toDateString()} → ${value.to.toDateString()}`
          : 'No range selected'}
      </p>
    </div>
  )
}

export const WithLabel = () => (
  <div className="flex flex-col gap-2 w-80">
    <Label htmlFor="report-range">Reporting period</Label>
    <DateRangePicker id="report-range" placeholder="Pick a period…" />
  </div>
)

export const Presets = () => {
  const [value, setValue] = React.useState<DateRange | undefined>(undefined)
  const today = new Date()
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const last7 = () => {
    const to = startOfDay(today)
    const from = new Date(to)
    from.setDate(to.getDate() - 6)
    setValue({ from, to })
  }
  const thisMonth = () => {
    const from = new Date(today.getFullYear(), today.getMonth(), 1)
    const to = startOfDay(today)
    setValue({ from, to })
  }
  return (
    <div className="flex flex-col gap-2 w-80">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={last7}
          className="text-xs px-2 py-1 rounded-md border border-border hover:bg-accent"
        >
          Last 7 days
        </button>
        <button
          type="button"
          onClick={thisMonth}
          className="text-xs px-2 py-1 rounded-md border border-border hover:bg-accent"
        >
          This month
        </button>
      </div>
      <DateRangePicker
        aria-label="Range with presets"
        value={value}
        onValueChange={setValue}
      />
    </div>
  )
}

export const MinMax = () => {
  const today = new Date()
  const min = new Date(today.getFullYear(), today.getMonth(), 1)
  const max = new Date(today.getFullYear(), today.getMonth() + 2, 0)
  return (
    <div className="w-80">
      <DateRangePicker
        aria-label="Bounded range"
        fromDate={min}
        toDate={max}
        placeholder="Within current quarter…"
      />
    </div>
  )
}
