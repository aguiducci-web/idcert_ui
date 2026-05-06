import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md p-12 text-center">
      <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
      <p className="mb-4 text-muted-foreground">No documentation at this URL.</p>
      <Link href="/docs/_stub" className="underline">
        Back to docs
      </Link>
    </main>
  )
}
