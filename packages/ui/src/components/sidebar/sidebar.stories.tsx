import type { Meta, StoryObj } from '@storybook/react'
import {
  Folder,
  Home,
  LayoutDashboard,
  Settings,
  User,
} from 'lucide-react'
import * as React from 'react'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
} from './index.js'

const meta = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

function ExampleSidebar({ collapsible = 'icon' }: { collapsible?: 'offcanvas' | 'icon' | 'none' }) {
  return (
    <Sidebar collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenuButton size="lg">
          <Home />
          <span>idcert</span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton active>
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Folder />
                <span>Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton>
          <User />
          <span>Account</span>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <ExampleSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Page header</span>
        </header>
        <div className="p-6">
          <h1 className="text-2xl font-semibold">Hello</h1>
          <p className="text-muted-foreground">Click the trigger to toggle the sidebar.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
}

export const RightSide: Story = {
  render: () => (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Right-side sidebar</span>
        </header>
        <div className="p-6">Content area.</div>
      </SidebarInset>
      <Sidebar side="right" collapsible="icon">
        <SidebarHeader>
          <SidebarMenuButton size="lg">
            <Home />
            <span>idcert</span>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
}

export const InsetVariant: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenuButton size="lg">
            <Home />
            <span>idcert</span>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton active>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Inset variant</span>
        </header>
        <div className="p-6">Inset gives the sidebar a card-like surrounding.</div>
      </SidebarInset>
    </SidebarProvider>
  ),
}

export const NonCollapsible: Story = {
  render: () => (
    <SidebarProvider>
      <ExampleSidebar collapsible="none" />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <span className="text-sm font-medium">No collapse</span>
        </header>
        <div className="p-6">Sidebar always expanded.</div>
      </SidebarInset>
    </SidebarProvider>
  ),
}
