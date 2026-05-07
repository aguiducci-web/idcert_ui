'use client'
import {
  BarChart3,
  Folder,
  Home,
  LayoutDashboard,
  Search,
  Settings,
  Users,
} from 'lucide-react'
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

export const WithGroups = () => (
  <SidebarProvider>
    <Sidebar>
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
                <BarChart3 />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Users />
                <span>Members</span>
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
    </Sidebar>
    <SidebarInset>
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <span className="text-sm font-medium">Dashboard</span>
      </header>
    </SidebarInset>
  </SidebarProvider>
)

export const Collapsed = () => (
  <SidebarProvider defaultOpen={false}>
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton size="lg" aria-label="idcert home">
          <Home />
          <span>idcert</span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton active aria-label="Dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton aria-label="Projects">
                <Folder />
                <span>Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton aria-label="Members">
                <Users />
                <span>Members</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <SidebarInset>
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <span className="text-sm font-medium">Icon-only sidebar</span>
      </header>
    </SidebarInset>
  </SidebarProvider>
)

export const WithFooter = () => (
  <SidebarProvider>
    <Sidebar>
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
        <SidebarMenuButton size="lg">
          <Users />
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">Andrea G.</span>
            <span className="text-xs text-muted-foreground">
              aguiducci@idcert.io
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
    <SidebarInset>
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <span className="text-sm font-medium">Account in footer</span>
      </header>
    </SidebarInset>
  </SidebarProvider>
)

export const WithSearch = () => (
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader>
        <SidebarMenuButton size="lg">
          <Home />
          <span>idcert</span>
        </SidebarMenuButton>
        <div className="relative px-1">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search navigation"
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
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
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BarChart3 />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <SidebarInset>
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <span className="text-sm font-medium">Search in header</span>
      </header>
    </SidebarInset>
  </SidebarProvider>
)
