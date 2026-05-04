'use client'

import { Button, useTheme } from '@idcert/ui'

export default function Home() {
  const { theme, setTheme } = useTheme()

  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">@idcert/ui playground</h1>
      <p className="text-muted-foreground">Theme: {theme}</p>
      <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle theme
      </Button>
      <div className="flex flex-wrap gap-3">
        <Button>Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </main>
  )
}
