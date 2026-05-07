'use client'
import * as React from 'react'
import { Pagination } from './index.js'

export const Default = () => {
  const [page, setPage] = React.useState(5)
  return (
    <div className="space-y-2">
      <Pagination currentPage={page} totalPages={20} onPageChange={setPage} />
      <div className="text-center text-sm text-muted-foreground">
        Page {page} of 20
      </div>
    </div>
  )
}

export const Truncated = () => {
  const [page, setPage] = React.useState(50)
  return (
    <div className="space-y-2">
      <Pagination currentPage={page} totalPages={100} onPageChange={setPage} />
      <div className="text-center text-sm text-muted-foreground">
        Page {page} of 100
      </div>
    </div>
  )
}

export const Controlled = () => {
  const [page, setPage] = React.useState(1)
  const totalPages = 8
  return (
    <div className="space-y-3">
      <div
        aria-live="polite"
        className="text-center text-sm text-muted-foreground"
      >
        Showing page {page} of {totalPages}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}

export const Compact = () => {
  const [page, setPage] = React.useState(3)
  return (
    <Pagination
      currentPage={page}
      totalPages={10}
      onPageChange={setPage}
      siblingCount={0}
    />
  )
}

export const Disabled = () => {
  const [page, setPage] = React.useState(1)
  return (
    <div className="space-y-3">
      <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
      <div className="text-center text-sm text-muted-foreground">
        Previous is disabled at page 1; Next is disabled at the last page.
      </div>
    </div>
  )
}
