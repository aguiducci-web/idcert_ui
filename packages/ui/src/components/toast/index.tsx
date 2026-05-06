'use client'

import * as React from 'react'
import { Toast as BaseToast } from '@base-ui/react/toast'

const useBaseToastManager = BaseToast.useToastManager
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

// ---- Public types -----------------------------------------------------------

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export type ToastOptions = {
  title: string
  description?: string
  type?: ToastType
  timeout?: number
  action?: { label: string; onClick: () => void }
}

type ToastData = {
  type?: ToastType
  actionLabel?: string
}

type ManagedToast = ReturnType<typeof useBaseToastManager<ToastData>>['toasts'][number]

// ---- Provider ---------------------------------------------------------------

export type ToastProviderProps = {
  timeout?: number
  limit?: number
  children?: React.ReactNode
}

export function ToastProvider({
  timeout = 5000,
  limit = 3,
  children,
}: ToastProviderProps): React.JSX.Element {
  return (
    <BaseToast.Provider timeout={timeout} limit={limit}>
      {children}
    </BaseToast.Provider>
  )
}

// ---- useToast hook ----------------------------------------------------------

export type UseToastReturn = {
  add: (options: ToastOptions) => string
  update: (id: string, options: Partial<ToastOptions>) => void
  close: (id: string) => void
}

function buildBaseOptions(options: Partial<ToastOptions>) {
  const data: ToastData = {
    type: options.type,
    actionLabel: options.action?.label,
  }
  return {
    title: options.title,
    description: options.description,
    type: options.type,
    timeout: options.timeout,
    actionProps: options.action ? { onClick: options.action.onClick } : undefined,
    data,
  }
}

export function useToast(): UseToastReturn {
  let manager: ReturnType<typeof useBaseToastManager<ToastData>>
  try {
    manager = useBaseToastManager<ToastData>()
  } catch {
    throw new Error('useToast must be used within a <ToastProvider>.')
  }

  return React.useMemo(
    () => ({
      add: (options) => manager.add(buildBaseOptions(options)),
      update: (id, options) => manager.update(id, buildBaseOptions(options)),
      close: (id) => manager.close(id),
    }),
    [manager],
  )
}

// ---- Sub-parts --------------------------------------------------------------

const toastRootVariants = cva(
  'pointer-events-auto relative flex w-full max-w-sm gap-3 rounded-md border bg-background p-4 pr-10 shadow-md transition-transform duration-200 ease-in-out',
  {
    variants: {
      type: {
        info: 'border-border [&_[data-icon]]:text-foreground',
        success: 'border-green-500 [&_[data-icon]]:text-green-600',
        warning: 'border-yellow-500 [&_[data-icon]]:text-yellow-600',
        error: 'border-destructive [&_[data-icon]]:text-destructive',
      },
    },
    defaultVariants: { type: 'info' },
  },
)

export type ToastProps = React.ComponentProps<typeof BaseToast.Root> &
  VariantProps<typeof toastRootVariants>

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  function Toast({ className, type, ...props }, ref) {
    return (
      <BaseToast.Root
        ref={ref}
        className={cn(toastRootVariants({ type }), className as string | undefined)}
        {...props}
      />
    )
  },
)

export type ToastTitleProps = React.ComponentProps<typeof BaseToast.Title>

export const ToastTitle = React.forwardRef<HTMLHeadingElement, ToastTitleProps>(
  function ToastTitle({ className, ...props }, ref) {
    return (
      <BaseToast.Title
        ref={ref}
        className={cn('text-sm font-semibold leading-none', className as string | undefined)}
        {...props}
      />
    )
  },
)

export type ToastDescriptionProps = React.ComponentProps<typeof BaseToast.Description>

export const ToastDescription = React.forwardRef<HTMLParagraphElement, ToastDescriptionProps>(
  function ToastDescription({ className, ...props }, ref) {
    return (
      <BaseToast.Description
        ref={ref}
        className={cn('text-sm text-muted-foreground', className as string | undefined)}
        {...props}
      />
    )
  },
)

export type ToastActionProps = React.ComponentProps<typeof BaseToast.Action>

export const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  function ToastAction({ className, ...props }, ref) {
    return (
      <BaseToast.Action
        ref={ref}
        className={cn(
          'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring',
          className as string | undefined,
        )}
        {...props}
      />
    )
  },
)

export type ToastCloseProps = React.ComponentProps<typeof BaseToast.Close>

export const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  function ToastClose({ className, children, ...props }, ref) {
    return (
      <BaseToast.Close
        ref={ref}
        aria-label="Close"
        // Base UI Toast.Close defaults `aria-hidden` to true while the toast is collapsed.
        // We always render the close affordance so that assistive tech can act on it
        // without first triggering hover/focus on the viewport.
        aria-hidden={undefined}
        className={cn(
          'absolute right-2 top-2 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring',
          className as string | undefined,
        )}
        {...props}
      >
        {children ?? <X aria-hidden="true" className="h-4 w-4" />}
      </BaseToast.Close>
    )
  },
)

// ---- Toaster (Viewport + default template) ---------------------------------

const toasterVariants = cva('fixed z-50 flex flex-col gap-2 p-4 outline-none', {
  variants: {
    position: {
      'top-right': 'top-0 right-0 items-end',
      'top-left': 'top-0 left-0 items-start',
      'bottom-right': 'bottom-0 right-0 items-end',
      'bottom-left': 'bottom-0 left-0 items-start',
      'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
      'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 items-center',
    },
  },
  defaultVariants: { position: 'top-right' },
})

export type ToasterProps = React.ComponentProps<typeof BaseToast.Viewport> &
  VariantProps<typeof toasterVariants>

const ICONS: Record<ToastType, React.ComponentType<{ className?: string; 'data-icon'?: boolean | string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

function ToasterTemplate({ toast }: { toast: ManagedToast }): React.JSX.Element {
  const data = (toast.data ?? {}) as ToastData
  const type: ToastType = data.type ?? 'info'
  const Icon = ICONS[type]
  const actionLabel = data.actionLabel

  return (
    <Toast toast={toast} type={type}>
      <Icon data-icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex flex-1 flex-col gap-1">
        {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
        {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
      </div>
      {actionLabel && <ToastAction>{actionLabel}</ToastAction>}
      <ToastClose />
    </Toast>
  )
}

export const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(
  function Toaster({ className, position, ...props }, ref) {
    const manager = useBaseToastManager<ToastData>()
    return (
      <BaseToast.Portal>
        <BaseToast.Viewport
          ref={ref}
          className={cn(toasterVariants({ position }), className as string | undefined)}
          {...props}
        >
          {manager.toasts.map((toast) => (
            <ToasterTemplate key={toast.id} toast={toast} />
          ))}
        </BaseToast.Viewport>
      </BaseToast.Portal>
    )
  },
)
