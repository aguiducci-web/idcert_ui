import { describe, it, expect } from 'vitest'
import path from 'node:path'
import fs from 'node:fs/promises'
import { extractProps } from '@/scripts/generate-props'

describe('extractProps', () => {
  it('extracts displayName, description, and prop info from Button', async () => {
    const docs = await extractProps([
      path.resolve(__dirname, '../../../../packages/ui/src/components/button/index.tsx'),
    ])
    const button = docs.Button
    expect(button).toBeDefined()
    const variant = button!.props.variant
    expect(variant).toBeDefined()
    expect(variant!.type.name).toBe('enum')
  })
})
