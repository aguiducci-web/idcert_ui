import type { Meta, StoryObj } from '@storybook/react'
import { List, ListItem } from './index.js'

const meta = {
  title: 'DataDisplay/List',
  component: List,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <List className="w-64">
      <ListItem>First item</ListItem>
      <ListItem>Second item</ListItem>
      <ListItem>Third item</ListItem>
    </List>
  ),
}

export const WithDivider: Story = {
  render: () => (
    <List divider className="w-64">
      <ListItem>First item</ListItem>
      <ListItem>Second item</ListItem>
      <ListItem>Third item</ListItem>
    </List>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <List divider className="w-72">
      <ListItem className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Active connection
      </ListItem>
      <ListItem className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-yellow-500" />
        Pending verification
      </ListItem>
      <ListItem className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-destructive" />
        Failed sync
      </ListItem>
    </List>
  ),
}
