import { glob } from 'glob'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SOURCE_GLOB = path.resolve(
  __dirname,
  '../../../packages/ui/src/components/**/*.examples.tsx',
)
const OUTPUT_PATH = path.resolve(__dirname, '../public/examples-source.json')

const EXPORT_REGEX = /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=/g

export async function extractFromFile(file: string): Promise<Record<string, string>> {
  const raw = await fs.readFile(file, 'utf8')
  const out: Record<string, string> = {}
  const matches: { name: string; start: number }[] = []
  for (const m of raw.matchAll(EXPORT_REGEX)) {
    const name = m[1]
    if (name === undefined || m.index === undefined) continue
    matches.push({ name, start: m.index })
  }
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i]!
    const next = matches[i + 1]
    const start = current.start
    const end = next ? next.start : raw.length
    out[current.name] = raw.slice(start, end).trim()
  }
  return out
}

function componentNameFromPath(file: string): string {
  const dir = path.basename(path.dirname(file))
  return dir
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

async function main() {
  const files = (await glob(SOURCE_GLOB)).sort()
  const out: Record<string, Record<string, string>> = {}
  for (const file of files) {
    const name = componentNameFromPath(file)
    out[name] = await extractFromFile(file)
  }
  const sorted = Object.fromEntries(
    Object.keys(out).sort().map((key) => [key, out[key]] as const),
  )
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(sorted, null, 2))
  console.log(
    `✓ wrote ${Object.keys(sorted).length} component entries to ${OUTPUT_PATH}`,
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
