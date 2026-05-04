import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './index.js'

function Sample({ open, onOpenChange }: { open?: boolean; onOpenChange?: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        <p>Body</p>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog', () => {
  test('trigger renders, content hidden initially', () => {
    render(<Sample />)
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('opens on trigger click', async () => {
    const user = userEvent.setup()
    render(<Sample />)
    await user.click(screen.getByText('Open'))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  test('closes on ESC', async () => {
    const user = userEvent.setup()
    render(<Sample />)
    await user.click(screen.getByText('Open'))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  test('closes when DialogClose clicked', async () => {
    const user = userEvent.setup()
    render(<Sample />)
    await user.click(screen.getByText('Open'))
    await screen.findByRole('dialog')
    await user.click(screen.getByText('Close'))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  test('controlled open prop renders content', async () => {
    render(<Sample open />)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  test('controlled onOpenChange fires on close', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Sample open onOpenChange={onOpenChange} />)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false, expect.any(Object))
    })
  })

  test('DialogTitle renders inside dialog with proper tag', async () => {
    render(<Sample open />)
    await screen.findByRole('dialog')
    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H2')
  })

  test('DialogContent forwards ref', async () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <Dialog open>
        <DialogContent ref={ref}>
          <DialogTitle>X</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  test('X close button is rendered by default and closes the dialog', async () => {
    const user = userEvent.setup()
    render(<Sample />)
    await user.click(screen.getByText('Open'))
    await screen.findByRole('dialog')
    const closeBtn = screen.getByLabelText('Close')
    await user.click(closeBtn)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  test('showCloseButton={false} hides the X close button', async () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    await screen.findByRole('dialog')
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument()
  })
})
