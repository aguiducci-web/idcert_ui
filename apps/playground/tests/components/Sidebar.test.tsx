import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/docs/Sidebar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/docs/components/button',
}))

describe('<Sidebar>', () => {
  it('renders all sections and groups', () => {
    render(<Sidebar />)
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Foundations')).toBeInTheDocument()
    expect(screen.getByText('Components')).toBeInTheDocument()
    expect(screen.getByText('Primitives')).toBeInTheDocument()
  })

  it('marks the active link', () => {
    render(<Sidebar />)
    const active = screen.getByRole('link', { name: 'Button' })
    expect(active).toHaveAttribute('aria-current', 'page')
  })
})
