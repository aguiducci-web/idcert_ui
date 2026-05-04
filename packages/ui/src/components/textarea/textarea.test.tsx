import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Textarea } from './index.js'

describe('Textarea', () => {
  test('renders with placeholder', () => {
    render(<Textarea placeholder="Write here" />)
    expect(screen.getByPlaceholderText('Write here')).toBeInTheDocument()
  })

  test('accepts multi-line typing', async () => {
    const onChange = vi.fn()
    render(<Textarea onChange={onChange} placeholder="X" />)
    await userEvent.type(screen.getByPlaceholderText('X'), 'line1{Enter}line2')
    expect(onChange).toHaveBeenCalled()
  })

  test('respects disabled', () => {
    render(<Textarea disabled placeholder="X" />)
    expect(screen.getByPlaceholderText('X')).toBeDisabled()
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})
