import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

// Mock browser APIs that jsdom does not implement, used by FileUpload tests.
if (typeof global.URL.createObjectURL === 'undefined') {
  Object.defineProperty(global.URL, 'createObjectURL', {
    writable: true,
    value: () => 'blob:mock',
  })
}
if (typeof global.URL.revokeObjectURL === 'undefined') {
  Object.defineProperty(global.URL, 'revokeObjectURL', {
    writable: true,
    value: () => undefined,
  })
}
