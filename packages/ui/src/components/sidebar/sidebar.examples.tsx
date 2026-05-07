'use client'
import { Folder, Home, LayoutDashboard, Settings } from 'lucide-react'
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
  SidebarInset,
} from './index.js'

export const Default = () => (
  <SidebarProvider>
    <Sidebar collapsible="icon">
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
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton>
          <Settings />
          <span>Settings</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
    <SidebarInset>
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <span className="text-sm font-medium">Page header</span>
      </header>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Hello</h1>
        <p className="text-muted-foreground">
          Click the trigger to toggle the sidebar.
        </p>
      </div>
    </SidebarInset>
  </SidebarProvider>
)
