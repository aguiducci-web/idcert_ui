'use client'

import * as React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { format as formatDate, type Locale } from 'date-fns'
import { DayPicker, type DateRange, type Matcher } from 'react-day-picker'
import {
  DatePopoverTrigger,
  DatePopoverContent,
  dayPickerClassNames,
} from '../date-picker/_shared.js'

export type { DateRange } from 'react-day-picker'

export type DateRangePickerProps = {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (value: DateRange | undefined) => void
  placeholder?: string
  /** date-fns format string. Default: "PPP" (long localized). */
  format?: string
  /** date-fns locale. Default: en-US. */
  locale?: Locale
  disabled?: boolean
  fromDate?: Date
  toDate?: Date
  numberOfMonths?: number
  className?: string
  'aria-label'?: string
  id?: string
}

export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      placeholder = 'Pick a range',
      format: formatString = 'PPP',
      locale,
      disabled,
      fromDate,
      toDate,
      numberOfMonths = 2,
      className,
      id,
      'aria-label': ariaLabel,
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false)
    const [uncontrolled, setUncontrolled] = React.useState<DateRange | undefined>(defaultValue)
    const isControlled = valueProp !== undefined
    const value = isControlled ? valueProp : uncontrolled

    const setValue = (next: DateRange | undefined) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    }

    const triggerLabel = (() => {
      if (!value || !value.from) return placeholder
      const fromText = formatDate(value.from, formatString, locale ? { locale } : undefined)
      const toText = value.to
        ? formatDate(value.to, formatString, locale ? { locale } : undefined)
        : '?'
      return `${fromText} − ${toText}`
    })()

    const isPlaceholder = !value || !value.from

    // react-day-picker v9 deprecated fromDate/toDate. Translate them to:
    //  - startMonth/endMonth (constrain month navigation)
    //  - disabled matcher (disable days outside the range)
    const disabledMatchers: Matcher[] = []
    if (fromDate !== undefined) disabledMatchers.push({ before: fromDate })
    if (toDate !== undefined) disabledMatchers.push({ after: toDate })

    return (
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        <DatePopoverTrigger
          ref={ref}
          id={id}
          aria-label={ariaLabel}
          disabled={disabled}
          isPlaceholder={isPlaceholder}
          className={className}
        >
          {triggerLabel}
        </DatePopoverTrigger>
        <DatePopoverContent>
          <DayPicker
            mode="range"
            selected={value}
            onSelect={(next) => {
              setValue(next)
              // react-day-picker v9 range mode: the first click sets
              // `{from: day, to: day}`. Only close when a real two-day range
              // has been selected (i.e. `from` and `to` differ).
              if (next?.from && next?.to && next.from.getTime() !== next.to.getTime()) {
                setOpen(false)
              }
            }}
            classNames={dayPickerClassNames}
            locale={locale}
            numberOfMonths={numberOfMonths}
            startMonth={fromDate}
            endMonth={toDate}
            disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
            defaultMonth={value?.from ?? fromDate ?? new Date()}
          />
        </DatePopoverContent>
      </BasePopover.Root>
    )
  },
)
