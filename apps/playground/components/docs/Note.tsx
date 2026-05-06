export function Note({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-4 rounded-md border-l-4 border-primary bg-muted p-4 text-sm">
      {children}
    </aside>
  )
}
