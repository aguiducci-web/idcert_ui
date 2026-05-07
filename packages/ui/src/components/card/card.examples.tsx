import { MoreHorizontal } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './index.js'
import { Button } from '../button/index.js'

export const Default = () => (
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
)

export const WithFooter = () => (
  <Card className="w-80">
    <CardHeader>
      <CardTitle>Delete project</CardTitle>
      <CardDescription>
        This action cannot be undone. All data will be removed.
      </CardDescription>
    </CardHeader>
    <CardFooter className="justify-end gap-2">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </CardFooter>
  </Card>
)

export const WithHeaderAction = () => (
  <Card className="w-80">
    <CardHeader className="flex-row items-start justify-between space-y-0">
      <div className="space-y-1.5">
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>Devices currently signed in.</CardDescription>
      </div>
      <Button variant="ghost" size="icon" aria-label="More options">
        <MoreHorizontal />
      </Button>
    </CardHeader>
    <CardContent>
      <p className="text-sm">3 devices · last sync 2 minutes ago</p>
    </CardContent>
  </Card>
)

export const Stat = () => (
  <Card className="w-64">
    <CardHeader className="space-y-0 pb-2">
      <CardDescription>Monthly revenue</CardDescription>
      <CardTitle className="text-3xl">$12,480</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">+12.4% vs last month</p>
    </CardContent>
  </Card>
)

export const Interactive = () => (
  <a
    href="#"
    className="block w-80 rounded-lg outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  >
    <Card className="transition hover:border-foreground/20 hover:shadow-md">
      <CardHeader>
        <CardTitle>Deployment guide</CardTitle>
        <CardDescription>
          Set up CI, environments, and rollbacks in under ten minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Read the guide →</p>
      </CardContent>
    </Card>
  </a>
)
