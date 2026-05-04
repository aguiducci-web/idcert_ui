import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './index.js'
import { Input } from '../input/index.js'

const meta = {
  title: 'Primitives/Label',
  component: Label,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { children: 'Email' },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2 w-64">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  ),
}
