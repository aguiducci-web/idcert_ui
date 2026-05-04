import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Spinner } from './index.js'

describe('Spinner', () => {
  test('renders with role status', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  test('uses default aria-label "Loading"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })

  test('respects custom aria-label', () => {
    render(<Spinner aria-label="Saving changes" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Saving changes')
  })

  test('applies size variant md by default (h-5 w-5)', () => {
    render(<Spinner />)
    const icon = screen.getByRole('status').querySelector('svg')
    expect(icon).toHaveClass('h-5')
    expect(icon).toHaveClass('w-5')
  })

  test('applies size variant lg (h-6 w-6)', () => {
    render(<Spinner size="lg" />)
    const icon = screen.getByRole('status').querySelector('svg')
    expect(icon).toHaveClass('h-6')
    expect(icon).toHaveClass('w-6')
  })

  test('merges custom className on outer span', () => {
    render(<Spinner className="custom-class" />)
    expect(screen.getByRole('status')).toHaveClass('custom-class')
  })
})
