import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { extractFromFile } from '@/scripts/extract-examples-source'

const fixture = path.resolve(__dirname, '__fixtures__/sample.examples.tsx')

describe('extractFromFile', () => {
  it('extracts each named export with its source body', async () => {
    const result = await extractFromFile(fixture)
    expect(Object.keys(result).sort()).toEqual(['Default', 'WithIcon'])
    expect(result.Default).toContain('<Button>Hello</Button>')
    expect(result.WithIcon).toContain('<span>Icon</span>')
  })
})
