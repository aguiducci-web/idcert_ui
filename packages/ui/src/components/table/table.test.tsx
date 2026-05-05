import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
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

describe('Table', () => {
  test('Table renders <table> inside scrollable wrapper', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const table = container.querySelector('table')
    expect(table).not.toBeNull()
    const wrapper = table?.parentElement
    expect(wrapper?.tagName).toBe('DIV')
    expect(wrapper).toHaveClass('overflow-auto')
  })

  test('TableHeader renders <thead>', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    )
    expect(container.querySelector('thead')).not.toBeNull()
  })

  test('TableBody renders <tbody>', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(container.querySelector('tbody')).not.toBeNull()
  })

  test('TableFooter renders <tfoot>', () => {
    const { container } = render(
      <Table>
        <TableFooter>
          <TableRow>
            <TableCell>total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    )
    expect(container.querySelector('tfoot')).not.toBeNull()
  })

  test('TableRow renders <tr>', () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-testid="row">
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByTestId('row').tagName).toBe('TR')
  })

  test('TableRow with data-state="selected" applies selected styling class', () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-state="selected" data-testid="row">
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const row = screen.getByTestId('row')
    expect(row).toHaveAttribute('data-state', 'selected')
    expect(row.className).toMatch(/data-\[state=selected\]:bg-muted/)
  })

  test('TableHead renders <th> with muted-foreground class', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="head">Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    )
    const head = screen.getByTestId('head')
    expect(head.tagName).toBe('TH')
    expect(head).toHaveClass('text-muted-foreground')
  })

  test('TableCell renders <td>', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell data-testid="cell">x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByTestId('cell').tagName).toBe('TD')
  })

  test('TableCaption renders <caption>', () => {
    const { container } = render(
      <Table>
        <TableCaption>List of items</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const caption = container.querySelector('caption')
    expect(caption).not.toBeNull()
    expect(caption).toHaveTextContent('List of items')
  })

  test('forwards ref to inner <table> element (not the wrapper)', () => {
    const ref = React.createRef<HTMLTableElement>()
    render(
      <Table ref={ref}>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('TABLE')
  })
})
