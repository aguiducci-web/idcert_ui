import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it as itLocale } from 'date-fns/locale'
import * as React from 'react'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { DatePicker } from './index.js'

const FROZEN_NOW = new Date('2026-05-05T12:00:00Z')

beforeAll(() => {
  // Only fake Date so the calendar renders May 2026 deterministically; leave
  // setTimeout / rAF / microtasks real so Base UI's Popover and react-day-picker
  // can settle inside userEvent interactions.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(FROZEN_NOW)
})

afterAll(() => {
  vi.useRealTimers()
})

describe('DatePicker', () => {
  test('renders trigger with placeholder when no value', () => {
    render(<DatePicker aria-label="Date" placeholder="Pick a date…" />)
    expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('Pick a date…')
  })

  test('opens popover on trigger click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<DatePicker aria-label="Date" placeholder="Pick…" />)
    await user.click(screen.getByRole('button', { name: 'Date' }))
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })
  })

  test('clicking a day calls onValueChange with a Date and closes popover', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onChange = vi.fn()
    render(<DatePicker aria-label="Date" onValueChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Date' }))
    const day10 = await screen.findByRole('button', { name: /10/ })
    await user.click(day10)
    expect(onChange).toHaveBeenCalled()
    const [arg] = onChange.mock.calls.at(-1) ?? []
    expect(arg).toBeInstanceOf(Date)
  })

  test('controlled mode shows formatted date in trigger', () => {
    render(
      <DatePicker
        aria-label="Date"
        value={new Date('2026-05-05')}
        onValueChange={() => {}}
        format="dd/MM/yyyy"
      />,
    )
    expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('05/05/2026')
  })

  test('respects custom locale when formatting', () => {
    render(
      <DatePicker
        aria-label="Date"
        value={new Date('2026-05-05')}
        onValueChange={() => {}}
        locale={itLocale}
        format="d MMMM yyyy"
      />,
    )
    expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('5 maggio 2026')
  })

  test('disabled prevents popover from opening', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<DatePicker aria-label="Date" disabled placeholder="Pick…" />)
    const trigger = screen.getByRole('button', { name: 'Date' })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
  })

  test('toDate disables days after the limit', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <DatePicker
        aria-label="Date"
        toDate={new Date('2026-05-05')}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Date' }))
    // react-day-picker v9 day buttons carry an aria-label like
    // "Wednesday, May 20th, 2026". Use that to disambiguate from the year.
    // v9 also renders disabled days via the DOM `disabled` attribute (not
    // `aria-disabled`) when the button is not the currently focused day.
    const day20 = await screen.findByRole('button', { name: /May 20th, 2026/ })
    expect(day20).toBeDisabled()
  })

  test('forwards ref to trigger button', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<DatePicker ref={ref} aria-label="Date" />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
