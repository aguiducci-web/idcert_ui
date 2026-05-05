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
export const dayPickerClassNames: Record<string, string> = {
  root: 'rdp',
  months: 'flex flex-col gap-4 sm:flex-row',
  month: 'space-y-4',
  caption: 'flex items-center justify-between px-2',
  caption_label: 'text-sm font-medium',
  nav: 'flex items-center gap-1',
  nav_button:
    'inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50',
  nav_button_previous: '',
  nav_button_next: '',
  table: 'w-full border-collapse',
  head_row: 'flex',
  head_cell: 'w-9 text-center text-xs font-medium text-muted-foreground',
  row: 'mt-2 flex w-full',
  cell: 'h-9 w-9 p-0 text-center text-sm relative',
  day: 'h-9 w-9 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100 inline-flex items-center justify-center',
  day_selected:
    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
  day_today: 'bg-accent text-accent-foreground font-semibold',
  day_disabled: 'text-muted-foreground opacity-50 pointer-events-none',
  day_outside: 'text-muted-foreground opacity-50',
  day_range_start: 'rounded-l-md bg-primary text-primary-foreground',
  day_range_middle: 'rounded-none bg-accent text-accent-foreground',
  day_range_end: 'rounded-r-md bg-primary text-primary-foreground',
  day_hidden: 'invisible',
}
