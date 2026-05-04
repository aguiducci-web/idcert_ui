import preset from '@idcert/tailwind-config'

export default {
  presets: [preset],
  content: [
    '../../packages/ui/src/**/*.{ts,tsx}',
    '.storybook/**/*.{ts,tsx}',
  ],
}
