import type { Meta, StoryObj } from '@storybook/react'
import { Stack, HStack, VStack } from './index.js'

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md bg-muted px-4 py-2 text-sm">{children}</div>
)

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: () => (
    <Stack gap={2}>
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Stack>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <Stack direction="horizontal" gap={4}>
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Stack>
  ),
}

export const HStackHelper: Story = {
  render: () => (
    <HStack gap={3}>
      <Box>A</Box>
      <Box>B</Box>
      <Box>C</Box>
    </HStack>
  ),
}

export const VStackHelper: Story = {
  render: () => (
    <VStack gap={3}>
      <Box>A</Box>
      <Box>B</Box>
      <Box>C</Box>
    </VStack>
  ),
}
