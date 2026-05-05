'use client'

import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type TimePickerProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'type'
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  function TimePicker(
    { className, value, defaultValue, onValueChange, ...props },
    ref,
  ) {
    return (
      <input
        ref={ref}
        type="time"
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => onValueChange?.(event.target.value)}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
