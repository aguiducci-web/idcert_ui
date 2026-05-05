import { render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from './index.js'

describe('Avatar', () => {
  test('renders root', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>U</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
  })

  describe('with mocked Image', () => {
    const OriginalImage = window.Image

    beforeEach(() => {
      // jsdom does not actually fetch images, so onload never fires.
      // Stub window.Image to immediately invoke onload so Base UI marks
      // the image as 'loaded' and renders the <img> element.
      vi.stubGlobal(
        'Image',
        class {
          onload: (() => void) | null = null
          onerror: (() => void) | null = null
          referrerPolicy = ''
          crossOrigin: string | null = null
          complete = false
          naturalWidth = 0
          set src(_value: string) {
            queueMicrotask(() => this.onload?.())
          }
          get src(): string {
            return ''
          }
        },
      )
    })

    afterEach(() => {
      vi.stubGlobal('Image', OriginalImage)
    })

    test('AvatarImage renders with src and alt when image loads', async () => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test user" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>,
      )
      await waitFor(() => {
        const img = document.querySelector('img[alt="Test user"]')
        expect(img).not.toBeNull()
        expect(img).toHaveAttribute('src', '/test.jpg')
      })
    })
  })

  test('AvatarFallback renders text content', () => {
    render(
      <Avatar>
        <AvatarFallback>AG</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('AG')).toBeInTheDocument()
  })

  test.each([
    ['sm', 'h-6'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
    ['xl', 'h-16'],
  ] as const)('size %s applies expected class %s', (size, expectedClass) => {
    render(
      <Avatar size={size} data-testid="a">
        <AvatarFallback>U</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByTestId('a')).toHaveClass(expectedClass)
  })

  test('AvatarGroup renders all children when count <= max', () => {
    render(
      <AvatarGroup max={3}>
        <Avatar><AvatarFallback>U1</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U2</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U3</AvatarFallback></Avatar>
      </AvatarGroup>,
    )
    expect(screen.getByText('U1')).toBeInTheDocument()
    expect(screen.getByText('U2')).toBeInTheDocument()
    expect(screen.getByText('U3')).toBeInTheDocument()
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  test('AvatarGroup truncates and shows +N when count > max', () => {
    render(
      <AvatarGroup max={3}>
        <Avatar><AvatarFallback>U1</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U2</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U3</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U4</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U5</AvatarFallback></Avatar>
      </AvatarGroup>,
    )
    expect(screen.getByText('U1')).toBeInTheDocument()
    expect(screen.getByText('U2')).toBeInTheDocument()
    expect(screen.getByText('U3')).toBeInTheDocument()
    expect(screen.queryByText('U4')).not.toBeInTheDocument()
    expect(screen.queryByText('U5')).not.toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  test('AvatarGroup without max renders all children', () => {
    render(
      <AvatarGroup>
        <Avatar><AvatarFallback>U1</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U2</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U3</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>U4</AvatarFallback></Avatar>
      </AvatarGroup>,
    )
    expect(screen.getByText('U1')).toBeInTheDocument()
    expect(screen.getByText('U4')).toBeInTheDocument()
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  test('forwards ref to Avatar root', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(
      <Avatar ref={ref}>
        <AvatarFallback>U</AvatarFallback>
      </Avatar>,
    )
    expect(ref.current).not.toBeNull()
  })
})
