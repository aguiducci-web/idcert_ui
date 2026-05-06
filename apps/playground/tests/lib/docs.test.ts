import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
  listDocSlugs,
  parseDocFile,
  slugFromContentPath,
} from '@/lib/docs'

const fixtureDir = path.resolve(__dirname, '__fixtures__/content/docs')

beforeAll(async () => {
  await fs.mkdir(path.join(fixtureDir, 'components'), { recursive: true })
  await fs.writeFile(
    path.join(fixtureDir, 'components/button.mdx'),
    `---
title: Button
description: Primary actions.
component: Button
package: '@idcert/ui'
category: primitives
---

# Hello
`,
  )
  await fs.writeFile(
    path.join(fixtureDir, 'index.mdx'),
    `---
title: Home
description: Top page.
category: getting-started
---

intro
`,
  )
})

afterAll(async () => {
  await fs.rm(path.resolve(__dirname, '__fixtures__'), { recursive: true, force: true })
})

describe('slugFromContentPath', () => {
  it('strips content/docs prefix and .mdx extension', () => {
    expect(
      slugFromContentPath('/abs/content/docs/components/button.mdx', '/abs/content/docs'),
    ).toBe('components/button')
  })

  it('treats index.mdx as parent slug', () => {
    expect(
      slugFromContentPath('/abs/content/docs/index.mdx', '/abs/content/docs'),
    ).toBe('')
  })
})

describe('listDocSlugs', () => {
  it('returns all MDX slugs under content/docs', async () => {
    const slugs = await listDocSlugs(fixtureDir)
    expect(slugs.sort()).toEqual(['', 'components/button'])
  })
})

describe('parseDocFile', () => {
  it('returns frontmatter and raw body', async () => {
    const file = path.join(fixtureDir, 'components/button.mdx')
    const result = await parseDocFile(file)
    expect(result.frontmatter).toMatchObject({
      title: 'Button',
      description: 'Primary actions.',
      component: 'Button',
      category: 'primitives',
    })
    expect(result.body).toContain('# Hello')
  })

  it('throws on missing required frontmatter', async () => {
    const bad = path.join(fixtureDir, 'bad.mdx')
    await fs.writeFile(bad, '# no frontmatter\n')
    await expect(parseDocFile(bad)).rejects.toThrow(/missing required frontmatter/i)
    await fs.rm(bad)
  })
})
