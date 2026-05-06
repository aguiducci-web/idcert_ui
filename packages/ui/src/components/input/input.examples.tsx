import { Input } from './index.js'
import { Label } from '../label/index.js'

export const Default = () => <Input placeholder="Enter your name" />

export const WithLabel = () => (
  <div className="grid w-72 gap-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="you@example.com" />
  </div>
)

export const WithDescription = () => (
  <div className="grid w-72 gap-1.5">
    <Label htmlFor="password">Password</Label>
    <Input id="password" type="password" />
    <p className="text-xs text-muted-foreground">At least 12 characters.</p>
  </div>
)

export const ErrorState = () => (
  <div className="grid w-72 gap-1.5">
    <Label htmlFor="email-bad">Email</Label>
    <Input
      id="email-bad"
      type="email"
      defaultValue="not-an-email"
      aria-invalid
      className="border-destructive focus-visible:ring-destructive"
    />
    <p className="text-xs text-destructive">Enter a valid email address.</p>
  </div>
)

export const Disabled = () => <Input placeholder="Disabled" disabled />

export const Types = () => (
  <div className="grid w-72 gap-3">
    <Input type="text" placeholder="Text" />
    <Input type="email" placeholder="Email" />
    <Input type="password" placeholder="Password" />
    <Input type="number" placeholder="Number" />
    <Input type="search" placeholder="Search" />
    <Input type="file" />
  </div>
)
