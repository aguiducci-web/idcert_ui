import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Label } from './index.js'

describe('Label', () => {
  test('renders with text', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  test('associates with htmlFor', () => {
    render(<Label htmlFor="email-input">Email</Label>)
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email-input')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLLabelElement | null }
    render(<Label ref={ref}>X</Label>)
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })

  test('merges custom className', () => {
    render(<Label className="custom-class">X</Label>)
    expect(screen.getByText('X')).toHaveClass('custom-class')
  })
})
