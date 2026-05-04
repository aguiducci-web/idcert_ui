import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './index.js'

const meta = {
  title: 'Feedback/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Small: Story = { args: { size: 'sm' } }
export const Large: Story = { args: { size: 'lg' } }
export const ExtraLarge: Story = { args: { size: 'xl' } }

export const InsideButton: Story = {
  render: () => (
    <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" disabled>
      <Spinner size="sm" aria-label="Saving" />
      <span>Saving…</span>
    </button>
  ),
}

export const CustomColor: Story = {
  render: () => (
    <div className="text-destructive">
      <Spinner size="lg" aria-label="Loading errors" />
    </div>
  ),
}
