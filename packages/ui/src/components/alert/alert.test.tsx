import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Alert, AlertTitle, AlertDescription } from './index.js'

describe('Alert', () => {
  test('renders with role alert', () => {
    render(<Alert>Heads up</Alert>)
    expect(screen.getByRole('alert')).toHaveTextContent('Heads up')
  })

  test.each([
    ['default', 'border-border'],
    ['info', 'border-primary'],
    ['success', 'border-green-500'],
    ['warning', 'border-yellow-500'],
    ['destructive', 'border-destructive'],
  ] as const)('variant %s applies expected border class', (variant, expectedClass) => {
    render(<Alert variant={variant} data-testid="a">x</Alert>)
    expect(screen.getByTestId('a')).toHaveClass(expectedClass)
  })

  test('renders default icon for info variant', () => {
    render(<Alert variant="info" data-testid="a">x</Alert>)
    expect(screen.getByTestId('a').querySelector('svg')).not.toBeNull()
  })

  test('does not render icon when icon={false}', () => {
    render(<Alert variant="info" icon={false} data-testid="a">x</Alert>)
    expect(screen.getByTestId('a').querySelector('svg')).toBeNull()
  })

  test('renders custom icon node', () => {
    render(
      <Alert variant="info" icon={<span data-testid="custom-icon">!</span>}>
        x
      </Alert>,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  test('AlertTitle renders as h5 with proper styles', () => {
    render(<AlertTitle>Title</AlertTitle>)
    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H5')
    expect(title).toHaveClass('font-medium')
  })

  test('AlertDescription renders as div', () => {
    render(<AlertDescription data-testid="d">Body</AlertDescription>)
    expect(screen.getByTestId('d').tagName).toBe('DIV')
    expect(screen.getByTestId('d')).toHaveTextContent('Body')
  })

  test('Alert forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Alert ref={ref}>x</Alert>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
