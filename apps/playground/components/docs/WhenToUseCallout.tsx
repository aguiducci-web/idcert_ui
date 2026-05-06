export function WhenToUseCallout({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-6 rounded-md border-l-4 border-primary bg-muted p-4">
      <h2 className="m-0 mb-2 text-sm font-semibold uppercase text-muted-foreground">
        When to use
      </h2>
      <div className="text-sm">{children}</div>
    </aside>
  )
}
