import fs from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'glob'
import matter from 'gray-matter'

export type DocCategory =
  | 'getting-started'
  | 'foundations'
  | 'primitives'
  | 'forms'
  | 'overlays'
  | 'layout'
  | 'navigation'
  | 'data'
  | 'feedback'
  | 'utility'
  | 'recipes'

export type DocStatus = 'stable' | 'experimental' | 'deprecated' | 'in-progress'

export type DocFrontmatter = {
  title: string
  description: string
  category: DocCategory
  component?: string
  package?: string
  status?: DocStatus
  whenToUse?: string
}

const REQUIRED_KEYS: (keyof DocFrontmatter)[] = ['title', 'description', 'category']

export const CONTENT_DIR = path.resolve(process.cwd(), 'content/docs')

export function slugFromContentPath(filePath: string, baseDir: string): string {
  const rel = path.relative(baseDir, filePath).replace(/\\/g, '/')
  const noExt = rel.replace(/\.mdx?$/, '')
  return noExt === 'index' ? '' : noExt.replace(/\/index$/, '')
}

export async function listDocSlugs(baseDir: string = CONTENT_DIR): Promise<string[]> {
  const files = await glob('**/*.mdx', { cwd: baseDir, absolute: true })
  return files.map((f) => slugFromContentPath(f, baseDir))
}

export async function parseDocFile(filePath: string): Promise<{
  frontmatter: DocFrontmatter
  body: string
}> {
  const raw = await fs.readFile(filePath, 'utf8')
  const { data, content } = matter(raw)
  for (const key of REQUIRED_KEYS) {
    if (!data[key]) {
      throw new Error(
        `${filePath}: missing required frontmatter key "${key}"`,
      )
    }
  }
  return { frontmatter: data as DocFrontmatter, body: content }
}
