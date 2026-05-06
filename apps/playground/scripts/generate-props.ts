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

const parser = docgen.withCustomConfig(TSCONFIG_PATH, {
  savePropValueAsString: true,
  propFilter: (prop) => !prop.parent?.fileName.includes('node_modules'),
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
  const files = await glob(SOURCE_GLOB)
  const out = await extractProps(files)
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(out, null, 2))
  console.log(`✓ wrote ${Object.keys(out).length} component entries to ${OUTPUT_PATH}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
