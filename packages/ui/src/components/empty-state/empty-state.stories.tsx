import type { Meta, StoryObj } from '@storybook/react'
import { FileX, Inbox, Search } from 'lucide-react'
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'DataDisplay/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon><Inbox /></EmptyStateIcon>
      <EmptyStateTitle>No messages</EmptyStateTitle>
      <EmptyStateDescription>
        Your inbox is empty. Compose to start the conversation.
      </EmptyStateDescription>
      <EmptyStateAction>
        <Button>New message</Button>
      </EmptyStateAction>
    </EmptyState>
  ),
}

export const NoActions: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon><FileX /></EmptyStateIcon>
      <EmptyStateTitle>File not found</EmptyStateTitle>
      <EmptyStateDescription>
        The file you requested does not exist or has been moved.
      </EmptyStateDescription>
    </EmptyState>
  ),
}

export const SearchResults: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon><Search /></EmptyStateIcon>
      <EmptyStateTitle>No results</EmptyStateTitle>
      <EmptyStateDescription>
        We couldn&apos;t find anything matching your search. Try different keywords.
      </EmptyStateDescription>
      <EmptyStateAction>
        <Button variant="outline">Clear filters</Button>
        <Button>New search</Button>
      </EmptyStateAction>
    </EmptyState>
  ),
}
