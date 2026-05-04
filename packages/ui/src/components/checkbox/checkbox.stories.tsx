import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './index.js'
import { Label } from '../label/index.js'

const meta = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { 'aria-label': 'Accept' } }
export const Checked: Story = { args: { 'aria-label': 'Accept', defaultChecked: true } }
export const Disabled: Story = { args: { 'aria-label': 'Disabled', disabled: true } }
export const DisabledChecked: Story = { args: { 'aria-label': 'X', disabled: true, defaultChecked: true } }

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}
