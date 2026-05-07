import * as React from 'react'
import { Stack } from './index.js'

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md bg-muted px-4 py-2 text-sm">{children}</div>
)

export const Default = () => (
  <Stack gap={2}>
    <Box>One</Box>
    <Box>Two</Box>
    <Box>Three</Box>
  </Stack>
)
