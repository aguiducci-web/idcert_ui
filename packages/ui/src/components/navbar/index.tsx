'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Menu } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'

const navbarVariants = cva(
  'flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6',
  {
    variants: {
      position: {
        static: '',
        sticky: 'sticky top-0 z-40',
        fixed: 'fixed inset-x-0 top-0 z-40',
      },
    },
    defaultVariants: { position: 'static' },
  },
)

export type NavbarProps = React.HTMLAttributes<HTMLElement> & VariantProps<typeof navbarVariants>

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  function Navbar({ className, position, ...props }, ref) {
    return (
      <nav
        ref={ref}
        className={cn(navbarVariants({ position }), className)}
        {...props}
      />
    )
  },
)

export type NavbarBrandProps = React.HTMLAttributes<HTMLDivElement>

export const NavbarBrand = React.forwardRef<HTMLDivElement, NavbarBrandProps>(
  function NavbarBrand({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2 mr-4', className)}
        {...props}
      />
    )
  },
)

export type NavbarContentProps = React.HTMLAttributes<HTMLDivElement>

export const NavbarContent = React.forwardRef<HTMLDivElement, NavbarContentProps>(
  function NavbarContent({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('hidden md:flex flex-1 items-center gap-4', className)}
        {...props}
      />
    )
  },
)

export type NavbarItemProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean
  asChild?: boolean
}

export const NavbarItem = React.forwardRef<HTMLAnchorElement, NavbarItemProps>(
  function NavbarItem({ className, active, asChild, ...props }, ref) {
    const Comp = asChild ? Slot : 'a'
    return (
      <Comp
        ref={ref}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'text-sm font-medium transition-colors hover:text-foreground',
          active ? 'text-foreground' : 'text-muted-foreground',
          className,
        )}
        {...props}
      />
    )
  },
)

export type NavbarActionsProps = React.HTMLAttributes<HTMLDivElement>

export const NavbarActions = React.forwardRef<HTMLDivElement, NavbarActionsProps>(
  function NavbarActions({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('ml-auto flex items-center gap-2', className)}
        {...props}
      />
    )
  },
)

export type NavbarMobileToggleProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const NavbarMobileToggle = React.forwardRef<HTMLButtonElement, NavbarMobileToggleProps>(
  function NavbarMobileToggle({ className, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
        {...props}
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>
    )
  },
)
