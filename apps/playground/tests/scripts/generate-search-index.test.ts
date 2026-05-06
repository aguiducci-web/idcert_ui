import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs/promises'
import path from 'node:path'
import { buildIndex } from '@/scripts/generate-search-index'

const fixtureDir = path.resolve(__dirname, '__fixtures__/search-content')

beforeAll(async () => {
  await fs.mkdir(path.join(fixtureDir, 'components'), { recursive: true })
  await fs.writeFile(
    path.join(fixtureDir, 'components/button.mdx'),
    `---
title: Button
description: Trigger primary actions.
category: primitives
---

## Examples

### Variants

### Sizes

## API Reference
`,
  )
})

afterAll(async () => {
  await fs.rm(fixtureDir, { recursive: true, force: true })
})

describe('buildIndex', () => {
  it('produces one entry per MDX with title, description, headings', async () => {
    const entries = await buildIndex(fixtureDir)
    expect(entries).toHaveLength(1)
    const e = entries[0]
    expect(e.slug).toBe('components/button')
    expect(e.title).toBe('Button')
    expect(e.description).toBe('Trigger primary actions.')
    expect(e.category).toBe('primitives')
    expect(e.headings.map((h) => h.text)).toEqual([
      'Examples',
      'Variants',
      'Sizes',
      'API Reference',
    ])
  })
})
