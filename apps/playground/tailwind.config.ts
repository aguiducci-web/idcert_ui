import type { Config } from 'tailwindcss'
import preset from '@idcert/tailwind-config'

export default {
  presets: [preset],
  content: [
    './app/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
} satisfies Config
