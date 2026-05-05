'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Menu } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'
import {
  Sheet,
  SheetContent,
} from '../sheet/index.js'

// Constants
const SIDEBAR_COOKIE_NAME = 'sidebar:state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

// useIsMobile hook
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const query = `(max-width: ${breakpoint - 1}px)`
    const mql = window.matchMedia(query)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpoint])

  return isMobile
}

// SidebarContext + useSidebar
type SidebarContextValue = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (next: boolean) => void
  openMobile: boolean
  setOpenMobile: (next: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>.')
  return ctx
}

// SidebarProvider
export type SidebarProviderProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (next: boolean) => void
  enableKeyboardShortcut?: boolean
  style?: React.CSSProperties
}

export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  function SidebarProvider(
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      enableKeyboardShortcut = true,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)
    const [internalOpen, setInternalOpen] = React.useState<boolean>(defaultOpen)

    const isControlled = openProp !== undefined
    const open = isControlled ? (openProp as boolean) : internalOpen

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalOpen(next)
        setOpenProp?.(next)
        if (typeof document !== 'undefined') {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [isControlled, setOpenProp],
    )

    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((prev) => !prev)
      } else {
        setOpen(!open)
      }
    }, [isMobile, open, setOpen])

    React.useEffect(() => {
      if (!enableKeyboardShortcut) return undefined
      const handler = (event: KeyboardEvent) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
    }, [enableKeyboardShortcut, toggleSidebar])

    const state: 'expanded' | 'collapsed' = open ? 'expanded' : 'collapsed'

    const contextValue = React.useMemo<SidebarContextValue>(
      () => ({
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar],
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          ref={ref}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn('group/sidebar-wrapper flex min-h-svh w-full', className)}
          data-state={state}
          data-mobile={isMobile ? 'true' : undefined}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  },
)

// Sidebar
export type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  function Sidebar(
    { side = 'left', variant = 'sidebar', collapsible = 'offcanvas', className, children, ...props },
    ref,
  ) {
    const { isMobile, openMobile, setOpenMobile, state } = useSidebar()

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side={side}
            className="w-[--sidebar-width] p-0"
            showCloseButton={false}
            data-sidebar="sidebar"
            data-mobile="true"
          >
            <div className="flex h-full w-full flex-col bg-background">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    const widthClass =
      collapsible === 'icon' && state === 'collapsed'
        ? 'w-[--sidebar-width-icon]'
        : 'w-[--sidebar-width]'

    const collapsedHidden = collapsible === 'offcanvas' && state === 'collapsed'

    return (
      <aside
        ref={ref}
        data-sidebar="sidebar"
        data-side={side}
        data-state={state}
        data-collapsible={collapsible}
        data-variant={variant}
        className={cn(
          'group/sidebar relative flex h-svh shrink-0 flex-col bg-background text-foreground transition-[width] duration-200 ease-linear',
          side === 'left' ? 'border-r border-border' : 'border-l border-border',
          widthClass,
          collapsedHidden && 'w-0 overflow-hidden border-0',
          variant === 'inset' && 'm-2 rounded-lg border bg-muted',
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    )
  },
)

// SidebarHeader / Content / Footer
export type SidebarHeaderProps = React.HTMLAttributes<HTMLDivElement>

export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  function SidebarHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex flex-col gap-2 p-2', className)} {...props} />
  },
)

export type SidebarContentProps = React.HTMLAttributes<HTMLDivElement>

export const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  function SidebarContent({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-1 flex-col gap-2 overflow-auto p-2', className)}
        {...props}
      />
    )
  },
)

export type SidebarFooterProps = React.HTMLAttributes<HTMLDivElement>

export const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  function SidebarFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex flex-col gap-2 p-2', className)} {...props} />
  },
)

// SidebarGroup / GroupLabel
export type SidebarGroupProps = React.HTMLAttributes<HTMLDivElement>

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  function SidebarGroup({ className, ...props }, ref) {
    return <div ref={ref} className={cn('flex flex-col gap-1 p-2', className)} {...props} />
  },
)

export type SidebarGroupLabelProps = React.HTMLAttributes<HTMLDivElement>

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  function SidebarGroupLabel({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider',
          className,
        )}
        {...props}
      />
    )
  },
)

// SidebarMenu / MenuItem / MenuButton
export type SidebarMenuProps = React.HTMLAttributes<HTMLUListElement>

export const SidebarMenu = React.forwardRef<HTMLUListElement, SidebarMenuProps>(
  function SidebarMenu({ className, ...props }, ref) {
    return <ul ref={ref} className={cn('flex flex-col gap-1', className)} {...props} />
  },
)

export type SidebarMenuItemProps = React.LiHTMLAttributes<HTMLLIElement>

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  function SidebarMenuItem({ className, ...props }, ref) {
    return <li ref={ref} className={cn('relative', className)} {...props} />
  },
)

const sidebarMenuButtonVariants = cva(
  'flex w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm outline-none ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      size: {
        default: 'h-8',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-base',
      },
      active: {
        true: 'bg-accent text-accent-foreground font-medium',
        false: 'text-foreground',
      },
    },
    defaultVariants: { size: 'default', active: false },
  },
)

export type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    asChild?: boolean
  }

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  function SidebarMenuButton({ className, size, active, asChild, type = 'button', ...props }, ref) {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref as never}
        type={asChild ? undefined : type}
        data-active={active || undefined}
        className={cn(sidebarMenuButtonVariants({ size, active }), className)}
        {...props}
      />
    )
  },
)

// SidebarTrigger
export type SidebarTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger({ className, onClick, type = 'button', ...props }, ref) {
    const { toggleSidebar } = useSidebar()
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
        onClick={(event) => {
          toggleSidebar()
          onClick?.(event)
        }}
        {...props}
      >
        <Menu aria-hidden="true" className="h-4 w-4" />
        <span className="sr-only">Toggle sidebar</span>
      </button>
    )
  },
)

// SidebarRail
export type SidebarRailProps = React.HTMLAttributes<HTMLButtonElement>

export const SidebarRail = React.forwardRef<HTMLButtonElement, SidebarRailProps>(
  function SidebarRail({ className, ...props }, ref) {
    const { toggleSidebar } = useSidebar()
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
        className={cn(
          'hidden md:block absolute inset-y-0 z-20 w-1 cursor-pointer transition-colors hover:bg-accent',
          'right-0 group-data-[side=right]/sidebar:left-0 group-data-[side=right]/sidebar:right-auto',
          className,
        )}
        {...props}
      />
    )
  },
)

// SidebarInset
export type SidebarInsetProps = React.HTMLAttributes<HTMLElement>

export const SidebarInset = React.forwardRef<HTMLElement, SidebarInsetProps>(
  function SidebarInset({ className, ...props }, ref) {
    return (
      <main
        ref={ref}
        className={cn(
          'relative flex min-h-svh flex-1 flex-col bg-background',
          className,
        )}
        {...props}
      />
    )
  },
)
