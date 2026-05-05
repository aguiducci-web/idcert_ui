import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Progress } from './index.js'

const meta = {
  title: 'DataDisplay/Progress',
  component: Progress,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const ThirtyPercent: Story = {
  args: { value: 30 },
  render: () => (
    <div className="w-80">
      <Progress value={30} />
    </div>
  ),
}

export const SixtyPercent: Story = {
  args: { value: 60 },
  render: () => (
    <div className="w-80">
      <Progress value={60} />
    </div>
  ),
}

export const Complete: Story = {
  args: { value: 100 },
  render: () => (
    <div className="w-80">
      <Progress value={100} />
    </div>
  ),
}

export const Indeterminate: Story = {
  args: { value: null },
  render: () => (
    <div className="w-80">
      <Progress value={null} />
    </div>
  ),
}

function AnimatedDemo() {
  const [v, setV] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => {
      setV((prev) => (prev >= 100 ? 0 : prev + 10))
    }, 500)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="w-80 space-y-2">
      <Progress value={v} />
      <div className="text-center text-sm text-muted-foreground">{v}%</div>
    </div>
  )
}

export const Animated: Story = {
  args: { value: 0 },
  render: () => <AnimatedDemo />,
}
