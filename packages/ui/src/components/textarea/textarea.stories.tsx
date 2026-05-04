import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './index.js'

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { placeholder: 'Write a message...' },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: 'Some longer text\nspanning multiple\nlines.' } }
export const Disabled: Story = { args: { disabled: true } }
