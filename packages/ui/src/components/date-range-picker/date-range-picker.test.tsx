import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { DateRangePicker, type DateRange } from './index.js'

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

describe('DateRangePicker', () => {
  test('renders trigger with placeholder when no value', () => {
    render(<DateRangePicker aria-label="Range" placeholder="Pick a range…" />)
    expect(screen.getByRole('button', { name: 'Range' })).toHaveTextContent('Pick a range…')
  })

  test('opens popover on trigger click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<DateRangePicker aria-label="Range" placeholder="Pick…" />)
    await user.click(screen.getByRole('button', { name: 'Range' }))
    await waitFor(() => {
      expect(screen.getAllByRole('grid').length).toBeGreaterThanOrEqual(1)
    })
  })

  test('selecting two days fires onValueChange with DateRange', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onChange = vi.fn()
    render(<DateRangePicker aria-label="Range" onValueChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Range' }))
    const day10 = await screen.findAllByRole('button', { name: /May 10th, 2026/ })
    await user.click(day10[0]!)
    const day20 = await screen.findAllByRole('button', { name: /May 20th, 2026/ })
    await user.click(day20[0]!)
    expect(onChange).toHaveBeenCalled()
    const lastArg = onChange.mock.calls.at(-1)?.[0] as DateRange | undefined
    expect(lastArg?.from).toBeInstanceOf(Date)
    expect(lastArg?.to).toBeInstanceOf(Date)
  })

  test('renders both from and to in trigger when controlled with full range', () => {
    render(
      <DateRangePicker
        aria-label="Range"
        value={{
          from: new Date('2026-05-05'),
          to: new Date('2026-05-12'),
        }}
        onValueChange={() => {}}
        format="dd/MM/yyyy"
      />,
    )
    expect(screen.getByRole('button', { name: 'Range' })).toHaveTextContent(
      '05/05/2026 − 12/05/2026',
    )
  })

  test('renders only from with placeholder for partial range', () => {
    render(
      <DateRangePicker
        aria-label="Range"
        value={{ from: new Date('2026-05-05'), to: undefined }}
        onValueChange={() => {}}
        format="dd/MM/yyyy"
      />,
    )
    expect(screen.getByRole('button', { name: 'Range' })).toHaveTextContent('05/05/2026 − ?')
  })

  test('renders 2 month grids by default', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<DateRangePicker aria-label="Range" />)
    await user.click(screen.getByRole('button', { name: 'Range' }))
    await waitFor(() => {
      const grids = screen.getAllByRole('grid')
      expect(grids.length).toBe(2)
    })
  })

  test('disabled prevents popover from opening', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<DateRangePicker aria-label="Range" disabled />)
    const trigger = screen.getByRole('button', { name: 'Range' })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(screen.queryAllByRole('grid')).toHaveLength(0)
  })

  test('forwards ref to trigger button', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<DateRangePicker ref={ref} aria-label="Range" />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
