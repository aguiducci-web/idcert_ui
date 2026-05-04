import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './index.js'

function Sample({ onAction, onCancel, open }: { onAction?: () => void; onCancel?: () => void; open?: boolean }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

describe('AlertDialog', () => {
  test('opens on trigger click', async () => {
    const user = userEvent.setup()
    render(<Sample />)
    await user.click(screen.getByText('Delete'))
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
  })

  test('action button triggers callback', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<Sample onAction={onAction} open />)
    await screen.findByRole('alertdialog')
    await user.click(screen.getByText('Confirm'))
    expect(onAction).toHaveBeenCalled()
  })

  test('cancel button triggers callback', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<Sample onCancel={onCancel} open />)
    await screen.findByRole('alertdialog')
    await user.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  test('closes on ESC', async () => {
    const user = userEvent.setup()
    render(<Sample />)
    await user.click(screen.getByText('Delete'))
    await screen.findByRole('alertdialog')
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })

  test('AlertDialogTitle renders as h2', async () => {
    render(<Sample open />)
    await screen.findByRole('alertdialog')
    expect(screen.getByText('Are you sure?').tagName).toBe('H2')
  })

  test('AlertDialogAction has destructive styles by default', async () => {
    render(<Sample open />)
    await screen.findByRole('alertdialog')
    const action = screen.getByText('Confirm')
    // destructive button uses bg-destructive class via Button variant="destructive"
    expect(action).toHaveClass('bg-destructive')
  })

  test('AlertDialogCancel has outline styles by default', async () => {
    render(<Sample open />)
    await screen.findByRole('alertdialog')
    const cancel = screen.getByText('Cancel')
    // outline button uses border class via Button variant="outline"
    expect(cancel).toHaveClass('border')
  })
})
