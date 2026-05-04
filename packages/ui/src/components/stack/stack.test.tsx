import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Stack, HStack, VStack } from './index.js'

describe('Stack', () => {
  test('renders children', () => {
    render(<Stack data-testid="s"><span>A</span><span>B</span></Stack>)
    expect(screen.getByTestId('s')).toBeInTheDocument()
  })

  test('defaults to vertical (flex-col)', () => {
    render(<Stack data-testid="s">X</Stack>)
    expect(screen.getByTestId('s')).toHaveClass('flex-col')
  })

  test('horizontal direction applies flex-row', () => {
    render(<Stack direction="horizontal" data-testid="s">X</Stack>)
    expect(screen.getByTestId('s')).toHaveClass('flex-row')
  })

  test('gap prop applies gap class', () => {
    render(<Stack gap={4} data-testid="s">X</Stack>)
    expect(screen.getByTestId('s')).toHaveClass('gap-4')
  })

  test('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Stack ref={ref}>X</Stack>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('HStack', () => {
  test('renders with horizontal direction', () => {
    render(<HStack data-testid="h">X</HStack>)
    expect(screen.getByTestId('h')).toHaveClass('flex-row')
  })
})

describe('VStack', () => {
  test('renders with vertical direction', () => {
    render(<VStack data-testid="v">X</VStack>)
    expect(screen.getByTestId('v')).toHaveClass('flex-col')
  })
})
