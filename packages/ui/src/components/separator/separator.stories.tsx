import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './index.js'

const meta = {
  title: 'Layout/Separator',
  component: Separator,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <h4 className="text-sm font-semibold">Section A</h4>
      <p className="text-sm text-muted-foreground">Content for section A.</p>
      <Separator className="my-4" />
      <h4 className="text-sm font-semibold">Section B</h4>
      <p className="text-sm text-muted-foreground">Content for section B.</p>
    </div>
  ),
}
