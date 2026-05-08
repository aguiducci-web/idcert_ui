import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-(--breakpoint-sm)',
      md: 'max-w-(--breakpoint-md)',
      lg: 'max-w-(--breakpoint-lg)',
      xl: 'max-w-(--breakpoint-xl)',
      '2xl': 'max-w-(--breakpoint-2xl)',
      full: 'max-w-full',
    },
  },
  defaultVariants: { size: 'xl' },
})

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants>

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ className, size, ...props }, ref) {
    return <div ref={ref} className={cn(containerVariants({ size, className }))} {...props} />
  },
)

export { containerVariants }
