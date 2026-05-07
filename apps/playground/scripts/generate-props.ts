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
const GLOSSARY_PATH = path.resolve(__dirname, '../public/types-glossary.json')

// Threshold above which a named enum/union is collapsed in PropsTable into a
// link to the types glossary, instead of dumping every literal as a chip.
const VERBOSE_ENUM_THRESHOLD = 8

// Matches a plain TypeScript identifier — used to decide whether `raw` is a
// linkable alias name vs. an inline union expression like `"left" | "right"`.
const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/

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

type GlossaryEntry = { name: string; values: string[] }

function buildGlossary(
  docs: Record<string, docgen.ComponentDoc>,
): Record<string, GlossaryEntry> {
  const glossary: Record<string, GlossaryEntry> = {}
  for (const doc of Object.values(docs)) {
    for (const prop of Object.values(doc.props ?? {})) {
      const t = prop.type as { name?: string; raw?: string; value?: { value: string }[] }
      if (t.name !== 'enum' || !t.value || !t.raw) continue
      if (!IDENT_RE.test(t.raw)) continue
      if (glossary[t.raw]) continue
      // Keep only string-literal members. Drops type-level escape hatches
      // like `string & {}` (HTMLInputAutoCompleteAttribute, AriaRole) and
      // type-only unions such as ReactNode that never made sense as chips.
      const literals = t.value
        .filter((v) => /^["'`]/.test(v.value))
        .map((v) => v.value)
      if (literals.length < VERBOSE_ENUM_THRESHOLD) continue
      glossary[t.raw] = { name: t.raw, values: literals }
    }
  }
  return Object.fromEntries(
    Object.keys(glossary).sort().map((k) => [k, glossary[k]] as const),
  ) as Record<string, GlossaryEntry>
}

async function main() {
  const files = (await glob(SOURCE_GLOB)).sort()
  const docs = await extractProps(files)
  const sorted = Object.fromEntries(
    Object.keys(docs).sort().map((key) => [key, docs[key]] as const),
  ) as Record<string, docgen.ComponentDoc>
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(sorted, null, 2))
  console.log(`✓ wrote ${Object.keys(sorted).length} component entries to ${OUTPUT_PATH}`)

  const glossary = buildGlossary(sorted)
  await fs.writeFile(GLOSSARY_PATH, JSON.stringify(glossary, null, 2))
  console.log(`✓ wrote ${Object.keys(glossary).length} glossary entries to ${GLOSSARY_PATH}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
