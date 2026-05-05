import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, test, vi } from 'vitest'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarActions,
  NavbarMobileToggle,
} from './index.js'

describe('Navbar', () => {
  test('renders <nav> root', () => {
    const { container } = render(
      <Navbar>
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    )
    expect(container.querySelector('nav')).not.toBeNull()
  })

  test('position="static" omits sticky/fixed positioning classes', () => {
    const { container } = render(
      <Navbar position="static">
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    )
    const nav = container.querySelector('nav')!
    expect(nav.className).not.toMatch(/sticky/)
    expect(nav.className).not.toMatch(/fixed/)
  })

  test('position="sticky" applies sticky top-0', () => {
    const { container } = render(
      <Navbar position="sticky">
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    )
    const nav = container.querySelector('nav')!
    expect(nav.className).toMatch(/sticky/)
    expect(nav.className).toMatch(/top-0/)
  })

  test('position="fixed" applies fixed inset-x-0 top-0', () => {
    const { container } = render(
      <Navbar position="fixed">
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    )
    const nav = container.querySelector('nav')!
    expect(nav.className).toMatch(/fixed/)
    expect(nav.className).toMatch(/inset-x-0/)
  })

  test('NavbarBrand, NavbarContent, NavbarActions render their children', () => {
    render(
      <Navbar>
        <NavbarBrand>BRAND</NavbarBrand>
        <NavbarContent>
          <NavbarItem>Item1</NavbarItem>
        </NavbarContent>
        <NavbarActions>ACTIONS</NavbarActions>
      </Navbar>,
    )
    expect(screen.getByText('BRAND')).toBeInTheDocument()
    expect(screen.getByText('Item1')).toBeInTheDocument()
    expect(screen.getByText('ACTIONS')).toBeInTheDocument()
  })

  test('NavbarItem with active prop sets aria-current="page"', () => {
    render(
      <Navbar>
        <NavbarContent>
          <NavbarItem active href="/home">Home</NavbarItem>
        </NavbarContent>
      </Navbar>,
    )
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  })

  test('NavbarItem with asChild composes the custom child element', () => {
    render(
      <Navbar>
        <NavbarContent>
          <NavbarItem asChild>
            <a href="/custom" data-testid="custom-link">Custom</a>
          </NavbarItem>
        </NavbarContent>
      </Navbar>,
    )
    const link = screen.getByTestId('custom-link')
    expect(link).toHaveAttribute('href', '/custom')
  })

  test('NavbarMobileToggle fires onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Navbar>
        <NavbarMobileToggle aria-label="Open menu" onClick={onClick} />
      </Navbar>,
    )
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(onClick).toHaveBeenCalled()
  })

  test('forwards ref to Navbar root', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <Navbar ref={ref}>
        <NavbarBrand>Brand</NavbarBrand>
      </Navbar>,
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.tagName).toBe('NAV')
  })
})
