'use client'

import * as React from 'react'
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { cn } from '../../lib/cn.js'
import { buttonVariants } from '../button/index.js'

export type AlertDialogProps = React.ComponentProps<typeof BaseAlertDialog.Root>
export const AlertDialog = BaseAlertDialog.Root

export type AlertDialogTriggerProps = React.ComponentProps<typeof BaseAlertDialog.Trigger>
export const AlertDialogTrigger = BaseAlertDialog.Trigger

export type AlertDialogContentProps = React.ComponentProps<typeof BaseAlertDialog.Popup>

export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent({ className, children, ...props }, ref) {
    return (
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[open]:animate-in data-[closed]:animate-out',
            'data-[open]:fade-in-0 data-[closed]:fade-out-0',
          )}
        />
        <BaseAlertDialog.Popup
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
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Portal>
    )
  },
)

export type AlertDialogHeaderProps = React.HTMLAttributes<HTMLDivElement>

export const AlertDialogHeader = React.forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  function AlertDialogHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
        {...props}
      />
    )
  },
)

export type AlertDialogFooterProps = React.HTMLAttributes<HTMLDivElement>

export const AlertDialogFooter = React.forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  function AlertDialogFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
        {...props}
      />
    )
  },
)

export type AlertDialogTitleProps = React.ComponentProps<typeof BaseAlertDialog.Title>

export const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  function AlertDialogTitle({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Title
        ref={ref}
        className={cn('text-lg font-semibold', className)}
        {...props}
      />
    )
  },
)

export type AlertDialogDescriptionProps = React.ComponentProps<typeof BaseAlertDialog.Description>

export const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  function AlertDialogDescription({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Description
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)

export type AlertDialogActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  function AlertDialogAction({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Close
        ref={ref}
        className={cn(buttonVariants({ variant: 'destructive' }), className)}
        {...props}
      />
    )
  },
)

export type AlertDialogCancelProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  function AlertDialogCancel({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Close
        ref={ref}
        className={cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', className)}
        {...props}
      />
    )
  },
)
