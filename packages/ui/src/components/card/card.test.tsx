import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from './index.js'

describe('Card compound', () => {
  test('Card renders with rounded border', () => {
    render(<Card data-testid="card">X</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('rounded-lg')
    expect(card).toHaveClass('border')
  })

  test('CardHeader renders', () => {
    render(<CardHeader data-testid="h">X</CardHeader>)
    expect(screen.getByTestId('h')).toBeInTheDocument()
  })

  test('CardTitle renders as h3 with proper styles', () => {
    render(<CardTitle>My Title</CardTitle>)
    const title = screen.getByText('My Title')
    expect(title.tagName).toBe('H3')
    expect(title).toHaveClass('font-semibold')
  })

  test('CardDescription renders', () => {
    render(<CardDescription>Some text</CardDescription>)
    expect(screen.getByText('Some text')).toBeInTheDocument()
  })

  test('CardContent renders', () => {
    render(<CardContent data-testid="c">X</CardContent>)
    expect(screen.getByTestId('c')).toBeInTheDocument()
  })

  test('CardFooter renders', () => {
    render(<CardFooter data-testid="f">X</CardFooter>)
    expect(screen.getByTestId('f')).toBeInTheDocument()
  })

  test('full composition renders all parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  test('Card forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Card ref={ref}>X</Card>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
