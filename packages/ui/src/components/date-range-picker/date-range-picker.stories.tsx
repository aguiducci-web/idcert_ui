import type { Meta, StoryObj } from '@storybook/react'
import { it as itLocale } from 'date-fns/locale'
import * as React from 'react'
import { DateRangePicker, type DateRange } from './index.js'

const meta = {
  title: 'Form/DateRangePicker',
  component: DateRangePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof meta>

function ControlledDemo() {
  const [v, setV] = React.useState<DateRange | undefined>({
    from: new Date('2026-05-05'),
    to: new Date('2026-05-12'),
  })
  return (
    <div className="w-80 space-y-2">
      <DateRangePicker
        aria-label="Range"
        value={v}
        onValueChange={setV}
        format="dd/MM/yyyy"
      />
      <div className="text-sm text-muted-foreground">
        From: {v?.from?.toISOString() ?? '—'}; To: {v?.to?.toISOString() ?? '—'}
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <DateRangePicker aria-label="Range" placeholder="Pick a range…" />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

export const WithItalianLocale: Story = {
  render: () => (
    <div className="w-80">
      <DateRangePicker
        aria-label="Range"
        placeholder="Scegli un range…"
        locale={itLocale}
        format="d MMM"
      />
    </div>
  ),
}

export const SingleMonth: Story = {
  render: () => (
    <div className="w-80">
      <DateRangePicker
        aria-label="Range"
        placeholder="Single month grid"
        numberOfMonths={1}
      />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <DateRangePicker aria-label="Range" placeholder="Disabled" disabled />
    </div>
  ),
}
