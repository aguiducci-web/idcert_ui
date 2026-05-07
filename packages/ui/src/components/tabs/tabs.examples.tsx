'use client'
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
