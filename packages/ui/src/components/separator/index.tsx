import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type SeparatorProps = React.HTMLAttributes<HTMLHRElement>

export const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  function Separator({ className, ...props }, ref) {
    return (
      <hr
        ref={ref}
        className={cn('h-px w-full shrink-0 border-0 bg-border', className)}
        {...props}
      />
    )
  },
)
