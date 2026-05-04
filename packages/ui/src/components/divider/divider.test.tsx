import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Divider } from './index.js'

describe('Divider', () => {
  test('renders with role separator by default', () => {
    render(<Divider />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  test('horizontal orientation by default', () => {
    render(<Divider data-testid="d" />)
    expect(screen.getByTestId('d')).toHaveClass('h-px')
  })

  test('vertical orientation applies w-px', () => {
    render(<Divider orientation="vertical" data-testid="d" />)
    expect(screen.getByTestId('d')).toHaveClass('w-px')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Divider ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
