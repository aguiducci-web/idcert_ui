import type { Meta, StoryObj } from '@storybook/react'
import { Grid } from './index.js'

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md bg-muted p-4 text-center text-sm">{children}</div>
)

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Grid>

export default meta
type Story = StoryObj<typeof meta>

export const TwoColumns: Story = {
  render: () => (
    <Grid cols={2} gap={4}>
      <Cell>1</Cell><Cell>2</Cell>
      <Cell>3</Cell><Cell>4</Cell>
    </Grid>
  ),
}

export const ThreeColumns: Story = {
  render: () => (
    <Grid cols={3} gap={4}>
      {Array.from({ length: 9 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
    </Grid>
  ),
}

export const TwelveColumns: Story = {
  render: () => (
    <Grid cols={12} gap={2}>
      {Array.from({ length: 12 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
    </Grid>
  ),
}
