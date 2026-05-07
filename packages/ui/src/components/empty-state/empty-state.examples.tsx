import { Inbox, FilePlus, Search } from 'lucide-react'
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
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
)

export const WithAction = () => (
  <EmptyState>
    <EmptyStateIcon aria-hidden><FilePlus /></EmptyStateIcon>
    <EmptyStateTitle>No projects yet</EmptyStateTitle>
    <EmptyStateDescription>
      Create your first project to start collecting documents and inviting
      collaborators.
    </EmptyStateDescription>
    <EmptyStateAction>
      <Button>Create project</Button>
      <Button variant="outline">Import</Button>
    </EmptyStateAction>
  </EmptyState>
)

export const NoResults = () => (
  <EmptyState>
    <EmptyStateIcon aria-hidden><Search /></EmptyStateIcon>
    <EmptyStateTitle>No results found</EmptyStateTitle>
    <EmptyStateDescription>
      We couldn't find anything matching your search. Try different keywords or
      clear your filters.
    </EmptyStateDescription>
    <EmptyStateAction>
      <Button variant="outline">Clear filters</Button>
    </EmptyStateAction>
  </EmptyState>
)
