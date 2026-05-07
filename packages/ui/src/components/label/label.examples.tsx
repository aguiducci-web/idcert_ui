'use client'
import { Label } from './index.js'
import { Input } from '../input/index.js'

export const Default = () => (
  <div className="w-64 space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="name@example.com" />
  </div>
)
