import type { Meta, StoryObj } from '@storybook/react'
import { Dialog } from './index.js'
import * as examples from './dialog.examples.js'

const meta = {
  title: 'Overlays/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: examples.Default }
export const Controlled: Story = { render: examples.Controlled }
export const NoCloseButton: Story = { render: examples.NoCloseButton }
export const CustomWidth: Story = { render: examples.CustomWidth }
