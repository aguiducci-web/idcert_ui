'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/cn.js'

export type PaginationRangeItem = number | 'ellipsis-left' | 'ellipsis-right'

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PaginationRangeItem[] {
  const totalShown = siblingCount * 2 + 5

  if (totalPages <= totalShown) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1)
  const rightSibling = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  const items: PaginationRangeItem[] = []

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + siblingCount * 2
    const left = Array.from({ length: leftCount }, (_, i) => i + 1)
    items.push(...left, 'ellipsis-right', totalPages)
    return items
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + siblingCount * 2
    const right = Array.from(
      { length: rightCount },
      (_, i) => totalPages - rightCount + i + 1,
    )
    items.push(1, 'ellipsis-left', ...right)
    return items
  }

  // both ellipsis
  const middle = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  )
  items.push(1, 'ellipsis-left', ...middle, 'ellipsis-right', totalPages)
  return items
}

export type PaginationProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'onChange'
> & {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
  showPrevNext?: boolean
  'aria-label'?: string
}

const buttonBase =
  'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const inactiveButton = 'text-foreground hover:bg-accent hover:text-accent-foreground'
const activeButton = 'bg-primary text-primary-foreground hover:bg-primary'
const iconButton =
  'inline-flex h-9 items-center justify-center gap-1 rounded-md px-2.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      currentPage,
      totalPages,
      onPageChange,
      siblingCount = 1,
      showPrevNext = true,
      className,
      'aria-label': ariaLabel = 'Pagination',
      ...props
    },
    ref,
  ) {
    const range = getPaginationRange(currentPage, totalPages, siblingCount)
    const isFirst = currentPage <= 1
    const isLast = currentPage >= totalPages

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={cn('mx-auto flex w-full justify-center', className)}
        {...props}
      >
        <ul className="flex flex-row items-center gap-1">
          {showPrevNext && (
            <li>
              <button
                type="button"
                aria-label="Previous page"
                disabled={isFirst}
                onClick={() => onPageChange(currentPage - 1)}
                className={iconButton}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            </li>
          )}
          {range.map((item, index) => {
            if (item === 'ellipsis-left' || item === 'ellipsis-right') {
              return (
                <li
                  key={`${item}-${index}`}
                  role="presentation"
                  className="flex h-9 w-9 items-center justify-center"
                >
                  <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">More pages</span>
                </li>
              )
            }
            const isActive = item === currentPage
            return (
              <li key={item}>
                <button
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  data-active={isActive || undefined}
                  onClick={() => onPageChange(item)}
                  className={cn(buttonBase, isActive ? activeButton : inactiveButton)}
                >
                  {item}
                </button>
              </li>
            )
          })}
          {showPrevNext && (
            <li>
              <button
                type="button"
                aria-label="Next page"
                disabled={isLast}
                onClick={() => onPageChange(currentPage + 1)}
                className={iconButton}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </li>
          )}
        </ul>
      </nav>
    )
  },
)
