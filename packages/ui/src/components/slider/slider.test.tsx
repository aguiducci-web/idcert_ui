import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import { Slider } from './index.js'

describe('Slider', () => {
  test('renders a single thumb when value has one entry', () => {
    render(<Slider value={[20]} aria-label="Volume" />)
    expect(screen.getAllByRole('slider')).toHaveLength(1)
  })

  test('renders two thumbs when value has two entries', () => {
    render(<Slider value={[20, 80]} aria-label="Range" />)
    expect(screen.getAllByRole('slider')).toHaveLength(2)
  })

  test('thumb reflects current value via aria-valuenow', () => {
    render(<Slider value={[42]} aria-label="Volume" min={0} max={100} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '42')
  })

  test('arrow key updates value via onValueChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Slider
        defaultValue={[50]}
        onValueChange={onChange}
        min={0}
        max={100}
        step={1}
        aria-label="Volume"
      />,
    )
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls.at(-1)
    expect(Array.isArray(lastCall?.[0])).toBe(true)
    expect(lastCall?.[0][0]).toBeGreaterThan(50)
  })

  test('disabled disables thumb interaction', () => {
    render(<Slider value={[50]} disabled aria-label="Volume" />)
    // Base UI 1.4.x renders the slider role on a hidden <input type="range">
    // that uses the native `disabled` attribute (not `aria-disabled`).
    expect(screen.getByRole('slider')).toBeDisabled()
  })

  test('forwards ref to root element', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Slider ref={ref} value={[50]} aria-label="Volume" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
