'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <span className="relative inline-flex">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            'peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-primary bg-background',
            'ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'checked:bg-primary checked:text-primary-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        <Check
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-4 w-4 text-primary-foreground opacity-0 peer-checked:opacity-100"
        />
      </span>
    )
  },
)
