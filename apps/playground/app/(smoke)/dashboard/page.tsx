'use client'

import {
  Folder,
  Home,
  LayoutDashboard,
  Settings,
  User,
} from 'lucide-react'
import * as React from 'react'
import {
  Button,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@idcert/ui'

export default function DashboardPage() {
  const [filterOpen, setFilterOpen] = React.useState(false)

  return (
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

      <SidebarInset>
        <Navbar position="sticky">
          <SidebarTrigger />
          <NavbarBrand>
            <span className="font-semibold">Dashboard</span>
          </NavbarBrand>
          <NavbarContent>
            <NavbarItem href="#" active>Overview</NavbarItem>
            <NavbarItem href="#">Reports</NavbarItem>
          </NavbarContent>
          <NavbarActions>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger render={<Button variant="outline">Filters</Button>} />
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Adjust filter criteria.</SheetDescription>
                </SheetHeader>
                <div className="py-4 text-sm">Filter form goes here.</div>
                <SheetFooter>
                  <Button onClick={() => setFilterOpen(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={() => setFilterOpen(false)}>Apply</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </NavbarActions>
        </Navbar>
        <main className="p-6">
          <h1 className="text-2xl font-semibold">Welcome</h1>
          <p className="mt-2 text-muted-foreground">
            Toggle sidebar via <kbd>Cmd/Ctrl+B</kbd> or click the menu icon.
          </p>
          <p className="mt-2 text-muted-foreground">
            Resize browser to mobile width to see Sidebar collapse into a Sheet drawer.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
