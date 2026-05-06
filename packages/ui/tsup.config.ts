import { defineConfig } from 'tsup'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

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
  treeshake: true,
  outDir: 'dist',
  outExtension({ format }) {
    return { js: format === 'esm' ? '.js' : '.cjs' }
  },
  async onSuccess() {
    const dist = resolve('dist')
    prependUseClient(resolve(dist, 'index.js'))
    prependUseClient(resolve(dist, 'index.cjs'))
    console.log('✓ prepended "use client" directive to bundle entries')
  },
})
