'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type BreadcrumbProps = React.HTMLAttributes<HTMLElement>

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb({ className, ...props }, ref) {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn(className)}
        {...props}
      />
    )
  },
)

export type BreadcrumbListProps = React.OlHTMLAttributes<HTMLOListElement>

export const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  function BreadcrumbList({ className, ...props }, ref) {
    return (
      <ol
        ref={ref}
        className={cn(
          'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
          className,
        )}
        {...props}
      />
    )
  },
)

export type BreadcrumbItemProps = React.LiHTMLAttributes<HTMLLIElement>

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ className, ...props }, ref) {
    return (
      <li
        ref={ref}
        className={cn('inline-flex items-center gap-1.5', className)}
        {...props}
      />
    )
  },
)

export type BreadcrumbLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  asChild?: boolean
}

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ className, asChild, ...props }, ref) {
    const Comp = asChild ? Slot : 'a'
    return (
      <Comp
        ref={ref}
        className={cn('transition-colors hover:text-foreground', className)}
        {...props}
      />
    )
  },
)

export type BreadcrumbPageProps = React.HTMLAttributes<HTMLSpanElement>

export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  function BreadcrumbPage({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn('font-normal text-foreground', className)}
        {...props}
      />
    )
  },
)

export type BreadcrumbSeparatorProps = React.LiHTMLAttributes<HTMLLIElement>

export const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  function BreadcrumbSeparator({ className, children, ...props }, ref) {
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('[&>svg]:h-3.5 [&>svg]:w-3.5', className)}
        {...props}
      >
        {children ?? <ChevronRight />}
      </li>
    )
  },
)

export type BreadcrumbEllipsisProps = React.HTMLAttributes<HTMLSpanElement>

export const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  function BreadcrumbEllipsis({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('flex h-9 w-9 items-center justify-center', className)}
        {...props}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More</span>
      </span>
    )
  },
)
