'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { nav } from '@/lib/nav'
import { cn } from '@/lib/cn'

export function Sidebar() {
  const pathname = usePathname()
  return (
    <nav aria-label="Documentation" className="w-60 shrink-0 border-r border-border bg-background">
      <ul className="space-y-6 p-4 text-sm">
        {nav.map((section) => (
          <li key={section.title}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            {section.groups.map((group) => (
              <div key={group.title || section.title} className="mb-3">
                {group.title && (
                  <h4 className="mb-1 px-2 text-xs font-medium text-foreground">
                    {group.title}
                  </h4>
                )}
                <ul>
                  {group.items.map((item) => {
                    const href = `/docs/${item.slug}`
                    const active = pathname === href
                    return (
                      <li key={item.slug}>
                        <Link
                          href={href}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'block rounded px-2 py-1 transition-colors',
                            active
                              ? 'bg-accent font-medium text-accent-foreground'
                              : 'text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {item.title}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </nav>
  )
}
