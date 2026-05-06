import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './index.js'
import * as examples from './input.examples.js'

const meta = {
  title: 'Forms/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithLabel: Story = { render: examples.WithLabel }
export const WithDescription: Story = { render: examples.WithDescription }
export const ErrorState: Story = { render: examples.ErrorState }
export const Disabled: Story = { args: { disabled: true, placeholder: 'Disabled' } }
export const Types: Story = { render: examples.Types }
