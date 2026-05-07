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
