import { defineConfig } from 'tsup'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { globSync } from 'glob'

const USE_CLIENT = '"use client";\n'

function prependUseClient(filePath: string): void {
  const content = readFileSync(filePath, 'utf8')
  if (!content.startsWith(USE_CLIENT)) {
    writeFileSync(filePath, USE_CLIENT + content, 'utf8')
  }
}

export default defineConfig({
  entry: ['src/index.ts', 'src/components/*/*.examples.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'next', 'next-themes'],
  noExternal: ['react-hook-form', '@hookform/resolvers', 'zod'],
  treeshake: true,
  outDir: 'dist',
  outExtension({ format }) {
    return { js: format === 'esm' ? '.js' : '.cjs' }
  },
  async onSuccess() {
    const dist = resolve('dist')
    prependUseClient(resolve(dist, 'index.js'))
    prependUseClient(resolve(dist, 'index.cjs'))
    const examples = globSync(resolve(dist, 'components/*/*.examples.{js,cjs}'))
    for (const file of examples) prependUseClient(file)
    console.log(`✓ prepended "use client" directive to bundle entries (+${examples.length} examples)`)
  },
})
