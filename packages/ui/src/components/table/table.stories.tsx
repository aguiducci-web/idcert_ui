import type { Meta, StoryObj } from '@storybook/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import * as React from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './index.js'
import { Badge } from '../badge/index.js'
import { Checkbox } from '../checkbox/index.js'

const meta = {
  title: 'DataDisplay/Table',
  component: Table,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const sampleRows = [
  { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: 250 },
  { id: 'INV002', status: 'Pending', method: 'Bank Transfer', amount: 150 },
  { id: 'INV003', status: 'Paid', method: 'PayPal', amount: 320 },
  { id: 'INV004', status: 'Failed', method: 'Credit Card', amount: 99 },
] as const

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'Paid' ? 'success' :
    status === 'Pending' ? 'warning' :
    status === 'Failed' ? 'destructive' :
    'secondary'
  return <Badge variant={variant}>{status}</Badge>
}

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleRows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell><StatusBadge status={row.status} /></TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell className="text-right">€{row.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>List of recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleRows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell><StatusBadge status={row.status} /></TableCell>
            <TableCell className="text-right">€{row.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const WithFooter: Story = {
  render: () => {
    const total = sampleRows.reduce((sum, row) => sum + row.amount, 0)
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleRows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.id}</TableCell>
              <TableCell><StatusBadge status={row.status} /></TableCell>
              <TableCell className="text-right">€{row.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell className="text-right">€{total.toFixed(2)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
  },
}

function SelectableDemo() {
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === sampleRows.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(sampleRows.map((r) => r.id)))
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={selected.size === sampleRows.length}
              onChange={() => toggleAll()}
              aria-label="Select all"
            />
          </TableHead>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleRows.map((row) => (
          <TableRow
            key={row.id}
            data-state={selected.has(row.id) ? 'selected' : undefined}
          >
            <TableCell>
              <Checkbox
                checked={selected.has(row.id)}
                onChange={() => toggle(row.id)}
                aria-label={`Select ${row.id}`}
              />
            </TableCell>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell><StatusBadge status={row.status} /></TableCell>
            <TableCell className="text-right">€{row.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const Selectable: Story = {
  render: () => <SelectableDemo />,
}

function SortableDemo() {
  const [sortKey, setSortKey] = React.useState<'id' | 'amount'>('id')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc')

  const sorted = React.useMemo(() => {
    return [...sampleRows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = av > bv ? 1 : av < bv ? -1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [sortKey, sortDir])

  function toggleSort(key: 'id' | 'amount') {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function SortIcon({ k }: { k: 'id' | 'amount' }) {
    if (sortKey !== k) return null
    return sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              type="button"
              onClick={() => toggleSort('id')}
              className="flex items-center gap-1"
            >
              Invoice <SortIcon k="id" />
            </button>
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">
            <button
              type="button"
              onClick={() => toggleSort('amount')}
              className="ml-auto flex items-center gap-1"
            >
              Amount <SortIcon k="amount" />
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell><StatusBadge status={row.status} /></TableCell>
            <TableCell className="text-right">€{row.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const Sortable: Story = {
  render: () => <SortableDemo />,
}
