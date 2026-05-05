import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from './index.js'

function renderSheet(props?: { side?: 'top' | 'right' | 'bottom' | 'left'; defaultOpen?: boolean }) {
  return render(
    <Sheet defaultOpen={props?.defaultOpen}>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side={props?.side ?? 'right'} data-testid="content">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Adjust filters.</SheetDescription>
        </SheetHeader>
        <div>body</div>
        <SheetFooter>
          <SheetClose>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>,
  )
}

describe('Sheet', () => {
  test('renders trigger', () => {
    renderSheet()
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  test('opens on trigger click', async () => {
    const user = userEvent.setup()
    renderSheet()
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })
  })

  test('closes on ESC key', async () => {
    const user = userEvent.setup()
    renderSheet({ defaultOpen: true })
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Filters')).not.toBeInTheDocument()
    })
  })

  test('closes on backdrop click', async () => {
    const user = userEvent.setup()
    const { container } = renderSheet({ defaultOpen: true })
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })
    const backdrop = container.ownerDocument.querySelector('[data-base-ui-portal] [role="presentation"]') ||
      container.ownerDocument.querySelector('.fixed.inset-0')
    expect(backdrop).not.toBeNull()
    if (backdrop) {
      await user.click(backdrop as Element)
      await waitFor(() => {
        expect(screen.queryByText('Filters')).not.toBeInTheDocument()
      })
    }
  })

  test('side="right" applies right-anchored classes (default)', () => {
    renderSheet({ side: 'right', defaultOpen: true })
    const content = screen.getByTestId('content')
    expect(content.className).toMatch(/inset-y-0/)
    expect(content.className).toMatch(/right-0/)
  })

  test('side="left" applies left-anchored classes', () => {
    renderSheet({ side: 'left', defaultOpen: true })
    const content = screen.getByTestId('content')
    expect(content.className).toMatch(/left-0/)
  })

  test('side="top" applies top-anchored classes', () => {
    renderSheet({ side: 'top', defaultOpen: true })
    const content = screen.getByTestId('content')
    expect(content.className).toMatch(/top-0/)
    expect(content.className).toMatch(/inset-x-0/)
  })

  test('side="bottom" applies bottom-anchored classes', () => {
    renderSheet({ side: 'bottom', defaultOpen: true })
    const content = screen.getByTestId('content')
    expect(content.className).toMatch(/bottom-0/)
  })

  test('forwards ref to SheetContent', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent ref={ref}>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Desc</SheetDescription>
        </SheetContent>
      </Sheet>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
