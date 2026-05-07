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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../dropdown-menu/index.js'

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

export const WithBrand = () => (
  <Navbar aria-label="Main">
    <NavbarBrand>
      <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">id</span>
      <span className="font-semibold">idcert</span>
    </NavbarBrand>
    <NavbarContent>
      <NavbarItem href="/features">Features</NavbarItem>
      <NavbarItem href="/pricing" active>Pricing</NavbarItem>
      <NavbarItem href="/customers">Customers</NavbarItem>
    </NavbarContent>
    <NavbarActions>
      <Button variant="ghost">Log in</Button>
      <Button>Start free trial</Button>
    </NavbarActions>
    <NavbarMobileToggle aria-label="Open menu" />
  </Navbar>
)

export const WithDropdown = () => (
  <Navbar aria-label="Main">
    <NavbarBrand>
      <span className="font-semibold">idcert</span>
    </NavbarBrand>
    <NavbarContent>
      <NavbarItem href="/overview">Overview</NavbarItem>
      <DropdownMenu>
        <DropdownMenuTrigger className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          Resources
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Documentation</DropdownMenuItem>
          <DropdownMenuItem>Guides</DropdownMenuItem>
          <DropdownMenuItem>Changelog</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <NavbarItem href="/pricing">Pricing</NavbarItem>
    </NavbarContent>
    <NavbarActions>
      <Button>Sign up</Button>
    </NavbarActions>
    <NavbarMobileToggle aria-label="Open menu" />
  </Navbar>
)

export const Sticky = () => (
  <div className="h-40 overflow-auto rounded-md border">
    <Navbar position="sticky" aria-label="Main">
      <NavbarBrand>
        <span className="font-semibold">idcert</span>
      </NavbarBrand>
      <NavbarContent>
        <NavbarItem href="/docs" active>Docs</NavbarItem>
        <NavbarItem href="/api">API</NavbarItem>
      </NavbarContent>
      <NavbarActions>
        <Button size="sm">Sign in</Button>
      </NavbarActions>
    </Navbar>
    <div className="p-4 text-sm text-muted-foreground">
      <p>Scroll this panel — the navbar stays pinned to the top.</p>
      <p className="mt-40">More content below.</p>
      <p className="mt-40">Even more content.</p>
    </div>
  </div>
)

export const Mobile = () => (
  <div className="max-w-sm">
    <Navbar aria-label="Main">
      <NavbarBrand>
        <span className="font-semibold">idcert</span>
      </NavbarBrand>
      <NavbarActions>
        <NavbarMobileToggle aria-label="Open menu" aria-expanded={false} aria-controls="mobile-nav" />
      </NavbarActions>
    </Navbar>
  </div>
)
