import type { Meta, StoryObj } from '@storybook/react'
import { it as itLocale } from 'date-fns/locale'
import * as React from 'react'
import { DatePicker } from './index.js'

const meta = {
  title: 'Form/DatePicker',
  component: DatePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

function ControlledDemo() {
  const [v, setV] = React.useState<Date | undefined>(new Date())
  return (
    <div className="w-72 space-y-2">
      <DatePicker
        aria-label="Date"
        value={v}
        onValueChange={setV}
        format="dd/MM/yyyy"
      />
      <div className="text-sm text-muted-foreground">
        Value: {v ? v.toISOString() : '—'}
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-72">
      <DatePicker aria-label="Date" placeholder="Pick a date…" />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

export const WithItalianLocale: Story = {
  render: () => (
    <div className="w-72">
      <DatePicker
        aria-label="Data"
        placeholder="Scegli una data…"
        locale={itLocale}
        format="d MMMM yyyy"
      />
    </div>
  ),
}

export const Constrained: Story = {
  render: () => (
    <div className="w-72">
      <DatePicker
        aria-label="Date"
        placeholder="Within range…"
        fromDate={new Date('2026-01-01')}
        toDate={new Date('2026-12-31')}
      />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-72">
      <DatePicker aria-label="Date" placeholder="Disabled" disabled />
    </div>
  ),
}
