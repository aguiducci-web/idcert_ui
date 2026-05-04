import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Separator } from './index.js'

describe('Separator', () => {
  test('renders as hr element', () => {
    render(<Separator data-testid="s" />)
    expect(screen.getByTestId('s').tagName).toBe('HR')
  })

  test('has separator role implicit from hr', () => {
    render(<Separator />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  test('applies muted background', () => {
    render(<Separator data-testid="s" />)
    expect(screen.getByTestId('s')).toHaveClass('bg-border')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLHRElement | null }
    render(<Separator ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLHRElement)
  })
})
