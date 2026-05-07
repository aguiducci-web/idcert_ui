'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

export type TocEntry = {
  value: string
  depth: number
  id?: string
  children?: TocEntry[]
}

function flatten(toc: TocEntry[], out: TocEntry[] = []): TocEntry[] {
  for (const e of toc) {
    if (e.depth === 2 || e.depth === 3) out.push(e)
    if (e.children) flatten(e.children, out)
  }
  return out
}

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const flat = React.useMemo(() => flatten(toc), [toc])
  const [active, setActive] = React.useState<string | null>(null)

  React.useEffect(() => {
    const ids = flat.map((e) => e.id).filter(Boolean) as string[]
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
            return
          }
        }
      },
      { rootMargin: '0% 0% -70% 0%' },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [flat])

  if (flat.length === 0) return null

  return (
    <aside
      aria-label="On this page"
      className="sticky top-20 hidden w-52 shrink-0 self-start lg:block"
    >
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </h3>
      <ul className="space-y-1 text-sm">
        {flat.map((entry) => {
          const id = entry?.id ?? ''
          return (
            <li
              key={id}
              className={cn(entry.depth === 3 && 'ml-3')}
            >
              <a
                href={`#${id}`}
                className={cn(
                  'block py-0.5 transition-colors',
                  active === id
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {entry.value}
              </a>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
