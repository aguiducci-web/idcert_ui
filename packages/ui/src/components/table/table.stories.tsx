import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './index.js'
import * as examples from './table.examples.js'

const meta = {
  title: 'Data/Table',
  component: Table,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: examples.Default }
export const WithFooter: Story = { render: examples.WithFooter }
export const SelectedRow: Story = { render: examples.SelectedRow }
