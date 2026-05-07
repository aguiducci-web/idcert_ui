'use client'

import * as React from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'

type SearchEntry = {
  slug: string
  title: string
  description: string
  category: string
  headings: { id: string; text: string; level: 2 | 3 }[]
}

type Result = {
  key: string
  label: string
  subtitle?: string
  category: string
  href: string
  keywords: string[]
}

const CATEGORY_LABELS: Record<string, string> = {
  'getting-started': 'Getting Started',
  foundations: 'Foundations',
  primitives: 'Components · Primitives',
  forms: 'Components · Forms',
  overlays: 'Components · Overlays',
  layout: 'Components · Layout',
  navigation: 'Components · Navigation',
  data: 'Components · Data',
  feedback: 'Components · Feedback',
  utility: 'Components · Utility',
  recipes: 'Recipes',
}

function entryToResults(entry: SearchEntry): Result[] {
  const base: Result = {
    key: entry.slug,
    label: entry.title,
    subtitle: entry.description,
    category: entry.category,
    href: `/docs/${entry.slug}`,
    keywords: [
      entry.title, entry.title, entry.title,
      entry.description, entry.description,
      entry.category,
    ],
  }
  const headingResults: Result[] = entry.headings.map((h) => ({
    key: `${entry.slug}#${h.id}`,
    label: h.text,
    category: entry.category,
    href: `/docs/${entry.slug}#${h.id}`,
    keywords: [h.text, entry.title],
  }))
  return [base, ...headingResults]
}

function groupByCategory(results: Result[]): Map<string, Result[]> {
  const map = new Map<string, Result[]>()
  for (const r of results) {
    const list = map.get(r.category) ?? []
    list.push(r)
    map.set(r.category, list)
  }
  return map
}

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [entries, setEntries] = React.useState<SearchEntry[] | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  React.useEffect(() => {
    if (!open || entries) return
    fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SearchEntry[]) => setEntries(data))
      .catch(() => setEntries([]))
  }, [open, entries])

  const grouped = React.useMemo(() => {
    if (!entries) return new Map<string, Result[]>()
    const all = entries.flatMap(entryToResults)
    return groupByCategory(all)
  }, [entries])

  const handleSelect = React.useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      className="fixed left-1/2 top-1/4 w-[600px] max-w-[90vw] -translate-x-1/2 rounded-md border border-border bg-background p-2 shadow-lg"
    >
      <Command.Input
        placeholder="Search docs…"
        className="w-full border-b border-border px-3 py-2 outline-none"
      />
      <Command.List className="max-h-[400px] overflow-y-auto p-2">
        <Command.Empty className="p-4 text-sm text-muted-foreground">
          No results.
        </Command.Empty>
        {Array.from(grouped.entries()).map(([category, items]) => (
          <Command.Group
            key={category}
            heading={CATEGORY_LABELS[category] ?? category}
          >
            {items.map((item) => (
              <Command.Item
                key={item.key}
                value={item.key}
                keywords={item.keywords}
                onSelect={() => handleSelect(item.href)}
                className="flex cursor-pointer flex-col rounded-sm px-3 py-2 text-sm aria-selected:bg-accent"
              >
                <span className="font-medium">{item.label}</span>
                {item.subtitle ? (
                  <span className="text-xs text-muted-foreground">
                    {item.subtitle}
                  </span>
                ) : null}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  )
}
