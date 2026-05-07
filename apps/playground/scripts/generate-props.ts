import * as docgen from 'react-docgen-typescript'
import { glob } from 'glob'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TSCONFIG_PATH = path.resolve(__dirname, '../../../packages/ui/tsconfig.json')
const SOURCE_GLOB = path.resolve(
  __dirname,
  '../../../packages/ui/src/components/**/index.tsx',
)
const OUTPUT_PATH = path.resolve(__dirname, '../public/props.json')

// Form/widget HTML attributes worth surfacing in PropsTable when a component
// type extends React's HTMLAttributes/InputHTMLAttributes via Omit/Pick.
// Skips noise (className, style, id, aria-*, data-*, key, ref) and text/
// number-input-only attrs (placeholder, min/max, step, pattern, minLength,
// maxLength, accept, rows, cols, wrap, spellCheck) that would clutter
// Checkbox/Radio/Switch docs without applying.
const REACT_PROPS_ALLOWLIST = new Set([
  'name', 'value', 'defaultValue', 'checked', 'defaultChecked',
  'disabled', 'required', 'readOnly',
  'autoComplete', 'autoFocus', 'form', 'multiple',
  'onChange', 'onBlur', 'onFocus', 'onSubmit', 'onClick', 'onKeyDown',
  'href', 'target', 'rel', 'type', 'role',
  'open',
])

const parser = docgen.withCustomConfig(TSCONFIG_PATH, {
  savePropValueAsString: true,
  propFilter: (prop) => {
    const fileName = prop.parent?.fileName
    if (!fileName) return true
    if (!fileName.includes('node_modules')) return true
    // For props sourced from React types, keep only the curated allowlist.
    if (fileName.includes('@types/react')) {
      return REACT_PROPS_ALLOWLIST.has(prop.name)
    }
    // Surface props from external UI libraries we wrap (Base UI, next-themes).
    if (fileName.includes('@base-ui/react') || fileName.includes('next-themes')) {
      return true
    }
    return false
  },
  shouldExtractLiteralValuesFromEnum: true,
  shouldExtractValuesFromUnion: true,
  shouldRemoveUndefinedFromOptional: true,
})

export async function extractProps(
  files: string[],
): Promise<Record<string, docgen.ComponentDoc>> {
  const out: Record<string, docgen.ComponentDoc> = {}
  for (const file of files) {
    const docs = parser.parse(file)
    for (const doc of docs) {
      out[doc.displayName] = doc
    }
  }
  return out
}

async function main() {
  const files = (await glob(SOURCE_GLOB)).sort()
  const docs = await extractProps(files)
  const sorted = Object.fromEntries(
    Object.keys(docs).sort().map((key) => [key, docs[key]] as const),
  )
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(sorted, null, 2))
  console.log(`✓ wrote ${Object.keys(sorted).length} component entries to ${OUTPUT_PATH}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
