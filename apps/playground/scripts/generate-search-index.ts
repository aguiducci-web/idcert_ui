import { glob } from 'glob'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_DIR = path.resolve(__dirname, '../content/docs')
const OUTPUT_PATH = path.resolve(__dirname, '../public/search-index.json')

export type SearchEntry = {
  slug: string
  title: string
  description: string
  category: string
  headings: { id: string; text: string; level: 2 | 3 }[]
}

const HEADING_REGEX = /^(#{2,3})\s+(.+?)\s*$/gm

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function buildIndex(baseDir: string): Promise<SearchEntry[]> {
  const files = await glob('**/*.mdx', { cwd: baseDir, absolute: true })
  const entries: SearchEntry[] = []
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8')
    const { data, content } = matter(raw)
    const headings: SearchEntry['headings'] = []
    for (const m of content.matchAll(HEADING_REGEX)) {
      const hashes = m[1]
      const heading = m[2]
      if (!hashes || !heading) continue
      const level = hashes.length === 2 ? 2 : 3
      const text = heading.trim()
      headings.push({ id: slugify(text), text, level: level as 2 | 3 })
    }
    const rel = path.relative(baseDir, file).replace(/\\/g, '/')
    const slug = rel.replace(/\.mdx$/, '').replace(/\/index$/, '')
    entries.push({
      slug,
      title: data.title ?? '',
      description: data.description ?? '',
      category: data.category ?? '',
      headings,
    })
  }
  return entries
}

async function main() {
  const entries = await buildIndex(CONTENT_DIR)
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(entries, null, 2))
  console.log(`✓ wrote ${entries.length} search entries to ${OUTPUT_PATH}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
