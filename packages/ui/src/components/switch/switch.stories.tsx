import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './index.js'
import { Label } from '../label/index.js'

const meta = {
  title: 'Primitives/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { 'aria-label': 'Toggle' } }
export const Checked: Story = { args: { 'aria-label': 'Toggle', defaultChecked: true } }
export const Disabled: Story = { args: { 'aria-label': 'Toggle', disabled: true } }

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane Mode</Label>
    </div>
  ),
}
