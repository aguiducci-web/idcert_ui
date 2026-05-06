import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PropsTable } from '@/components/docs/PropsTable'

vi.mock('@/public/props.json', () => ({
  default: {
    Button: {
      displayName: 'Button',
      description: '',
      props: {
        variant: {
          name: 'variant',
          required: false,
          description: 'Visual style.',
          defaultValue: { value: '"default"' },
          type: {
            name: 'enum',
            value: [
              { value: '"default"' },
              { value: '"destructive"' },
            ],
          },
        },
        asChild: {
          name: 'asChild',
          required: false,
          description: 'Render as Slot.',
          defaultValue: { value: 'false' },
          type: { name: 'boolean' },
        },
      },
    },
  },
}))

describe('<PropsTable>', () => {
  it('renders one row per prop with name, type, default, description', () => {
    render(<PropsTable component="Button" />)
    expect(screen.getByText('variant')).toBeInTheDocument()
    expect(screen.getByText('asChild')).toBeInTheDocument()
    expect(screen.getByText('Visual style.')).toBeInTheDocument()
    expect(screen.getAllByText('"default"').length).toBeGreaterThan(0)
    expect(screen.getByText('false')).toBeInTheDocument()
  })

  it('renders nothing for unknown component', () => {
    const { container } = render(<PropsTable component="Unknown" />)
    expect(container).toBeEmptyDOMElement()
  })
})
