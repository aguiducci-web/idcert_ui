import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Grid } from './index.js'

describe('Grid', () => {
  test('renders children with grid display', () => {
    render(<Grid data-testid="g">X</Grid>)
    expect(screen.getByTestId('g')).toHaveClass('grid')
  })

  test('cols prop applies grid-cols class', () => {
    render(<Grid cols={3} data-testid="g">X</Grid>)
    expect(screen.getByTestId('g')).toHaveClass('grid-cols-3')
  })

  test('gap prop applies gap class', () => {
    render(<Grid gap={6} data-testid="g">X</Grid>)
    expect(screen.getByTestId('g')).toHaveClass('gap-6')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Grid ref={ref}>X</Grid>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
