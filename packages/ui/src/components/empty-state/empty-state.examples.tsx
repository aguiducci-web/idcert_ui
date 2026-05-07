import { Inbox } from 'lucide-react'
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
