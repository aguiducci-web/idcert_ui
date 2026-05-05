import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { Portal } from './index.js'

describe('Portal', () => {
  test('renders children into document.body by default', () => {
    render(
      <Portal>
        <div data-testid="portal-child">Hello</div>
      </Portal>,
    )
    const child = screen.getByTestId('portal-child')
    expect(child).toBeInTheDocument()
    // Direct parent should be document.body (createPortal mounts directly into the target).
    expect(child.parentElement).toBe(document.body)
  })

  test('custom container prop targets specified element', () => {
    const target = document.createElement('div')
    target.id = 'custom-target'
    document.body.appendChild(target)
    render(
      <Portal container={target}>
        <span data-testid="custom">x</span>
      </Portal>,
    )
    expect(target.querySelector('[data-testid="custom"]')).not.toBeNull()
    target.remove()
  })

  test('forwards children unchanged (text content visible)', () => {
    render(
      <Portal>
        <p>Plain text content</p>
      </Portal>,
    )
    expect(screen.getByText('Plain text content')).toBeInTheDocument()
  })

  test('multiple Portal instances coexist in document.body', () => {
    render(
      <>
        <Portal>
          <span data-testid="first">First</span>
        </Portal>
        <Portal>
          <span data-testid="second">Second</span>
        </Portal>
      </>,
    )
    expect(screen.getByTestId('first')).toBeInTheDocument()
    expect(screen.getByTestId('second')).toBeInTheDocument()
  })

  test('passing container={null} renders nothing', () => {
    const { container } = render(
      <Portal container={null}>
        <span data-testid="nope">x</span>
      </Portal>,
    )
    expect(screen.queryByTestId('nope')).not.toBeInTheDocument()
    expect(container.querySelector('[data-testid="nope"]')).toBeNull()
  })
})
