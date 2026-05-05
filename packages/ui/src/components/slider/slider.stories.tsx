import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Slider } from './index.js'

const meta = {
  title: 'Form/Slider',
  component: Slider,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

function DefaultDemo(): React.JSX.Element {
  const [v, setV] = React.useState([50])
  return (
    <div className="w-80 space-y-2">
      <Slider value={v} onValueChange={setV} aria-label="Volume" />
      <div className="text-sm text-muted-foreground">Value: {v[0]}</div>
    </div>
  )
}

function RangeDemo(): React.JSX.Element {
  const [v, setV] = React.useState([20, 80])
  return (
    <div className="w-80 space-y-2">
      <Slider value={v} onValueChange={setV} aria-label="Range" />
      <div className="text-sm text-muted-foreground">
        Min: {v[0]} — Max: {v[1]}
      </div>
    </div>
  )
}

function SteppedDemo(): React.JSX.Element {
  const [v, setV] = React.useState([5])
  return (
    <div className="w-80 space-y-2">
      <Slider
        value={v}
        onValueChange={setV}
        min={0}
        max={10}
        step={1}
        aria-label="Stepped"
      />
      <div className="text-sm text-muted-foreground">Step 1: {v[0]}</div>
    </div>
  )
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}

export const Range: Story = {
  render: () => <RangeDemo />,
}

export const Stepped: Story = {
  render: () => <SteppedDemo />,
}

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <Slider value={[40]} disabled aria-label="Disabled" />
    </div>
  ),
}
