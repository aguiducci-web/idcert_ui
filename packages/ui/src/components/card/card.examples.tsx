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
