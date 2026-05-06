import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Example } from '@/components/docs/Example'

vi.mock('@/public/examples-source.json', () => ({
  default: {
    Button: {
      AllVariants: 'export const AllVariants = () => <Button>v</Button>',
    },
  },
}))

describe('<Example>', () => {
  it('renders preview by default and toggles code on click', async () => {
    render(
      <Example name="AllVariants" component="Button">
        <button>preview</button>
      </Example>,
    )
    expect(screen.getByText('preview')).toBeInTheDocument()
    expect(screen.queryByText(/AllVariants/)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /code/i }))
    expect(screen.getByText(/AllVariants/)).toBeInTheDocument()
  })
})
