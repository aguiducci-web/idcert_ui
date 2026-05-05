import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './index.js'

describe('Breadcrumb', () => {
  test('renders a <nav> with aria-label="breadcrumb"', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb')
  })

  test('BreadcrumbList renders an <ol>', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList data-testid="list">
          <BreadcrumbItem>
            <BreadcrumbPage>x</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(container.querySelector('ol')).not.toBeNull()
  })

  test('BreadcrumbItem renders an <li>', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>x</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const items = container.querySelectorAll('li')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  test('BreadcrumbLink renders an <a> with href', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toHaveAttribute('href', '/docs')
  })

  test('BreadcrumbLink with asChild renders the custom child element', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a href="/custom" data-testid="custom-link">Custom</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const link = screen.getByTestId('custom-link')
    expect(link).toHaveAttribute('href', '/custom')
    expect(link).toHaveTextContent('Custom')
  })

  test('BreadcrumbPage has aria-current="page"', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const page = screen.getByText('Current')
    expect(page).toHaveAttribute('aria-current', 'page')
  })

  test('BreadcrumbSeparator renders a default ChevronRight icon', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator data-testid="sep" />
          <BreadcrumbItem>
            <BreadcrumbPage>x</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const sep = screen.getByTestId('sep')
    expect(sep).toHaveAttribute('aria-hidden', 'true')
    expect(sep.querySelector('svg')).not.toBeNull()
  })

  test('BreadcrumbEllipsis renders MoreHorizontal icon', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbEllipsis data-testid="ellipsis" />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const ellipsis = screen.getByTestId('ellipsis')
    expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
    expect(ellipsis.querySelector('svg')).not.toBeNull()
  })
})
