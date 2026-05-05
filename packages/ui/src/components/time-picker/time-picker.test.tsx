import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import { TimePicker } from './index.js'

describe('TimePicker', () => {
  test('renders an input of type time with our styling', () => {
    render(<TimePicker aria-label="Time" />)
    const input = screen.getByLabelText('Time')
    expect(input).toHaveAttribute('type', 'time')
    expect(input).toHaveClass('h-10')
  })

  test('accepts and reflects HH:mm value', () => {
    render(<TimePicker aria-label="Time" value="14:30" onValueChange={() => {}} />)
    expect(screen.getByLabelText<HTMLInputElement>('Time').value).toBe('14:30')
  })

  test('fires onValueChange with the new time string on change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker aria-label="Time" defaultValue="09:00" onValueChange={onChange} />)
    const input = screen.getByLabelText<HTMLInputElement>('Time')
    await user.clear(input)
    await user.type(input, '12:45')
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls.at(-1)
    expect(typeof lastCall?.[0]).toBe('string')
  })

  test('propagates step / min / max to the native input', () => {
    render(
      <TimePicker
        aria-label="Time"
        value="10:00"
        onValueChange={() => {}}
        step={300}
        min="08:00"
        max="20:00"
      />,
    )
    const input = screen.getByLabelText<HTMLInputElement>('Time')
    expect(input).toHaveAttribute('step', '300')
    expect(input).toHaveAttribute('min', '08:00')
    expect(input).toHaveAttribute('max', '20:00')
  })

  test('disabled disables the input', () => {
    render(<TimePicker aria-label="Time" disabled value="10:00" onValueChange={() => {}} />)
    expect(screen.getByLabelText('Time')).toBeDisabled()
  })

  test('forwards ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<TimePicker ref={ref} aria-label="Time" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
