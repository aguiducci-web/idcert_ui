import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './index.js'

const meta = {
  title: 'Primitives/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { placeholder: 'Type something...' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: 'Hello' } }
export const Disabled: Story = { args: { disabled: true } }
export const Password: Story = { args: { type: 'password', placeholder: 'Password' } }
export const Email: Story = { args: { type: 'email', placeholder: 'name@example.com' } }
