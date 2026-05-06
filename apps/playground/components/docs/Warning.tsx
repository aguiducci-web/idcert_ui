export function Warning({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-4 rounded-md border-l-4 border-destructive bg-destructive/10 p-4 text-sm">
      {children}
    </aside>
  )
}
