import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Checkbox } from './index.js'

describe('Checkbox', () => {
  test('renders unchecked by default', () => {
    render(<Checkbox aria-label="Accept" />)
    expect(screen.getByRole('checkbox', { name: 'Accept' })).not.toBeChecked()
  })

  test('toggles on click', async () => {
    const onChange = vi.fn()
    render(<Checkbox aria-label="Accept" onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalled()
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  test('respects disabled', async () => {
    const onChange = vi.fn()
    render(<Checkbox disabled aria-label="X" onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  test('respects defaultChecked', () => {
    render(<Checkbox defaultChecked aria-label="X" />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Checkbox ref={ref} aria-label="X" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
