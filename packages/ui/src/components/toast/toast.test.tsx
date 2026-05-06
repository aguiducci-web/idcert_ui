import { render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ToastProvider, Toaster, useToast } from './index.js'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider timeout={5000} limit={3}>
      {children}
      <Toaster position="top-right" data-testid="toaster" />
    </ToastProvider>
  )
}

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastProvider', () => {
  test('renders children', () => {
    render(
      <ToastProvider>
        <span>app content</span>
      </ToastProvider>,
    )
    expect(screen.getByText('app content')).toBeInTheDocument()
  })
})

describe('useToast', () => {
  test('throws when used outside ToastProvider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useToast())).toThrow(/ToastProvider/i)
    errorSpy.mockRestore()
  })

  test('returns add/update/close API inside Provider', () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ({ children }) => <Wrapper>{children}</Wrapper>,
    })
    expect(typeof result.current.add).toBe('function')
    expect(typeof result.current.update).toBe('function')
    expect(typeof result.current.close).toBe('function')
  })
})

describe('Toaster default template', () => {
  test('toast.add inserts a toast that renders title + description', async () => {
    function App() {
      const toast = useToast()
      return (
        <button
          type="button"
          onClick={() =>
            toast.add({
              type: 'info',
              title: 'Hello',
              description: 'World',
            })
          }
        >
          fire
        </button>
      )
    }
    const user = userEvent.setup()
    render(
      <Wrapper>
        <App />
      </Wrapper>,
    )
    await user.click(screen.getByRole('button', { name: 'fire' }))
    expect(await screen.findByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()
  })

  test.each([
    ['success', 'lucide-circle-check'],
    ['error', 'lucide-circle-x'],
    ['warning', 'lucide-triangle-alert'],
    ['info', 'lucide-info'],
  ] as const)(
    'type=%s renders lucide icon class containing identifier %s',
    async (type, iconClass) => {
      function App() {
        const toast = useToast()
        return (
          <button type="button" onClick={() => toast.add({ type, title: type })}>
            fire
          </button>
        )
      }
      const user = userEvent.setup()
      render(
        <Wrapper>
          <App />
        </Wrapper>,
      )
      await user.click(screen.getByRole('button', { name: 'fire' }))
      const titleEl = await screen.findByText(type)
      // Base UI Toast.Root renders a `<div role="dialog">` (or "alertdialog" for high priority).
      const root = titleEl.closest('[role="dialog"], [role="alertdialog"]')
      expect(root).not.toBeNull()
      const svg = root!.querySelector(`svg[class*="${iconClass}"]`)
      expect(svg).not.toBeNull()
    },
  )

  test('action button renders and click fires onClick', async () => {
    const onAction = vi.fn()
    function App() {
      const toast = useToast()
      return (
        <button
          type="button"
          onClick={() =>
            toast.add({
              title: 'Saved',
              action: { label: 'Undo', onClick: onAction },
            })
          }
        >
          fire
        </button>
      )
    }
    const user = userEvent.setup()
    render(
      <Wrapper>
        <App />
      </Wrapper>,
    )
    await user.click(screen.getByRole('button', { name: 'fire' }))
    const undo = await screen.findByRole('button', { name: 'Undo' })
    await user.click(undo)
    expect(onAction).toHaveBeenCalled()
  })

  test('close button dismisses the toast', async () => {
    function App() {
      const toast = useToast()
      return (
        <button type="button" onClick={() => toast.add({ title: 'Closeable' })}>
          fire
        </button>
      )
    }
    const user = userEvent.setup()
    render(
      <Wrapper>
        <App />
      </Wrapper>,
    )
    await user.click(screen.getByRole('button', { name: 'fire' }))
    expect(await screen.findByText('Closeable')).toBeInTheDocument()
    const closeBtn = screen.getByRole('button', { name: /close/i })
    await user.click(closeBtn)
    await waitFor(() => {
      expect(screen.queryByText('Closeable')).not.toBeInTheDocument()
    })
  })

  test('timeout auto-dismisses the toast after Provider default', async () => {
    // Use a short per-toast `timeout` so the test can dismiss with real timers quickly.
    function App() {
      const toast = useToast()
      return (
        <button
          type="button"
          onClick={() => toast.add({ title: 'Auto', timeout: 50 })}
        >
          fire
        </button>
      )
    }
    const user = userEvent.setup()
    render(
      <Wrapper>
        <App />
      </Wrapper>,
    )
    await user.click(screen.getByRole('button', { name: 'fire' }))
    expect(await screen.findByText('Auto')).toBeInTheDocument()
    await waitFor(
      () => {
        expect(screen.queryByText('Auto')).not.toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  })

  test.each([
    ['top-right', ['top-0', 'right-0', 'items-end']],
    ['top-left', ['top-0', 'left-0', 'items-start']],
    ['bottom-right', ['bottom-0', 'right-0', 'items-end']],
    ['bottom-left', ['bottom-0', 'left-0', 'items-start']],
  ] as const)(
    'Toaster position=%s applies expected fixed classes',
    (position, expectedClasses) => {
      render(
        <ToastProvider>
          <Toaster position={position} data-testid="t" />
        </ToastProvider>,
      )
      const viewport = screen.getByTestId('t')
      for (const cls of expectedClasses) {
        expect(viewport).toHaveClass(cls)
      }
    },
  )
})
