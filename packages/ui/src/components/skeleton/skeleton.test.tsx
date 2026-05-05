import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { Skeleton } from './index.js'

describe('Skeleton', () => {
  test('renders a div', () => {
    render(<Skeleton data-testid="s" />)
    expect(screen.getByTestId('s').tagName).toBe('DIV')
  })

  test('applies default animate-pulse and bg-muted classes', () => {
    render(<Skeleton data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el).toHaveClass('animate-pulse')
    expect(el).toHaveClass('bg-muted')
    expect(el).toHaveClass('rounded-md')
  })

  test('merges custom className while keeping defaults', () => {
    render(<Skeleton className="h-4 w-24" data-testid="s" />)
    const el = screen.getByTestId('s')
    expect(el).toHaveClass('h-4')
    expect(el).toHaveClass('w-24')
    expect(el).toHaveClass('animate-pulse')
  })

  test('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Skeleton ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
