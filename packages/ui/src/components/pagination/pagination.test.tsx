import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import { Pagination, getPaginationRange } from './index.js'

describe('getPaginationRange', () => {
  test('returns all pages when totalPages <= 7 (no ellipsis)', () => {
    expect(getPaginationRange(3, 5, 1)).toEqual([1, 2, 3, 4, 5])
    expect(getPaginationRange(1, 7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  test('currentPage near start: no left ellipsis', () => {
    expect(getPaginationRange(2, 20, 1)).toEqual([1, 2, 3, 4, 5, 'ellipsis-right', 20])
  })

  test('currentPage near end: no right ellipsis', () => {
    expect(getPaginationRange(19, 20, 1)).toEqual([1, 'ellipsis-left', 16, 17, 18, 19, 20])
  })

  test('middle currentPage: both ellipsis', () => {
    expect(getPaginationRange(10, 20, 1)).toEqual([
      1,
      'ellipsis-left',
      9,
      10,
      11,
      'ellipsis-right',
      20,
    ])
  })

  test('siblingCount=0 returns minimal range', () => {
    expect(getPaginationRange(10, 20, 0)).toEqual([
      1,
      'ellipsis-left',
      10,
      'ellipsis-right',
      20,
    ])
  })
})

describe('Pagination', () => {
  test('renders prev, next, and page number buttons', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
  })

  test('clicking a page number fires onPageChange with that page', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '3' }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  test('clicking prev fires onPageChange with currentPage-1', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /previous page/i }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  test('clicking next fires onPageChange with currentPage+1', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /next page/i }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  test('prev disabled when currentPage=1', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
  })

  test('next disabled when currentPage=totalPages', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
  })

  test('current page button has data-active="true"', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('data-active', 'true')
  })

  test('ellipsis renders inside the pagination', () => {
    render(<Pagination currentPage={10} totalPages={20} onPageChange={() => {}} />)
    const items = screen.getAllByRole('presentation')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  test('showPrevNext={false} hides prev/next buttons', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={() => {}}
        showPrevNext={false}
      />,
    )
    expect(screen.queryByRole('button', { name: /previous page/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next page/i })).not.toBeInTheDocument()
  })

  test('aria-label defaults to "Pagination" on the nav', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />,
    )
    const nav = container.querySelector('nav')
    expect(nav).toHaveAttribute('aria-label', 'Pagination')
  })

  test('forwards ref to the nav element', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <Pagination
        ref={ref}
        currentPage={1}
        totalPages={3}
        onPageChange={() => {}}
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.tagName).toBe('NAV')
  })
})
