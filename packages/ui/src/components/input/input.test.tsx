import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Input } from './index.js'

describe('Input', () => {
  test('renders with placeholder', () => {
    render(<Input placeholder="Email" />)
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
  })

  test('accepts user typing', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} placeholder="Type here" />)
    await userEvent.type(screen.getByPlaceholderText('Type here'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  test('respects disabled', () => {
    render(<Input disabled placeholder="X" />)
    expect(screen.getByPlaceholderText('X')).toBeDisabled()
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  test('merges custom className with base classes', () => {
    render(<Input className="custom-class" placeholder="X" />)
    expect(screen.getByPlaceholderText('X')).toHaveClass('custom-class')
  })

  test('respects type prop', () => {
    render(<Input type="password" placeholder="Pass" />)
    expect(screen.getByPlaceholderText('Pass')).toHaveAttribute('type', 'password')
  })
})
