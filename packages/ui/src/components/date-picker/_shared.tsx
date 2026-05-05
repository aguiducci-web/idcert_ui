'use client'

import * as React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type DatePopoverTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isPlaceholder?: boolean
}

export const DatePopoverTrigger = React.forwardRef<HTMLButtonElement, DatePopoverTriggerProps>(
  function DatePopoverTrigger({ className, children, isPlaceholder, ...props }, ref) {
    return (
      <BasePopover.Trigger
        ref={ref}
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isPlaceholder && 'text-muted-foreground',
          className,
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
        <CalendarIcon aria-hidden="true" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </BasePopover.Trigger>
    )
  },
)

export type DatePopoverContentProps = {
  open?: boolean
  sideOffset?: number
  className?: string
  children?: React.ReactNode
}

export function DatePopoverContent({
  sideOffset = 4,
  className,
  children,
}: DatePopoverContentProps): React.JSX.Element {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner sideOffset={sideOffset} className="outline-none">
        <BasePopover.Popup
          className={cn(
            'z-50 rounded-md border border-border bg-background p-3 text-foreground shadow-md',
            'data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0',
            'data-[closed]:zoom-out-95 data-[open]:zoom-in-95',
            className,
          )}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

// Tailwind class mapping for react-day-picker v9 calendar slots.
// Themed to match our design tokens. Used by DatePicker and DateRangePicker.
// Keys mirror the v9 `UI`, `DayFlag`, `SelectionState` enums.
export const dayPickerClassNames: Record<string, string> = {
  root: 'rdp w-fit',
  months: 'flex flex-col gap-4 sm:flex-row',
  month: 'space-y-4',
  month_caption: 'flex h-9 items-center justify-center px-9',
  caption_label: 'text-sm font-medium',
  nav: 'absolute inset-x-1 flex items-center justify-between',
  button_previous:
    'inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-30',
  button_next:
    'inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-30',
  chevron: 'h-4 w-4 fill-current',
  month_grid: 'w-full border-collapse',
  weekdays: 'flex',
  weekday: 'flex h-9 w-9 items-center justify-center text-xs font-medium text-muted-foreground',
  weeks: 'flex flex-col gap-1',
  week: 'flex w-full',
  day: 'flex h-9 w-9 items-center justify-center p-0 text-sm relative',
  day_button:
    'inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  selected:
    '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary [&>button:hover]:text-primary-foreground',
  today: '[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:font-semibold',
  outside: '[&>button]:text-muted-foreground [&>button]:opacity-50',
  disabled: '[&>button]:text-muted-foreground [&>button]:opacity-50 [&>button]:pointer-events-none',
  hidden: 'invisible',
  range_start: '[&>button]:rounded-r-none [&>button]:bg-primary [&>button]:text-primary-foreground',
  range_middle:
    '[&>button]:rounded-none [&>button]:bg-accent [&>button]:text-accent-foreground',
  range_end: '[&>button]:rounded-l-none [&>button]:bg-primary [&>button]:text-primary-foreground',
}
