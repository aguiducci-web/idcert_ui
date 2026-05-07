'use client'
import * as React from 'react'
import { User, Settings, Bell } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './index.js'

export const Default = () => (
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
)

export const Controlled = () => {
  const [value, setValue] = React.useState('overview')
  return (
    <div className="space-y-2">
      <Tabs
        value={value}
        onValueChange={(next) => setValue(String(next))}
        className="w-[400px]"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel.</TabsContent>
        <TabsContent value="activity">Activity panel.</TabsContent>
        <TabsContent value="reports">Reports panel.</TabsContent>
      </Tabs>
      <div className="text-sm text-muted-foreground">Active: {value}</div>
    </div>
  )
}

export const WithIcons = () => (
  <Tabs defaultValue="profile" className="w-[400px]">
    <TabsList>
      <TabsTrigger value="profile" className="gap-2">
        <User className="h-4 w-4" aria-hidden /> Profile
      </TabsTrigger>
      <TabsTrigger value="settings" className="gap-2">
        <Settings className="h-4 w-4" aria-hidden /> Settings
      </TabsTrigger>
      <TabsTrigger value="alerts" className="gap-2">
        <Bell className="h-4 w-4" aria-hidden /> Alerts
      </TabsTrigger>
    </TabsList>
    <TabsContent value="profile">Profile details.</TabsContent>
    <TabsContent value="settings">Settings panel.</TabsContent>
    <TabsContent value="alerts">Alert preferences.</TabsContent>
  </Tabs>
)

export const Disabled = () => (
  <Tabs defaultValue="active" className="w-[400px]">
    <TabsList>
      <TabsTrigger value="active">Active</TabsTrigger>
      <TabsTrigger value="archived" disabled>
        Archived
      </TabsTrigger>
      <TabsTrigger value="drafts">Drafts</TabsTrigger>
    </TabsList>
    <TabsContent value="active">Active items.</TabsContent>
    <TabsContent value="archived">Archived items.</TabsContent>
    <TabsContent value="drafts">Draft items.</TabsContent>
  </Tabs>
)

export const Vertical = () => (
  <Tabs
    defaultValue="general"
    orientation="vertical"
    className="flex w-[500px] gap-4"
  >
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
)

export const ManyTabs = () => (
  <Tabs defaultValue="one" className="w-[500px]">
    <div className="overflow-x-auto">
      <TabsList className="w-max">
        <TabsTrigger value="one">Overview</TabsTrigger>
        <TabsTrigger value="two">Activity</TabsTrigger>
        <TabsTrigger value="three">Reports</TabsTrigger>
        <TabsTrigger value="four">Billing</TabsTrigger>
        <TabsTrigger value="five">Members</TabsTrigger>
        <TabsTrigger value="six">Integrations</TabsTrigger>
        <TabsTrigger value="seven">Audit Log</TabsTrigger>
      </TabsList>
    </div>
    <TabsContent value="one">Overview panel.</TabsContent>
    <TabsContent value="two">Activity panel.</TabsContent>
    <TabsContent value="three">Reports panel.</TabsContent>
    <TabsContent value="four">Billing panel.</TabsContent>
    <TabsContent value="five">Members panel.</TabsContent>
    <TabsContent value="six">Integrations panel.</TabsContent>
    <TabsContent value="seven">Audit log panel.</TabsContent>
  </Tabs>
)
