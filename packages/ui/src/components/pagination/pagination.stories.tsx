import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Pagination } from './index.js'

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: () => {},
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

function ControlledDemo({ totalPages = 20, siblingCount = 1 }: { totalPages?: number; siblingCount?: number }) {
  const [page, setPage] = React.useState(5)
  return (
    <div className="space-y-2">
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        siblingCount={siblingCount}
      />
      <div className="text-center text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => <ControlledDemo />,
}

export const Short: Story = {
  render: () => <ControlledDemo totalPages={5} />,
}

export const Long: Story = {
  render: () => <ControlledDemo totalPages={100} />,
}

export const SiblingCountZero: Story = {
  render: () => <ControlledDemo totalPages={50} siblingCount={0} />,
}

function NoPrevNextDemo() {
  const [page, setPage] = React.useState(1)
  return (
    <Pagination
      currentPage={page}
      totalPages={5}
      onPageChange={setPage}
      showPrevNext={false}
    />
  )
}

export const NoPrevNext: Story = {
  render: () => <NoPrevNextDemo />,
}
