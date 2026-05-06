import './globals.css'
import type { Metadata } from 'next'
import { Navbar, NavbarContent, NavbarItem, ThemeProvider, ToastProvider, Toaster } from '@idcert/ui'

export const metadata: Metadata = {
  title: 'idcert-ui playground',
  description: 'Integration test app for @idcert/ui',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Navbar>
          <NavbarContent>
            <NavbarItem href="/">Home</NavbarItem>
            {/* <NavbarItem href="/dashboard">Dashboard</NavbarItem> */}
            <NavbarItem href="/data">Data</NavbarItem>
            <NavbarItem href="/forms">Forms</NavbarItem>
            <NavbarItem href="/utility">Utility</NavbarItem>
            <NavbarItem href="/navigation">Navigation</NavbarItem>
          </NavbarContent>
        </Navbar>
        <ThemeProvider>
          <ToastProvider>
            {children}
            <Toaster position="top-right" />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
