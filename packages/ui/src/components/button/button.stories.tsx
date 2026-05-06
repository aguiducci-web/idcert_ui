import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './index.js'
import * as examples from './button.examples.js'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Button' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete' } }
export const Outline: Story = { args: { variant: 'outline' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Link: Story = { args: { variant: 'link' } }
export const Sizes: Story = { render: examples.Sizes }
export const WithIcon: Story = { render: examples.WithIcon }
export const Disabled: Story = { render: examples.Disabled }
export const Loading: Story = { render: examples.Loading }
export const AllVariants: Story = { render: examples.AllVariants }
