import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarActions,
  NavbarMobileToggle,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Navigation/Navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Navbar>
      <NavbarBrand>
        <span className="font-semibold">idcert</span>
      </NavbarBrand>
      <NavbarContent>
        <NavbarItem href="/products" active>Products</NavbarItem>
        <NavbarItem href="/docs">Docs</NavbarItem>
        <NavbarItem href="/blog">Blog</NavbarItem>
      </NavbarContent>
      <NavbarActions>
        <Button variant="ghost">Sign in</Button>
        <Button>Get started</Button>
      </NavbarActions>
      <NavbarMobileToggle aria-label="Open menu" />
    </Navbar>
  ),
}

export const Sticky: Story = {
  render: () => (
    <div className="h-[200vh] bg-muted/30">
      <Navbar position="sticky">
        <NavbarBrand>
          <span className="font-semibold">Sticky</span>
        </NavbarBrand>
        <NavbarContent>
          <NavbarItem href="/a" active>Home</NavbarItem>
          <NavbarItem href="/b">About</NavbarItem>
        </NavbarContent>
        <NavbarActions>
          <Button>Action</Button>
        </NavbarActions>
      </Navbar>
      <div className="p-8">
        <p>Scroll down to verify the navbar sticks to the top.</p>
      </div>
    </div>
  ),
}

export const Fixed: Story = {
  render: () => (
    <div className="h-[200vh] bg-muted/30 pt-20">
      <Navbar position="fixed">
        <NavbarBrand>
          <span className="font-semibold">Fixed</span>
        </NavbarBrand>
        <NavbarContent>
          <NavbarItem href="/a">Home</NavbarItem>
        </NavbarContent>
      </Navbar>
      <div className="p-8">
        <p>Fixed navbar overlays content. Pad the body to compensate.</p>
      </div>
    </div>
  ),
}

export const WithAsChildLink: Story = {
  render: () => (
    <Navbar>
      <NavbarBrand>
        <span className="font-semibold">Brand</span>
      </NavbarBrand>
      <NavbarContent>
        <NavbarItem asChild>
          <a href="/custom" data-app-link="custom">Custom</a>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  ),
}
