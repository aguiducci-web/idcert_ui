'use client'

import * as React from 'react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { cn } from '../../lib/cn.js'

export type TooltipProviderProps = React.ComponentProps<typeof BaseTooltip.Provider>

export function TooltipProvider({ delay = 200, ...props }: TooltipProviderProps): React.JSX.Element {
  return <BaseTooltip.Provider delay={delay} {...props} />
}

export type TooltipProps = React.ComponentProps<typeof BaseTooltip.Root>

export function Tooltip(props: TooltipProps): React.JSX.Element {
  return <BaseTooltip.Root {...props} />
}

export type TooltipTriggerProps = React.ComponentProps<typeof BaseTooltip.Trigger>

export const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  function TooltipTrigger(props, ref) {
    return <BaseTooltip.Trigger ref={ref as never} {...props} />
  },
)

export type TooltipContentProps = React.ComponentProps<typeof BaseTooltip.Popup> & {
  sideOffset?: number
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent({ className, sideOffset = 6, children, ...props }, ref) {
    return (
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={sideOffset}>
          <BaseTooltip.Popup
            ref={ref}
            role="tooltip"
            className={cn(
              'z-50 overflow-hidden rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground shadow-md',
              // Base UI 1.4.1 uses data-open / data-closed (not data-state)
              // and data-starting-style / data-ending-style for enter/leave transitions
              'data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0',
              'data-[closed]:zoom-out-95 data-[open]:zoom-in-95',
              'data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2',
              'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
              'data-[side=top]:slide-out-to-bottom-2 data-[side=bottom]:slide-out-to-top-2',
              'data-[side=left]:slide-out-to-right-2 data-[side=right]:slide-out-to-left-2',
              className,
            )}
            {...props}
          >
            {children}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    )
  },
)
