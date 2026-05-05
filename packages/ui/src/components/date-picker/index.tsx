'use client'

import * as React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { format as formatDate, type Locale } from 'date-fns'
import { DayPicker, type Matcher } from 'react-day-picker'
import {
  DatePopoverTrigger,
  DatePopoverContent,
  dayPickerClassNames,
} from './_shared.js'

export type DatePickerProps = {
  value?: Date
  defaultValue?: Date
  onValueChange?: (value: Date | undefined) => void
  placeholder?: string
  /** date-fns format string. Default: "PPP" (long localized). */
  format?: string
  /** date-fns locale. Default: en-US. */
  locale?: Locale
  disabled?: boolean
  fromDate?: Date
  toDate?: Date
  className?: string
  'aria-label'?: string
  id?: string
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      placeholder = 'Pick a date',
      format: formatString = 'PPP',
      locale,
      disabled,
      fromDate,
      toDate,
      className,
      id,
      'aria-label': ariaLabel,
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false)
    const [uncontrolled, setUncontrolled] = React.useState<Date | undefined>(defaultValue)
    const isControlled = valueProp !== undefined
    const value = isControlled ? valueProp : uncontrolled

    const setValue = (next: Date | undefined) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    }

    const triggerLabel = value
      ? formatDate(value, formatString, locale ? { locale } : undefined)
      : placeholder

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
          isPlaceholder={!value}
          className={className}
        >
          {triggerLabel}
        </DatePopoverTrigger>
        <DatePopoverContent>
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(next) => {
              setValue(next)
              setOpen(false)
            }}
            classNames={dayPickerClassNames}
            locale={locale}
            startMonth={fromDate}
            endMonth={toDate}
            disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
            defaultMonth={value ?? fromDate ?? new Date()}
          />
        </DatePopoverContent>
      </BasePopover.Root>
    )
  },
)
