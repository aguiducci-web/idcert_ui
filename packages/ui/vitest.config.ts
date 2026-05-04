import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/index.ts',
        '**/*.config.ts',
      ],
      thresholds: { lines: 70, branches: 70 },
    },
  },
})
