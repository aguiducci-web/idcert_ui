import type { Meta, StoryObj } from '@storybook/react'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from './index.js'
import { Button } from '../button/index.js'

const meta = {
  title: 'Layout/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Simple: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Latest: incident report from oncall.</p>
      </CardContent>
      <CardFooter>
        <Button>Mark all read</Button>
      </CardFooter>
    </Card>
  ),
}

export const HeaderOnly: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Just a title</CardTitle>
      </CardHeader>
    </Card>
  ),
}
