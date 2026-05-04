'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    },
  },
  defaultVariants: { size: 'md' },
})

export type SpinnerProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'role'> &
  VariantProps<typeof spinnerVariants> & {
    'aria-label'?: string
  }

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner({ className, size, 'aria-label': ariaLabel = 'Loading', ...props }, ref) {
    return (
      <span
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <Loader2 aria-hidden="true" className={spinnerVariants({ size })} />
      </span>
    )
  },
)

export { spinnerVariants }
