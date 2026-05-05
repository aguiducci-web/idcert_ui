'use client'

import * as React from 'react'
import { Progress as BaseProgress } from '@base-ui/react/progress'
import { cn } from '../../lib/cn.js'

export type ProgressProps = React.ComponentProps<typeof BaseProgress.Root>

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  function Progress({ className, ...props }, ref) {
    return (
      <BaseProgress.Root
        ref={ref}
        className={cn('relative w-full', className)}
        {...props}
      >
        <BaseProgress.Track className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <BaseProgress.Indicator className="h-full bg-primary transition-transform" />
        </BaseProgress.Track>
      </BaseProgress.Root>
    )
  },
)
