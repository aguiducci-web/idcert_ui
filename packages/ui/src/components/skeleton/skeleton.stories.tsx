import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './index.js'

const meta = {
  title: 'DataDisplay/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const TextLine: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
}

export const Avatar: Story = {
  render: () => <Skeleton className="h-12 w-12 rounded-full" />,
}

export const Card: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  ),
}

export const FullWidth: Story = {
  render: () => (
    <div className="w-96">
      <Skeleton className="h-32 w-full" />
    </div>
  ),
}
