import { render, screen } from '@testing-library/react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import {
  DatePopoverTrigger,
  DatePopoverContent,
  dayPickerClassNames,
} from './_shared.js'

function withPopover(children: React.ReactNode, open?: boolean) {
  return <BasePopover.Root open={open}>{children}</BasePopover.Root>
}

describe('_shared', () => {
  test('DatePopoverTrigger renders a button with given children and trailing calendar icon', () => {
    render(
      withPopover(
        <DatePopoverTrigger aria-label="Trigger">Some date</DatePopoverTrigger>,
      ),
    )
    const btn = screen.getByRole('button', { name: 'Trigger' })
    expect(btn).toHaveTextContent('Some date')
    expect(btn.querySelector('svg')).not.toBeNull()
  })

  test('DatePopoverTrigger forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(withPopover(<DatePopoverTrigger ref={ref}>x</DatePopoverTrigger>))
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  test('DatePopoverTrigger applies muted styling when isPlaceholder', () => {
    render(
      withPopover(
        <DatePopoverTrigger isPlaceholder data-testid="t">
          placeholder
        </DatePopoverTrigger>,
      ),
    )
    expect(screen.getByTestId('t')).toHaveClass('text-muted-foreground')
  })

  test('DatePopoverContent renders children inside a popup', () => {
    render(
      withPopover(
        <DatePopoverContent>
          <div data-testid="calendar-stub" />
        </DatePopoverContent>,
        true,
      ),
    )
    expect(screen.getByTestId('calendar-stub')).toBeInTheDocument()
  })

  test('dayPickerClassNames defines all calendar slot keys', () => {
    expect(dayPickerClassNames).toMatchObject({
      root: expect.any(String),
      months: expect.any(String),
      month: expect.any(String),
      caption: expect.any(String),
      caption_label: expect.any(String),
      nav: expect.any(String),
      nav_button: expect.any(String),
      table: expect.any(String),
      head_row: expect.any(String),
      head_cell: expect.any(String),
      row: expect.any(String),
      cell: expect.any(String),
      day: expect.any(String),
      day_selected: expect.any(String),
      day_today: expect.any(String),
      day_disabled: expect.any(String),
      day_outside: expect.any(String),
      day_range_start: expect.any(String),
      day_range_middle: expect.any(String),
      day_range_end: expect.any(String),
    })
  })
})
