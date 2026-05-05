import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './index.js'

const meta = {
  title: 'DataDisplay/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: 'Default' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Beta' } }
export const Destructive: Story = { args: { variant: 'destructive', children: 'Error' } }
export const Outline: Story = { args: { variant: 'outline', children: 'Outlined' } }
export const Success: Story = { args: { variant: 'success', children: 'Active' } }
export const Warning: Story = { args: { variant: 'warning', children: 'Pending' } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
    </div>
  ),
}
