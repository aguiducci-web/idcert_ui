import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type ListProps = React.HTMLAttributes<HTMLUListElement> & {
  divider?: boolean
}

export const List = React.forwardRef<HTMLUListElement, ListProps>(
  function List({ className, divider, ...props }, ref) {
    return (
      <ul
        ref={ref}
        className={cn(
          'flex flex-col text-sm',
          divider
            ? 'divide-y divide-border [&>li]:py-2 [&>li:first-child]:pt-0 [&>li:last-child]:pb-0'
            : 'gap-2',
          className,
        )}
        {...props}
      />
    )
  },
)

export type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem({ className, ...props }, ref) {
    return (
      <li
        ref={ref}
        className={cn('text-foreground', className)}
        {...props}
      />
    )
  },
)
