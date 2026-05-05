'use client'

import * as React from 'react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  Pagination,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@idcert/ui'

export default function NavigationPage() {
  const [page, setPage] = React.useState(5)
  const [view, setView] = React.useState('grid')
  const [statusBar, setStatusBar] = React.useState(true)

  return (
    <main className="mx-auto max-w-3xl space-y-12 p-8">
      <h1 className="text-2xl font-semibold">Navigation smoke test</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Breadcrumb</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Components</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tabs (default + pills)</h2>
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
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">DropdownMenu (full features)</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Account menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={statusBar}
              onCheckedChange={setStatusBar}
            >
              Show status bar
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>View</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={view} onValueChange={(v) => setView(String(v))}>
              <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem>Email</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Pagination</h2>
        <Pagination
          currentPage={page}
          totalPages={20}
          onPageChange={setPage}
          siblingCount={1}
        />
        <div className="text-center text-sm text-muted-foreground">
          Page {page} of 20
        </div>
      </section>
    </main>
  )
}
