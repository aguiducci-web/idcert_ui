import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { TimePicker } from './index.js'

const meta = {
  title: 'Form/TimePicker',
  component: TimePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

function ControlledDemo() {
  const [v, setV] = React.useState('14:30')
  return (
    <div className="w-64 space-y-2">
      <TimePicker aria-label="Time" value={v} onValueChange={setV} />
      <div className="text-sm text-muted-foreground">Value: {v}</div>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <TimePicker aria-label="Time" defaultValue="09:00" />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

export const WithMinMaxStep: Story = {
  render: () => (
    <div className="w-64">
      <TimePicker
        aria-label="Time"
        defaultValue="08:00"
        min="08:00"
        max="20:00"
        step={300}
      />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-64">
      <TimePicker aria-label="Time" defaultValue="10:00" disabled />
    </div>
  ),
}
