import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './index.js'

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Manage your account.</TabsContent>
      <TabsContent value="password">Change your password.</TabsContent>
      <TabsContent value="notifications">Notification settings.</TabsContent>
    </Tabs>
  ),
}

export const Pills: Story = {
  render: () => (
    <Tabs defaultValue="grid" variant="pills" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="grid">Grid</TabsTrigger>
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="kanban">Kanban</TabsTrigger>
      </TabsList>
      <TabsContent value="grid">Grid view.</TabsContent>
      <TabsContent value="list">List view.</TabsContent>
      <TabsContent value="kanban">Kanban board.</TabsContent>
    </Tabs>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="general" orientation="vertical" className="flex w-[500px] gap-4">
      <TabsList className="flex-col items-stretch h-auto w-40 border-b-0 border-r border-border">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="general">General settings.</TabsContent>
        <TabsContent value="profile">Profile settings.</TabsContent>
        <TabsContent value="security">Security settings.</TabsContent>
      </div>
    </Tabs>
  ),
}

function ControlledDemo() {
  const [v, setV] = React.useState('a')
  return (
    <div className="space-y-2">
      <Tabs value={v} onValueChange={(next) => setV(String(next))} className="w-[400px]">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
        <TabsContent value="c">Panel C</TabsContent>
      </Tabs>
      <div className="text-sm text-muted-foreground">Active: {v}</div>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}
