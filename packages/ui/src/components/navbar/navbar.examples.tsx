'use client'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarActions,
  NavbarMobileToggle,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
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
)
