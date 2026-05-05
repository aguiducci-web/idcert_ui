import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { Badge } from './index.js'

describe('Badge', () => {
  test('renders with text content', () => {
    render(<Badge>Hello</Badge>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  test('default variant applies bg-primary class', () => {
    render(<Badge data-testid="b">x</Badge>)
    expect(screen.getByTestId('b')).toHaveClass('bg-primary')
  })

  test.each([
    ['secondary', 'bg-secondary'],
    ['destructive', 'bg-destructive'],
    ['outline', 'text-foreground'],
    ['success', 'bg-green-500'],
    ['warning', 'bg-yellow-500'],
  ] as const)('variant %s applies expected class %s', (variant, expectedClass) => {
    render(
      <Badge variant={variant} data-testid="b">x</Badge>,
    )
    expect(screen.getByTestId('b')).toHaveClass(expectedClass)
  })

  test('merges custom className', () => {
    render(<Badge className="custom-class" data-testid="b">x</Badge>)
    expect(screen.getByTestId('b')).toHaveClass('custom-class')
  })

  test('forwards ref', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(<Badge ref={ref}>x</Badge>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })
})
