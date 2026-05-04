import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type DividerProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical'
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  function Divider({ className, orientation = 'horizontal', ...props }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={cn(
          'shrink-0 bg-border',
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
          className,
        )}
        {...props}
      />
    )
  },
)
