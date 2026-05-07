import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

import { CommandMenu } from '@/components/docs/CommandMenu'

const fixtureIndex = [
  {
    slug: 'components/button',
    title: 'Button',
    description: 'Trigger primary actions',
    category: 'primitives',
    headings: [{ id: 'examples', text: 'Examples', level: 2 }],
  },
  {
    slug: 'foundations/colors',
    title: 'Colors',
    description: 'Semantic and primitive color tokens',
    category: 'foundations',
    headings: [],
  },
]

beforeEach(() => {
  pushMock.mockReset()
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(fixtureIndex),
    } as unknown as Response),
  )
})

afterEach(() => {
  cleanup()
})

describe('CommandMenu', () => {
  it('opens with Cmd+K and lists grouped entries', async () => {
    render(<CommandMenu />)
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    await waitFor(() => expect(screen.getByPlaceholderText(/search docs/i)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('Button')).toBeInTheDocument())
    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText(/primitives/i)).toBeInTheDocument()
    expect(screen.getByText(/foundations/i)).toBeInTheDocument()
  })

  it('filters by query and navigates on select', async () => {
    const user = userEvent.setup()
    render(<CommandMenu />)
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    const input = await screen.findByPlaceholderText(/search docs/i)
    await user.type(input, 'butt')
    await user.click(await screen.findByText('Button'))
    expect(pushMock).toHaveBeenCalledWith('/docs/components/button')
  })

  it('navigates to a heading anchor when a heading entry is selected', async () => {
    const user = userEvent.setup()
    render(<CommandMenu />)
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    const input = await screen.findByPlaceholderText(/search docs/i)
    await user.type(input, 'examples')
    await user.click(await screen.findByText(/examples/i))
    expect(pushMock).toHaveBeenCalledWith('/docs/components/button#examples')
  })
})
