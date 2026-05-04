'use client'

import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="radio"
        className={cn(
          'h-4 w-4 shrink-0 appearance-none rounded-full border border-primary bg-background',
          'ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'checked:border-[5px] checked:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)

export type RadioGroupProps = React.HTMLAttributes<HTMLDivElement>

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn('flex flex-col gap-2', className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
