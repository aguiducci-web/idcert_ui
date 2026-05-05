import * as React from 'react'
import { cn } from '../../lib/cn.js'

export type TableProps = React.TableHTMLAttributes<HTMLTableElement>

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  function Table({ className, ...props }, ref) {
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        />
      </div>
    )
  },
)

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader({ className, ...props }, ref) {
    return (
      <thead
        ref={ref}
        className={cn('[&_tr]:border-b', className)}
        {...props}
      />
    )
  },
)

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody({ className, ...props }, ref) {
    return (
      <tbody
        ref={ref}
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
      />
    )
  },
)

export type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  function TableFooter({ className, ...props }, ref) {
    return (
      <tfoot
        ref={ref}
        className={cn(
          'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
          className,
        )}
        {...props}
      />
    )
  },
)

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ className, ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
          className,
        )}
        {...props}
      />
    )
  },
)

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  function TableHead({ className, ...props }, ref) {
    return (
      <th
        ref={ref}
        className={cn(
          'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
          className,
        )}
        {...props}
      />
    )
  },
)

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ className, ...props }, ref) {
    return (
      <td
        ref={ref}
        className={cn(
          'p-2 align-middle [&:has([role=checkbox])]:pr-0',
          className,
        )}
        {...props}
      />
    )
  },
)

export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption({ className, ...props }, ref) {
    return (
      <caption
        ref={ref}
        className={cn('mt-4 text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  },
)
