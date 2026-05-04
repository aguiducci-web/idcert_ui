import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Switch } from './index.js'

describe('Switch', () => {
  test('renders with role switch', () => {
    render(<Switch aria-label="Toggle" />)
    expect(screen.getByRole('switch', { name: 'Toggle' })).toBeInTheDocument()
  })

  test('toggles on click', async () => {
    const onChange = vi.fn()
    render(<Switch aria-label="X" onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalled()
  })

  test('respects defaultChecked', () => {
    render(<Switch defaultChecked aria-label="X" />)
    expect(screen.getByRole('switch')).toBeChecked()
  })

  test('respects disabled', async () => {
    const onChange = vi.fn()
    render(<Switch disabled aria-label="X" onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).not.toHaveBeenCalled()
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Switch ref={ref} aria-label="X" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
