import type { Meta, StoryObj } from '@storybook/react'
import { Container } from './index.js'

const meta = {
  title: 'Layout/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'] },
  },
  args: {
    children: (
      <div className="rounded-md bg-muted p-8 text-center text-sm">
        Container content
      </div>
    ),
  },
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Small: Story = { args: { size: 'sm' } }
export const Large: Story = { args: { size: 'lg' } }
export const Full: Story = { args: { size: 'full' } }
