import * as React from 'react'
import { cn } from '../../lib/cn.js'

type GapValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24

export type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  direction?: 'vertical' | 'horizontal'
  gap?: GapValue
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
}

const gapClasses: Record<GapValue, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
  5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12',
  16: 'gap-16', 20: 'gap-20', 24: 'gap-24',
}

const alignClasses = {
  start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch',
} as const

const justifyClasses = {
  start: 'justify-start', center: 'justify-center', end: 'justify-end',
  between: 'justify-between', around: 'justify-around',
} as const

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  function Stack({ className, direction = 'vertical', gap = 4, align, justify, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'horizontal' ? 'flex-row' : 'flex-col',
          gapClasses[gap],
          align && alignClasses[align],
          justify && justifyClasses[justify],
          className,
        )}
        {...props}
      />
    )
  },
)

export const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  function HStack(props, ref) {
    return <Stack ref={ref} direction="horizontal" {...props} />
  },
)

export const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  function VStack(props, ref) {
    return <Stack ref={ref} direction="vertical" {...props} />
  },
)
