import { Navbar, NavbarContent, NavbarItem } from '@idcert/ui'

export default function SmokeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar>
        <NavbarContent>
          <NavbarItem href="/docs/getting-started/installation">Docs</NavbarItem>
          <NavbarItem href="/forms">Forms</NavbarItem>
          <NavbarItem href="/data">Data</NavbarItem>
          <NavbarItem href="/utility">Utility</NavbarItem>
          <NavbarItem href="/navigation">Navigation</NavbarItem>
        </NavbarContent>
      </Navbar>
      {children}
    </>
  )
}
