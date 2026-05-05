'use client'

import * as React from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type SheetProps = React.ComponentProps<typeof BaseDialog.Root>
export const Sheet = BaseDialog.Root

export type SheetTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>
export const SheetTrigger = BaseDialog.Trigger

export type SheetCloseProps = React.ComponentProps<typeof BaseDialog.Close>
export const SheetClose = BaseDialog.Close

const sheetContentVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full',
        bottom:
          'inset-x-0 bottom-0 border-t data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full',
        left:
          'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full',
      },
    },
    defaultVariants: { side: 'right' },
  },
)

export type SheetContentProps = React.ComponentProps<typeof BaseDialog.Popup> &
  VariantProps<typeof sheetContentVariants> & {
    showCloseButton?: boolean
  }

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  function SheetContent(
    { className, children, side = 'right', showCloseButton = true, ...props },
    ref,
  ) {
    return (
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300',
            'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
          )}
        />
        <BaseDialog.Popup
          ref={ref}
          className={cn(sheetContentVariants({ side }), className)}
          {...props}
        >
          {children}
          {showCloseButton && (
            <BaseDialog.Close
              className="absolute right-4 top-4 rounded-sm p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </BaseDialog.Close>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    )
  },
)

export type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement>

export const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  function SheetHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
        {...props}
      />
    )
  },
)

export type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>

export const SheetFooter = React.forwardRef<HTMLDivElement, SheetFooterProps>(
  function SheetFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
        {...props}
      />
    )
  },
)

export type SheetTitleProps = React.ComponentProps<typeof BaseDialog.Title>

export const SheetTitle = React.forwardRef<HTMLHeadingElement, SheetTitleProps>(
  function SheetTitle({ className, ...props }, ref) {
    return (
      <BaseDialog.Title
        ref={ref}
        className={cn('text-lg font-semibold text-foreground', className)}
        {...props}
      />
    )
  },
)

export type SheetDescriptionProps = React.ComponentProps<typeof BaseDialog.Description>

export const SheetDescription = React.forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  function SheetDescription({ className, ...props }, ref) {
    return (
      <BaseDialog.Description
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)
