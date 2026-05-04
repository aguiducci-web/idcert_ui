import * as React from 'react'
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11',
  {
    variants: {
      variant: {
        default:     'bg-background text-foreground border-border',
        info:        'bg-background text-foreground border-primary [&>svg]:text-primary',
        success:     'bg-background text-foreground border-green-500 [&>svg]:text-green-600',
        warning:     'bg-background text-foreground border-yellow-500 [&>svg]:text-yellow-600',
        destructive: 'bg-background text-destructive border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const defaultIcons: Record<NonNullable<VariantProps<typeof alertVariants>['variant']>, React.ReactNode | null> = {
  default: null,
  info:        <Info aria-hidden="true" />,
  success:     <CheckCircle2 aria-hidden="true" />,
  warning:     <AlertTriangle aria-hidden="true" />,
  destructive: <XCircle aria-hidden="true" />,
}

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    icon?: React.ReactNode | false
  }

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert({ className, variant = 'default', icon, children, ...props }, ref) {
    const resolvedIcon =
      icon === false ? null : icon !== undefined ? icon : defaultIcons[variant ?? 'default']

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {resolvedIcon}
        {children}
      </div>
    )
  },
)

export const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function AlertTitle({ className, ...props }, ref) {
    return (
      <h5
        ref={ref}
        className={cn('mb-1 font-medium leading-none tracking-tight', className)}
        {...props}
      />
    )
  },
)

export const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AlertDescription({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('text-sm [&_p]:leading-relaxed', className)}
        {...props}
      />
    )
  },
)

export { alertVariants }
