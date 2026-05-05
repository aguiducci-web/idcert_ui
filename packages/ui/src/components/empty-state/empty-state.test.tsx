import { render, screen } from '@testing-library/react'
import { Inbox } from 'lucide-react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from './index.js'

describe('EmptyState', () => {
  test('EmptyState root renders children', () => {
    render(
      <EmptyState>
        <span>content</span>
      </EmptyState>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  test('EmptyStateIcon contains its child SVG', () => {
    render(
      <EmptyStateIcon data-testid="icon">
        <Inbox />
      </EmptyStateIcon>,
    )
    expect(screen.getByTestId('icon').querySelector('svg')).not.toBeNull()
  })

  test('EmptyStateTitle renders as h3', () => {
    render(<EmptyStateTitle>No items</EmptyStateTitle>)
    const heading = screen.getByText('No items')
    expect(heading.tagName).toBe('H3')
  })

  test('EmptyStateDescription renders as p', () => {
    render(<EmptyStateDescription>Inbox is empty</EmptyStateDescription>)
    const paragraph = screen.getByText('Inbox is empty')
    expect(paragraph.tagName).toBe('P')
  })

  test('EmptyStateAction renders its children', () => {
    render(
      <EmptyStateAction>
        <button type="button">New</button>
      </EmptyStateAction>,
    )
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
  })

  test('EmptyState forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<EmptyState ref={ref}>x</EmptyState>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
