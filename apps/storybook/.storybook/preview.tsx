import * as React from 'react'
import type { Preview } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes'
import '@idcert/ui/styles.css'

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
