import { describe, it, expect } from 'vitest'

describe('examples subpath', () => {
  it('resolves @idcert/ui/components/button/examples', async () => {
    const mod = await import('@idcert/ui/components/button/examples')
    expect(typeof mod.Default).toBe('function')
  })
})
