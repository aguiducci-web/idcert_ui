'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cn } from '../../lib/cn.js'

export type DialogProps = React.ComponentProps<typeof BaseDialog.Root>
export const Dialog = BaseDialog.Root

export type DialogTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>
export const DialogTrigger = BaseDialog.Trigger

export type DialogContentProps = React.ComponentProps<typeof BaseDialog.Popup> & {
  showCloseButton?: boolean
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ className, children, showCloseButton = true, ...props }, ref) {
    return (
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[open]:animate-in data-[closed]:animate-out',
            'data-[open]:fade-in-0 data-[closed]:fade-out-0',
          )}
        />
        <BaseDialog.Popup
          ref={ref}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg sm:rounded-lg',
            'data-[open]:animate-in data-[closed]:animate-out',
            'data-[open]:fade-in-0 data-[closed]:fade-out-0',
            'data-[open]:zoom-in-95 data-[closed]:zoom-out-95',
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <BaseDialog.Close
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
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

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DialogHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
        {...props}
      />
    )
  },
)

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DialogFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
        {...props}
      />
    )
  },
)

export type DialogTitleProps = React.ComponentProps<typeof BaseDialog.Title>

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ className, ...props }, ref) {
    return (
      <BaseDialog.Title
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
      />
    )
  },
)

export type DialogDescriptionProps = React.ComponentProps<typeof BaseDialog.Description>

export const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, ...props }, ref) {
    return (
      <BaseDialog.Description
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)

export type DialogCloseProps = React.ComponentProps<typeof BaseDialog.Close>
export const DialogClose = BaseDialog.Close
