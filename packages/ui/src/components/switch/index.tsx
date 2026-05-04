'use client'

import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'>

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className={cn(
          'relative h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-input',
          'transition-colors',
          'before:absolute before:left-0.5 before:top-0.5 before:h-5 before:w-5 before:rounded-full before:bg-background before:transition-transform before:content-[\'\']',
          'checked:bg-primary checked:before:translate-x-5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
