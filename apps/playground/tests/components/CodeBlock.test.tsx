import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeBlock } from '@/components/docs/CodeBlock'

describe('<CodeBlock>', () => {
  it('renders code text', () => {
    render(<CodeBlock language="tsx">{`const x = 1`}</CodeBlock>)
    expect(screen.getByText(/const x = 1/)).toBeInTheDocument()
  })

  it('copy button writes to clipboard', async () => {
    const writeText = vi.fn()
    Object.assign(navigator, { clipboard: { writeText } })
    render(<CodeBlock language="tsx">{`hello`}</CodeBlock>)
    const btn = screen.getByRole('button', { name: /copy/i })
    await userEvent.click(btn)
    expect(writeText).toHaveBeenCalledWith('hello')
  })
})
