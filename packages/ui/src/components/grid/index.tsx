import * as React from 'react'
import { cn } from '../../lib/cn.js'

type ColsValue = 1 | 2 | 3 | 4 | 5 | 6 | 12
type GapValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12

const colsClasses: Record<ColsValue, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3',
  4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6', 12: 'grid-cols-12',
}

const gapClasses: Record<GapValue, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
  5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12',
}

export type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  cols?: ColsValue
  gap?: GapValue
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  function Grid({ className, cols = 1, gap = 4, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('grid', colsClasses[cols], gapClasses[gap], className)}
        {...props}
      />
    )
  },
)
