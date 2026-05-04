import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Radio, RadioGroup } from './index.js'

describe('Radio', () => {
  test('renders with label', () => {
    render(<Radio name="g" value="a" aria-label="Option A" />)
    expect(screen.getByRole('radio', { name: 'Option A' })).toBeInTheDocument()
  })

  test('toggles on click', async () => {
    const onChange = vi.fn()
    render(<Radio name="g" value="a" aria-label="A" onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio'))
    expect(onChange).toHaveBeenCalled()
    expect(screen.getByRole('radio')).toBeChecked()
  })

  test('respects disabled', () => {
    render(<Radio name="g" value="a" disabled aria-label="X" />)
    expect(screen.getByRole('radio')).toBeDisabled()
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Radio ref={ref} name="g" value="a" aria-label="X" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})

describe('RadioGroup', () => {
  test('renders children with role radiogroup', () => {
    render(
      <RadioGroup aria-label="Choose">
        <Radio name="g" value="a" aria-label="A" />
        <Radio name="g" value="b" aria-label="B" />
      </RadioGroup>,
    )
    expect(screen.getByRole('radiogroup', { name: 'Choose' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
  })

  test('only one radio in group can be checked', async () => {
    render(
      <RadioGroup aria-label="Choose">
        <Radio name="grp" value="a" aria-label="A" />
        <Radio name="grp" value="b" aria-label="B" />
      </RadioGroup>,
    )
    const a = screen.getByRole('radio', { name: 'A' })
    const b = screen.getByRole('radio', { name: 'B' })
    await userEvent.click(a)
    expect(a).toBeChecked()
    expect(b).not.toBeChecked()
    await userEvent.click(b)
    expect(b).toBeChecked()
    expect(a).not.toBeChecked()
  })
})
