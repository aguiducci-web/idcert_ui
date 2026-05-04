import type { Meta, StoryObj } from '@storybook/react'
import { Terminal } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from './index.js'

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'info', 'success', 'warning', 'destructive'] },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
    </Alert>
  ),
}

export const Info: Story = {
  render: () => (
    <Alert variant="info">
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>Version 2.0 is available with new features.</AlertDescription>
    </Alert>
  ),
}

export const Success: Story = {
  render: () => (
    <Alert variant="success">
      <AlertTitle>Saved</AlertTitle>
      <AlertDescription>Your changes have been saved successfully.</AlertDescription>
    </Alert>
  ),
}

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertTitle>Watch out</AlertTitle>
      <AlertDescription>This action will affect billing.</AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Something went wrong. Please try again.</AlertDescription>
    </Alert>
  ),
}

export const CustomIcon: Story = {
  render: () => (
    <Alert icon={<Terminal aria-hidden="true" />}>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>Run <code>pnpm install</code> to fetch new packages.</AlertDescription>
    </Alert>
  ),
}

export const NoIcon: Story = {
  render: () => (
    <Alert variant="info" icon={false}>
      <AlertTitle>Plain message</AlertTitle>
      <AlertDescription>No icon here.</AlertDescription>
    </Alert>
  ),
}
