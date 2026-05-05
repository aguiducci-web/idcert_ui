'use client'

import * as React from 'react'
import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const avatarVariants = cva(
  'relative inline-flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-6 w-6 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export type AvatarProps = React.ComponentProps<typeof BaseAvatar.Root> &
  VariantProps<typeof avatarVariants>

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar({ className, size, ...props }, ref) {
    return (
      <BaseAvatar.Root
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      />
    )
  },
)

export type AvatarImageProps = React.ComponentProps<typeof BaseAvatar.Image>

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  function AvatarImage({ className, ...props }, ref) {
    return (
      <BaseAvatar.Image
        ref={ref}
        className={cn('aspect-square h-full w-full object-cover', className)}
        {...props}
      />
    )
  },
)

export type AvatarFallbackProps = React.ComponentProps<typeof BaseAvatar.Fallback>

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback({ className, ...props }, ref) {
    return (
      <BaseAvatar.Fallback
        ref={ref}
        className={cn(
          'flex h-full w-full items-center justify-center bg-muted text-muted-foreground font-medium',
          className,
        )}
        {...props}
      />
    )
  },
)

export type AvatarGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  max?: number
  size?: VariantProps<typeof avatarVariants>['size']
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup({ className, children, max, size, ...props }, ref) {
    const childrenArr = React.Children.toArray(children)
    const visibleArr = max && childrenArr.length > max ? childrenArr.slice(0, max) : childrenArr
    const overflow = max && childrenArr.length > max ? childrenArr.length - max : 0

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex [&>*:not(:first-child)]:-ml-2 [&>*]:ring-2 [&>*]:ring-background',
          className,
        )}
        {...props}
      >
        {visibleArr}
        {overflow > 0 && (
          <Avatar size={size}>
            <AvatarFallback>+{overflow}</AvatarFallback>
          </Avatar>
        )}
      </div>
    )
  },
)

export { avatarVariants }
