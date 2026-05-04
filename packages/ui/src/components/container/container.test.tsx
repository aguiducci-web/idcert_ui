import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Container } from './index.js'

describe('Container', () => {
  test('renders children', () => {
    render(<Container>Hello</Container>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  test('applies max-width class for default size', () => {
    render(<Container data-testid="c">Content</Container>)
    expect(screen.getByTestId('c')).toHaveClass('max-w-screen-xl')
  })

  test('applies size variant', () => {
    render(<Container size="sm" data-testid="c">X</Container>)
    expect(screen.getByTestId('c')).toHaveClass('max-w-screen-sm')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Container ref={ref}>X</Container>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  test('merges custom className', () => {
    render(<Container className="custom-class" data-testid="c">X</Container>)
    expect(screen.getByTestId('c')).toHaveClass('custom-class')
  })
})
