import { defineConfig } from 'tsup'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const USE_CLIENT = '"use client";\n'

function prependUseClient(filePath: string): void {
  const content = readFileSync(filePath, 'utf8')
  if (!content.startsWith(USE_CLIENT)) {
    writeFileSync(filePath, USE_CLIENT + content, 'utf8')
  }
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'next', 'next-themes'],
  treeshake: true,
  async onSuccess() {
    const dist = resolve('dist')
    mkdirSync(dist, { recursive: true })
    copyFileSync('src/styles/globals.css', resolve(dist, 'styles.css'))
    console.log('✓ copied globals.css to dist/styles.css')

    prependUseClient(resolve(dist, 'index.js'))
    prependUseClient(resolve(dist, 'index.cjs'))
    console.log('✓ prepended "use client" directive to bundle entries')
  },
})
