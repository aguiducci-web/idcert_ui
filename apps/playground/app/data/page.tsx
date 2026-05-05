'use client'

import { Inbox } from 'lucide-react'
import * as React from 'react'
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  Badge,
  Button,
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  List,
  ListItem,
  Progress,
  Skeleton,
} from '@idcert/ui'

export default function DataPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-12 p-8">
      <h1 className="text-2xl font-semibold">Data Display smoke test</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Badge</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Avatar</h2>
        <div className="flex items-center gap-6">
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/100?img=1" alt="" />
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
          <AvatarGroup max={3}>
            <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=1" alt="" /><AvatarFallback>U1</AvatarFallback></Avatar>
            <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=2" alt="" /><AvatarFallback>U2</AvatarFallback></Avatar>
            <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=3" alt="" /><AvatarFallback>U3</AvatarFallback></Avatar>
            <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=4" alt="" /><AvatarFallback>U4</AvatarFallback></Avatar>
            <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=5" alt="" /><AvatarFallback>U5</AvatarFallback></Avatar>
          </AvatarGroup>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Progress</h2>
        <div className="space-y-3 max-w-md">
          <Progress value={30} />
          <Progress value={60} />
          <Progress value={100} />
          <Progress value={null} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Skeleton</h2>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">List</h2>
        <div className="grid grid-cols-2 gap-6">
          <List>
            <ListItem>Default item one</ListItem>
            <ListItem>Default item two</ListItem>
            <ListItem>Default item three</ListItem>
          </List>
          <List divider>
            <ListItem>Divider item one</ListItem>
            <ListItem>Divider item two</ListItem>
            <ListItem>Divider item three</ListItem>
          </List>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">EmptyState</h2>
        <div className="rounded-lg border">
          <EmptyState>
            <EmptyStateIcon><Inbox /></EmptyStateIcon>
            <EmptyStateTitle>No messages</EmptyStateTitle>
            <EmptyStateDescription>
              Your inbox is empty. Compose to start.
            </EmptyStateDescription>
            <EmptyStateAction>
              <Button>New message</Button>
            </EmptyStateAction>
          </EmptyState>
        </div>
      </section>
    </main>
  )
}
