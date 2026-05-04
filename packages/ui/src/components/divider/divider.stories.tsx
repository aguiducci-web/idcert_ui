import type { Meta, StoryObj } from '@storybook/react'
import { Divider } from './index.js'

const meta = {
  title: 'Layout/Divider',
  component: Divider,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm">Content above</p>
      <Divider className="my-4" />
      <p className="text-sm">Content below</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-16 items-center gap-4">
      <span className="text-sm">Left</span>
      <Divider orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  ),
}
