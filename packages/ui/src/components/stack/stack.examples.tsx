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

export const Horizontal = () => (
  <Stack direction="horizontal" gap={3}>
    <Box>One</Box>
    <Box>Two</Box>
    <Box>Three</Box>
  </Stack>
)

export const Gaps = () => (
  <Stack gap={4}>
    <Stack direction="horizontal" gap={1} align="center">
      <span className="w-16 text-xs text-muted-foreground">gap=1</span>
      <Box>A</Box><Box>B</Box><Box>C</Box>
    </Stack>
    <Stack direction="horizontal" gap={2} align="center">
      <span className="w-16 text-xs text-muted-foreground">gap=2</span>
      <Box>A</Box><Box>B</Box><Box>C</Box>
    </Stack>
    <Stack direction="horizontal" gap={4} align="center">
      <span className="w-16 text-xs text-muted-foreground">gap=4</span>
      <Box>A</Box><Box>B</Box><Box>C</Box>
    </Stack>
    <Stack direction="horizontal" gap={6} align="center">
      <span className="w-16 text-xs text-muted-foreground">gap=6</span>
      <Box>A</Box><Box>B</Box><Box>C</Box>
    </Stack>
  </Stack>
)

export const AlignedRow = () => (
  <Stack
    direction="horizontal"
    align="center"
    justify="between"
    gap={4}
    className="w-full rounded-md border border-border px-4 py-2"
  >
    <span className="text-sm font-medium">Toolbar title</span>
    <Stack direction="horizontal" gap={2} align="center">
      <Box>Action</Box>
      <Box>Action</Box>
    </Stack>
  </Stack>
)

export const Justify = () => (
  <Stack gap={3}>
    <Stack
      direction="horizontal"
      justify="start"
      gap={2}
      className="w-full rounded-md border border-border p-2"
    >
      <Box>start</Box><Box>start</Box>
    </Stack>
    <Stack
      direction="horizontal"
      justify="center"
      gap={2}
      className="w-full rounded-md border border-border p-2"
    >
      <Box>center</Box><Box>center</Box>
    </Stack>
    <Stack
      direction="horizontal"
      justify="between"
      gap={2}
      className="w-full rounded-md border border-border p-2"
    >
      <Box>between</Box><Box>between</Box>
    </Stack>
    <Stack
      direction="horizontal"
      justify="around"
      gap={2}
      className="w-full rounded-md border border-border p-2"
    >
      <Box>around</Box><Box>around</Box>
    </Stack>
  </Stack>
)
