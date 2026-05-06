import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider, ToastProvider, Toaster } from '@idcert/ui'

export const metadata: Metadata = {
  title: 'idcert-ui playground',
  description: 'Integration test app for @idcert/ui',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
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
