import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './index.js'

const meta = {
  title: 'Form/Select',
  component: Select,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <Select>
        <SelectTrigger aria-label="Country">
          <SelectValue placeholder="Choose a country…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="it">Italy</SelectItem>
          <SelectItem value="fr">France</SelectItem>
          <SelectItem value="es">Spain</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const WithGroups: Story = {
  render: () => (
    <div className="w-64">
      <Select>
        <SelectTrigger aria-label="Country">
          <SelectValue placeholder="Choose a country…" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="it">Italy</SelectItem>
            <SelectItem value="fr">France</SelectItem>
            <SelectItem value="es">Spain</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Americas</SelectLabel>
            <SelectItem value="us">USA</SelectItem>
            <SelectItem value="br">Brazil</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}

function ControlledDemo(): React.JSX.Element {
  const [v, setV] = React.useState<string>('fr')
  return (
    <div className="w-64 space-y-2">
      <Select value={v} onValueChange={setV}>
        <SelectTrigger aria-label="Country">
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="it">Italy</SelectItem>
          <SelectItem value="fr">France</SelectItem>
          <SelectItem value="es">Spain</SelectItem>
        </SelectContent>
      </Select>
      <div className="text-sm text-muted-foreground">Value: {v}</div>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

export const Disabled: Story = {
  render: () => (
    <div className="w-64">
      <Select disabled defaultValue="it">
        <SelectTrigger aria-label="Country">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="it">Italy</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}
