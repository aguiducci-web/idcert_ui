'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type DropdownMenuProps = React.ComponentProps<typeof BaseMenu.Root>

export function DropdownMenu(props: DropdownMenuProps): React.JSX.Element {
  return <BaseMenu.Root {...props} />
}

export type DropdownMenuTriggerProps = Omit<
  React.ComponentProps<typeof BaseMenu.Trigger>,
  'render'
> & {
  asChild?: boolean
}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ asChild, children, ...props }, ref) {
    if (asChild && React.isValidElement(children)) {
      return (
        <BaseMenu.Trigger
          ref={ref as never}
          render={children as React.ReactElement}
          {...(props as Record<string, unknown>)}
        />
      )
    }
    return (
      <BaseMenu.Trigger ref={ref as never} {...props}>
        {children}
      </BaseMenu.Trigger>
    )
  },
)

const popupClassName = cn(
  'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-background p-1 text-foreground shadow-md',
  'data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0',
  'data-[closed]:zoom-out-95 data-[open]:zoom-in-95',
)

export type DropdownMenuContentProps = React.ComponentProps<typeof BaseMenu.Popup> & {
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
}

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent({ className, children, sideOffset = 4, align, ...props }, ref) {
    return (
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={sideOffset} align={align} className="outline-none">
          <BaseMenu.Popup ref={ref} className={cn(popupClassName, className)} {...props}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    )
  },
)

const itemClassName = cn(
  'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
  'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
)

export type DropdownMenuItemProps = React.ComponentProps<typeof BaseMenu.Item>

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  function DropdownMenuItem({ className, ...props }, ref) {
    return (
      <BaseMenu.Item ref={ref} className={cn(itemClassName, className)} {...props} />
    )
  },
)

export type DropdownMenuGroupProps = React.ComponentProps<typeof BaseMenu.Group>

export const DropdownMenuGroup = React.forwardRef<HTMLDivElement, DropdownMenuGroupProps>(
  function DropdownMenuGroup(props, ref) {
    return <BaseMenu.Group ref={ref} {...props} />
  },
)

export type DropdownMenuLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * When true, renders the label as a Base UI `Menu.GroupLabel` so it is
   * automatically associated (via `aria-labelledby`) with its parent
   * `DropdownMenuGroup`. Defaults to `false` so the label can be used at the
   * top level of `DropdownMenuContent` without requiring a surrounding group.
   */
  inset?: boolean
  asGroupLabel?: boolean
}

export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  function DropdownMenuLabel({ className, asGroupLabel, ...props }, ref) {
    const labelClassName = cn(
      'px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
      className,
    )
    if (asGroupLabel) {
      return <BaseMenu.GroupLabel ref={ref} className={labelClassName} {...props} />
    }
    return <div ref={ref} className={labelClassName} {...props} />
  },
)

export type DropdownMenuSeparatorProps = React.ComponentProps<typeof BaseMenu.Separator>

export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  function DropdownMenuSeparator({ className, ...props }, ref) {
    return (
      <BaseMenu.Separator
        ref={ref}
        className={cn('-mx-1 my-1 h-px bg-border', className)}
        {...props}
      />
    )
  },
)

export type DropdownMenuCheckboxItemProps = React.ComponentProps<typeof BaseMenu.CheckboxItem>

export const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <BaseMenu.CheckboxItem ref={ref} className={cn(itemClassName, 'pl-8', className)} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <BaseMenu.CheckboxItemIndicator>
          <Check aria-hidden="true" className="h-4 w-4" />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      {children}
    </BaseMenu.CheckboxItem>
  )
})

export type DropdownMenuRadioGroupProps = React.ComponentProps<typeof BaseMenu.RadioGroup>

export function DropdownMenuRadioGroup(
  props: DropdownMenuRadioGroupProps,
): React.JSX.Element {
  return <BaseMenu.RadioGroup {...props} />
}

export type DropdownMenuRadioItemProps = React.ComponentProps<typeof BaseMenu.RadioItem>

export const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  function DropdownMenuRadioItem({ className, children, ...props }, ref) {
    return (
      <BaseMenu.RadioItem ref={ref} className={cn(itemClassName, 'pl-8', className)} {...props}>
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <BaseMenu.RadioItemIndicator>
            <Circle aria-hidden="true" className="h-2 w-2 fill-current" />
          </BaseMenu.RadioItemIndicator>
        </span>
        {children}
      </BaseMenu.RadioItem>
    )
  },
)

export type DropdownMenuSubProps = React.ComponentProps<typeof BaseMenu.SubmenuRoot>

export function DropdownMenuSub(props: DropdownMenuSubProps): React.JSX.Element {
  return <BaseMenu.SubmenuRoot {...props} />
}

export type DropdownMenuSubTriggerProps = React.ComponentProps<typeof BaseMenu.SubmenuTrigger>

export const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSubTriggerProps
>(function DropdownMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <BaseMenu.SubmenuTrigger ref={ref} className={cn(itemClassName, className)} {...props}>
      {children}
      <ChevronRight aria-hidden="true" className="ml-auto h-4 w-4" />
    </BaseMenu.SubmenuTrigger>
  )
})

export type DropdownMenuSubContentProps = React.ComponentProps<typeof BaseMenu.Popup> & {
  sideOffset?: number
}

export const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  function DropdownMenuSubContent({ className, children, sideOffset = 4, ...props }, ref) {
    return (
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={sideOffset} className="outline-none">
          <BaseMenu.Popup ref={ref} className={cn(popupClassName, className)} {...props}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    )
  },
)
