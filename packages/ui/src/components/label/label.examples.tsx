'use client'
import { Label } from './index.js'
import { Input } from '../input/index.js'

export const Default = () => (
  <div className="w-64 space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="name@example.com" />
  </div>
)

export const WithInput = () => (
  <div className="w-64 space-y-2">
    <Label htmlFor="username">Username</Label>
    <Input id="username" type="text" placeholder="caveman42" />
  </div>
)

export const Required = () => (
  <div className="w-64 space-y-2">
    <Label htmlFor="password">
      Password
      <span aria-hidden="true" className="ml-0.5 text-destructive">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </Label>
    <Input id="password" type="password" required />
  </div>
)

export const Disabled = () => (
  <div className="w-64 space-y-2">
    <Label htmlFor="readonly-email" className="peer-disabled:opacity-70">
      Email
    </Label>
    <Input
      id="readonly-email"
      type="email"
      disabled
      defaultValue="locked@example.com"
      className="peer"
    />
  </div>
)
