import { describe, it, expect } from 'vitest'
import { nav, allNavSlugs } from '@/lib/nav'

describe('nav structure', () => {
  it('every entry has a non-empty slug and title', () => {
    for (const section of nav) {
      for (const group of section.groups) {
        for (const item of group.items) {
          expect(item.title.length).toBeGreaterThan(0)
          expect(item.slug.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('slugs are unique', () => {
    const slugs = allNavSlugs()
    const set = new Set(slugs)
    expect(set.size).toBe(slugs.length)
  })

  it('contains all 43 components by canonical slug', () => {
    const slugs = allNavSlugs().filter((s) => s.startsWith('components/'))
    expect(slugs).toHaveLength(43)
  })
})
