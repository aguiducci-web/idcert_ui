import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement>

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center gap-3 py-12 px-6',
          className,
        )}
        {...props}
      />
    )
  },
)

export type EmptyStateIconProps = React.HTMLAttributes<HTMLDivElement>

export const EmptyStateIcon = React.forwardRef<HTMLDivElement, EmptyStateIconProps>(
  function EmptyStateIcon({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:h-6 [&>svg]:w-6',
          className,
        )}
        {...props}
      />
    )
  },
)

export type EmptyStateTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export const EmptyStateTitle = React.forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  function EmptyStateTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn('text-lg font-semibold text-foreground', className)}
        {...props}
      />
    )
  },
)

export type EmptyStateDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export const EmptyStateDescription = React.forwardRef<HTMLParagraphElement, EmptyStateDescriptionProps>(
  function EmptyStateDescription({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground max-w-sm', className)}
        {...props}
      />
    )
  },
)

export type EmptyStateActionProps = React.HTMLAttributes<HTMLDivElement>

export const EmptyStateAction = React.forwardRef<HTMLDivElement, EmptyStateActionProps>(
  function EmptyStateAction({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('mt-2 flex gap-2', className)}
        {...props}
      />
    )
  },
)
