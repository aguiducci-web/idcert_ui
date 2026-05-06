import type { Meta, StoryObj } from '@storybook/react'
import * as examples from './form.examples.js'

const meta = {
  title: 'Forms/Form',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: examples.Default }
export const FieldErrorState: Story = { render: examples.FieldErrorState }
