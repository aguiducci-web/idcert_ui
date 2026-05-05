'use client'

import * as React from 'react'
import { Select as BaseSelect } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn.js'

type BaseSelectRootProps = React.ComponentProps<typeof BaseSelect.Root>

export type SelectProps = Omit<BaseSelectRootProps, 'onValueChange'> & {
  /**
   * Event handler called when the value of the select changes.
   * Receives the new value as a single argument (the underlying Base UI
   * `eventDetails` second argument is not forwarded).
   */
  // The base value type from Base UI is `any`, so we accept the same here
  // for parameter contravariance with consumer handlers like
  // `(v: string) => void`. Internally we never use `any` directly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValueChange?: (value: any) => void
}

export function Select({ onValueChange, ...props }: SelectProps): React.JSX.Element {
  const handleValueChange = React.useMemo<BaseSelectRootProps['onValueChange'] | undefined>(
    () =>
      onValueChange
        ? (value) => {
            onValueChange(value)
          }
        : undefined,
    [onValueChange],
  )
  return <BaseSelect.Root {...(props as BaseSelectRootProps)} onValueChange={handleValueChange} />
}

export type SelectTriggerProps = React.ComponentProps<typeof BaseSelect.Trigger>

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger({ className, children, ...props }, ref) {
    return (
      <BaseSelect.Trigger
        ref={ref}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[popup-open]:ring-2 data-[popup-open]:ring-ring',
          className,
        )}
        {...props}
      >
        {children}
        <BaseSelect.Icon>
          <ChevronDown aria-hidden="true" className="h-4 w-4 opacity-50" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
    )
  },
)

export type SelectValueProps = React.ComponentProps<typeof BaseSelect.Value>

export function SelectValue(props: SelectValueProps): React.JSX.Element {
  return <BaseSelect.Value {...props} />
}

export type SelectContentProps = React.ComponentProps<typeof BaseSelect.Popup> & {
  sideOffset?: number
}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent({ className, children, sideOffset = 4, ...props }, ref) {
    return (
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={sideOffset} className="outline-none">
          <BaseSelect.Popup
            ref={ref}
            className={cn(
              'z-50 max-h-96 min-w-32 overflow-y-auto rounded-md border border-border bg-background p-1 text-foreground shadow-md',
              'data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0',
              'data-[closed]:zoom-out-95 data-[open]:zoom-in-95',
              className,
            )}
            {...props}
          >
            {children}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    )
  },
)

export type SelectItemProps = React.ComponentProps<typeof BaseSelect.Item>

export const SelectItem = React.forwardRef<HTMLElement, SelectItemProps>(
  function SelectItem({ className, children, ...props }, ref) {
    return (
      <BaseSelect.Item
        ref={ref}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
          'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className,
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <BaseSelect.ItemIndicator>
            <Check aria-hidden="true" className="h-4 w-4" />
          </BaseSelect.ItemIndicator>
        </span>
        <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      </BaseSelect.Item>
    )
  },
)

export type SelectGroupProps = React.ComponentProps<typeof BaseSelect.Group>

export function SelectGroup(props: SelectGroupProps): React.JSX.Element {
  return <BaseSelect.Group {...props} />
}

export type SelectLabelProps = React.ComponentProps<typeof BaseSelect.GroupLabel>

export const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  function SelectLabel({ className, ...props }, ref) {
    return (
      <BaseSelect.GroupLabel
        ref={ref}
        className={cn(
          'px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
          className,
        )}
        {...props}
      />
    )
  },
)

export type SelectSeparatorProps = React.ComponentProps<typeof BaseSelect.Separator>

export const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  function SelectSeparator({ className, ...props }, ref) {
    return (
      <BaseSelect.Separator
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-border', className)}
        {...props}
      />
    )
  },
)
