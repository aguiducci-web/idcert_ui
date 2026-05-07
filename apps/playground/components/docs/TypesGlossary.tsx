import glossaryData from '@/public/types-glossary.json'

type Entry = { name: string; values: string[] }
const data = glossaryData as Record<string, Entry>

export function TypesGlossary() {
  const entries = Object.values(data)
  if (entries.length === 0) return null
  return (
    <div className="not-prose space-y-10">
      {entries.map((entry) => (
        <section key={entry.name} id={entry.name} className="scroll-mt-24">
          <h3 className="font-mono text-base font-semibold text-foreground">
            {entry.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {entry.values.length} string-literal members.
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {entry.values.map((v) => (
              <code
                key={v}
                className="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
              >
                {v}
              </code>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
